import { clerkClient } from '@clerk/nextjs/server';

// Returns true only when the signed-in Clerk user has publicMetadata.role === 'seller'.
// Any failure (no user, Clerk error) returns false, so a broken check never grants access.
const authSeller = async (userId) => {
    if (!userId) return false;
    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        return user?.publicMetadata?.role === 'seller'
    } catch (error) {
        return false
    }
}

export default authSeller;
