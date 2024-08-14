"use client"

import { FormEvent, Fragment, useState } from 'react'
import { Button, Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react'
import Image from 'next/image'
import { addUserEmailToProduct } from '@/lib/actions'

interface Props{
    productId: string
}

export default function Modal({productId}: Props) {

    let [isOpen, setIsOpen] = useState(false)
    let [isSubmitting, setIsSubmitting] = useState(false)
    let [email, setEmail] = useState('')


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
       
        await addUserEmailToProduct(productId, email)

        setIsSubmitting(false)
        setEmail('')
        closeModal()
    }

  const openModal = () => setIsOpen(true)

  const closeModal = () => setIsOpen(false)


  return (
    <>
      <Button onClick={openModal} type="button" className="btn">
        Track
      </Button>

      {/* <Button
        onClick={open}
        className="rounded-md bg-black/20 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-black/30 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        Open dialog
      </Button> */}

        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none dialog-container" onClose={closeModal}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                    transition
                    className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                    >
                        <DialogTitle as="h3" className="text-base/7 font-medium text-black flex justify-between">
                            <Image
                                src="/assets/icons/logo.svg"
                                alt='logo'
                                width={30}
                                height={30}
                            />
                            <Image
                                src="/assets/icons/x-close.svg"
                                alt='close'
                                width={24}
                                height={24}
                                onClick={closeModal}
                                className='cursor-pointer'
                            />
                        </DialogTitle>
                        <h4 className="dialog-head_text">
                            Stay updated with product pricing alerts right in your inbox!
                        </h4>
                        <p className="mt-2 text-sm/6 text-black/50">
                            Never miss a bargain again with our timely alerts!
                        </p>
                        <form className='flex flex-col mt-5' onSubmit={handleSubmit}>
                            <label htmlFor="email" className='text-sm font-medium text-gray-700'>
                                Email address
                            </label>
                            <div className='dialog-input_container'>
                                <Image
                                    src="/assets/icons/mail.svg"
                                    alt='mail'
                                    width={18}
                                    height={18}
                                />
                                <input
                                    required
                                    type='email'
                                    id='email'
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder='Emter your email address'
                                    className='dialog-input'
                                /> 
                            </div>

                            <Button
                                type='submit'
                                className="dialog-btn w-full"
                                >
                                    {isSubmitting? 'Submitting' : 'Track'}
                            </Button>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>

    </>
  )

}
