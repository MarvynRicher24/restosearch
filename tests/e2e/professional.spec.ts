import { test, expect } from '@playwright/test'

test('Parcours professionnel: créer un plat (fallback localStorage)', async ({ page }) => {
  // Préparer session pro via localStorage
  await page.goto('/')
  await page.evaluate(() => {
    try {
      localStorage.setItem('resto_user', JSON.stringify({ id: 'p1761735220817', name: 'marvynesto', email: 'pro@hotmail.fr', role: 'professional' }))
      localStorage.setItem('resto_token', 'e2e-token')
    } catch (e) {}
  })

  // Aller à la page création de plat
  await page.goto('/professional/createDishes')
  await expect(page.locator('h1.title, h1')).toBeVisible()

  // Remplir le formulaire minimal
  await page.getByLabel('Nom').fill('E2E Test Dish')
  await page.getByLabel('Prix (€)').fill('9.99')
  await page.locator('form button[type="submit"]').click()

  // Vérifier la redirection vers la liste des plats professionnels
  await page.waitForURL(/\/professional\/dishes/)
  await expect(page).toHaveURL(/\/professional\/dishes/)
})
