// server/api/restaurants.get.ts
import fs from "fs/promises";
import path from "path";
import type { UserWithPassword, Restaurant } from '../../types'

export default defineEventHandler(async () => {
  // Prefer to expose professional users (created by admin) as "restaurants" on the index.
  // Each professional user can add restaurant info (name, address, city, image, description...).
  try {
    const usersFile = path.join(process.cwd(), "public", "data", "users.json");
    const raw = await fs.readFile(usersFile, "utf-8");
    const users = JSON.parse(raw || "[]")
    const pros = Array.isArray(users)
      ? (users as UserWithPassword[]).filter((u) => u && u.role === 'professional')
      : []

    const mapped: Restaurant[] = pros.map((u) => {
      const name = (u as any).restaurant || (u as any).restaurantName || u.name || ''
      const image = u.image || ''
      const locationParts: string[] = []
      if (u.city) locationParts.push(u.city)
      if (u.address) locationParts.push(u.address)
      const location = locationParts.join(', ')
      const cuisine = (u as any).cuisine || ''
      const rating = (u as any).rating || undefined
      const short = (u as any).description || u.bio || (u as any).short || ''
      return {
        id: u.id || u.email || name,
        name,
        image,
        location,
        cuisine,
        rating,
        short,
        createdAt: u.createdAt || null
      }
    })

    // if we found professionals, return them; otherwise fallback to static restaurants.json
    if (mapped.length > 0) return mapped

  } catch (err) {
    // continue to fallback
  }

  // fallback: return packaged restaurants.json
  try {
    const file = path.join(process.cwd(), "public", "data", "restaurants.json");
    const content = await fs.readFile(file, "utf-8");
    const data = JSON.parse(content || "[]");
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de charger les restaurants",
    });
  }
});
