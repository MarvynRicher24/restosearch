import fs from 'fs/promises'
import path from 'path'
import type { Dish } from '../../types'
import { parseJsonArray, isH3Error } from '../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Données invalides' })
    }

    const file = path.join(process.cwd(), 'public', 'data', 'dishes_custom.json')
    let arr: Dish[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = parseJsonArray<Dish>(content || '[]')
    } catch (e) {
      arr = []
    }

    // prevent duplicate id
    const exists = arr.find((d: Dish) => d.id === (body as any).id)
    if (exists) {
      throw createError({ statusCode: 409, statusMessage: 'Plat déjà existant' })
    }
    const newDish = body as Dish
    arr.push(newDish)
    await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf-8')

    return { ok: true, dish: newDish }
  } catch (err: unknown) {
    if (isH3Error(err)) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de sauvegarder le plat sur le serveur' })
  }
})
