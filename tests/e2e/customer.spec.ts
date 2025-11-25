import { test, expect } from '@playwright/test'

test('Parcours client: recherche → resto → plat → ajouter au panier via auth', async ({ page }) => {
  // 1) Accéder à la page d'accueil et ouvrir le premier restaurant
  await page.goto('/')
  await page.locator('.view-btn').first().click()

  // 2) Sur la page du restaurant, ouvrir le premier plat
  const dishCount = await page.locator('.dish-card').count()
  expect(dishCount).toBeGreaterThan(0)
  await page.locator('.dish-card .btn').first().click()

  // 3) Sur la page du plat, tenter d'ajouter au panier (devrait ouvrir la modal de connexion)
  const addBtn = page.getByRole('button', { name: /Ajouter au panier/i })
  await expect(addBtn).toBeVisible()
  await addBtn.click()

  // modal visible — aller à la page d'auth
  await expect(page.locator('.modal')).toBeVisible()
  await page.getByRole('button', { name: /Se connecter|Se connecter \/ S'inscrire/i }).click()

  // 4) Se connecter en tant qu'utilisateur (coordonnées présentes dans public/data/users.json)
  await page.waitForURL(/\/auth/)
  await page.fill('input[type="email"]', 'marvyn2@hotmail.fr')
  await page.fill('input[type="password"]', 'marvyn')
  await page.locator('form button[type="submit"]').click()

  // 5) Après connexion, l'action en attente doit avoir ajouté l'article au panier — vérifier le panier
  await page.goto('/user/cart')
  const cartCount = await page.locator('.cart-item').count()
  expect(cartCount).toBeGreaterThan(0)
})
