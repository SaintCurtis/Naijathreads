const STATUS_STYLE = {
  'Order Placed': 'bg-blue-50 text-blue-700',
  Processing: 'bg-amber-50 text-amber-800',
  Shipped: 'bg-indigo-50 text-indigo-700',
  'Out for Delivery': 'bg-purple-50 text-purple-700',
  Delivered: 'bg-forest-50 text-forest-700',
  Cancelled: 'bg-red-50 text-red-700',
}

// Status is always written out, so colour is never the only signal
const StatusPill = ({ status }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
)

export default StatusPill
