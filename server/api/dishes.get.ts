// server/api/dishes.get.ts
import fs from "fs/promises";
import path from "path";
import type { DishesMap } from '../../types/api'

export default defineEventHandler(async () => {
  try {
    const file = path.join(process.cwd(), "public", "data", "dishes_custom.json");
    const content = await fs.readFile(file, "utf-8");
    const data = JSON.parse(content || "{}") as unknown
    // Normalize to DishesMap: could be an object or an array (legacy)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as DishesMap
    }
    // fallback: if array, return empty map (consumer normalizes later)
    return {} as DishesMap
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de charger les plats",
    });
  }
});
