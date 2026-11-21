import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

        // Reserve stock item by item. The conditional update only succeeds when enough
        // units are left, so two buyers can never both take the last piece.
        let amount = 0
        for (const item of items) {
            const quantity = Math.floor(Number(item.quantity))
            if (!(quantity > 0)) {
                throw new Error('Invalid quantity')
            }

            const product = await Product.findOneAndUpdate(
                { _id: item.product, archived: { $ne: true }, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true }
            )

            if (!product) {
                const existing = await Product.findById(item.product)
                const name = existing ? existing.name : 'An item'
                const left = existing && !existing.archived ? existing.stock : 0
                throw new Error(left > 0
                    ? `Only ${left} of "${name}" left. Please reduce the quantity.`
                    : `"${name}" is out of stock.`)
            }

            reserved.push({ id: product._id, quantity })
            amount += product.offerPrice * quantity
        }

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
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
        await Promise.all(reserved.map((r) =>
            Product.updateOne({ _id: r.id }, { $inc: { stock: r.quantity } })
        )).catch(() => {})
        console.log(error)
        return NextResponse.json({ success: false, message: error.message })
    }
}
