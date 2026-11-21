import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { reserveStock, releaseStock } from "@/lib/stock";
import { hasSizes, stockFor } from "@/lib/sizes";

// Body: { address, items: [{ product, quantity, size? }] }
export async function POST(request) {
    const reserved = [] // stock taken so far, returned if anything fails

    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Please sign in' })
        }

        const { address, items } = await request.json();

        if (!address || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        await connectDB()

        let amount = 0
        const orderItems = []

        for (const item of items) {
            const quantity = Math.floor(Number(item.quantity))
            if (!(quantity > 0)) throw new Error('Invalid quantity')

            const existing = await Product.findById(item.product)
            if (!existing || existing.archived) throw new Error('An item in your cart is no longer available.')

            const sized = hasSizes(existing)
            const size = sized ? String(item.size || '') : null
            if (sized && !existing.sizes.some((s) => s.size === size)) {
                throw new Error(`Please choose a size for "${existing.name}".`)
            }

            const product = await reserveStock(existing._id, size, quantity)

            if (!product) {
                const label = size ? `"${existing.name}" in size ${size}` : `"${existing.name}"`
                const left = stockFor(existing, size)
                throw new Error(left > 0
                    ? `Only ${left} of ${label} left. Please reduce the quantity.`
                    : `${label} is out of stock.`)
            }

            reserved.push({ id: product._id, size, quantity })
            orderItems.push({ product: String(product._id), quantity, size })
            amount += product.offerPrice * quantity
        }

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items: orderItems,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now()
            }
        })

        // clear user cart
        const user = await User.findById(userId)
        if (user) {
            user.cartItems = {}
            await user.save()
        }

        return NextResponse.json({ success: true, message: 'Order Placed' })

    } catch (error) {
        // give back anything reserved before the failure
        await Promise.all(reserved.map((r) => releaseStock(r.id, r.size, r.quantity))).catch(() => {})
        console.log(error)
        return NextResponse.json({ success: false, message: error.message })
    }
}
