import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import authSeller from '@/lib/authSeller'

// Use at the top of every admin API route:
//   const { userId, denied } = await requireSeller(request); if (denied) return denied;
export default async function requireSeller(request) {
    const { userId } = getAuth(request)
    const ok = await authSeller(userId)
    if (!ok) {
        return { userId, denied: NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 }) }
    }
    return { userId, denied: null }
}
