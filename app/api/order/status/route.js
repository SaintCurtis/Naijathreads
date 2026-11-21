import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { releaseStock } from "@/lib/stock";
import requireSeller from "@/lib/requireSeller";
import { ORDER_STATUSES } from "@/lib/constants";

// Body: { orderId, status }
// Cancelling puts the items back into stock. A cancelled order can't be reopened
// (place a new order instead), so stock is never returned twice.
export async function POST(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        const { orderId, status } = await request.json()
        if (!ORDER_STATUSES.includes(status)) {
            return NextResponse.json({ success: false, message: 'Unknown status' })
        }

        await connectDB()
        const order = await Order.findById(orderId)
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' })
        }
        if (order.status === 'Cancelled') {
            return NextResponse.json({ success: false, message: 'This order was cancelled and can no longer change' })
        }

        if (status === 'Cancelled') {
            await Promise.all(order.items.map((item) =>
                releaseStock(item.product, item.size || null, item.quantity)
            ))
        }

        order.status = status
        await order.save()

        return NextResponse.json({ success: true, message: `Order marked "${status}"`, status })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
