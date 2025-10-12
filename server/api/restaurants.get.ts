// server/api/restaurants.get.ts
import fs from "fs/promises";
import path from "path";

export default defineEventHandler(async () => {
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
