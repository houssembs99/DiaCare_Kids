# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Dashboard Navigation >> should login as Doctor and see dashboard
- Location: tests\dashboard.spec.js:34:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*doctor\/dashboard/
Received string:  "http://localhost:3000/auth"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × unexpected value "http://localhost:3000/auth"

```

```yaml
- navigation:
  - link "DiaCareKids Smart Pediatric Monitoring":
    - /url: /
  - link "Accueil":
    - /url: /
  - link "À Propos":
    - /url: /about
  - link "Services":
    - /url: /services
  - link "Contact":
    - /url: /contact
  - textbox "Rechercher un patient, un outil..."
  - button "FR"
  - button
  - link "Connexion Mon Espace":
    - /url: /auth
- main:
  - heading "Panel de Test" [level=3]
  - text: Agent Clinique agentclinique@gmail.com
  - button
  - text: agentclinique10
  - button
  - text: Médecin medmed@gmail.com
  - button
  - text: med12345
  - button
  - text: Parent ahmed@gmail.com
  - button
  - text: ahmed2020
  - button
  - text: Enfant anas@gmail.com
  - button
  - text: anas30
  - button
  - heading "Bon retour !" [level=1]
  - paragraph: Accédez à votre espace de santé intelligent.
  - button "Connexion"
  - button "Inscription"
  - textbox "Adresse Email": medmed@gmail.com
  - textbox "Mot de Passe": med12345
  - button
  - button "Se connecter"
- contentinfo:
  - link "DiaCareKids":
    - /url: /
  - paragraph: "\"Redonner le sourire aux petits champions à travers l'innovation et l'éducation intelligente.\""
  - heading "Explorer" [level=4]
  - list:
    - listitem:
      - link "À Propos":
        - /url: "#about"
    - listitem:
      - link "Services":
        - /url: "#features"
    - listitem:
      - link "Contact":
        - /url: "#contact"
    - listitem:
      - link "Confidentialité":
        - /url: /privacy
  - heading "Nous Joindre" [level=4]
  - text: +216 71 000 000 hello@diacarekids.tn Hôpital des Enfants, Tunis
  - paragraph: © 2026 DIACARE KIDS. TOUS DROITS RÉSERVÉS. PROJET PFE GÉNIE LOGICIEL.
  - text: Made with love by HBS
- alert
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Dashboard Navigation', () => {
  4  |   test('should login as Parent and see dashboard', async ({ page }) => {
  5  |     // Listen for all dialogs (alerts)
  6  |     page.on('dialog', dialog => {
  7  |         console.log(`Dialog message: ${dialog.message()}`);
  8  |         dialog.dismiss().catch(() => {});
  9  |     });
  10 | 
  11 |     await page.goto('/auth');
  12 |     
  13 |     // Fill credentials for Parent
  14 |     await page.fill('input[type="email"]', 'ahmed@gmail.com');
  15 |     await page.fill('input[type="password"]', 'ahmed2020');
  16 |     
  17 |     // Submit
  18 |     const submitBtn = page.locator('button:has-text("Se connecter")').or(page.locator('button:has(svg.lucide-arrow-right)'));
  19 |     await submitBtn.first().click();
  20 |     
  21 |     console.log('Clicked login, waiting for redirection...');
  22 |     
  23 |     // Wait for redirection with a longer timeout
  24 |     try {
  25 |         await expect(page).toHaveURL(/.*parent\/dashboard/, { timeout: 15000 });
  26 |         console.log('Successfully redirected to parent dashboard');
  27 |     } catch (e) {
  28 |         console.log('Current URL:', page.url());
  29 |         await page.screenshot({ path: 'tests/failure-parent-login.png' });
  30 |         throw e;
  31 |     }
  32 |   });
  33 | 
  34 |   test('should login as Doctor and see dashboard', async ({ page }) => {
  35 |     page.on('dialog', dialog => {
  36 |         console.log(`Dialog message: ${dialog.message()}`);
  37 |         dialog.dismiss().catch(() => {});
  38 |     });
  39 | 
  40 |     await page.goto('/auth');
  41 |     
  42 |     await page.fill('input[type="email"]', 'medmed@gmail.com');
  43 |     await page.fill('input[type="password"]', 'med12345');
  44 |     
  45 |     const submitBtn = page.locator('button:has-text("Se connecter")').or(page.locator('button:has(svg.lucide-arrow-right)'));
  46 |     await submitBtn.first().click();
  47 |     
  48 |     try {
> 49 |         await expect(page).toHaveURL(/.*doctor\/dashboard/, { timeout: 15000 });
     |                            ^ Error: expect(page).toHaveURL(expected) failed
  50 |         console.log('Successfully redirected to doctor dashboard');
  51 |     } catch (e) {
  52 |         console.log('Current URL:', page.url());
  53 |         await page.screenshot({ path: 'tests/failure-doctor-login.png' });
  54 |         throw e;
  55 |     }
  56 |   });
  57 | });
  58 | 
```