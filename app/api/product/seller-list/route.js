import connectDB from '@/config/db'
import Product from '@/models/Product'
import requireSeller from '@/lib/requireSeller'
import { NextResponse } from 'next/server'

// Admin listing: every product, archived included, newest first.
export async function GET(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        await connectDB()
        const products = await Product.find({}).sort({ date: -1 })
        return NextResponse.json({ success: true, products })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
