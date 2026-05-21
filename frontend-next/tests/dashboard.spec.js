const { test, expect } = require('@playwright/test');

test.describe('Dashboard Navigation', () => {
  test('should login as Parent and see dashboard', async ({ page }) => {
    // Listen for all dialogs (alerts)
    page.on('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
    });

    await page.goto('/auth');
    
    // Fill credentials for Parent
    await page.fill('input[type="email"]', 'ahmed@gmail.com');
    await page.fill('input[type="password"]', 'ahmed2020');
    
    // Submit
    const submitBtn = page.locator('button:has-text("Se connecter")').or(page.locator('button:has(svg.lucide-arrow-right)'));
    await submitBtn.first().click();
    
    console.log('Clicked login, waiting for redirection...');
    
    // Wait for redirection with a longer timeout
    try {
        await expect(page).toHaveURL(/.*parent\/dashboard/, { timeout: 15000 });
        console.log('Successfully redirected to parent dashboard');
    } catch (e) {
        console.log('Current URL:', page.url());
        await page.screenshot({ path: 'tests/failure-parent-login.png' });
        throw e;
    }
  });

  test('should login as Doctor and see dashboard', async ({ page }) => {
    page.on('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
    });

    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'medmed@gmail.com');
    await page.fill('input[type="password"]', 'med12345');
    
    const submitBtn = page.locator('button:has-text("Se connecter")').or(page.locator('button:has(svg.lucide-arrow-right)'));
    await submitBtn.first().click();
    
    try {
        await expect(page).toHaveURL(/.*doctor\/dashboard/, { timeout: 15000 });
        console.log('Successfully redirected to doctor dashboard');
    } catch (e) {
        console.log('Current URL:', page.url());
        await page.screenshot({ path: 'tests/failure-doctor-login.png' });
        throw e;
    }
  });
});
