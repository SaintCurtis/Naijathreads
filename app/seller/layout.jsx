'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className='bg-gray-50/60 min-h-screen'>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        <main className='flex-1 min-w-0'>{children}</main>
      </div>
    </div>
  )
}

export default Layout
