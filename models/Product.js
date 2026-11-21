import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    // Per-size stock, e.g. [{ size: 'M', stock: 3 }, { size: 'L', stock: 5 }].
    // Empty for one-size items (fabrics, caps, accessories).
    sizes: {
        type: [{ _id: false, size: { type: String, required: true }, stock: { type: Number, default: 0, min: 0 } }],
        default: [],
    },
    // Total units available. For sized products this is always the sum of `sizes`.
    // Orders decrement it; cancelling an order puts it back.
    stock: { type: Number, default: 0, min: 0 },
    // Archived products are hidden from the store but kept so old orders still show them.
    archived: { type: Boolean, default: false },
    date: { type: Number, required: true }
})

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product
