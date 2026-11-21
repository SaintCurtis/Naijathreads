import Product from "@/models/Product";

// Atomically take `quantity` units (of `size`, for sized products).
// Succeeds only if enough units are left, so two buyers can never both get the last piece.
// Returns the updated product, or null if there isn't enough stock.
export async function reserveStock(productId, size, quantity) {
    if (size) {
        return Product.findOneAndUpdate(
            { _id: productId, archived: { $ne: true }, sizes: { $elemMatch: { size, stock: { $gte: quantity } } } },
            { $inc: { 'sizes.$.stock': -quantity, stock: -quantity } },
            { new: true }
        )
    }
    return Product.findOneAndUpdate(
        { _id: productId, archived: { $ne: true }, 'sizes.0': { $exists: false }, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
    )
}

// Put units back (failed checkout, cancelled order)
export async function releaseStock(productId, size, quantity) {
    if (size) {
        const res = await Product.updateOne(
            { _id: productId, 'sizes.size': size },
            { $inc: { 'sizes.$.stock': quantity, stock: quantity } }
        )
        if (res.matchedCount) return
        // size was removed from the product since the order: return it to the total only
    }
    await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
}
