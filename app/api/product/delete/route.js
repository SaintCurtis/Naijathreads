import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import requireSeller from "@/lib/requireSeller";
import { deleteImages } from "@/lib/cloudinary";

// Body: { id, restore?: boolean }
// A product that appears in past orders is archived (hidden from the store, history kept).
// A product that was never ordered is deleted for good, images included.
export async function POST(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        const { id, restore } = await request.json()

        await connectDB()
        const product = await Product.findById(id)
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' })
        }

        if (restore) {
            product.archived = false
            await product.save()
            return NextResponse.json({ success: true, message: 'Product restored to the store', mode: 'restored' })
        }

        const hasOrders = await Order.exists({ 'items.product': String(product._id) })

        if (hasOrders) {
            product.archived = true
            await product.save()
            return NextResponse.json({ success: true, message: 'Product has past orders, so it was archived (hidden from the store)', mode: 'archived' })
        }

        await Product.deleteOne({ _id: product._id })
        await deleteImages(product.image)
        return NextResponse.json({ success: true, message: 'Product deleted', mode: 'deleted' })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
