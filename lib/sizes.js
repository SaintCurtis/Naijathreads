// Size helpers shared by the admin, the store and the API.

// Suggested sizes in display order. The admin can also type a custom one
// (e.g. "Age 4-5", "6 yards").
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Free size']

const ORDER = Object.fromEntries(SIZE_PRESETS.map((s, i) => [s, i]))
export const sortSizes = (sizes = []) =>
    [...sizes].sort((a, b) => (ORDER[a.size] ?? 99) - (ORDER[b.size] ?? 99))

export const hasSizes = (product) => Array.isArray(product?.sizes) && product.sizes.length > 0

// Units available for a product, or for one size of it
export const stockFor = (product, size) => {
    if (!product) return 0
    if (hasSizes(product)) {
        if (!size) return product.sizes.reduce((s, x) => s + (x.stock || 0), 0)
        return product.sizes.find((x) => x.size === size)?.stock || 0
    }
    return product.stock || 0
}

// Cart keys: "productId" for one-size products, "productId::M" for sized ones
const SEP = '::'
export const cartKey = (productId, size) => (size ? `${productId}${SEP}${size}` : String(productId))
export const parseCartKey = (key) => {
    const i = String(key).indexOf(SEP)
    return i === -1 ? { productId: key, size: null } : { productId: key.slice(0, i), size: key.slice(i + SEP.length) }
}

// Clean up sizes sent from the admin form: trim, drop blanks/duplicates, whole non-negative stock
export const normaliseSizes = (raw) => {
    let list = raw
    if (typeof raw === 'string') {
        try { list = JSON.parse(raw || '[]') } catch { list = [] }
    }
    if (!Array.isArray(list)) return []
    const seen = new Set()
    const out = []
    for (const item of list) {
        const size = String(item?.size || '').trim().slice(0, 20)
        if (!size || seen.has(size.toLowerCase())) continue
        seen.add(size.toLowerCase())
        out.push({ size, stock: Math.max(0, Math.floor(Number(item.stock) || 0)) })
    }
    return sortSizes(out)
}
