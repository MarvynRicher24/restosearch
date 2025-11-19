import fs from 'fs/promises'
import path from 'path'
import type { User } from '../../../types'
import { parseJsonArray, isH3Error } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? body['email'] : undefined
    if (!email) throw createError({ statusCode: 400, statusMessage: 'email requis' })

    const file = path.join(process.cwd(), 'public', 'data', 'users.json')
    let arr: User[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      arr = parseJsonArray<User>(content || '[]')
    } catch (e) {
      arr = []
    }

    const remaining = arr.filter(u => (u.email || '').toLowerCase() !== (email || '').toLowerCase())
    await fs.writeFile(file, JSON.stringify(remaining, null, 2), 'utf-8')

    // Also remove from resto_users_custom (client-side list) if present
    try {
      const customFile = path.join(process.cwd(), 'public', 'data', 'users_custom.json')
      const customContent = await fs.readFile(customFile, 'utf-8').catch(() => '[]')
      const customArr = parseJsonArray<User>(customContent || '[]')
      const remainingCustom = customArr.filter(u => (u.email || '').toLowerCase() !== (email || '').toLowerCase())
      await fs.writeFile(customFile, JSON.stringify(remainingCustom, null, 2), 'utf-8')
    } catch (e) {
      // ignore
    }

    return { ok: true }
  } catch (err: unknown) {
    if (isH3Error(err)) throw err
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le restaurateur sur le serveur' })
  }
})
