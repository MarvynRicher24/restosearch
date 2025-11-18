import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || !body.email) throw createError({ statusCode: 400, statusMessage: 'email requis' })

    const usersFile = path.join(process.cwd(), 'public', 'data', 'users.json')
    let arr: any[] = []
    try {
      const content = await fs.readFile(usersFile, 'utf-8')
      arr = JSON.parse(content || '[]')
      if (!Array.isArray(arr)) arr = []
    } catch (e) {
      arr = []
    }

    const idx = arr.findIndex((u: any) => (u.email || '').toLowerCase() === (body.email || '').toLowerCase())
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: 'utilisateur non trouvé' })
    }

    const existing = arr[idx]
    const updated: any = { ...existing }

    // copy simple fields; we will consolidate restaurant name into a single `name` field
  // allow updating address, postal code, city and a short description
  const allowed = ['address', 'postalCode', 'city', 'description']
    for (const k of allowed) {
      if (body[k] !== undefined) updated[k] = body[k]
    }

    // Consolidate restaurant name: prefer body.name, then body.restaurant, then body.restaurantName
    const restaurantName = (body.name || body.restaurant || body.restaurantName)
    if (restaurantName !== undefined && restaurantName !== null) {
      updated.name = restaurantName
    }
    // Remove legacy duplicate fields if present
    delete updated.restaurant
    delete updated.restaurantName

    // handle image: accept either a data URL (base64) or a URL string
    if (body.image) {
      const img = body.image as string
      if (typeof img === 'string' && img.startsWith('data:')) {
        // data URL: data:image/webp;base64,AAAA
        const m = img.match(/^data:(image\/(webp|jpeg|jpg));base64,(.+)$/)
        if (!m) throw createError({ statusCode: 400, statusMessage: 'format d\'image non supporté (attendu webp ou jpeg)' })
        const mime = m[1] as string
        const ext = (m[2] === 'webp') ? 'webp' : 'jpg'
        const b64 = m[3]

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'professional')
        await fs.mkdir(uploadsDir, { recursive: true })
        const safeName = (existing.id || existing.email || 'pro').toString().replace(/[^a-z0-9-_\.]/gi, '_')
        const filename = `${safeName}-${Date.now()}.${ext}`
        const filepath = path.join(uploadsDir, filename)
        const buffer = Buffer.from(b64, 'base64')
        await fs.writeFile(filepath, buffer)
        // expose relative URL
        updated.image = `/uploads/professional/${filename}`
      } else if (typeof img === 'string') {
        // URL provided — accept as-is
        updated.image = img
      }
    }

  arr[idx] = updated
    await fs.writeFile(usersFile, JSON.stringify(arr, null, 2), 'utf-8')

    return { ok: true, user: updated }
  } catch (err: any) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de mettre à jour le profil' })
  }
})
