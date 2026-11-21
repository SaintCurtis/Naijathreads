'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import { CATEGORIES } from '@/lib/constants'

const MAX_IMAGES = 4
const input = 'outline-none md:py-2.5 py-2 px-3 rounded-md border border-gray-300 focus:border-forest-600 bg-white'

// mode: 'add' | 'edit'. For edit, pass the existing product.
const ProductForm = ({ mode = 'add', product = null, onSaved }) => {
  const { getToken, currency, fetchProductData } = useAppContext()

  // Each slot holds either an existing URL ({ url }) or a new File ({ file })
  const [slots, setSlots] = useState(Array(MAX_IMAGES).fill(null))
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [stock, setStock] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && product) {
      setSlots(Array.from({ length: MAX_IMAGES }, (_, i) => (product.image[i] ? { url: product.image[i] } : null)))
      setName(product.name)
      setDescription(product.description)
      setCategory(product.category)
      setPrice(String(product.price))
      setOfferPrice(String(product.offerPrice))
      setStock(String(product.stock ?? 0))
    }
  }, [mode, product])

  const previews = useMemo(
    () => slots.map((s) => (s?.file ? URL.createObjectURL(s.file) : s?.url || null)),
    [slots]
  )
  useEffect(() => () => previews.forEach((p, i) => slots[i]?.file && URL.revokeObjectURL(p)), [previews]) // eslint-disable-line

  const setSlot = (i, value) => setSlots((prev) => prev.map((s, j) => (j === i ? value : s)))

  const discount = Number(price) > 0 && Number(offerPrice) > 0 && Number(offerPrice) < Number(price)
    ? Math.round((1 - Number(offerPrice) / Number(price)) * 100)
    : 0

  const reset = () => {
    setSlots(Array(MAX_IMAGES).fill(null))
    setName(''); setDescription(''); setCategory(CATEGORIES[0])
    setPrice(''); setOfferPrice(''); setStock('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!slots.some(Boolean)) return toast.error('Add at least one image')
    if (Number(offerPrice) > Number(price)) return toast.error('Offer price should not be higher than the price')

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())
    formData.append('category', category)
    formData.append('price', price)
    formData.append('offerPrice', offerPrice)
    formData.append('stock', stock || '0')

    // keep the order the admin arranged: existing URLs first in their slots, then new files
    formData.append('keepImages', JSON.stringify(slots.filter((s) => s?.url).map((s) => s.url)))
    slots.forEach((s) => s?.file && formData.append('images', s.file))
    if (mode === 'edit') formData.append('id', product._id)

    setSaving(true)
    try {
      const token = await getToken()
      const url = mode === 'edit' ? '/api/product/update' : '/api/product/add'
      const { data } = await axios.post(url, formData, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true })
      if (data.success) {
        toast.success(data.message)
        fetchProductData?.()
        if (mode === 'add') reset()
        onSaved?.(data)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div>
          <p className="font-medium text-gray-900">Product images</p>
          <p className="text-xs text-gray-500">Up to 4. The first image is the main photo in the store.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {slots.map((slot, index) => (
            <div key={index} className="relative">
              <label htmlFor={`image${index}`} className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  id={`image${index}`}
                  hidden
                  onChange={(e) => e.target.files?.[0] && setSlot(index, { file: e.target.files[0] })}
                />
                {previews[index] ? (
                  <Image src={previews[index]} alt="" width={96} height={96} className="w-24 h-24 object-cover rounded-md border border-gray-200" unoptimized={!!slot?.file} />
                ) : (
                  <Image src={assets.upload_area} alt="Upload image" width={96} height={96} className="w-24 h-24" />
                )}
              </label>
              {slot && (
                <button
                  type="button"
                  onClick={() => setSlot(index, null)}
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-600 text-sm leading-none shadow-sm hover:bg-red-50 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-gray-900" htmlFor="product-name">Product name</label>
          <input id="product-name" type="text" placeholder="e.g. Royal Aso Oke Agbada Set" className={input} onChange={(e) => setName(e.target.value)} value={name} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-gray-900" htmlFor="product-description">Description</label>
          <textarea id="product-description" rows={4} className={`${input} resize-none`} placeholder="Fabric, fit, occasion, what's included…" onChange={(e) => setDescription(e.target.value)} value={description} required />
        </div>
        <div className="flex flex-col gap-1 max-w-xs">
          <label className="font-medium text-gray-900" htmlFor="category">Category</label>
          <select id="category" className={input} onChange={(e) => setCategory(e.target.value)} value={category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="font-medium text-gray-900 mb-3">Pricing & stock</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700" htmlFor="product-price">Price ({currency})</label>
            <input id="product-price" type="number" min="0" step="0.01" placeholder="0" className={input} onChange={(e) => setPrice(e.target.value)} value={price} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700" htmlFor="offer-price">Offer price ({currency})</label>
            <input id="offer-price" type="number" min="0" step="0.01" placeholder="0" className={input} onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700" htmlFor="stock">Units in stock</label>
            <input id="stock" type="number" min="0" step="1" placeholder="0" className={input} onChange={(e) => setStock(e.target.value)} value={stock} required />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 h-4">
          {discount > 0 ? `Customers see ${discount}% off.` : 'Offer price is what customers pay. Set it lower than the price to show a discount.'}
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-8 py-2.5 bg-forest-700 hover:bg-forest-800 disabled:opacity-60 transition text-white font-medium rounded-md">
          {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add product'}
        </button>
        {mode === 'add' && (
          <button type="button" onClick={reset} className="px-5 py-2.5 text-gray-600 hover:text-gray-900">Clear</button>
        )}
      </div>
    </form>
  )
}

export default ProductForm
