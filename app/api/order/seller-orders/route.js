import connectDB from "@/config/db";
import requireSeller from "@/lib/requireSeller";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { denied } = await requireSeller(request)
        if (denied) return denied

        await connectDB()

        // make sure the models are registered before populate
        await Address.length
        await Product.length

        const orders = await Order.find({}).sort({ date: -1 }).populate('address items.product')

        return NextResponse.json({ success: true, orders })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
