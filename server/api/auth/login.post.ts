// server/api/auth/login.post.ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const { createHash, createHmac } = crypto;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const email: string = (body?.email || "").trim().toLowerCase();
    const password: string = body?.password || "";

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email et mot de passe requis",
      });
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Format d'email invalide",
      });
    }

    const dataDir = path.join(process.cwd(), ".data");
    const usersFile = path.join(dataDir, "users.json");

    let users: Array<any> = [];
    try {
      const content = await fs.readFile(usersFile, "utf-8");
      users = JSON.parse(content || "[]");
    } catch (e) {
      // Le fichier n'existe pas encore, c'est normal
      users = [];
    }

    const pwHash = createHash("sha256").update(password).digest("hex");
    const found = users.find((u) => u.email === email && u.password === pwHash);

    if (!found) {
      throw createError({
        statusCode: 401,
        statusMessage: "Identifiants invalides",
      });
    }

    const config = useRuntimeConfig();
    const secret = config.NITRO_SECRET;
    const token = createHmac("sha256", secret)
      .update(email + Date.now().toString())
      .digest("hex");

    return { email, token };
  } catch (error: any) {
    // Si c'est déjà une erreur HTTP, on la relance
    if (error.statusCode) {
      throw error;
    }

    // Sinon, erreur serveur générique
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur serveur lors de la connexion",
    });
  }
});
