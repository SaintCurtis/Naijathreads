'use client';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import useAdminApi, { money } from "@/components/seller/useAdminApi";
import StatusPill from "@/components/seller/StatusPill";
import { SearchIcon } from "@/components/seller/Icons";
import { ORDER_STATUSES } from "@/lib/constants";

const Orders = () => {
    const { currency, user } = useAppContext();
    const { get, post } = useAdminApi();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 15;

    const load = useCallback(async () => {
        const data = await get('/api/order/seller-orders')
        if (data?.success) setOrders(data.orders)
        else toast.error(data?.message || 'Could not load orders')
        setLoading(false)
    }, [get])

    useEffect(() => { if (user) load() }, [user, load]);

    const changeStatus = async (order, next) => {
        if (next === order.status) return
        if (next === 'Cancelled' && !window.confirm('Cancel this order? Its items go back into stock and it can\'t be reopened.')) return
        const data = await post('/api/order/status', { orderId: order._id, status: next })
        if (data?.success) {
            toast.success(data.message)
            setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: data.status } : o)))
        } else toast.error(data?.message || 'Update failed')
    }

    const counts = useMemo(() => {
        const c = { all: orders.length }
        for (const o of orders) c[o.status] = (c[o.status] || 0) + 1
        return c
    }, [orders])

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase()
        return orders.filter((o) => {
            if (status !== 'all' && o.status !== status) return false
            if (!q) return true
            const hay = [o.address?.fullName, o.address?.phoneNumber, o.address?.city, String(o._id), ...o.items.map((i) => i.product?.name)]
                .join(' ').toLowerCase()
            return hay.includes(q)
        })
    }, [orders, status, query])

    useEffect(() => { setPage(1) }, [status, query])
    const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE))
    const pageItems = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
            <div className="md:p-8 p-4 space-y-5 max-w-6xl w-full">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                    <p className="text-gray-500">Update a status as the order moves. Cancelling returns the items to stock.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Customer, phone, product, order ID" className="pl-9 pr-3 py-2 w-72 rounded-md border border-gray-300 outline-none focus:border-forest-600 bg-white" />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="py-2 px-3 rounded-md border border-gray-300 bg-white outline-none" aria-label="Status filter">
                        <option value="all">All statuses ({counts.all || 0})</option>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s} ({counts[s] || 0})</option>)}
                    </select>
                </div>

                {loading ? <Loading /> : shown.length === 0 ? (
                    <p className="py-16 text-center text-gray-500 bg-white rounded-xl border border-gray-200">No orders {status !== 'all' || query ? 'match' : 'yet'}.</p>
                ) : (
                    <div className="space-y-3">
                        {pageItems.map((order) => {
                            const thumb = order.items.find((i) => i.product?.image?.[0])?.product.image[0]
                            return (
                            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5 grid md:grid-cols-[1.4fr_1fr_auto_auto] gap-5 items-start">
                                <div className="flex gap-4 min-w-0">
                                    {thumb
                                        ? <Image className="w-12 h-12 shrink-0 rounded-md object-cover bg-gray-100" src={thumb} alt="" width={48} height={48} />
                                        : <div className="w-12 h-12 shrink-0 rounded-md bg-gray-100" />}
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-medium text-gray-900">
                                            {order.items.map((item) => `${item.product?.name || 'Removed product'} × ${item.quantity}`).join(", ")}
                                        </p>
                                        <p className="text-gray-500">
                                            {order.items.reduce((s, i) => s + i.quantity, 0)} item(s) · {new Date(order.date).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">#{String(order._id).slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-gray-600 leading-relaxed">
                                    <p className="font-medium text-gray-900">{order.address?.fullName}</p>
                                    <p>{order.address?.area}</p>
                                    <p>{[order.address?.city, order.address?.state].filter(Boolean).join(', ')}</p>
                                    <p>{order.address?.phoneNumber}</p>
                                </div>
                                <div className="md:text-right">
                                    <p className="font-semibold text-gray-900 tabular-nums">{money(currency, order.amount)}</p>
                                    <p className="text-gray-500">Pay on delivery</p>
                                </div>
                                <div className="space-y-2 md:w-44">
                                    <StatusPill status={order.status} />
                                    <select
                                        value={order.status}
                                        disabled={order.status === 'Cancelled'}
                                        onChange={(e) => changeStatus(order, e.target.value)}
                                        className="w-full py-1.5 px-2 rounded-md border border-gray-300 bg-white outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                        aria-label="Change order status"
                                    >
                                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            )
                        })}
                        {pages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-gray-500">
                                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, shown.length)} of {shown.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo(0, 0) }} className="px-3 py-1.5 rounded-md border border-gray-300 bg-white disabled:opacity-40">← Previous</button>
                                    <span className="text-gray-600 tabular-nums">{page} / {pages}</span>
                                    <button disabled={page === pages} onClick={() => { setPage(page + 1); window.scrollTo(0, 0) }} className="px-3 py-1.5 rounded-md border border-gray-300 bg-white disabled:opacity-40">Next →</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Orders;
