import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Données invalides' })
    }

    const file = path.join(process.cwd(), 'public', 'data', 'dishes_custom.json')
    let arr: any[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = JSON.parse(content || '[]')
      if (!Array.isArray(arr)) arr = []
    } catch (e) {
      arr = []
    }

    // prevent duplicate id
    const exists = arr.find((d: any) => d.id === body.id)
    if (exists) {
      throw createError({ statusCode: 409, statusMessage: 'Plat déjà existant' })
    }

    arr.push(body)
    await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf-8')

    return { ok: true, dish: body }
  } catch (err: any) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de sauvegarder le plat sur le serveur' })
  }
})
