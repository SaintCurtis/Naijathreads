import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import { useClerk } from '@clerk/nextjs'

const Navbar = () => {

  const { router, user } = useAppContext()
  const { signOut } = useClerk()

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b bg-white'>
      <div className='flex items-center gap-3'>
        <Image onClick={() => router.push('/')} className='h-9 lg:h-11 w-auto cursor-pointer' src={assets.logo} alt="Naija Threads Clothing" />
        <span className='hidden sm:inline text-xs font-medium tracking-widest uppercase text-gold-600 border-l border-gray-300 pl-3'>Admin</span>
      </div>
      <div className='flex items-center gap-3'>
        {user && <span className='hidden md:inline text-sm text-gray-500'>{user.fullName || user.primaryEmailAddress?.emailAddress}</span>}
        <button onClick={() => router.push('/')} className='hidden sm:inline text-sm text-gray-600 hover:text-forest-700 px-3 py-2'>View store</button>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className='bg-forest-700 hover:bg-forest-800 transition text-white px-5 py-2 sm:px-7 rounded-full text-xs sm:text-sm'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
