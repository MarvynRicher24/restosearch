import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const email = body?.email
    if (!email) throw createError({ statusCode: 400, statusMessage: 'email requis' })

    const file = path.join(process.cwd(), 'public', 'data', 'users.json')
    let arr: any[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = JSON.parse(content || '[]')
      if (!Array.isArray(arr)) arr = []
    } catch (e) {
      arr = []
    }

    const remaining = arr.filter((u: any) => (u.email || '').toLowerCase() !== (email || '').toLowerCase())
    await fs.writeFile(file, JSON.stringify(remaining, null, 2), 'utf-8')

    // Also remove from resto_users_custom (client-side list) if present
    try {
      const customFile = path.join(process.cwd(), 'public', 'data', 'users_custom.json')
      const customContent = await fs.readFile(customFile, 'utf-8').catch(() => '[]')
      const customArr = JSON.parse(customContent || '[]')
      const remainingCustom = (Array.isArray(customArr) ? customArr : []).filter((u: any) => (u.email || '').toLowerCase() !== (email || '').toLowerCase())
      await fs.writeFile(customFile, JSON.stringify(remainingCustom, null, 2), 'utf-8')
    } catch (e) {
      // ignore
    }

    return { ok: true }
  } catch (err: any) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le restaurateur sur le serveur' })
  }
})
