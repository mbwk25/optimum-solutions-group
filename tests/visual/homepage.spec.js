import { test, expect } from '@playwright/test';

/**
 * Homepage Visual Regression Tests
 * 
 * These tests capture screenshots of the homepage across different viewport sizes
 * and compare them with baseline screenshots to detect visual regressions.
 */

test.describe('Homepage Visual Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Wait for page to fully load before taking screenshots
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements that change between runs
    await page.addStyleTag({
      content: `
        /* Hide elements with dynamic content */
        .dynamic-timestamp,
        .loading-spinner,
        .animated-element {
          visibility: hidden !important;
        }
        
        /* Disable CSS animations and transitions */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('Homepage - Full page screenshot', async ({ page }) => {
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('homepage-full-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Homepage - Above the fold', async ({ page }) => {
    // Screenshot of the visible viewport (above the fold)
    await expect(page).toHaveScreenshot('homepage-above-fold.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Hero section', async ({ page }) => {
    // Screenshot of just the hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toHaveScreenshot('homepage-hero-section.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Navigation', async ({ page }) => {
    // Screenshot of the navigation bar
    const navigation = page.locator('nav').first();
    await expect(navigation).toHaveScreenshot('homepage-navigation.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Footer', async ({ page }) => {
    // Screenshot of the footer
    const footer = page.locator('footer').first();
    await expect(footer).toHaveScreenshot('homepage-footer.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Mobile navigation menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile viewports');
    
    // Open mobile menu if it exists
    const menuButton = page.locator('[aria-label="Open menu"], [aria-label="Menu"], .mobile-menu-button');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      await expect(page).toHaveScreenshot('homepage-mobile-menu.png', {
        animations: 'disabled'
      });
    }
  });

  test('Homepage - Contact form section', async ({ page }) => {
    // Scroll to and screenshot contact form if it exists
    const contactForm = page.locator('form, [data-testid="contact-form"]').first();
    if (await contactForm.isVisible()) {
      await contactForm.scrollIntoViewIfNeeded();
      await expect(contactForm).toHaveScreenshot('homepage-contact-form.png', {
        animations: 'disabled'
      });
    }
  });

  test('Homepage - Services section', async ({ page }) => {
    // Screenshot of services section if it exists
    const servicesSection = page.locator('[data-testid="services"], section:has-text("Services")').first();
    if (await servicesSection.isVisible()) {
      await servicesSection.scrollIntoViewIfNeeded();
      await expect(servicesSection).toHaveScreenshot('homepage-services-section.png', {
        animations: 'disabled'
      });
    }
  });

  // Test with different color schemes (if supported)
  test('Homepage - Dark theme', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Color scheme tests run on Chromium only');
    
    // Set dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Homepage - Light theme', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Color scheme tests run on Chromium only');
    
    // Set light color scheme
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-light-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  // Test hover states for interactive elements
  test('Homepage - Button hover states', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover tests not applicable on mobile');
    
    const buttons = page.locator('button, [role="button"], .btn');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) { // Test up to 3 buttons
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.hover();
        await expect(button).toHaveScreenshot(`homepage-button-${i}-hover.png`, {
          animations: 'disabled'
        });
      }
    }
  });

  // Test focus states for accessibility
  test('Homepage - Focus states', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Focus tests not applicable on mobile');
    
    const focusableElements = page.locator('a, button, input, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) { // Test up to 5 elements
      const element = focusableElements.nth(i);
      if (await element.isVisible()) {
        await element.focus();
        await expect(element).toHaveScreenshot(`homepage-focus-${i}.png`, {
          animations: 'disabled'
        });
      }
    }
  });
});
