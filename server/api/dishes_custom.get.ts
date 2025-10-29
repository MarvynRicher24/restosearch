import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async () => {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'dishes_custom.json')
    const content = await fs.readFile(file, 'utf-8')
    const data = JSON.parse(content || '[]')
    return Array.isArray(data) ? data : []
  } catch (error) {
    // if file doesn't exist, return empty
    return []
  }
})
