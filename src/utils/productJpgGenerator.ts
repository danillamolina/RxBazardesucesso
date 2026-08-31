import JSZip from 'jszip';
import { Product } from '../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from './formatters';

// Simple in-memory cache for loaded images to make subsequent exports instant
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Checks if current environment is desktop / PC
 */
export function isDesktopDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Utility to load an image safely into HTMLImageElement with timeout & cache
 */
function loadImage(src: string, timeoutMs: number = 2000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    // Return from cache if already loaded
    if (imageCache.has(src)) {
      const cached = imageCache.get(src)!;
      if (cached.complete && cached.naturalWidth > 0) {
        return resolve(cached);
      }
    }

    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        imageCache.set(src, img);
        resolve(img);
      }
    };
    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(null);
      }
    };
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
 * as requested (Photo with stock pill, white price overlay, category pill,
 * and dark offer bottom section with De/Por, % OFF and Economia pills).
 */
export async function generateProductJpgCanvas(product: Product): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  // 4:5 vertical proportion (1080 x 1350) - gold standard for WhatsApp / Instagram / Mobile sharing
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background - Clean Light Premium Studio Palette (#F8FAFC)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, width, height);

  // Soft border around entire canvas
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // Top Section: Product Photo Container (Height: 780px)
  const imgBoxX = 28;
  const imgBoxY = 28;
  const imgBoxW = width - 56;
  const imgBoxH = 780;
  const imgRadius = 32;

  // Draw Photo Container Background (Studio Neutral Clean Canvas)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgRadius);
  ctx.clip();

  const studioGrad = ctx.createLinearGradient(imgBoxX, imgBoxY, imgBoxX, imgBoxY + imgBoxH);
  studioGrad.addColorStop(0, '#FFFFFF');
  studioGrad.addColorStop(1, '#F1F5F9');
  ctx.fillStyle = studioGrad;
  ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
  ctx.restore();

  // Subtle border around photo container
  ctx.save();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgRadius);
  ctx.stroke();
  ctx.restore();

  // Load and Draw Product Image if available
  let loadedImg: HTMLImageElement | null = null;
  if (product.imageUrl) {
    loadedImg = await loadImage(product.imageUrl);
  }

  if (loadedImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgRadius);
    ctx.clip();

    // 1. Subtle Ambient background of the photo (smooth, soft blur to harmonize colors)
    try {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.filter = 'blur(30px)';
      ctx.drawImage(loadedImg, imgBoxX - 30, imgBoxY - 30, imgBoxW + 60, imgBoxH + 60);
      ctx.restore();
    } catch {
      // In case filter is unsupported in some legacy contexts
    }

    // 2. High-Fidelity Centered Product Framing (Contain with balanced safe padding)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Safe padding so the entire product (edges, top, bottom) is 100% visible and beautifully framed
    const safePadX = 36;
    const safePadY = 32;
    const availW = imgBoxW - safePadX * 2;
    const availH = imgBoxH - safePadY * 2;

    const imgRatio = loadedImg.width / loadedImg.height;
    const boxRatio = availW / availH;

    let drawW: number;
    let drawH: number;

    if (imgRatio > boxRatio) {
      // Wider than box
      drawW = availW;
      drawH = availW / imgRatio;
    } else {
      // Taller or square
      drawH = availH;
      drawW = availH * imgRatio;
    }

    // Center product precisely inside the photo container
    const drawX = imgBoxX + safePadX + (availW - drawW) / 2;
    const drawY = imgBoxY + safePadY + (availH - drawH) / 2;

    // Soft realistic studio shadow for depth
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
    ctx.restore();

    ctx.restore();
  } else {
    // Fallback graphic for missing photo
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛍️ Foto do Produto', imgBoxX + imgBoxW / 2, imgBoxY + imgBoxH / 2);
  }

  // Pricing calculations
  const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(product);

  // 1. TOP-LEFT OVERLAY BADGE: STOCK STATUS (Amber / Orange gradient pill)
  const isSoldOut = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 3;
  
  let stockBadgeText = `RESTAM ${product.quantity} UNID.`;
  let stockBadgeIcon = '⚡ ';
  let stockBadgeBg = '#F59E0B'; // Amber
  let stockTextColor = '#0F172A';

  if (isSoldOut) {
    stockBadgeText = 'ESGOTADO';
    stockBadgeIcon = '🔴 ';
    stockBadgeBg = '#E11D48'; // Rose/Red
    stockTextColor = '#FFFFFF';
  } else if (!isLowStock) {
    stockBadgeText = `ESTOQUE: ${product.quantity} UNID.`;
    stockBadgeIcon = '✓ ';
    stockBadgeBg = '#10B981'; // Emerald
    stockTextColor = '#FFFFFF';
  }

  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  const fullStockText = `${stockBadgeIcon}${stockBadgeText}`;
  const stockTextWidth = ctx.measureText(fullStockText).width;
  const stockPillW = stockTextWidth + 34;
  const stockPillH = 46;
  const stockPillX = imgBoxX + 20;
  const stockPillY = imgBoxY + 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = stockBadgeBg;
  ctx.beginPath();
  ctx.roundRect(stockPillX, stockPillY, stockPillW, stockPillH, 16);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = stockTextColor;
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(fullStockText, stockPillX + 17, stockPillY + 30);

  // 2. TOP-RIGHT OVERLAY CARD: FLOATING WHITE OFFER CARD (Compact & Sleek)
  const priceCardW = 290;
  const priceCardH = hasDiscount ? 144 : 88;
  const priceCardX = imgBoxX + imgBoxW - priceCardW - 20;
  const priceCardY = imgBoxY + 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(priceCardX, priceCardY, priceCardW, priceCardH, 20);
  ctx.fill();
  ctx.restore();

  let cardContentY = priceCardY + 32;
  ctx.textAlign = 'right';

  if (hasDiscount) {
    // Line 1: De: R$ 249,00 (with strike-through)
    const dePrefix = 'De: ';
    const dePriceStr = formatCurrency(fullPrice);
    
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748B';
    const priceDeWidth = ctx.measureText(dePriceStr).width;
    
    const deRightX = priceCardX + priceCardW - 20;
    ctx.fillText(`${dePrefix}${dePriceStr}`, deRightX, cardContentY);
    
    // Draw strike-through line over price
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(deRightX - priceDeWidth, cardContentY - 5);
    ctx.lineTo(deRightX, cardContentY - 5);
    ctx.stroke();

    cardContentY += 36;

    // Line 2: Por R$ 199,00
    ctx.font = '900 29px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#059669'; // Emerald green
    ctx.fillText(`Por ${formatCurrency(bazarPrice)}`, priceCardX + priceCardW - 20, cardContentY);

    cardContentY += 38;

    // Line 3: Discount Pill (Light pink bg, rose text)
    const discPillText = `${formatPercent(discountPercent)} de desconto`;
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    const discPillTextW = ctx.measureText(discPillText).width;
    const discPillW = discPillTextW + 24;
    const discPillH = 30;
    const discPillX = priceCardX + priceCardW - 20 - discPillW;
    const discPillY = cardContentY - 22;

    ctx.fillStyle = '#FFF1F2'; // Light Rose
    ctx.beginPath();
    ctx.roundRect(discPillX, discPillY, discPillW, discPillH, 8);
    ctx.fill();
    ctx.strokeStyle = '#FECDD3';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#BE123C'; // Deep Rose
    ctx.textAlign = 'center';
    ctx.fillText(discPillText, discPillX + discPillW / 2, discPillY + 21);
  } else {
    // Single price
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Valor no Bazar:', priceCardX + priceCardW - 20, cardContentY);

    cardContentY += 36;

    ctx.font = '900 30px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText(formatCurrency(bazarPrice), priceCardX + priceCardW - 20, cardContentY);
  }

  // 3. BOTTOM-LEFT OVERLAY BADGE ON PHOTO: CATEGORY & SUBCATEGORY PILL (Light pill with dark text)
  const catText = product.subcategory 
    ? `${product.category || 'Bazar'} • ${product.subcategory}`
    : (product.category || 'Bazar de Sucesso');
  ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
  const catTextW = ctx.measureText(catText).width;
  const catPillW = catTextW + 32;
  const catPillH = 42;
  const catPillX = imgBoxX + 20;
  const catPillY = imgBoxY + imgBoxH - catPillH - 20;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(catPillX, catPillY, Math.min(imgBoxW - 40, catPillW), catPillH, 21);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.textAlign = 'center';
  ctx.fillText(catText, catPillX + Math.min(imgBoxW - 40, catPillW) / 2, catPillY + 28);

  // Sold Out Dark Overlay if sold out
  if (isSoldOut) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgRadius);
    ctx.clip();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
    ctx.restore();
  }

  // ==========================================
  // BOTTOM SECTION: CLEAN LIGHT CARD INFORMATION AREA
  // ==========================================
  const bottomX = 36;
  let bottomY = imgBoxY + imgBoxH + 40;
  const bottomW = width - 72;

  // Product Name (Bold High-Contrast Slate Typography)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 42px system-ui, -apple-system, sans-serif';

  const nameLines = wrapText(ctx, product.name, bottomW - 140);
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, bottomX, bottomY);
    bottomY += 48;
  }

  // SKU code on top right of name if exists
  if (product.sku) {
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    const skuText = `Cód: ${product.sku}`;
    const skuW = ctx.measureText(skuText).width + 24;
    ctx.fillStyle = '#FFF1F2';
    ctx.beginPath();
    ctx.roundRect(bottomX + bottomW - skuW, imgBoxY + imgBoxH + 30, skuW, 36, 10);
    ctx.fill();
    ctx.strokeStyle = '#FECDD3';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#E11D48';
    ctx.textAlign = 'center';
    ctx.fillText(skuText, bottomX + bottomW - skuW / 2, imgBoxY + imgBoxH + 55);
  }

  // Size / Attribute / Details (Coral/Rose Icon & Text)
  bottomY += 4;
  if (product.sizeColor || product.expirationDate) {
    const attrItems: string[] = [];
    if (product.sizeColor) attrItems.push(`📏 ${product.sizeColor}`);
    if (product.expirationDate) attrItems.push(`📅 Val: ${product.expirationDate}`);

    const attrText = attrItems.join('   •   ');
    ctx.textAlign = 'left';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#E11D48'; // Vibrant Rose
    ctx.fillText(attrText, bottomX, bottomY);
    bottomY += 38;
  } else {
    bottomY += 16;
  }

  // OFFER CONTAINER BOX (Clean Pure White Box with Subtle Shadow & Border)
  const offerBoxX = bottomX;
  const offerBoxY = bottomY;
  const offerBoxW = bottomW;
  const offerBoxH = 170;

  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(offerBoxX, offerBoxY, offerBoxW, offerBoxH, 24);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(offerBoxX, offerBoxY, offerBoxW, offerBoxH, 24);
  ctx.stroke();

  // LEFT SIDE OF OFFER BOX: Prices (De / Por)
  const leftPriceX = offerBoxX + 32;
  let leftPriceY = offerBoxY + 54;

  if (hasDiscount) {
    // "De: R$ 249,00"
    const dePrefix = 'De: ';
    const dePriceStr = formatCurrency(fullPrice);
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748B'; // Slate 500
    ctx.textAlign = 'left';
    ctx.fillText(`${dePrefix}${dePriceStr}`, leftPriceX, leftPriceY);

    const totalDeW = ctx.measureText(`${dePrefix}${dePriceStr}`).width;
    const priceOnlyW = ctx.measureText(dePriceStr).width;

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftPriceX + totalDeW - priceOnlyW, leftPriceY - 7);
    ctx.lineTo(leftPriceX + totalDeW, leftPriceY - 7);
    ctx.stroke();

    leftPriceY += 58;

    // "Por R$ 199,00"
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#059669'; // Rich Emerald Green
    ctx.fillText(`Por ${formatCurrency(bazarPrice)}`, leftPriceX, leftPriceY);
  } else {
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';
    ctx.fillText('Valor no Bazar:', leftPriceX, leftPriceY);

    leftPriceY += 54;
    ctx.font = '900 50px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText(formatCurrency(bazarPrice), leftPriceX, leftPriceY);
  }

  // RIGHT SIDE OF OFFER BOX: Badges (🔥 % de desconto & Economia. R$ 50,00)
  const rightBadgeRight = offerBoxX + offerBoxW - 32;
  let rightBadgeY = offerBoxY + 34;

  if (hasDiscount) {
    // Top Right Pill: 🔥 20,1% de desconto (Red/Crimson Pill)
    const discTagText = `🔥 ${formatPercent(discountPercent)} de desconto`;
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    const discTagTextW = ctx.measureText(discTagText).width;
    const discTagW = discTagTextW + 36;
    const discTagH = 50;
    const discTagX = rightBadgeRight - discTagW;

    ctx.fillStyle = '#E11D48'; // Crimson / Rose
    ctx.beginPath();
    ctx.roundRect(discTagX, rightBadgeY, discTagW, discTagH, 14);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(discTagText, discTagX + discTagW / 2, rightBadgeY + 34);

    rightBadgeY += 60;

    // Bottom Right Pill: Economia. R$ 50,00 (Mint Light Green Pill with Emerald text)
    const econTagText = `Economia. ${formatCurrency(discountAmount)}`;
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    const econTagTextW = ctx.measureText(econTagText).width;
    const econTagW = econTagTextW + 36;
    const econTagH = 50;
    const econTagX = rightBadgeRight - econTagW;

    ctx.fillStyle = '#ECFDF5'; // Mint/Emerald Light Background
    ctx.beginPath();
    ctx.roundRect(econTagX, rightBadgeY, econTagW, econTagH, 14);
    ctx.fill();
    ctx.strokeStyle = '#A7F3D0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#065F46'; // Forest/Emerald Green text
    ctx.textAlign = 'center';
    ctx.fillText(econTagText, econTagX + econTagW / 2, rightBadgeY + 34);
  } else {
    // Single tag for available stock or exclusive piece
    const singleTagText = '💎 Peça Exclusiva';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    const singleTagTextW = ctx.measureText(singleTagText).width;
    const singleTagW = singleTagTextW + 36;
    const singleTagH = 50;
    const singleTagX = rightBadgeRight - singleTagW;

    ctx.fillStyle = '#ECFDF5';
    ctx.beginPath();
    ctx.roundRect(singleTagX, offerBoxY + (offerBoxH - singleTagH) / 2, singleTagW, singleTagH, 14);
    ctx.fill();
    ctx.strokeStyle = '#A7F3D0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#065F46';
    ctx.textAlign = 'center';
    ctx.fillText(singleTagText, singleTagX + singleTagW / 2, offerBoxY + (offerBoxH - singleTagH) / 2 + 34);
  }

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
 * Copies product card image directly to system clipboard (PNG format supported by modern browsers)
 * Super useful on PC to paste (Ctrl+V) directly into WhatsApp Web in 1 second!
 */
