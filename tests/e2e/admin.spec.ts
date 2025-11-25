import { test, expect } from '@playwright/test'

test('Parcours admin: créer un professionnel (fallback localStorage)', async ({ page }) => {
  // Préparer session admin
  await page.goto('/')
  await page.evaluate(() => {
    try {
      localStorage.setItem('resto_user', JSON.stringify({ id: 'u1', email: 'marvyn@hotmail.fr', name: 'Marvyn', role: 'admin' }))
      localStorage.setItem('resto_token', 'admin-token')
    } catch (e) {}
  })

  // Aller à la page d'admin pour créer un pro
  await page.goto('/admin/createPro')
  await expect(page.locator('h1')).toContainText(/Créer/) // assurance

  // Remplir le formulaire
  const unique = Date.now()
  await page.getByLabel('Nom du restaurant').fill(`e2e-resto-${unique}`)
  await page.getByLabel('Adresse').fill('1 rue E2E')
  await page.getByLabel('Code postal').fill('12345')
  await page.getByLabel('Ville').fill('VilleTest')
  const email = `e2e+${unique}@example.test`
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe').fill('e2epwd')
  await page.locator('form button[type="submit"]').click()

  // Vérifier qu'un enregistrement local a été créé (fallback local)
  const arr = await page.evaluate(() => JSON.parse(localStorage.getItem('resto_users_custom') || '[]'))
  const found = (arr || []).find((u: any) => u && u.email === `${email}`)
  expect(found).toBeTruthy()
})
