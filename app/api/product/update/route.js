import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import requireSeller from "@/lib/requireSeller";
import { uploadImages, deleteImages } from "@/lib/cloudinary";

// Edit a product. FormData fields:
//   id, name, description, category, price, offerPrice, stock
//   keepImages: JSON array of existing image URLs to keep (in display order)
//   images: new files to append
export async function POST(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        const formData = await request.formData()
        const id = formData.get('id')

        await connectDB()
        const product = await Product.findById(id)
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' })
        }

        const keepImages = JSON.parse(formData.get('keepImages') || '[]').filter((u) => product.image.includes(u))
        const files = formData.getAll('images').filter((f) => f && typeof f === 'object' && f.size > 0)
        const newUrls = files.length ? await uploadImages(files) : []
        const image = [...keepImages, ...newUrls].slice(0, 4)

        if (image.length === 0) {
            return NextResponse.json({ success: false, message: 'A product needs at least one image' })
        }

        const price = Number(formData.get('price'))
        const offerPrice = Number(formData.get('offerPrice'))
        if (!(price > 0) || !(offerPrice > 0)) {
            return NextResponse.json({ success: false, message: 'Prices must be greater than 0' })
        }

        const removed = product.image.filter((u) => !image.includes(u))

        product.name = formData.get('name')
        product.description = formData.get('description')
        product.category = formData.get('category')
        product.price = price
        product.offerPrice = offerPrice
        product.stock = Math.max(0, Math.floor(Number(formData.get('stock') || 0)))
        product.image = image
        await product.save()

        await deleteImages(removed)

        return NextResponse.json({ success: true, message: 'Product updated', product })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
