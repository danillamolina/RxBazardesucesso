import { Product } from '../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from './formatters';

/**
 * Utility to load an image safely into HTMLImageElement for canvas drawing
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Wraps text into lines that fit inside maxWidth for canvas rendering
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates an HTML5 Canvas containing the exact Vitrine Product Card layout
 */
export async function generateProductJpgCanvas(product: Product): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 850;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background - Warm Linen Canvas
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#F7F4EB');
  bgGrad.addColorStop(1, '#ECE4D4');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Card Frame (White rounded card with subtle border)
  const cardX = 30;
  const cardY = 30;
  const cardW = width - 60;
  const cardH = height - 60;
  const borderRadius = 28;

  ctx.shadowColor = 'rgba(42, 55, 34, 0.08)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, borderRadius);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Border line
  ctx.strokeStyle = '#E2D5C3';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left Section: Product Photo Container
  const imgBoxX = cardX + 24;
  const imgBoxY = cardY + 24;
  const imgBoxW = 510;
  const imgBoxH = cardH - 48;

  // Draw Image Box Background
  ctx.fillStyle = '#F7F4EB';
  ctx.beginPath();
  ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = '#E2D5C3';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Load and Draw Product Image if available
  let loadedImg: HTMLImageElement | null = null;
  if (product.imageUrl) {
    loadedImg = await loadImage(product.imageUrl);
  }

  if (loadedImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, 20);
    ctx.clip();

    // Scale to cover or contain nicely
    const imgRatio = loadedImg.width / loadedImg.height;
    const boxRatio = imgBoxW / imgBoxH;
    let drawW = imgBoxW;
    let drawH = imgBoxH;
    let drawX = imgBoxX;
    let drawY = imgBoxY;

    if (imgRatio > boxRatio) {
      drawW = imgBoxH * imgRatio;
      drawX = imgBoxX - (drawW - imgBoxW) / 2;
    } else {
      drawH = imgBoxW / imgRatio;
      drawY = imgBoxY - (drawH - imgBoxH) / 2;
    }

    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    // Fallback graphic for missing photo
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛍️ Foto do Produto', imgBoxX + imgBoxW / 2, imgBoxY + imgBoxH / 2);
  }

  // Top Left Badges on Product Image
  // 1. Category Badge (Deep Olive)
  const catName = (product.category || 'Bazar').toUpperCase();
  ctx.font = 'bold 12px system-ui, sans-serif';
  const catWidth = ctx.measureText(catName).width + 24;
  ctx.fillStyle = '#2A3722';
  ctx.beginPath();
  ctx.roundRect(imgBoxX + 16, imgBoxY + 16, catWidth, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(catName, imgBoxX + 16 + catWidth / 2, imgBoxY + 34);

  // 2. Stock Badge (Sage Green Pill)
  const stockText = product.quantity > 0 ? `✓ Estoque: ${product.quantity} un.` : '🔴 Esgotado';
  ctx.font = 'bold 12px system-ui, sans-serif';
  const stockWidth = ctx.measureText(stockText).width + 24;
  ctx.fillStyle = product.quantity > 0 ? '#4A5D3B' : '#8B4A42';
  ctx.beginPath();
  ctx.roundRect(imgBoxX + 16, imgBoxY + 52, stockWidth, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(stockText, imgBoxX + 16 + stockWidth / 2, imgBoxY + 70);

  // Pricing calculations
  const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(product);

  // Bottom Right Badge Overlay on Photo
  const overlayRight = imgBoxX + imgBoxW - 16;
  const overlayBottom = imgBoxY + imgBoxH - 16;

  // Price Card Box Overlay
  const boxW = 220;
  const boxH = hasDiscount ? 90 : 54;
  const boxX = overlayRight - boxW;
  const boxY = overlayBottom - boxH;

  // Price Overlay Box (Clean White Background)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'right';
  if (hasDiscount) {
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(`Preço Cheio: ${formatCurrency(fullPrice)}`, overlayRight - 16, boxY + 24);

    ctx.fillStyle = '#059669';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText(`Por ${formatCurrency(bazarPrice)}`, overlayRight - 16, boxY + 54);

    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`Desconto: ${formatCurrency(discountAmount)} (${formatPercent(discountPercent)} OFF)`, overlayRight - 16, boxY + 76);
  } else {
    ctx.fillStyle = '#059669';
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.fillText(`Valor no Bazar: ${formatCurrency(bazarPrice)}`, overlayRight - 16, boxY + 45);
  }

  // Right Section: Product Details & Pricing Info
  const rightX = cardX + 560;
  let currentY = cardY + 36;

  // Header Row: Category Badge + Code / Size Tag
  ctx.textAlign = 'left';

  // Category Tag (Soft Sage)
  const catTagText = product.category || 'Geral';
  ctx.font = 'bold 13px system-ui, sans-serif';
  const tagW = ctx.measureText(catTagText).width + 20;
  ctx.fillStyle = '#E5EBDE';
  ctx.beginPath();
  ctx.roundRect(rightX, currentY, tagW, 28, 10);
  ctx.fill();
  ctx.fillStyle = '#3A452F';
  ctx.fillText(catTagText, rightX + 10, currentY + 19);

  let nextBadgeX = rightX + tagW + 10;

  // Code / SKU Tag
  if (product.sku) {
    const skuText = `Cód: ${product.sku}`;
    ctx.font = 'bold 13px system-ui, sans-serif';
    const skuW = ctx.measureText(skuText).width + 20;
    ctx.fillStyle = '#F5F0E6';
    ctx.beginPath();
    ctx.roundRect(nextBadgeX, currentY, skuW, 28, 10);
    ctx.fill();
    ctx.fillStyle = '#715F46';
    ctx.fillText(skuText, nextBadgeX + 10, currentY + 19);
    nextBadgeX += skuW + 10;
  }

  // Size/Color Tag
  if (product.sizeColor) {
    const sizeText = `📏 ${product.sizeColor}`;
    ctx.font = 'bold 13px system-ui, sans-serif';
    const sizeW = ctx.measureText(sizeText).width + 20;
    ctx.fillStyle = '#F5F0E6';
    ctx.beginPath();
    ctx.roundRect(nextBadgeX, currentY, sizeW, 28, 10);
    ctx.fill();
    ctx.fillStyle = '#2B3323';
    ctx.fillText(sizeText, nextBadgeX + 10, currentY + 19);
  }

  currentY += 46;

  // Expiration Date (if present)
  if (product.expirationDate) {
    ctx.fillStyle = '#8B4A42';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`📅 Validade: ${product.expirationDate}`, rightX, currentY);
    currentY += 28;
  }

  // Product Title
  ctx.fillStyle = '#2A3722';
  ctx.font = '900 32px system-ui, sans-serif';
  const titleLines = wrapText(ctx, product.name, 560);
  for (const line of titleLines) {
    ctx.fillText(line, rightX, currentY);
    currentY += 38;
  }

  currentY += 12;

  // Highlight Price Box (Sage Card)
  const priceBoxW = 560;
  const priceBoxH = 140;
  ctx.fillStyle = '#F0F4EB';
  ctx.beginPath();
  ctx.roundRect(rightX, currentY, priceBoxW, priceBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = '#CAD7BE';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inside Price Box Content
  ctx.fillStyle = '#465437';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('VALOR DE BAZAR:', rightX + 24, currentY + 36);

  ctx.fillStyle = '#3A452F';
  ctx.font = '900 38px system-ui, sans-serif';
  ctx.fillText(formatCurrency(bazarPrice), rightX + 160, currentY + 42);

  if (hasDiscount) {
    ctx.fillStyle = '#715F46';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(`De ${formatCurrency(fullPrice)}`, rightX + 380, currentY + 40);

    // Pill 1: % Discount
    const pill1Text = `🔥 ${formatPercent(discountPercent)} de Desconto`;
    ctx.font = 'bold 12px system-ui, sans-serif';
    const p1W = ctx.measureText(pill1Text).width + 20;
    ctx.fillStyle = '#E5EBDE';
    ctx.beginPath();
    ctx.roundRect(rightX + 24, currentY + 76, p1W, 32, 12);
    ctx.fill();
    ctx.fillStyle = '#3A452F';
    ctx.fillText(pill1Text, rightX + 34, currentY + 96);

    // Pill 2: Real Savings
    const pill2Text = `💰 Economia Real: ${formatCurrency(discountAmount)}`;
    const p2W = ctx.measureText(pill2Text).width + 20;
    ctx.fillStyle = '#CCD8BF';
    ctx.beginPath();
    ctx.roundRect(rightX + 34 + p1W, currentY + 76, p2W, 32, 12);
    ctx.fill();
    ctx.fillStyle = '#2A3722';
    ctx.fillText(pill2Text, rightX + 44 + p1W, currentY + 96);
  }

  currentY += priceBoxH + 24;

  // Description & Details Section
  ctx.fillStyle = '#715F46';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('DESCRIÇÃO & DETALHES DO PRODUTO:', rightX, currentY);
  currentY += 22;

  const descText = product.description || 'Produto de altíssima qualidade do Nosso Bazar! Garantia e procedência.';
  ctx.fillStyle = '#2B3323';
  ctx.font = '500 15px system-ui, sans-serif';
  const descLines = wrapText(ctx, descText, 560);
  for (let i = 0; i < Math.min(descLines.length, 5); i++) {
    ctx.fillText(descLines[i], rightX, currentY);
    currentY += 22;
  }

  // Bottom Call To Action Banner
  const ctaY = cardY + cardH - 80;
  ctx.fillStyle = '#4A5D3B';
  ctx.shadowColor = 'rgba(74, 93, 59, 0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.roundRect(rightX, ctaY, 560, 56, 18);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📲 Peça agora pelo WhatsApp!', rightX + 280, ctaY + 35);

  return canvas;
}