export async function copyProductImageToClipboard(product: Product): Promise<boolean> {
  try {
    const canvas = await generateProductJpgCanvas(product);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          console.warn('Clipboard write failed:', e);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Erro ao copiar imagem para área de transferência:', err);
    return false;
  }
}

/**
 * Downloads the JPG Vitrine Banner Image
 */
export async function downloadProductJpg(product: Product, preloadedDataUrl?: string): Promise<void> {
  const dataUrl = preloadedDataUrl || (await generateProductJpgDataUrl(product));
  const link = document.createElement('a');
  const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 25);
  link.download = `anuncio-${sanitizedName || 'produto'}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export type WhatsAppDestination = 'standard' | 'business' | 'web';

/**
 * Builds the direct WhatsApp Web / Mobile URL with full PC and Mobile support
 */
export function buildWhatsAppDirectUrl(
  shareText: string,
  targetPhone?: string,
  destination: WhatsAppDestination | boolean = 'standard',
  preferWhatsAppWebOnDesktop: boolean = true
): string {
  let formattedPhone = targetPhone ? targetPhone.replace(/\D/g, '') : '';
  if (formattedPhone && (formattedPhone.length === 10 || formattedPhone.length === 11)) {
    formattedPhone = `55${formattedPhone}`;
  }

  const encodedText = encodeURIComponent(shareText);
  const isDesktop = isDesktopDevice();

  const mode: WhatsAppDestination =
    typeof destination === 'boolean'
      ? destination
        ? 'business'
        : 'standard'
      : destination;

  // 1. WhatsApp Business mode
  if (mode === 'business') {
    // Uses native protocol whatsapp:// which triggers installed WhatsApp / Business app on mobile and desktop
    return formattedPhone
      ? `whatsapp://send?phone=${formattedPhone}&text=${encodedText}`
      : `whatsapp://send?text=${encodedText}`;
  }

  // 2. Explicit WhatsApp Web mode (Browser tab on PC)
  if (mode === 'web') {
    return formattedPhone
      ? `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
      : `https://web.whatsapp.com/send?text=${encodedText}`;
  }

  // 3. Standard WhatsApp mode:
  // On PC Desktop: if phone number is provided, WhatsApp Web is direct and smooth.
  // If no phone number is provided, api.whatsapp.com / wa.me works reliably across all browsers without getting stuck.
  if (isDesktop && preferWhatsAppWebOnDesktop) {
    if (formattedPhone) {
      return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
    }
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  // Mobile standard:
  return formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Opens WhatsApp directly in a new window/tab or native app
 */
export function openWhatsAppDirect(
  shareText: string,
  targetPhone?: string,
  destination: WhatsAppDestination | boolean = 'standard'
): void {
  const url = buildWhatsAppDirectUrl(shareText, targetPhone, destination, true);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Handles sending JPG via WhatsApp / WhatsApp Business or Native Share API
 */
export async function shareProductJpgWhatsApp(
  product: Product,
  destination: WhatsAppDestination | boolean = 'standard',
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

  // Generate canvas ONCE for single-pass conversion
  const canvas = await generateProductJpgCanvas(product);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Try Native Web Share API with JPG File if browser supports sharing files (Mobile browsers)
  if (!isDesktopDevice() && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.92));
      if (blob) {
        const fileName = `anuncio-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: product.name,
            text: shareText,
            files: [file],
          });
          return;
        }
      }
    } catch (err) {
      console.log('Native file share failed or not supported:', err);
    }
  }

  // PC or Desktop / fallback: Download the pre-generated JPG (instant, no re-render) and open direct WhatsApp
  await downloadProductJpg(product, dataUrl);

  openWhatsAppDirect(shareText, formattedPhone, destination);
}

/**
 * Generates edited JPG cards for multiple products and bundles them into a ZIP file
 */
export async function downloadMultipleProductsZip(
  products: Product[],
  onProgress?: (current: number, total: number, productName: string) => void
): Promise<void> {
  if (!products || products.length === 0) return;

  const zip = new JSZip();
  const total = products.length;

  for (let i = 0; i < total; i++) {
    const prod = products[i];
    if (onProgress) {
      onProgress(i + 1, total, prod.name);
    }

    try {
      const blob = await generateProductJpgBlob(prod);
      const sanitizedName = prod.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 30);
      const indexStr = String(i + 1).padStart(2, '0');
      const filename = `${indexStr}_${sanitizedName || 'produto'}.jpg`;

      zip.file(filename, blob);
    } catch (err) {
      console.error(`Erro ao gerar card editado para o produto ${prod.name}:`, err);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `fotos_vitrine_bazar_editadas_${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Downloads multiple edited JPG cards sequentially
 */
export async function downloadMultipleProductsIndividualJpgs(
  products: Product[],
  onProgress?: (current: number, total: number, productName: string) => void
): Promise<void> {
  if (!products || products.length === 0) return;

  const total = products.length;
  for (let i = 0; i < total; i++) {
    const prod = products[i];
    if (onProgress) {
      onProgress(i + 1, total, prod.name);
    }

    try {
      await downloadProductJpg(prod);
      // Brief pause to prevent browser from blocking multiple automatic downloads
      await new Promise((r) => setTimeout(r, 450));
    } catch (err) {
      console.error(`Erro ao baixar card do produto ${prod.name}:`, err);
    }
  }
}

/**
 * Shares multiple edited JPG cards along with the catalog text to WhatsApp or Native Share API
 */
export async function shareMultipleProductsWithEditedImages(
  products: Product[],
  shareText: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ sharedNatively: boolean }> {
  if (!products || products.length === 0) {
    return { sharedNatively: false };
  }

  const filesToShare: File[] = [];
  const total = products.length;

  for (let i = 0; i < total; i++) {
    const prod = products[i];
    if (onProgress) {
      onProgress(i + 1, total);
    }

    try {
      const blob = await generateProductJpgBlob(prod);
      const sanitizedName = prod.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 30);
      const indexStr = String(i + 1).padStart(2, '0');
      const filename = `${indexStr}_${sanitizedName || 'anuncio'}.jpg`;

      const file = new File([blob], filename, { type: 'image/jpeg' });
      filesToShare.push(file);
    } catch (err) {
      console.error(`Erro ao processar imagem para compartilhamento (${prod.name}):`, err);
    }
  }

  // Mobile Web Share API support with files
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    filesToShare.length > 0 &&
    navigator.canShare({ files: filesToShare })
  ) {
    try {
      await navigator.share({
        title: 'Catálogo — Rx do Bazar de Sucesso',
        text: shareText,
        files: filesToShare,
      });
      return { sharedNatively: true };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { sharedNatively: true };
      }
      console.warn('Native multi-file share failed, falling back to download + WhatsApp link:', err);
    }
  }

  return { sharedNatively: false };
}


