import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'id requis' })

    const file = path.join(process.cwd(), 'public', 'data', 'dishes_custom.json')
    let arr: any[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = JSON.parse(content || '[]')
      if (!Array.isArray(arr)) arr = []
    } catch (e) {
      arr = []
    }

    const remaining = arr.filter((d: any) => d.id !== id)
    await fs.writeFile(file, JSON.stringify(remaining, null, 2), 'utf-8')

    return { ok: true }
  } catch (err: any) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le plat sur le serveur' })
  }
})
