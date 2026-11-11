import { test, expect, Page } from '@playwright/test';

const URL = 'http://localhost:8080/';

// Helper functions

// Set cookies 1, 2, 3 to given values, then reload page and check that the cookies are set correctly
async function setCookies(page: Page, c1: boolean, c2: boolean, c3: boolean) {
    await page.evaluate(([a, b, c]: boolean[]) => {
        document.cookie = `1=${a}`;
        document.cookie = `2=${b}`;
        document.cookie = `3=${c}`;
    }, [c1, c2, c3]);
    await page.reload();
}

// The "cat names listing" under "Cats available for rent:"
function listing(page: Page) {
  return page.getByRole('list', { name: 'Cat names' }).getByRole('listitem');
}

// The images in the catalog's numbered list
function catalogImages(page: Page) {
    return page.locator('ol li img');
}

function link(page: Page, name: string) {
    return page.getByRole('link', { name, exact: true });
}

// Test fixture

test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await setCookies(page, false, false, false);
});

// Task 1
 
test('TEST-1-RESET', async ({ page }) => {
    await setCookies(page, true, true, true);
    await link(page, 'Reset').click();
    await expect(listing(page).nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});
 
test('TEST-2-CATALOG', async ({ page }) => {
    await link(page, 'Catalog').click();
    await expect(catalogImages(page).nth(1)).toHaveAttribute('src', '/images/cat2.jpg');
});
 
test('TEST-3-LISTING', async ({ page }) => {
    await link(page, 'Catalog').click();
    await expect(listing(page)).toHaveCount(3);
    await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});
 
test('TEST-4-RENT-A-CAT', async ({ page }) => {
    await link(page, 'Rent-A-Cat').click();
    await expect(page.getByRole('button', { name: 'Return', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rent', exact: true })).toBeVisible();
});
 
test('TEST-5-RENT', async ({ page }) => {
    await link(page, 'Rent-A-Cat').click();
    await page.getByRole('textbox').nth(0).fill('1'); // rent ID box
    await page.getByRole('button', { name: 'Rent', exact: true }).click();
    await expect(listing(page).nth(0)).toHaveText('Rented out');
    await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
    await expect(page.getByText('Success!', { exact: true })).toBeVisible();
    await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
});
 
test('TEST-6-RETURN', async ({ page }) => {
    await setCookies(page, false, true, true);
    await link(page, 'Rent-A-Cat').click();
    await page.getByRole('textbox').nth(1).fill('2'); // return ID box
    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await expect(listing(page).nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(listing(page).nth(2)).toHaveText('Rented out');
    await expect(page.getByText('Success!', { exact: true })).toBeVisible();
});
 
test('TEST-7-FEED-A-CAT', async ({ page }) => {
    await link(page, 'Feed-A-Cat').click();
    await expect(page.getByRole('button', { name: 'Feed', exact: true })).toBeVisible();
});
 
test('TEST-8-FEED', async ({ page }) => {
    await link(page, 'Feed-A-Cat').click();
    await page.getByRole('textbox').fill('6');
    await page.getByRole('button', { name: 'Feed', exact: true }).click();
    await expect(page.getByText('Nom, nom, nom.', { exact: true })).toBeVisible({ timeout: 10000 });
});
 
test('TEST-9-GREET-A-CAT', async ({ page }) => {
    await link(page, 'Greet-A-Cat').click();
    await expect(page.getByText('Meow!Meow!Meow!', { exact: true })).toBeVisible();
});
 
test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
    await page.goto(URL + 'greet-a-cat/Jennyanydots');
    await expect(page.getByText('Meow! from Jennyanydots.', { exact: true })).toBeVisible();
});
 
test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
    await setCookies(page, true, true, true);
    await link(page, 'Feed-A-Cat').click();
    // Compares against the provided baseline in tests/rentacat.spec.ts-snapshots/
    await expect(page.locator('body')).toHaveScreenshot();
});