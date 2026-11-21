import connectDB from '@/config/db'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

// Public store listing: archived products are hidden.
export async function GET() {
    try {
        await connectDB()
        const products = await Product.find({ archived: { $ne: true } })
        return NextResponse.json({ success: true, products })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
