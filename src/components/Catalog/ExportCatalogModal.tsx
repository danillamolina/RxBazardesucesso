import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  Sparkles, 
  Package, 
  ExternalLink,
  Images,
  FileText,
  Briefcase,
  Smartphone
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Product } from '../../types';
import { formatCurrency, generateFullCatalogExportText, getProductPriceDetails } from '../../utils/formatters';

interface ExportCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export const ExportCatalogModal: React.FC<ExportCatalogModalProps> = ({
  isOpen,
  onClose,
  products: propsProducts,
}) => {
  const { products: contextProducts } = useBazar();
  const products = propsProducts || contextProducts || [];
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingJPG, setIsGeneratingJPG] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  if (!isOpen) return null;

  const availableProducts = products.filter(p => p.quantity > 0 && p.showInCatalog !== false);
  const productsWithImages = availableProducts.filter(p => !!p.imageUrl);

  const catalogText = generateFullCatalogExportText(availableProducts);
  const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(catalogText)}`;

  // Convert image URL/base64 to File object safely without crashing on fetch errors
  const urlToFile = async (url: string, filename: string): Promise<File | null> => {
    if (!url) return null;
    try {
      if (url.startsWith('data:')) {
        const parts = url.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      }

      const res = await fetch(url, { mode: 'cors' }).catch(() => null);
      if (res && res.ok) {
        const blob = await res.blob().catch(() => null);
        if (blob) {
          const mimeType = blob.type || 'image/jpeg';
          return new File([blob], filename, { type: mimeType });
        }
      }

      // Fallback: convert via Canvas
      return await new Promise<File | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 300;
            canvas.height = img.naturalHeight || img.height || 300;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], filename, { type: blob.type || 'image/jpeg' }));
                } else {
                  resolve(null);
                }
              }, 'image/jpeg', 0.9);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch {
      return null;
    }
  };

  // Open WhatsApp or WhatsApp Business link safely
  const handleOpenWhatsApp = (appType: 'standard' | 'business') => {
    const encodedText = encodeURIComponent(catalogText);
    
    if (appType === 'business') {
      // Attempt opening WhatsApp Business deep link scheme first
      const waBusinessUri = `whatsapp-business://send?text=${encodedText}`;
      const fallbackUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      
      const start = Date.now();
      try {
        window.location.href = waBusinessUri;
        // Fallback to web link if protocol isn't handled by system
        setTimeout(() => {
          if (Date.now() - start < 1200) {
            window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          }
        }, 600);
      } catch {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Standard WhatsApp
      const standardUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(standardUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 1. Share native all photos + text via Web Share API
  const handleShareAll = async () => {
    setIsSharing(true);
    try {
      if (navigator.share && productsWithImages.length > 0) {
        const filePromises = productsWithImages.map((p, idx) => {
          const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return urlToFile(p.imageUrl!, `bazar-${idx + 1}-${cleanName}.jpg`);
        });

        const files = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

        if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
          await navigator.share({
            title: 'Catálogo Completo — Rx do Bazar de Sucesso',
            text: catalogText,
            files: files,
          });
          setIsSharing(false);
          return;
        }
      }

      // Fallback: Open WhatsApp with full text
      window.open(waLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.log('Compartilhamento cancelado ou não suportado:', err);
      window.open(waLink, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSharing(false);
    }
  };

  // 2. Download all images in sequence
  const handleDownloadAllImages = async () => {
    if (productsWithImages.length === 0) return;
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: productsWithImages.length });

    for (let i = 0; i < productsWithImages.length; i++) {
      const p = productsWithImages[i];
      setDownloadProgress({ current: i + 1, total: productsWithImages.length });

      try {
        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileName = `bazar-${i + 1}-${cleanName}.jpg`;

        const link = document.createElement('a');
        link.href = p.imageUrl!;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay to prevent browser download throttling
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error('Erro ao baixar imagem:', err);
      }
    }

    setIsDownloading(false);
  };

  // 3. Copy catalog text
  const handleCopyCatalogText = () => {
    navigator.clipboard.writeText(catalogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 4. Generate Single Poster Image / JPG Collage of the Full Catalog
  const handleGenerateCatalogJPG = async () => {
    const items = availableProducts;
    if (items.length === 0) return;
    setIsGeneratingJPG(true);

    try {
      const cardWidth = 360;
      const cardHeight = 440;
      const cols = items.length === 1 ? 1 : items.length <= 4 ? 2 : 3;
      const rows = Math.ceil(items.length / cols);

      const padding = 36;
      const headerHeight = 150;
      const footerHeight = 90;

      const canvas = document.createElement('canvas');
      canvas.width = padding * 2 + cols * cardWidth + (cols - 1) * 24;
      canvas.height = headerHeight + padding + rows * cardHeight + (rows - 1) * 24 + footerHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark slate background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      const grad = ctx.createLinearGradient(0, 0, canvas.width, headerHeight);
      grad.addColorStop(0, '#e11d48'); // rose-600
      grad.addColorStop(1, '#be123c'); // rose-700
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, headerHeight);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛍️ RX DO BAZAR DE SUCESSO — CATÁLOGO', canvas.width / 2, 60);

      ctx.font = '16px system-ui, sans-serif';
      ctx.fillStyle = '#ffe4e6';
      ctx.fillText(`Peças exclusivas disponíveis para entrega imediata | Total: ${items.length} itens`, canvas.width / 2, 100);

      const loadImage = (url: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      // Draw each product card
      for (let i = 0; i < items.length; i++) {
        const prod = items[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = padding + col * (cardWidth + 24);
        const y = headerHeight + padding + row * (cardHeight + 24);

        // Card background
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 20);
        ctx.fill();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Product Image
        const imgHeight = 250;
        let imgLoaded = false;
        if (prod.imageUrl) {
          const img = await loadImage(prod.imageUrl);
          if (img) {
            imgLoaded = true;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x + 12, y + 12, cardWidth - 24, imgHeight, 14);
            ctx.clip();
            ctx.drawImage(img, x + 12, y + 12, cardWidth - 24, imgHeight);
            ctx.restore();
          }
        }

        if (!imgLoaded) {
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(x + 12, y + 12, cardWidth - 24, imgHeight, 14);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sem Imagem Cadastrada', x + cardWidth / 2, y + 12 + imgHeight / 2);
        }

        // Category Tag Badge (Top Left of Image)
        const catText = (prod.category || 'Bazar').toUpperCase();
        ctx.font = 'bold 10px system-ui, sans-serif';
        const catWidth = ctx.measureText(catText).width + 20;

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.roundRect(x + 24, y + 24, catWidth, 24, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(catText, x + 24 + catWidth / 2, y + 40);

        // Calculate price breakdown details
        const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);

        // Price & Discount Overlay Badges (Top Right of Image)
        if (hasDiscount) {
          // OFF Pill
          const offText = `🔥 ${discountPercent}% OFF`;
          ctx.font = 'bold 11px system-ui, sans-serif';
          const offWidth = ctx.measureText(offText).width + 16;
          const offX = x + cardWidth - 24 - offWidth;

          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.roundRect(offX, y + 24, offWidth, 22, 10);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(offText, offX + offWidth / 2, y + 39);

          // De X por Y Pill
          const dePorText = `De ${formatCurrency(fullPrice)} por ${formatCurrency(bazarPrice)}`;
          ctx.font = 'bold 10px system-ui, sans-serif';
          const dePorWidth = ctx.measureText(dePorText).width + 16;
          const dePorX = x + cardWidth - 24 - dePorWidth;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(dePorX, y + 52, dePorWidth, 22, 10);
          ctx.fill();
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(dePorText, dePorX + dePorWidth / 2, y + 67);
        } else {
          const priceText = formatCurrency(bazarPrice);
          ctx.font = 'bold 11px system-ui, sans-serif';
          const priceWidth = ctx.measureText(priceText).width + 18;
          const priceX = x + cardWidth - 24 - priceWidth;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(priceX, y + 24, priceWidth, 24, 12);
          ctx.fill();
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(priceText, priceX + priceWidth / 2, y + 40);
        }

        // Product Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px system-ui, sans-serif';
        ctx.textAlign = 'left';
        const truncatedName = prod.name.length > 27 ? prod.name.substring(0, 26) + '...' : prod.name;
        ctx.fillText(`${i + 1}. ${truncatedName}`, x + 18, y + imgHeight + 42);

        // Size / Color
        if (prod.sizeColor) {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '13px system-ui, sans-serif';
          const truncatedDetails = prod.sizeColor.length > 32 ? prod.sizeColor.substring(0, 31) + '...' : prod.sizeColor;
          ctx.fillText(`📏 ${truncatedDetails}`, x + 18, y + imgHeight + 68);
        }

        // Description snippet
        if (prod.description) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          const truncatedDesc = prod.description.length > 38 ? prod.description.substring(0, 37) + '...' : prod.description;
          ctx.fillText(`📝 ${truncatedDesc}`, x + 18, y + imgHeight + 92);
        }

        // Bottom Price Breakdown
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText(`Por ${formatCurrency(bazarPrice)}`, x + 18, y + cardHeight - 18);

        if (hasDiscount) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillText(`De ${formatCurrency(fullPrice)} (Econ. ${formatCurrency(discountAmount)})`, x + 165, y + cardHeight - 18);
        }
      }

      // Footer
      const footerY = canvas.height - footerHeight + 25;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬 Para comprar ou tirar dúvidas, envie uma mensagem no WhatsApp!', canvas.width / 2, footerY + 20);

      // Trigger Download as JPG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `bazar-catalogo-foto-geral.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Erro ao gerar foto do catálogo:', err);
      alert('Ocorreu um erro ao gerar a foto geral do catálogo.');
    } finally {
      setIsGeneratingJPG(false);
    }
  };

  // 5. Open Printable / PDF Catalog Window
  const handlePrintCatalog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = availableProducts
      .map(
        (p, idx) => `
        <div style="break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; gap: 16px; align-items: center; margin-bottom: 16px; background: #ffffff;">
          <div style="width: 110px; height: 110px; flex-shrink: 0; background: #f1f5f9; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-center: center;">
            ${
              p.imageUrl
                ? `<img src="${p.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<div style="color: #94a3b8; font-size: 11px; text-align: center;">Sem Foto</div>`
            }
          </div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: bold; color: #e11d48; text-transform: uppercase;">${p.category || 'Bazar'}</div>
            <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 2px 0;">${idx + 1}. ${p.name}</div>
            ${p.sizeColor ? `<div style="font-size: 12px; font-weight: 600; color: #475569;">📏 Detalhes/Tamanho: ${p.sizeColor}</div>` : ''}
            ${p.description ? `<div style="font-size: 12px; color: #334155; margin-top: 4px;">📝 ${p.description}</div>` : ''}
            <div style="font-size: 15px; font-weight: bold; color: #059669; margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Por ${formatCurrency(p.bazarPrice)}</span>
              ${
                p.fullPrice && p.fullPrice > p.bazarPrice
                  ? `<span style="font-size: 12px; color: #94a3b8; text-decoration: line-through;">De ${formatCurrency(p.fullPrice)}</span>
                     <span style="font-size: 11px; background: #ffe4e6; color: #be123c; padding: 2px 8px; border-radius: 6px; font-weight: bold;">🔥 ${Math.round(((p.fullPrice - p.bazarPrice) / p.fullPrice) * 100)}% OFF (Economia: ${formatCurrency(p.fullPrice - p.bazarPrice)})</span>`
                  : ''
              }
            </div>
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Catálogo Completo - Rx do Bazar de Sucesso</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #f8fafc; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 4px; color: #0f172a; }
            p.sub { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; }
            .grid { max-width: 800px; margin: 0 auto; }
            @media print {
              body { background: white; padding: 0; }
              .grid { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <h1>🛍️ Catálogo Completo — Rx do Bazar de Sucesso</h1>
          <p class="sub">Total de ${availableProducts.length} peças disponíveis em estoque para entrega imediata</p>
          <div class="grid">
            ${itemsHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Exportar Catálogo Completo
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Divulgue todas as {availableProducts.length} peças com fotos e detalhes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-4 mt-3">

        {/* Catalog Summary Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Produtos no Catálogo</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {availableProducts.length}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Com Fotos Cadastradas</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {productsWithImages.length}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">Formato Pronto</div>
            <div className="text-xs font-black text-amber-900 dark:text-amber-200 mt-1 flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Fotos + Detalhes</span>
            </div>
          </div>
        </div>

        {/* Formatted Text Box Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Prévia do Texto Completo para WhatsApp:
            </label>
            <span className="text-[11px] text-slate-400">
              Inclui preço, tamanho, descrição e links das fotos
            </span>
          </div>

          <div className="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-52 overflow-y-auto border border-slate-800 shadow-inner">
            {catalogText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3.5 pt-1">

          {/* Main Requested Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Print / Export PDF */}
            <button
              onClick={handlePrintCatalog}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2.5 transition active:scale-98"
            >
              <Printer className="h-5 w-5 shrink-0" />
              <span>Gerar PDF / Imprimir Catálogo Completo</span>
            </button>

            {/* 2. Export JPG Poster Image */}
            <button
              onClick={handleGenerateCatalogJPG}
              disabled={isGeneratingJPG || availableProducts.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition active:scale-98 disabled:opacity-50"
            >
              <FileText className="h-5 w-5 shrink-0" />
              <span>{isGeneratingJPG ? 'Criando Foto Geral...' : 'Exportar Foto Geral (JPG)'}</span>
              <Download className="h-4 w-4 opacity-80 shrink-0" />
            </button>
          </div>

          {/* Dedicated WhatsApp Options Card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Opções de Envio via WhatsApp
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Selecione seu aplicativo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Business Option */}
              <button
                onClick={() => handleOpenWhatsApp('business')}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 active:scale-98"
              >
                <Briefcase className="h-4 w-4 text-emerald-200 shrink-0" />
                <span>Enviar no WhatsApp Business</span>
              </button>

              {/* WhatsApp Standard Option */}
              <button
                onClick={() => handleOpenWhatsApp('standard')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Enviar no WhatsApp Padrão</span>
              </button>
            </div>

            {/* Native Share with Images */}
            <button
              onClick={handleShareAll}
              disabled={isSharing}
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50 active:scale-98"
            >
              <Smartphone className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {isSharing
                  ? 'Enviando com Fotos...'
                  : 'Compartilhar Fotos + Texto (Menu Nativo do Celular)'}
              </span>
            </button>
          </div>

          {/* Download Images & Copy Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            {/* Download All Individual Photos */}
            <button
              onClick={handleDownloadAllImages}
              disabled={isDownloading || productsWithImages.length === 0}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 px-3 rounded-2xl transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              <Images className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                {isDownloading
                  ? `Baixando (${downloadProgress.current}/${downloadProgress.total})...`
                  : `Baixar ${productsWithImages.length} Fotos Separadas`}
              </span>
            </button>

            {/* Copy Full Text */}
            <button
              onClick={handleCopyCatalogText}
              className={`font-bold text-xs py-3 px-3 rounded-2xl transition flex items-center justify-center gap-2 border ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Texto do Catálogo Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-sky-500 shrink-0" />
                  <span>Copiar Apenas o Texto</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic pt-1">
            💡 Dica: Você pode enviar diretamente para o WhatsApp Business, gerar um PDF do catálogo ou exportar a Foto Geral em JPG!
          </p>

        </div>

        </div>
      </div>
    </div>
  );
};
