'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/AppContext'
import Footer from '@/components/admin/Footer'
import Loading from '@/components/Loading'
import useAdminApi, { money } from '@/components/admin/useAdminApi'
import StockBadge from '@/components/admin/StockBadge'
import StatusPill from '@/components/admin/StatusPill'
import { ChartCard, KpiTile, RevenueChart, HBarChart, ColumnChart } from '@/components/admin/Charts'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '12 months' },
]

const Dashboard = () => {
  const { currency, user } = useAppContext()
  const { get } = useAdminApi()
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (d) => {
    setLoading(true)
    const data = await get(`/api/admin/stats?days=${d}`)
    if (data?.success) setStats(data)
    else toast.error(data?.message || 'Could not load stats')
    setLoading(false)
  }, [get])

  useEffect(() => {
    if (user) load(days)
  }, [user, days, load])

  const cur = currency || '$'
  const k = stats?.kpis

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <div className="md:p-8 p-4 space-y-6 max-w-7xl w-full">
        {/* Header + filters, one row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Sales, orders and stock at a glance</p>
          </div>
          <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                aria-pressed={days === r.days}
                className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition ${days === r.days ? 'bg-forest-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {!stats ? (
          <Loading />
        ) : (
          <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {/* KPI tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile label="Revenue" value={money(cur, k.revenue)} change={k.revenueChange} hint="Excludes cancelled orders" />
              <KpiTile label="Orders" value={k.orders.toLocaleString()} change={k.ordersChange} hint={`${k.pending} waiting to ship`} />
              <KpiTile label="Avg. order value" value={money(cur, k.aov)} change={k.aovChange} hint="Per order" />
              <KpiTile label="Customers" value={k.customers.toLocaleString()} hint="Registered accounts" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile label="Active products" value={k.products.toLocaleString()} hint="Visible in the store" />
              <KpiTile label="Units in stock" value={k.unitsInStock.toLocaleString()} hint={`Worth ${money(cur, k.stockValue)}`} />
              <KpiTile label="Low stock" value={k.lowStock.toLocaleString()} hint={`${stats.lowStockThreshold} or fewer left`} />
              <KpiTile label="Out of stock" value={k.outOfStock.toLocaleString()} hint="Can't be ordered" />
            </div>

            {/* Revenue over time */}
            <ChartCard
              title="Revenue"
              subtitle={`Daily revenue, last ${RANGES.find((r) => r.days === stats.days)?.label}`}
              table={{
                columns: [
                  { key: 'date', label: 'Date' },
                  { key: 'orders', label: 'Orders', align: 'right' },
                  { key: 'revenue', label: 'Revenue', align: 'right', format: (v) => money(cur, v) },
                ],
                rows: stats.revenueByDay.filter((d) => d.orders > 0).reverse(),
              }}
            >
              <RevenueChart data={stats.revenueByDay} currency={cur} />
            </ChartCard>

            <div className="grid lg:grid-cols-2 gap-6">
              <ChartCard
                title="Sales by category"
                subtitle="Revenue per category"
                table={{
                  columns: [
                    { key: 'category', label: 'Category' },
                    { key: 'revenue', label: 'Revenue', align: 'right', format: (v) => money(cur, v) },
                  ],
                  rows: stats.salesByCategory,
                }}
              >
                <ColumnChart data={stats.salesByCategory} labelKey="category" valueKey="revenue" valueLabel="Revenue" currency={cur} />
              </ChartCard>

              <ChartCard
                title="Orders by status"
                subtitle="Where this period's orders are now"
                table={{
                  columns: [
                    { key: 'status', label: 'Status' },
                    { key: 'count', label: 'Orders', align: 'right' },
                  ],
                  rows: stats.ordersByStatus,
                }}
              >
                <HBarChart data={stats.ordersByStatus} labelKey="status" valueKey="count" valueLabel="Orders" />
              </ChartCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <ChartCard
                title="Top products"
                subtitle="Best sellers by units sold"
                table={{
                  columns: [
                    { key: 'name', label: 'Product' },
                    { key: 'units', label: 'Units', align: 'right' },
                    { key: 'revenue', label: 'Revenue', align: 'right', format: (v) => money(cur, v) },
                  ],
                  rows: stats.topProducts,
                }}
              >
                <HBarChart data={stats.topProducts} labelKey="name" valueKey="units" valueLabel="Units sold" />
              </ChartCard>

              <ChartCard title="Needs restocking" subtitle="Out of stock first, then lowest stock">
                {stats.attention.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Everything is well stocked.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {stats.attention.map((p) => (
                      <li key={p._id} className="flex items-center gap-3 py-2.5">
                        {p.image && (
                          <Image src={p.image} alt="" width={40} height={40} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                        <StockBadge stock={p.stock} />
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/admin/inventory" className="mt-3 text-sm font-medium text-forest-700 hover:underline self-start">
                  Manage inventory →
                </Link>
              </ChartCard>
            </div>

            {/* Recent orders */}
            <ChartCard title="Recent orders" subtitle="Latest orders in this period">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-500">
                      <tr>
                        <th className="py-2 font-medium">Customer</th>
                        <th className="py-2 font-medium">Date</th>
                        <th className="py-2 font-medium text-right">Items</th>
                        <th className="py-2 font-medium text-right">Amount</th>
                        <th className="py-2 font-medium pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {stats.recentOrders.map((o) => (
                        <tr key={o._id} className="border-t border-gray-100">
                          <td className="py-2.5">{o.customer}</td>
                          <td className="py-2.5 text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                          <td className="py-2.5 text-right tabular-nums">{o.items}</td>
                          <td className="py-2.5 text-right tabular-nums">{money(cur, o.amount)}</td>
                          <td className="py-2.5 pl-4"><StatusPill status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Link href="/admin/orders" className="mt-3 text-sm font-medium text-forest-700 hover:underline self-start">
                All orders →
              </Link>
            </ChartCard>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
