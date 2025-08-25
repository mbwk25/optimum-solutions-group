#!/usr/bin/env node
/**
 * PWA Icon Generator
 * Creates missing PWA icons for manifest.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG-based icons as placeholders
const generateIconSVG = (size, text = 'OSG') => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1a365d"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
    ${text}
  </text>
</svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcutSizes = [96];

// Generate main icons
iconSizes.forEach(size => {
  const svgContent = generateIconSVG(size);
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.png.svg`),
    svgContent
  );
});

// Generate maskable icons
[192, 512].forEach(size => {
  const svgContent = generateIconSVG(size, 'OSG');
  fs.writeFileSync(
    path.join(iconsDir, `icon-maskable-${size}x${size}.png.svg`),
    svgContent
  );
});

// Generate shortcut icons
const shortcuts = ['services', 'contact', 'analytics', 'estimator'];
shortcuts.forEach(shortcut => {
  const svgContent = generateIconSVG(96, shortcut.substring(0, 1).toUpperCase());
  fs.writeFileSync(
    path.join(iconsDir, `shortcut-${shortcut}.png.svg`),
    svgContent
  );
});

console.log('✅ Generated PWA icon placeholders');
console.log('📁 Location:', iconsDir);
console.log('💡 Replace these SVG files with proper PNG icons for production');
