import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || !body.email) {
      throw createError({ statusCode: 400, statusMessage: 'Données invalides' })
    }

    const file = path.join(process.cwd(), 'public', 'data', 'users.json')
    let arr: any[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = JSON.parse(content || '[]')
      if (!Array.isArray(arr)) arr = []
    } catch (e) {
      // file may not exist or be invalid, start with empty
      arr = []
    }

    // prevent duplicate emails
    const exists = arr.find((u: any) => (u.email || '').toLowerCase() === (body.email || '').toLowerCase())
    if (exists) {
      throw createError({ statusCode: 409, statusMessage: 'Un utilisateur avec cet email existe déjà' })
    }

    arr.push(body)
    await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf-8')

    return { ok: true, user: body }
  } catch (err: any) {
    // bubble createError
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de sauvegarder l\'utilisateur sur le serveur' })
  }
})
