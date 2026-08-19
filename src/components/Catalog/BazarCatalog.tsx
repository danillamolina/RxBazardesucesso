import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Package, 
  Sparkles, 
  ExternalLink,
  Tag,
  Download,
  Image as ImageIcon,
  LayoutList,
  LayoutGrid,
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  UserCheck
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { Product, ProductCategory } from '../../types';
import { shareProductJpgWhatsApp, downloadProductJpg } from '../../utils/productJpgGenerator';
import { ExportCatalogModal } from './ExportCatalogModal';
import { SendToCustomerModal } from './SendToCustomerModal';

export const BazarCatalog: React.FC = () => {
  const { products, sales } = useBazar();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [stockFilter, setStockFilter] = useState<'todos' | 'disponiveis' | 'pouco_estoque' | 'esgotados'>('todos');
  const [viewMode, setViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [isExportCatalogOpen, setIsExportCatalogOpen] = useState(false);
  const [sendCustomerProduct, setSendCustomerProduct] = useState<Product | null>(null);
  const [isSendCustomerOpen, setIsSendCustomerOpen] = useState(false);

  // All catalog eligible products
  const catalogProducts = products.filter((p) => p.showInCatalog !== false);

  // Counts for live stock summary
  const inStockCount = catalogProducts.filter((p) => p.quantity > 0).length;
  const lowStockCount = catalogProducts.filter((p) => p.quantity > 0 && p.quantity <= 3).length;
  const soldOutCount = catalogProducts.filter((p) => p.quantity === 0).length;

  // Filter by category
  let filteredProducts = selectedCategory === 'Todas'
    ? catalogProducts
    : catalogProducts.filter((p) => p.category === selectedCategory);

  // Filter by stock status
  if (stockFilter === 'disponiveis') {
    filteredProducts = filteredProducts.filter((p) => p.quantity > 0);
  } else if (stockFilter === 'pouco_estoque') {
    filteredProducts = filteredProducts.filter((p) => p.quantity > 0 && p.quantity <= 3);
  } else if (stockFilter === 'esgotados') {
    filteredProducts = filteredProducts.filter((p) => p.quantity === 0);
  }

  const handleCopyText = (prod: Product) => {
    const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
    const text = 
      `🔥 *ACHADO DO RX DO BAZAR DE SUCESSO!* 🔥\n\n` +
      `✨ *${prod.name}*${prod.sku ? ` (Cód: ${prod.sku})` : ''}\n` +
      (prod.sizeColor ? `📏 Detalhes: ${prod.sizeColor}\n` : '') +
      (prod.expirationDate ? `📅 Validade: ${prod.expirationDate}\n` : '') +
      (prod.description ? `📝 ${prod.description}\n` : '') +
      (hasDiscount 
        ? `\n🏷️ Preço Cheio: ~${formatCurrency(fullPrice)}~\n🔥 Preço no Bazar: *${formatCurrency(bazarPrice)}* (🔥 *${discountPercent}% OFF*)\n💰 Desconto Realizado: *${formatCurrency(discountAmount)}* de economia!\n`
        : `\n💰 Preço no Bazar: *${formatCurrency(bazarPrice)}*!\n`) +
      (prod.quantity > 0 ? `📦 Estoque Disponível: *${prod.quantity} un.*\n` : `🔴 *PRODUTO ESGOTADO*\n`) +
      `\nMe chama no privado para garantir ou tirar dúvidas! 🛍️💖`;

    navigator.clipboard.writeText(text);
    setCopiedId(prod.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (prod: Product, isBusiness: boolean = false) => {
    const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
    const text = 
      `🔥 *ACHADO DO RX DO BAZAR DE SUCESSO!* 🔥\n\n` +
      `✨ *${prod.name}*${prod.sku ? ` (Cód: ${prod.sku})` : ''}\n` +
      (prod.sizeColor ? `📏 Detalhes: ${prod.sizeColor}\n` : '') +
      (prod.expirationDate ? `📅 Validade: ${prod.expirationDate}\n` : '') +
      (prod.description ? `📝 ${prod.description}\n` : '') +
      (hasDiscount 
        ? `\n🏷️ Preço Cheio: ~${formatCurrency(fullPrice)}~\n🔥 Preço no Bazar: *${formatCurrency(bazarPrice)}* (🔥 *${discountPercent}% OFF*)\n💰 Desconto Realizado: *${formatCurrency(discountAmount)}* de economia!\n`
        : `\n💰 Preço no Bazar: *${formatCurrency(bazarPrice)}*!\n`) +
      (prod.quantity > 0 ? `📦 Estoque Disponível: *${prod.quantity} un.*\n` : `🔴 *PRODUTO ESGOTADO*\n`) +
      (prod.imageUrl && !prod.imageUrl.startsWith('data:') ? `\n📸 Foto da peça: ${prod.imageUrl}\n` : '') +
      `\nMe chama no privado para garantir ou tirar dúvidas! 🛍️💖`;

    const encoded = encodeURIComponent(text);
    const url = isBusiness ? `whatsapp://send?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendJpgWhatsApp = async (prod: Product, isBusiness: boolean = false) => {
    try {
      await shareProductJpgWhatsApp(prod, isBusiness);
    } catch (err) {
      console.error('Erro ao compartilhar imagem JPG:', err);
    }
  };

  const handleDownloadJpg = async (prod: Product) => {
    try {
      await downloadProductJpg(prod);
    } catch (err) {
      console.error('Erro ao baixar imagem JPG:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Vitrine do Rx do Bazar de Sucesso
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Catálogo Online & Vitrine de Produtos
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Preços cheios, valores de bazar e descontos destacados diretamente na foto do produto! O catálogo se atualiza em tempo real conforme as peças são vendidas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsExportCatalogOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Gerar PDF / Imprimir Catálogo</span>
          </button>

          <button
            onClick={() => setIsExportCatalogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar Foto Geral (JPG)</span>
          </button>
        </div>
      </div>

      {/* Live Sync Real-time Stock Banner & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        
        {/* Real-time sync message */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span>Catálogo Sincronizado em Tempo Real</span>
            <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Atualiza automaticamente ao vender peças)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {inStockCount} disponíveis
            </span>
            {lowStockCount > 0 && (
              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lowStockCount} acabando
              </span>
            )}
            {soldOutCount > 0 && (
              <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {soldOutCount} esgotados
              </span>
            )}
          </div>
        </div>

        {/* Filters Bar: Categories + Stock Filter + View Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Stock Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="text-xs font-extrabold text-slate-400 uppercase mr-1">Estoque:</span>
            
            <button
              onClick={() => setStockFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                stockFilter === 'todos'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>Todos os Produtos</span>
              <span className="text-[10px] opacity-75">({catalogProducts.length})</span>
            </button>

            <button
              onClick={() => setStockFilter('disponiveis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                stockFilter === 'disponiveis'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>🟢 Disponíveis</span>
              <span className="text-[10px] opacity-75">({inStockCount})</span>
            </button>

            <button
              onClick={() => setStockFilter('pouco_estoque')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                stockFilter === 'pouco_estoque'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>⚡ Poucas Unidades</span>
              <span className="text-[10px] opacity-75">({lowStockCount})</span>
            </button>

            <button
              onClick={() => setStockFilter('esgotados')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                stockFilter === 'esgotados'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>🔴 Esgotados</span>
              <span className="text-[10px] opacity-75">({soldOutCount})</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('horizontal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'horizontal'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Foto Grande com Descrição ao Lado"
            >
              <LayoutList className="h-4 w-4" />
              <span>Foto Grande</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grade de Cards"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Grade</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {['Todas', 'Roupas', 'Calçados', 'Bolsas & Acessórios', 'Cosméticos & Perfumes', 'Semijoias', 'Casa & Decoração'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Package className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum produto encontrado neste filtro</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente alterar o filtro de estoque ou selecionar outra categoria.
          </p>
        </div>
      ) : viewMode === 'horizontal' ? (
        /* HORIZONTAL LAYOUT: LARGER PHOTO ON LEFT, DESCRIPTION & DETAILS ON RIGHT */
        <div className="space-y-6">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 border ${
                  isSoldOut 
                    ? 'border-slate-300 dark:border-slate-800 opacity-80' 
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                } rounded-3xl overflow-hidden shadow-sm transition flex flex-col md:flex-row group relative`}
              >
                {/* Large Photo Section with Photo Price Overlay */}
                <div className="relative w-full md:w-5/12 lg:w-1/2 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] bg-slate-100 dark:bg-slate-800/80 shrink-0 overflow-hidden flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        isSoldOut ? 'grayscale contrast-75' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 p-6 text-center">
                      <Package className="h-20 w-20 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Sem foto cadastrada</span>
                    </div>
                  )}

                  {/* Stock Status Badge Overlay on Photo (Top Left) */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
                    <span className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg border border-slate-700/50">
                      {prod.category}
                    </span>

                    {isSoldOut ? (
                      <span className="bg-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border border-rose-400">
                        <XCircle className="h-4 w-4" />
                        PRODUTO ESGOTADO
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-pulse border border-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        RESTAM APENAS {prod.quantity} UNID.!
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Estoque: {prod.quantity} un.
                      </span>
                    )}
                  </div>

                  {/* Full Price & Bazar Price DIRECTLY ON THE PHOTO (Bottom Right Overlay) */}
                  <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1.5 max-w-[88%]">
                    {/* Price Tag Box Overlay on Photo */}
                    <div className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-200 text-right space-y-0.5">
                      {hasDiscount && (
                        <div className="text-xs text-slate-500 font-bold">
                          Preço Cheio: <span className="line-through text-slate-400 font-medium">{formatCurrency(fullPrice)}</span>
                        </div>
                      )}
                      <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                        {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                          Desconto: {formatCurrency(discountAmount)} ({formatPercent(discountPercent)} OFF)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sold Out Dark Mask Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-4 text-center space-y-2">
                      <div className="bg-rose-600 text-white font-black text-lg sm:text-xl px-6 py-2.5 rounded-2xl shadow-2xl tracking-wide uppercase border border-rose-400">
                        🔴 PEÇA ESGOTADA
                      </div>
                      <p className="text-xs text-slate-300">Todas as unidades foram reservadas</p>
                    </div>
                  )}
                </div>

                {/* Description & Details on Right Side */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Size / Color & Category Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                        {prod.category}
                      </span>
                      {prod.sizeColor && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          📏 {prod.sizeColor}
                        </span>
                      )}
                    </div>

                    {/* Product Name & Code */}
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-snug">
                          {prod.name}
                        </h3>
                        {prod.sku && (
                          <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            Cód: {prod.sku}
                          </span>
                        )}
                      </div>
                      {prod.expirationDate && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                          📅 Validade: {prod.expirationDate}
                        </p>
                      )}
                    </div>

                    {/* Prominent Price & Discount Breakdown Box */}
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-2">
                      {hasDiscount && (
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 uppercase">Preço Cheio:</span>
                          <span className="text-sm text-slate-400 line-through font-bold">
                            {formatCurrency(fullPrice)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
                        <span className="text-xs font-bold text-slate-500 uppercase">{hasDiscount ? "Por:" : "Valor no Bazar:"}</span>
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(bazarPrice)}
                        </span>
                      </div>

                      {hasDiscount && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-white bg-rose-600 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 border border-rose-400 animate-pulse">
                            🔥 Etiqueta de Desconto: {formatPercent(discountPercent)} OFF
                          </span>
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                            💰 Economia: {formatCurrency(discountAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Description */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Descrição & Detalhes do Produto:
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {prod.description || 'Peça exclusiva do Rx do Bazar de Sucesso disponível para entrega imediata.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar - Exactly 2 options: Baixar JPG & Enviar para Cliente */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDownloadJpg(prod)}
                      className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-98"
                      title="Baixar imagem (JPG) do anúncio do produto"
                    >
                      <Download className="h-4 w-4 text-emerald-400" />
                      <span>Baixar JPG</span>
                    </button>

                    <button
                      onClick={() => {
                        setSendCustomerProduct(prod);
                        setIsSendCustomerOpen(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98"
                      title="Enviar imagem (JPG) do anúncio para um cliente"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Enviar para Cliente</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID LAYOUT (VERTICAL CARDS) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 border ${
                  isSoldOut ? 'border-slate-300 dark:border-slate-800 opacity-80' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                } rounded-3xl overflow-hidden shadow-sm transition flex flex-col justify-between`}
              >
                <div>
                  <div className="relative h-64 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-75' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <Package className="h-16 w-16" />
                      </div>
                    )}

                    {/* Stock status overlay on top left */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                      {isSoldOut ? (
                        <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md border border-rose-400">
                          🔴 ESGOTADO
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md animate-pulse">
                          ⚡ RESTAM {prod.quantity} UNID.
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
                          Estoque: {prod.quantity} un.
                        </span>
                      )}
                    </div>

                    {/* Photo Overlay with Full Price, Por & Discount Value */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10 max-w-[85%]">
                      <div className="bg-white/95 backdrop-blur-md text-slate-900 px-3 py-2 rounded-xl shadow-lg text-right border border-slate-200 space-y-0.5">
                        {hasDiscount && (
                          <div className="text-[10px] text-slate-500 font-bold">
                            Preço Cheio: <span className="line-through text-slate-400 font-medium">{formatCurrency(fullPrice)}</span>
                          </div>
                        )}
                        <div className="text-xs sm:text-sm font-black text-emerald-600">
                          {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                        </div>
                        {hasDiscount && (
                          <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Desconto: {formatCurrency(discountAmount)} ({formatPercent(discountPercent)} OFF)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category pill bottom left */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {prod.category}
                    </div>

                    {/* Sold Out Dark Overlay Mask */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-3 text-center">
                        <span className="bg-rose-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xl uppercase border border-rose-400">
                          🔴 PEÇA ESGOTADA
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                        {prod.name}
                      </h3>
                      {prod.sku && (
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                          Cód: {prod.sku}
                        </span>
                      )}
                    </div>
                    {prod.sizeColor && (
                      <p className="text-xs font-semibold text-rose-500">📏 {prod.sizeColor}</p>
                    )}
                    {prod.expirationDate && (
                      <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">📅 Val: {prod.expirationDate}</p>
                    )}

                    {/* Price breakdown & Savings */}
                    <div className="pt-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                      {hasDiscount && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 font-bold">
                            Preço Cheio: <span className="line-through font-normal">{formatCurrency(fullPrice)}</span>
                          </span>
                          <span className="text-xs font-black text-white bg-rose-600 px-2.5 py-1 rounded-lg shadow-sm border border-rose-400 animate-pulse">
                            🔥 {formatPercent(discountPercent)} OFF
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline justify-between gap-2 pt-0.5">
                        <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                          Por {formatCurrency(bazarPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            Econ. {formatCurrency(discountAmount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {prod.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions - Exactly 2 options: Baixar JPG & Enviar para Cliente */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadJpg(prod)}
                    className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
                    title="Baixar imagem JPG do anúncio"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Baixar JPG</span>
                  </button>

                  <button
                    onClick={() => {
                      setSendCustomerProduct(prod);
                      setIsSendCustomerOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98"
                    title="Enviar imagem JPG do anúncio para cliente"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Enviar para Cliente</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Export Full Catalog Modal */}
      <ExportCatalogModal
        isOpen={isExportCatalogOpen}
        onClose={() => setIsExportCatalogOpen(false)}
        products={products}
      />

      {/* Send to Customer X Modal */}
      <SendToCustomerModal
        isOpen={isSendCustomerOpen}
        onClose={() => setIsSendCustomerOpen(false)}
        product={sendCustomerProduct}
        sales={sales}
      />

    </div>
  );
};
