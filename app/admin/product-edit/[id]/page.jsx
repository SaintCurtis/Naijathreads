'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/AppContext'
import ProductForm from '@/components/admin/ProductForm'
import Footer from '@/components/admin/Footer'
import Loading from '@/components/Loading'
import useAdminApi from '@/components/admin/useAdminApi'
import StockBadge from '@/components/admin/StockBadge'

const EditProduct = () => {
  const { id } = useParams()
  const { user, router } = useAppContext()
  const { get } = useAdminApi()
  const [product, setProduct] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user) return
    get('/api/product/seller-list').then((data) => {
      if (!data?.success) return toast.error(data?.message || 'Could not load product')
      const p = data.products.find((x) => x._id === id)
      p ? setProduct(p) : setNotFound(true)
    })
  }, [user, id, get])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <div className="md:p-8 p-4 space-y-6">
        <Link href="/admin/product-list" className="text-sm text-gray-500 hover:text-gray-800">← Back to products</Link>
        {notFound ? (
          <p className="text-gray-600">This product doesn't exist any more.</p>
        ) : !product ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">Edit product</h1>
              <StockBadge stock={product.stock} archived={product.archived} />
            </div>
            <ProductForm mode="edit" product={product} onSaved={() => router.push('/admin/product-list')} />
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default EditProduct
