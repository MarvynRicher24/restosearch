// server/api/auth/register.post.ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const { createHash, createHmac } = crypto;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const email: string = (body?.email || "").trim().toLowerCase();
    const password: string = body?.password || "";

    // Validations
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email et mot de passe requis",
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Format d'email invalide",
      });
    }

    // Validation mot de passe
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const dataDir = path.join(process.cwd(), ".data");
    await fs.mkdir(dataDir, { recursive: true });
    const usersFile = path.join(dataDir, "users.json");

    let users: Array<any> = [];
    try {
      const content = await fs.readFile(usersFile, "utf-8");
      users = JSON.parse(content || "[]");
    } catch (e) {
      users = [];
    }

    // Vérifier si l'utilisateur existe déjà
    if (users.find((u) => u.email === email)) {
      throw createError({
        statusCode: 409,
        statusMessage: "Un compte avec cet email existe déjà",
      });
    }

    const pwHash = createHash("sha256").update(password).digest("hex");
    const newUser = {
      email,
      password: pwHash,
      createdAt: Date.now(),
    };

    users.push(newUser);
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));

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
      statusMessage: "Erreur serveur lors de l'inscription",
    });
  }
});
