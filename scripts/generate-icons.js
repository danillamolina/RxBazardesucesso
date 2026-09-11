import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const iconSvg = fs.readFileSync(path.resolve('public/icon.svg'));
  const iconMaskableSvg = fs.readFileSync(path.resolve('public/icon-maskable.svg'));

  console.log('Generating pwa-192x192.png...');
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));

  console.log('Generating pwa-512x512.png...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));

  console.log('Generating apple-touch-icon.png (180x180)...');
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  console.log('Generating pwa-maskable-512x512.png...');
  await sharp(iconMaskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  console.log('Generating favicon-32x32.png...');
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/favicon-32x32.png'));

  // Also create a favicon.ico by copying or saving 32x32 png
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(path.resolve('public/favicon.ico'));

  console.log('All PWA icons successfully generated!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
