import React, { useState, useMemo } from 'react';
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
  Smartphone,
  CheckSquare,
  Square,
  Filter,
  Layers,
  Tag
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Product } from '../../types';
import { formatCurrency, generateFullCatalogExportText, getProductPriceDetails } from '../../utils/formatters';

interface ExportCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  initialSelectedProductIds?: string[];
}

export const ExportCatalogModal: React.FC<ExportCatalogModalProps> = ({
  isOpen,
  onClose,
  products: propsProducts,
  initialSelectedProductIds,
}) => {
  const { products: contextProducts, categories } = useBazar();
  const allProducts = propsProducts || contextProducts || [];

  // Filter only items with available quantity and visible in catalog
  const availableProducts = useMemo(() => {
    return allProducts.filter((p) => p.quantity > 0 && p.showInCatalog !== false);
  }, [allProducts]);

  // Selected products state
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedProductIds && initialSelectedProductIds.length > 0) {
      return initialSelectedProductIds;
    }
    return availableProducts.map((p) => p.id);
  });

  // Filter inside modal
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('Todas');
  const [modalSubcategoryFilter, setModalSubcategoryFilter] = useState<string>('Todas');

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingJPG, setIsGeneratingJPG] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  // Update selectedIds if initialSelectedProductIds changes or modal reopens
  React.useEffect(() => {
    if (initialSelectedProductIds && initialSelectedProductIds.length > 0) {
      setSelectedIds(initialSelectedProductIds);
    } else {
      setSelectedIds(availableProducts.map((p) => p.id));
    }
  }, [initialSelectedProductIds, isOpen, availableProducts]);

  if (!isOpen) return null;

  // Selected products array
  const selectedProducts = availableProducts.filter((p) => selectedIds.includes(p.id));
  const productsWithImages = selectedProducts.filter((p) => !!p.imageUrl);

  // Available subcategories for current modal filter
  const currentCategoryObj = categories.find((c) => c.name === modalCategoryFilter);
  const availableSubcategoriesInModal = currentCategoryObj?.subcategories || [];

  // Filtered products shown in selection list
  const visibleProductsInList = availableProducts.filter((p) => {
    if (modalCategoryFilter !== 'Todas' && p.category !== modalCategoryFilter) return false;
    if (modalSubcategoryFilter !== 'Todas' && p.subcategory !== modalSubcategoryFilter) return false;
    return true;
  });

  const catalogText = generateFullCatalogExportText(selectedProducts);

  const toggleSelectAll = () => {
    if (selectedIds.length === availableProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableProducts.map((p) => p.id));
    }
  };

  const toggleSelectVisible = () => {
    const visibleIds = visibleProductsInList.map((p) => p.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Convert image URL/base64 to File object safely
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

      // Fallback via Canvas
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

  // Open WhatsApp
  const handleOpenWhatsApp = (appType: 'standard' | 'business') => {
    const encodedText = encodeURIComponent(catalogText);
    
    if (appType === 'business') {
      const waBusinessUri = `whatsapp-business://send?text=${encodedText}`;
      const fallbackUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      const start = Date.now();
      try {
        window.location.href = waBusinessUri;
        setTimeout(() => {
          if (Date.now() - start < 1200) {
            window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          }
        }, 600);
      } catch {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      const standardUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(standardUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Share native all photos + text via Web Share API
  const handleShareAll = async () => {
    setIsSharing(true);
    try {
      const filesToShare: File[] = [];

      for (let i = 0; i < productsWithImages.length; i++) {
        const prod = productsWithImages[i];
        if (prod.imageUrl) {
          const safeName = prod.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const file = await urlToFile(prod.imageUrl, `${i + 1}_${safeName}.jpg`);
          if (file) {
            filesToShare.push(file);
          }
        }
      }

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          title: 'Catálogo de Produtos — Rx do Bazar de Sucesso',
          text: catalogText,
          files: filesToShare,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Catálogo de Produtos — Rx do Bazar de Sucesso',
          text: catalogText,
        });
      } else {
        handleOpenWhatsApp('standard');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        handleOpenWhatsApp('standard');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Download all individual photos
  const handleDownloadAllPhotos = async () => {
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: productsWithImages.length });

    try {
      for (let i = 0; i < productsWithImages.length; i++) {
        const prod = productsWithImages[i];
        if (prod.imageUrl) {
          setDownloadProgress({ current: i + 1, total: productsWithImages.length });

          const safeName = prod.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const link = document.createElement('a');
          link.href = prod.imageUrl;
          link.download = `bazar_${i + 1}_${safeName}.jpg`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          await new Promise((r) => setTimeout(r, 400));
        }
      }
    } catch (err) {
      console.error('Erro ao baixar fotos:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy catalog text
  const handleCopyCatalogText = () => {
    navigator.clipboard.writeText(catalogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate Single Poster Image / Clean Light JPG Collage of Selected Products
  const handleGenerateCatalogJPG = async () => {
    const items = selectedProducts;
    if (items.length === 0) return;
    setIsGeneratingJPG(true);

    try {
      const cardWidth = 380;
      const cardHeight = 460;
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

      // Clean Light background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner - Rose Gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, headerHeight);
      grad.addColorStop(0, '#e11d48');
      grad.addColorStop(1, '#be123c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, headerHeight);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛍️ RX DO BAZAR DE SUCESSO — CATÁLOGO', canvas.width / 2, 60);

      ctx.font = '15px system-ui, sans-serif';
      ctx.fillStyle = '#ffe4e6';
      ctx.fillText(`Peças selecionadas disponíveis para entrega imediata | Total: ${items.length} itens`, canvas.width / 2, 100);

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

        // Card background (Clean Light White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 20);
        ctx.fill();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Product Image
        const imgHeight = 255;
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
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(x + 12, y + 12, cardWidth - 24, imgHeight, 14);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sem Imagem Cadastrada', x + cardWidth / 2, y + 12 + imgHeight / 2);
        }

        // Category Tag Badge
        const catLabel = prod.subcategory ? `${prod.category} • ${prod.subcategory}` : (prod.category || 'Bazar');
        ctx.font = 'bold 10px system-ui, sans-serif';
        const catWidth = ctx.measureText(catLabel).width + 18;

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.roundRect(x + 20, y + 20, Math.min(cardWidth - 130, catWidth), 24, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(catLabel, x + 28, y + 36);

        // Calculate price details
        const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);

        // Price & Discount Overlay Badges
        if (hasDiscount) {
          const offText = `🔥 ${discountPercent}% OFF`;
          ctx.font = 'bold 11px system-ui, sans-serif';
          const offWidth = ctx.measureText(offText).width + 16;
          const offX = x + cardWidth - 20 - offWidth;

          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.roundRect(offX, y + 20, offWidth, 22, 10);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(offText, offX + offWidth / 2, y + 35);
        }

        // Product Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'left';
        const truncatedName = prod.name.length > 28 ? prod.name.substring(0, 27) + '...' : prod.name;
        ctx.fillText(`${i + 1}. ${truncatedName}`, x + 16, y + imgHeight + 40);

        // Size / Color
        if (prod.sizeColor) {
          ctx.fillStyle = '#64748b';
          ctx.font = '12px system-ui, sans-serif';
          const truncatedDetails = prod.sizeColor.length > 34 ? prod.sizeColor.substring(0, 33) + '...' : prod.sizeColor;
          ctx.fillText(`📏 ${truncatedDetails}`, x + 16, y + imgHeight + 64);
        }

        // Price Breakdown
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText(`Por ${formatCurrency(bazarPrice)}`, x + 16, y + cardHeight - 18);

        if (hasDiscount) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillText(`De ${formatCurrency(fullPrice)} (Econ. ${formatCurrency(discountAmount)})`, x + 155, y + cardHeight - 18);
        }
      }

      // Footer
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Garanta já a sua peça favorita! Estoque limitado.', canvas.width / 2, canvas.height - 40);

      // Download collage
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `catalogo_bazar_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao gerar JPG do catálogo:', err);
    } finally {
      setIsGeneratingJPG(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Exportar Catálogo para WhatsApp
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Selecione os produtos desejados, ordene e envie com fotos, valores cheios e descontos organizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* Selection & Category Filtering Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Produtos Selecionados para Envio:
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                  {selectedIds.length} de {availableProducts.length} itens
                </span>
              </div>

              {/* Selection Quick Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  {selectedIds.length === availableProducts.length ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>Desmarcar Todos</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>Selecionar Todos ({availableProducts.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Category & Subcategory Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-rose-500" />
                  Filtrar Lista por Categoria
                </label>
                <select
                  value={modalCategoryFilter}
                  onChange={(e) => {
                    setModalCategoryFilter(e.target.value);
                    setModalSubcategoryFilter('Todas');
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Todas">Todas as Categorias ({availableProducts.length})</option>
                  {categories.map((cat) => {
                    const count = availableProducts.filter((p) => p.category === cat.name).length;
                    return (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-rose-500" />
                  Filtrar por Subcategoria
                </label>
                <select
                  value={modalSubcategoryFilter}
                  disabled={modalCategoryFilter === 'Todas' || availableSubcategoriesInModal.length === 0}
                  onChange={(e) => setModalSubcategoryFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 disabled:opacity-50"
                >
                  <option value="Todas">Todas as Subcategorias</option>
                  {availableSubcategoriesInModal.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Products Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Marque ou desmarque os itens que farão parte do catálogo:
              </span>
              <button
                type="button"
                onClick={toggleSelectVisible}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Inverter Visíveis ({visibleProductsInList.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900">
              {visibleProductsInList.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium">
                  Nenhum produto disponível nesta categoria/subcategoria.
                </div>
              ) : (
                visibleProductsInList.map((prod) => {
                  const isSelected = selectedIds.includes(prod.id);
                  const { bazarPrice, fullPrice, discountPercent, hasDiscount } = getProductPriceDetails(prod);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProductSelection(prod.id)}
                      translate="no"
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition select-none notranslate ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-rose-400 dark:border-rose-500 shadow-xs'
                          : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 pointer-events-none"
                      />

                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 notranslate" translate="no">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate notranslate" translate="no">
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(bazarPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-1 py-0.2 rounded">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* WhatsApp Standard Action */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Pessoal</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Abre o WhatsApp com o texto organizado por Categoria e Subcategoria.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={() => handleOpenWhatsApp('standard')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
              >
                Enviar no WhatsApp ({selectedProducts.length} itens)
              </button>
            </div>

            {/* WhatsApp Business Action */}
            <div className="bg-teal-50/80 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-extrabold text-sm">
                  <Briefcase className="h-4 w-4 text-teal-600" />
                  <span>WhatsApp Business</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Envia diretamente pelo aplicativo WhatsApp Business.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={() => handleOpenWhatsApp('business')}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95 disabled:opacity-50"
              >
                Abrir no WhatsApp Business
              </button>
            </div>

            {/* Generate Full JPG Collage */}
            <div className="bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-extrabold text-sm">
                  <Images className="h-4 w-4 text-purple-600" />
                  <span>Banner Geral em JPG</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Gera uma imagem única de alta resolução estilo vitrine com todos os itens selecionados.
                </p>
              </div>
              <button
                type="button"
                disabled={isGeneratingJPG || selectedProducts.length === 0}
                onClick={handleGenerateCatalogJPG}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingJPG ? 'Gerando Imagem...' : `Baixar Foto Geral (${selectedProducts.length} itens)`}
              </button>
            </div>

            {/* Share or Download Photos */}
            <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-sm">
                  <Smartphone className="h-4 w-4 text-rose-600" />
                  <span>Compartilhar / Baixar Fotos</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {productsWithImages.length} fotos disponíveis entre os produtos selecionados.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSharing || selectedProducts.length === 0}
                  onClick={handleShareAll}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl transition active:scale-95 disabled:opacity-50"
                >
                  {isSharing ? 'Preparando...' : 'Compartilhar'}
                </button>
                <button
                  type="button"
                  disabled={isDownloading || productsWithImages.length === 0}
                  onClick={handleDownloadAllPhotos}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition active:scale-95 disabled:opacity-50"
                >
                  {isDownloading ? `${downloadProgress.current}/${downloadProgress.total}` : 'Baixar Fotos'}
                </button>
              </div>
            </div>

          </div>

          {/* Copy Catalog Text Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Copie o texto completo pré-formatado para colar em grupos ou listas de transmissão.
            </div>
            <button
              type="button"
              onClick={handleCopyCatalogText}
              className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span>Copiar Texto Completo</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-extrabold px-6 py-2.5 rounded-xl transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
