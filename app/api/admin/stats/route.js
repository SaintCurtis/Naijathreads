import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Address from "@/models/Address";
import requireSeller from "@/lib/requireSeller";
import { LOW_STOCK_THRESHOLD, ORDER_STATUSES } from "@/lib/constants";

const DAY = 24 * 60 * 60 * 1000;
const ALLOWED_RANGES = [7, 30, 90, 365];

const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

// GET /api/admin/stats?days=30
// Everything the dashboard draws, computed in one pass over the orders in range.
export async function GET(request) {
    try {
        const { denied } = await requireSeller(request);
        if (denied) return denied;

        const requested = Number(new URL(request.url).searchParams.get("days"));
        const days = ALLOWED_RANGES.includes(requested) ? requested : 30;

        await connectDB();
        await Address.length; // register model for populate

        const now = Date.now();
        const since = now - days * DAY;
        const prevSince = since - days * DAY;

        const [orders, prevOrders, products, customerCount] = await Promise.all([
            Order.find({ date: { $gte: since } }).sort({ date: -1 }).populate("items.product address"),
            Order.find({ date: { $gte: prevSince, $lt: since } }).select("amount status"),
            Product.find({}).select("name category stock archived offerPrice image"),
            User.countDocuments({}),
        ]);

        const live = orders.filter((o) => o.status !== "Cancelled");
        const prevLive = prevOrders.filter((o) => o.status !== "Cancelled");

        const revenue = live.reduce((s, o) => s + o.amount, 0);
        const prevRevenue = prevLive.reduce((s, o) => s + o.amount, 0);
        const aov = live.length ? revenue / live.length : 0;
        const prevAov = prevLive.length ? prevRevenue / prevLive.length : 0;

        const change = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

        // Revenue + orders per day, every day in range present (zeros included)
        const byDay = {};
        for (let t = since; t <= now; t += DAY) byDay[dayKey(t)] = { revenue: 0, orders: 0 };
        for (const o of live) {
            const k = dayKey(o.date);
            if (!byDay[k]) byDay[k] = { revenue: 0, orders: 0 };
            byDay[k].revenue += o.amount;
            byDay[k].orders += 1;
        }
        const revenueByDay = Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => ({ date, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }));

        // Orders per status (all statuses listed, in workflow order)
        const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
        for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

        // Sales per category and per product (from non-cancelled orders)
        const categoryTotals = {};
        const productTotals = {};
        for (const o of live) {
            for (const item of o.items) {
                const p = item.product;
                if (!p) continue;
                const value = (p.offerPrice || 0) * item.quantity;
                categoryTotals[p.category] = (categoryTotals[p.category] || 0) + value;
                const key = String(p._id);
                if (!productTotals[key]) productTotals[key] = { name: p.name, units: 0, revenue: 0 };
                productTotals[key].units += item.quantity;
                productTotals[key].revenue += value;
            }
        }
        const salesByCategory = Object.entries(categoryTotals)
            .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
            .sort((a, b) => b.revenue - a.revenue);
        const topProducts = Object.values(productTotals)
            .sort((a, b) => b.units - a.units)
            .slice(0, 5);

        // Inventory
        const active = products.filter((p) => !p.archived);
        const outOfStock = active.filter((p) => (p.stock || 0) === 0);
        const lowStock = active
            .filter((p) => (p.stock || 0) > 0 && p.stock <= LOW_STOCK_THRESHOLD)
            .sort((a, b) => a.stock - b.stock);
        const unitsInStock = active.reduce((s, p) => s + (p.stock || 0), 0);
        const stockValue = active.reduce((s, p) => s + (p.stock || 0) * (p.offerPrice || 0), 0);

        const recentOrders = orders.slice(0, 6).map((o) => ({
            _id: o._id,
            customer: o.address?.fullName || "Customer",
            items: o.items.reduce((s, i) => s + i.quantity, 0),
            amount: o.amount,
            status: o.status,
            date: o.date,
        }));

        const attention = [...outOfStock, ...lowStock].slice(0, 8).map((p) => ({
            _id: p._id,
            name: p.name,
            category: p.category,
            stock: p.stock || 0,
            image: p.image?.[0],
        }));

        return NextResponse.json({
            success: true,
            days,
            kpis: {
                revenue,
                revenueChange: change(revenue, prevRevenue),
                orders: live.length,
                ordersChange: change(live.length, prevLive.length),
                aov,
                aovChange: change(aov, prevAov),
                customers: customerCount,
                products: active.length,
                unitsInStock,
                stockValue,
                lowStock: lowStock.length,
                outOfStock: outOfStock.length,
                pending: orders.filter((o) => ["Order Placed", "Processing"].includes(o.status)).length,
            },
            revenueByDay,
            ordersByStatus,
            salesByCategory,
            topProducts,
            recentOrders,
            attention,
            lowStockThreshold: LOW_STOCK_THRESHOLD,
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
