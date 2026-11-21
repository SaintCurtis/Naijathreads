import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import requireSeller from "@/lib/requireSeller";
import { hasSizes } from "@/lib/sizes";

// Body: { id, size?, stock } sets an exact count, or { id, size?, delta } adds/removes units.
// For sized products `size` is required; the product total is recalculated.
export async function POST(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        const { id, size, stock, delta } = await request.json()

        await connectDB()
        const product = await Product.findById(id)
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' })
        }

        const apply = (current) =>
            Math.max(0, Math.floor(typeof stock === 'number' ? stock : current + Number(delta || 0)))

        if (hasSizes(product)) {
            const entry = product.sizes.find((s) => s.size === size)
            if (!entry) {
                return NextResponse.json({ success: false, message: 'Choose a size to update' })
            }
            entry.stock = apply(entry.stock || 0)
            product.stock = product.sizes.reduce((s, x) => s + (x.stock || 0), 0)
            product.markModified('sizes')
        } else {
            product.stock = apply(product.stock || 0)
        }

        await product.save()

        return NextResponse.json({ success: true, message: 'Stock updated', stock: product.stock, sizes: product.sizes })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
