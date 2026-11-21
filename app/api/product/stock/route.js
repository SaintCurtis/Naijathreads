import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import requireSeller from "@/lib/requireSeller";

// Body: { id, stock } sets an exact count, or { id, delta } adds/removes units.
export async function POST(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        const { id, stock, delta } = await request.json()

        await connectDB()
        const product = await Product.findById(id)
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' })
        }

        const next = typeof stock === 'number' ? stock : (product.stock || 0) + Number(delta || 0)
        product.stock = Math.max(0, Math.floor(next))
        await product.save()

        return NextResponse.json({ success: true, message: 'Stock updated', stock: product.stock })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
