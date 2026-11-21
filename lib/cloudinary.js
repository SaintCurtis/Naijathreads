import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Upload File objects from a FormData request; resolves to their secure URLs.
export async function uploadImages(files) {
    const results = await Promise.all(
        files.map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer())
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'naijathreads/products' },
                    (error, result) => (error ? reject(error) : resolve(result))
                )
                stream.end(buffer)
            })
        })
    )
    return results.map((r) => r.secure_url)
}

// Best-effort removal of images we no longer use. Never throws.
export async function deleteImages(urls = []) {
    const ids = urls
        .map((url) => {
            const m = /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url || '')
            return m ? m[1] : null
        })
        .filter(Boolean)
    if (ids.length === 0) return
    try {
        await cloudinary.api.delete_resources(ids)
    } catch (e) {
        console.log('Cloudinary cleanup skipped:', e.message)
    }
}

export default cloudinary
