import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

// Text + colour, never colour alone
const StockBadge = ({ stock = 0, archived = false, low = LOW_STOCK_THRESHOLD }) => {
  if (archived) return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Archived</span>
  if (stock === 0) return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">● Out of stock</span>
  if (stock <= low) return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">▲ Low · {stock}</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">In stock · {stock}</span>
}

export default StockBadge