/**
 * Generates JPG Data URL (quality 0.92)
 */
export async function generateProductJpgDataUrl(product: Product): Promise<string> {
  const canvas = await generateProductJpgCanvas(product);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generates JPG Blob for sharing/downloading
 */
export async function generateProductJpgBlob(product: Product): Promise<Blob> {
  const canvas = await generateProductJpgCanvas(product);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to JPG blob'));
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Downloads the JPG Vitrine Banner Image
 */
export async function downloadProductJpg(product: Product): Promise<void> {
  const dataUrl = await generateProductJpgDataUrl(product);
  const link = document.createElement('a');
  const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 25);
  link.download = `anuncio-${sanitizedName || 'produto'}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Handles sending JPG via WhatsApp / WhatsApp Business or Native Share API
 */
export async function shareProductJpgWhatsApp(
  product: Product,
  isBusiness: boolean = false,
  targetPhone?: string,
  customerName?: string
): Promise<void> {
  const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(product);

  const shareText =
    `🔥 *ACHADO DO RX DO BAZAR DE SUCESSO!* 🔥\n\n` +
    (customerName ? `Olá *${customerName}*! Confira essa oferta exclusiva:\n\n` : '') +
    `✨ *${product.name}*${product.sku ? ` (Cód: ${product.sku})` : ''}\n` +
    (product.sizeColor ? `📏 Detalhes: ${product.sizeColor}\n` : '') +
    (product.expirationDate ? `📅 Validade: ${product.expirationDate}\n` : '') +
    (product.description ? `📝 ${product.description}\n` : '') +
    (hasDiscount
      ? `\n🏷️ Preço Cheio: ~${formatCurrency(fullPrice)}~\n🔥 Preço no Bazar: *${formatCurrency(bazarPrice)}* (🔥 *${formatPercent(discountPercent)} OFF*)\n💰 Desconto Realizado: *${formatCurrency(discountAmount)}* de economia!\n`
      : `\n💰 Preço no Bazar: *${formatCurrency(bazarPrice)}*!\n`) +
    (product.quantity > 0 ? `📦 Estoque Disponível: *${product.quantity} un.*\n` : `🔴 *PRODUTO ESGOTADO*\n`) +
    `\nMe chama no privado para garantir ou tirar dúvidas! 🛍️💖`;

  // Format phone if provided
  let formattedPhone = targetPhone ? targetPhone.replace(/\D/g, '') : '';
  if (formattedPhone && (formattedPhone.length === 10 || formattedPhone.length === 11)) {
    formattedPhone = `55${formattedPhone}`;
  }

  // Try Native Web Share API with JPG File if browser supports sharing files
  try {
    const blob = await generateProductJpgBlob(product);
    const fileName = `anuncio-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: product.name,
        text: shareText,
        files: [file],
      });
      return;
    }
  } catch (err) {
    console.log('Native file share failed or not supported, falling back to download + WhatsApp link:', err);
  }

  // Fallback: Download the JPG and open WhatsApp / WhatsApp Business link
  await downloadProductJpg(product);

  const encodedText = encodeURIComponent(shareText);
  let url = '';

  if (formattedPhone) {
    url = isBusiness
      ? `whatsapp://send?phone=${formattedPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  } else {
    url = isBusiness
      ? `whatsapp://send?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
