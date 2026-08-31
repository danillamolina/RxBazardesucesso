import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  Download, 
  Copy, 
  Check, 
  Share2, 
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
  Tag,
  Eye,
  Send,
  Flame,
  CheckCircle2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Product } from '../../types';
import { formatCurrency, formatPercent, generateFullCatalogExportText, getProductPriceDetails } from '../../utils/formatters';
import { 
  downloadMultipleProductsIndividualJpgs, 
  shareMultipleProductsWithEditedImages,
  downloadProductJpg,
  copyProductImageToClipboard,
  shareProductJpgWhatsApp,
  buildWhatsAppDirectUrl,
  isDesktopDevice
} from '../../utils/productJpgGenerator';

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

  const [copiedText, setCopiedText] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);
  const [isSharingImages, setIsSharingImages] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [progressStatus, setProgressStatus] = useState({ current: 0, total: 0, text: '' });
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const isDesktop = useMemo(() => isDesktopDevice(), []);

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

  // Open WhatsApp with text
  const handleOpenWhatsAppTextOnly = (destination: 'standard' | 'business' | 'web') => {
    const url = buildWhatsAppDirectUrl(catalogText, undefined, destination, true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 1. Share edited photos + text directly to WhatsApp or Native Mobile Share
  const handleShareAllEditedImages = async (destination: 'standard' | 'business' = 'standard') => {
    if (selectedProducts.length === 0) return;
    setIsSharingImages(true);
    const destName = destination === 'business' ? 'WhatsApp Business' : 'WhatsApp';
    setProgressStatus({ current: 0, total: selectedProducts.length, text: `Preparando fotos editadas para ${destName}...` });

    try {
      const result = await shareMultipleProductsWithEditedImages(
        selectedProducts,
        catalogText,
        (curr, tot) => {
          setProgressStatus({ current: curr, total: tot, text: `Gerando imagem ${curr} de ${tot}...` });
        }
      );

      if (!result.sharedNatively) {
        // Fallback on desktop or non-sharing browsers: Download the JPG files directly and open WhatsApp
        setProgressStatus({ current: selectedProducts.length, total: selectedProducts.length, text: 'Baixando fotos editadas (JPGs)...' });
        await downloadMultipleProductsIndividualJpgs(selectedProducts);
        
        setSuccessNotice(`Fotos editadas baixadas com sucesso! Abrindo o ${destName} para colar o texto e anexar as fotos.`);
        setTimeout(() => setSuccessNotice(null), 8000);

        handleOpenWhatsAppTextOnly(destination);
      }
    } catch (err) {
      console.error('Erro ao compartilhar fotos editadas:', err);
      handleOpenWhatsAppTextOnly(destination);
    } finally {
      setIsSharingImages(false);
      setProgressStatus({ current: 0, total: 0, text: '' });
    }
  };

  // 2. Save all edited photos directly to Mobile Gallery / Device Downloads (Pure JPG files, NO ZIP!)
  const handleSaveAllToGallery = async () => {
    if (selectedProducts.length === 0) return;
    setIsSavingToGallery(true);
    setProgressStatus({ current: 0, total: selectedProducts.length, text: 'Iniciando download das fotos para a galeria...' });

    try {
      await downloadMultipleProductsIndividualJpgs(selectedProducts, (curr, tot, name) => {
        setProgressStatus({ current: curr, total: tot, text: `Salvando foto (${curr}/${tot}): ${name}` });
      });
      setSuccessNotice(`${selectedProducts.length} fotos editadas salvas na sua galeria/downloads com sucesso!`);
      setTimeout(() => setSuccessNotice(null), 7000);
    } catch (err) {
      console.error('Erro ao salvar fotos na galeria:', err);
    } finally {
      setIsSavingToGallery(false);
      setProgressStatus({ current: 0, total: 0, text: '' });
    }
  };

  // Copy catalog text
  const handleCopyCatalogText = () => {
    navigator.clipboard.writeText(catalogText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Quick single card download/save to gallery
  const handleSaveSingleCard = async (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadProductJpg(prod);
      setSuccessNotice(`Foto editada de "${prod.name}" salva com sucesso!`);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Erro ao baixar foto do produto:', err);
    }
  };

  // Quick single card share directly to WhatsApp or WhatsApp Business
  const handleShareSingleCard = async (prod: Product, destination: 'standard' | 'business', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await shareProductJpgWhatsApp(prod, destination);
    } catch (err) {
      console.error('Erro ao enviar foto para WhatsApp:', err);
    }
  };

  // Quick single card copy to clipboard for Ctrl+V
  const handleCopySingleCard = async (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const ok = await copyProductImageToClipboard(prod);
      if (ok) {
        setCopiedId(prod.id);
        setTimeout(() => setCopiedId(null), 2500);
      } else {
        await downloadProductJpg(prod);
      }
    } catch (err) {
      console.error('Erro ao copiar foto:', err);
    }
  };

  // Generate Single Poster Image / Clean Light JPG Collage of Selected Products
  const handleGenerateCatalogCollage = async () => {
    const items = selectedProducts;
    if (items.length === 0) return;
    setIsGeneratingCollage(true);

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
      link.download = `catalogo_geral_bazar_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessNotice('Banner geral em JPG baixado com sucesso!');
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err) {
      console.error('Erro ao gerar JPG do catálogo:', err);
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  const isBusy = isSharingImages || isSavingToGallery || isGeneratingCollage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto notranslate" translate="no">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Exportar Fotos Editadas & WhatsApp
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Fotos com estoque, preço cheio, valor promocional e desconto prontas para enviar ou salvar na galeria.
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

        {/* Success / Status Notification Banner */}
        {successNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-5 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Progress Bar when generating / downloading cards */}
        {isBusy && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900/60 px-5 py-3 space-y-1.5 animate-pulse">
            <div className="flex items-center justify-between text-xs font-extrabold text-rose-800 dark:text-rose-300">
              <span>{progressStatus.text || 'Processando fotos editadas...'}</span>
              {progressStatus.total > 0 && (
                <span>{progressStatus.current} de {progressStatus.total}</span>
              )}
            </div>
            {progressStatus.total > 0 && (
              <div className="w-full bg-rose-200 dark:bg-rose-900/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progressStatus.current / progressStatus.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* MAIN PROMINENT ACTION CARD: Export Edited Photos */}
          <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-600/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider mb-2 border border-white/30">
                  <Flame className="h-3.5 w-3.5" />
                  Fotos Editadas com Dados & Descontos
                </div>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                  Anúncios com Fotos Prontos para Postagem
                </h4>
                <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl font-medium">
                  Gere as fotos de cada produto com o layout completo (estoque, preço cheio, valor promocional, % de desconto e detalhes), prontas para postar no WhatsApp ou salvar na galeria do seu celular!
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col items-end gap-1">
                <span className="text-3xl font-black tracking-tight">{selectedProducts.length}</span>
                <span className="text-xs text-rose-100 font-bold uppercase">Produtos Selecionados</span>
              </div>
            </div>

            {/* Main Action Buttons Grid: DIRECT WHATSAPP & DIRECT GALLERY DOWNLOAD (NO ZIP) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              {/* Button 1: Share / WhatsApp Normal with Edited Photos */}
              <button
                type="button"
                disabled={isBusy || selectedProducts.length === 0}
                onClick={() => handleShareAllEditedImages('standard')}
                className="bg-white hover:bg-rose-50 text-emerald-700 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                title="Envia fotos editadas e texto formatado pelo WhatsApp Padrão / WhatsApp Web"
              >
                <MessageSquare className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                <div className="text-left">
                  <div className="leading-tight font-black">WhatsApp Normal</div>
                  <div className="text-[10px] text-slate-500 font-normal">Fotos + Texto</div>
                </div>
              </button>

              {/* Button 2: Share / WhatsApp Business with Edited Photos */}
              <button
                type="button"
                disabled={isBusy || selectedProducts.length === 0}
                onClick={() => handleShareAllEditedImages('business')}
                className="bg-teal-900/90 hover:bg-teal-900 text-white border border-teal-400/40 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                title="Envia fotos editadas e texto formatado pelo aplicativo WhatsApp Business"
              >
                <Briefcase className="h-4.5 w-4.5 shrink-0 text-teal-300" />
                <div className="text-left">
                  <div className="leading-tight font-black">WhatsApp Business</div>
                  <div className="text-[10px] text-teal-200 font-normal">Fotos + Texto</div>
                </div>
              </button>

              {/* Button 3: Save All Photos directly to Phone Gallery (JPGs) */}
              <button
                type="button"
                disabled={isBusy || selectedProducts.length === 0}
                onClick={handleSaveAllToGallery}
                className="bg-rose-950/40 hover:bg-rose-950/60 text-white border border-white/30 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                title="Salva todas as fotos editadas em formato JPG diretamente na galeria de fotos do celular ou computador"
              >
                <Camera className="h-4.5 w-4.5 shrink-0 text-white" />
                <div className="text-left">
                  <div className="leading-tight font-black">Salvar na Galeria</div>
                  <div className="text-[10px] text-rose-200 font-normal">Fotos em JPG</div>
                </div>
              </button>

            </div>
          </div>

          {/* Selection & Category Filtering Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Itens Selecionados para Exportação:
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

          {/* Interactive Products Checklist with Single Card Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Produtos no Catálogo (salve na galeria ou envie individualmente):
              </span>
              <button
                type="button"
                onClick={toggleSelectVisible}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Inverter Visíveis ({visibleProductsInList.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900">
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
                      className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(prod.id)}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 pointer-events-none"
                          />
                        </div>

                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate leading-tight text-slate-900 dark:text-white">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(bazarPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1 rounded">
                                -{discountPercent}%
                              </span>
                            )}
                            <span className="text-slate-400 font-medium truncate">
                              • {prod.quantity} un.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Single Item Actions (Save to Gallery / WhatsApp Normal / WhatsApp Business) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleShareSingleCard(prod, 'standard', e)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs transition"
                          title="Enviar foto deste produto pelo WhatsApp Padrão"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShareSingleCard(prod, 'business', e)}
                          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs transition"
                          title="Enviar foto deste produto pelo WhatsApp Business"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopySingleCard(prod, e)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs transition"
                          title="Copiar imagem editada (para colar com Ctrl+V)"
                        >
                          {copiedId === prod.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSaveSingleCard(prod, e)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-2xs transition"
                          title="Salvar foto editada em JPG na galeria"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Secondary Actions: Banner Collage & WhatsApp Text & WhatsApp Web */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Action 1: WhatsApp Text Direct */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                  <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Padrão</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                  Envia lista de texto formatada com preços e descontos.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={() => handleOpenWhatsAppTextOnly('standard')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                Enviar Texto ({selectedProducts.length})
              </button>
            </div>

            {/* Action 2: WhatsApp Business */}
            <div className="bg-teal-50/80 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-extrabold text-xs">
                  <Briefcase className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>WhatsApp Business</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                  Abre diretamente no app WhatsApp Business comercial.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={() => handleOpenWhatsAppTextOnly('business')}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                Abrir no Business
              </button>
            </div>

            {/* Action 3: WhatsApp Web Direct for PC */}
            <div className="bg-sky-50/80 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-extrabold text-xs">
                  <ExternalLink className="h-4 w-4 text-sky-600 shrink-0" />
                  <span>WhatsApp Web (PC)</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                  Abre direto em uma nova aba do navegador para PC.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={() => handleOpenWhatsAppTextOnly('web')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                Abrir Web no PC
              </button>
            </div>

            {/* Action 4: Generate Single Collage Banner */}
            <div className="bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-extrabold text-xs">
                  <Images className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Banner Resumo</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                  1 imagem estilo vitrine com todos os itens juntos.
                </p>
              </div>
              <button
                type="button"
                disabled={isBusy || selectedProducts.length === 0}
                onClick={handleGenerateCatalogCollage}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingCollage ? 'Gerando...' : 'Baixar Banner'}
              </button>
            </div>

          </div>

          {/* Copy Catalog Text Quick Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Copie o texto completo pré-formatado para colar em grupos ou listas de transmissão:
            </div>
            <button
              type="button"
              onClick={handleCopyCatalogText}
              className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0"
            >
              {copiedText ? (
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
