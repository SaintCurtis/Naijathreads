'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import useAdminApi, { money } from "@/components/seller/useAdminApi";
import StockBadge from "@/components/seller/StockBadge";
import { EditIcon, TrashIcon, EyeIcon, SearchIcon } from "@/components/seller/Icons";
import { CATEGORIES, LOW_STOCK_THRESHOLD } from "@/lib/constants";

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'In store' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
  { key: 'archived', label: 'Archived' },
]

const ProductList = () => {
  const { router, user, currency, fetchProductData } = useAppContext()
  const { get, post } = useAdminApi()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState(null) // product pending delete

  const load = useCallback(async () => {
    const data = await get('/api/product/seller-list')
    if (data?.success) setProducts(data.products)
    else toast.error(data?.message || 'Could not load products')
    setLoading(false)
  }, [get])

  useEffect(() => { if (user) load() }, [user, load])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !`${p.name} ${p.category}`.toLowerCase().includes(q)) return false
      if (category !== 'all' && p.category !== category) return false
      const s = p.stock || 0
      if (filter === 'active') return !p.archived
      if (filter === 'low') return !p.archived && s > 0 && s <= LOW_STOCK_THRESHOLD
      if (filter === 'out') return !p.archived && s === 0
      if (filter === 'archived') return p.archived
      return true
    })
  }, [products, query, category, filter])

  const doDelete = async (product) => {
    setConfirm(null)
    const data = await post('/api/product/delete', { id: product._id })
    if (data?.success) {
      toast.success(data.message)
      load(); fetchProductData?.()
    } else toast.error(data?.message || 'Delete failed')
  }

  const restore = async (product) => {
    const data = await post('/api/product/delete', { id: product._id, restore: true })
    if (data?.success) { toast.success(data.message); load(); fetchProductData?.() }
    else toast.error(data?.message || 'Restore failed')
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <div className="w-full md:p-8 p-4 space-y-5 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">{products.length} total · {products.filter((p) => !p.archived).length} in the store</p>
          </div>
          <Link href="/seller/add-product" className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white text-sm font-medium rounded-md">+ Add product</Link>
        </div>

        {/* Filters: one row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="pl-9 pr-3 py-2 w-60 text-sm rounded-md border border-gray-300 outline-none focus:border-forest-600 bg-white" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="py-2 px-3 text-sm rounded-md border border-gray-300 bg-white outline-none" aria-label="Category">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Stock filter">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                className={`px-3 py-1 text-sm rounded-md ${filter === f.key ? 'bg-forest-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loading /> : (
          <div className="overflow-x-auto rounded-xl bg-white border border-gray-200">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium max-md:hidden">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {shown.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No products match.</td></tr>
                )}
                {shown.map((product) => (
                  <tr key={product._id} className={`border-t border-gray-100 ${product.archived ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Image src={product.image[0]} alt="" width={48} height={48} className="w-12 h-12 rounded-md object-cover bg-gray-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-900 font-medium truncate max-w-[16rem]">{product.name}</p>
                          <p className="text-xs text-gray-500 md:hidden">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-md:hidden">{product.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                      {money(currency, product.offerPrice)}
                      {product.price > product.offerPrice && <span className="block text-xs text-gray-400 line-through">{money(currency, product.price)}</span>}
                    </td>
                    <td className="px-4 py-3"><StockBadge stock={product.stock || 0} archived={product.archived} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!product.archived && (
                          <button onClick={() => router.push(`/product/${product._id}`)} title="View in store" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"><EyeIcon /></button>
                        )}
                        <button onClick={() => router.push(`/seller/product-edit/${product._id}`)} title="Edit" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"><EditIcon /></button>
                        {product.archived ? (
                          <button onClick={() => restore(product)} className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50">Restore</button>
                        ) : (
                          <button onClick={() => setConfirm(product)} title="Delete" className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-700"><TrashIcon /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Delete “{confirm.name}”?</h2>
            <p className="text-sm text-gray-600">
              If this product appears in past orders it will be <b>archived</b> instead: hidden from the store, but kept so those orders still show it. Otherwise it's deleted for good, photos included.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={() => doDelete(confirm)} className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
