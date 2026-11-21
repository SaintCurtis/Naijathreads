'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/seller/Footer'
import Loading from '@/components/Loading'
import useAdminApi, { money } from '@/components/seller/useAdminApi'
import StockBadge from '@/components/seller/StockBadge'
import { SearchIcon } from '@/components/seller/Icons'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

// One row: −/+ buttons for quick changes, or type an exact count and press Save
const StockRow = ({ product, currency, onChange }) => {
  const [value, setValue] = useState(String(product.stock || 0))
  const [busy, setBusy] = useState(false)
  useEffect(() => setValue(String(product.stock || 0)), [product.stock])

  const dirty = Number(value) !== (product.stock || 0)

  const save = async (body) => {
    setBusy(true)
    await onChange(product._id, body)
    setBusy(false)
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image src={product.image[0]} alt="" width={40} height={40} className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0" />
          <div className="min-w-0">
            <Link href={`/seller/product-edit/${product._id}`} className="text-gray-900 font-medium truncate block max-w-[14rem] hover:underline">{product.name}</Link>
            <p className="text-xs text-gray-500">{product.category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><StockBadge stock={product.stock || 0} /></td>
      <td className="px-4 py-3 text-right tabular-nums max-md:hidden">{money(currency, (product.stock || 0) * product.offerPrice)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <button disabled={busy || (product.stock || 0) === 0} onClick={() => save({ delta: -1 })} aria-label="Remove one"
            className="w-8 h-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40">−</button>
          <input
            type="number" min="0" value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && dirty && save({ stock: Math.max(0, Math.floor(Number(value) || 0)) })}
            aria-label={`Stock for ${product.name}`}
            className="w-16 h-8 text-center rounded-md border border-gray-300 outline-none focus:border-forest-600 tabular-nums"
          />
          <button disabled={busy} onClick={() => save({ delta: 1 })} aria-label="Add one"
            className="w-8 h-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40">+</button>
          <button disabled={busy || !dirty} onClick={() => save({ stock: Math.max(0, Math.floor(Number(value) || 0)) })}
            className="ml-1 h-8 px-3 rounded-md text-sm bg-forest-700 text-white hover:bg-forest-800 disabled:bg-gray-200 disabled:text-gray-500">
            Save
          </button>
        </div>
      </td>
    </tr>
  )
}

const Inventory = () => {
  const { user, currency, fetchProductData } = useAppContext()
  const { get, post } = useAdminApi()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [onlyAttention, setOnlyAttention] = useState(false)

  const load = useCallback(async () => {
    const data = await get('/api/product/seller-list')
    if (data?.success) setProducts(data.products.filter((p) => !p.archived))
    else toast.error(data?.message || 'Could not load inventory')
    setLoading(false)
  }, [get])

  useEffect(() => { if (user) load() }, [user, load])

  const updateStock = async (id, body) => {
    const data = await post('/api/product/stock', { id, ...body })
    if (data?.success) {
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: data.stock } : p)))
      fetchProductData?.()
    } else toast.error(data?.message || 'Update failed')
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => !q || `${p.name} ${p.category}`.toLowerCase().includes(q))
      .filter((p) => !onlyAttention || (p.stock || 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
  }, [products, query, onlyAttention])

  const totals = useMemo(() => ({
    units: products.reduce((s, p) => s + (p.stock || 0), 0),
    value: products.reduce((s, p) => s + (p.stock || 0) * p.offerPrice, 0),
    low: products.filter((p) => (p.stock || 0) > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
    out: products.filter((p) => (p.stock || 0) === 0).length,
  }), [products])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <div className="md:p-8 p-4 space-y-5 max-w-6xl w-full">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Lowest stock first. Orders reduce stock automatically; cancelling an order puts it back.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            ['Units in stock', totals.units.toLocaleString()],
            ['Stock value', money(currency, totals.value)],
            [`Low stock (≤ ${LOW_STOCK_THRESHOLD})`, totals.low],
            ['Out of stock', totals.out],
          ].map(([label, v]) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1 tabular-nums">{v}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="pl-9 pr-3 py-2 w-60 text-sm rounded-md border border-gray-300 outline-none focus:border-forest-600 bg-white" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={onlyAttention} onChange={(e) => setOnlyAttention(e.target.checked)} className="accent-forest-700 w-4 h-4" />
            Only low & out of stock
          </label>
        </div>

        {loading ? <Loading /> : (
          <div className="overflow-x-auto rounded-xl bg-white border border-gray-200">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right max-md:hidden">Stock value</th>
                  <th className="px-4 py-3 font-medium text-right">Adjust stock</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {shown.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">{products.length ? 'Nothing matches.' : 'No products yet.'}</td></tr>
                )}
                {shown.map((p) => <StockRow key={p._id} product={p} currency={currency} onChange={updateStock} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Inventory
