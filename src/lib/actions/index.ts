"use server"

import { revalidatePath } from "next/cache"

import { connectToDB } from "@/lib/mongoose"
import { scrapeAmazonProduct } from "@/lib/scraper"
import Product from "@/lib/models/product.model"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "@/lib/utils"
import { User } from "@/types"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeAndStoreProduct(productUrl: string){


    if(!productUrl) return

    try {

        await connectToDB()

        await delay(10000);

        const scrapedProduct = await scrapeAmazonProduct(productUrl)
        
        if(!scrapedProduct) return

        let product = scrapedProduct

        const existingProduct = await Product.findOne({url: scrapedProduct.url})

        if(existingProduct){

           const updatedPriceHistory: any = [
            ...existingProduct.priceHistory,
            {price: scrapedProduct.currentPrice}
           ]

           product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory)
           }
        }

        const newProduct = await Product.findOneAndUpdate(
            {url: scrapedProduct.url},
            {$set: product},
            {upsert: true, new: true} 
        )

        revalidatePath(`/products/${newProduct._id}`)
        

    } catch (error: any) {
      console.log(error);
        // throw new Error("Failed to create/update product")
    }
}

export async function getProductById(productId: string) {
    try {
      await connectToDB();
  
      const product = await Product.findOne({ _id: productId });
  
      if(!product) return null;
  
      return product;
    } catch (error) {
      console.log(error);
    }
}
  
export async function getAllProducts() {
try {

    await connectToDB();

    const products = await Product.find();

    return products;
} catch (error) {
    console.log("err: ", error);
}
}

export async function getSimilarProducts(productId: string) {
    try {
      await connectToDB();
  
      const currentProduct = await Product.findById(productId);
  
      if(!currentProduct) return null;
  
      const similarProducts = await Product.find({
        _id: { $ne: productId },
      }).limit(3);
  
      return similarProducts;
    } catch (error) {
      console.log(error);
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
