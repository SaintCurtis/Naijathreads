'use client'
import React from 'react'
import ProductForm from '@/components/seller/ProductForm'
import Footer from '@/components/seller/Footer'

const AddProduct = () => (
  <div className="flex-1 min-h-screen flex flex-col justify-between">
    <div className="md:p-8 p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add product</h1>
        <p className="text-sm text-gray-500">New items appear in the store as soon as they're saved.</p>
      </div>
      <ProductForm mode="add" />
    </div>
    <Footer />
  </div>
)

export default AddProduct
