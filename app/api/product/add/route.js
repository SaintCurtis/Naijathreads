import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import requireSeller from "@/lib/requireSeller";
import { uploadImages } from "@/lib/cloudinary";

export async function POST(request) {
    try {
        const { userId, denied } = await requireSeller(request)
        if (denied) return denied

        const formData = await request.formData()

        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = Number(formData.get('price'));
        const offerPrice = Number(formData.get('offerPrice'));
        const stock = Math.max(0, Math.floor(Number(formData.get('stock') || 0)));

        const files = formData.getAll('images').filter((f) => f && typeof f === 'object' && f.size > 0);

        if (files.length === 0) {
            return NextResponse.json({ success: false, message: 'Add at least one product image' })
        }
        if (!(price > 0) || !(offerPrice > 0)) {
            return NextResponse.json({ success: false, message: 'Prices must be greater than 0' })
        }

        const image = await uploadImages(files)

        await connectDB()
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price,
            offerPrice,
            stock,
            image,
            date: Date.now()
        })

        return NextResponse.json({ success: true, message: 'Product added', newProduct })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
