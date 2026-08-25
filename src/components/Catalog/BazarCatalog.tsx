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
  UserCheck,
  Search,
  X
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { Product, ProductCategory } from '../../types';
import { shareProductJpgWhatsApp, downloadProductJpg } from '../../utils/productJpgGenerator';
import { ExportCatalogModal } from './ExportCatalogModal';
import { SendToCustomerModal } from './SendToCustomerModal';

export const BazarCatalog: React.FC = () => {
  const { products, sales } = useBazar();
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  // Filter by search term (by product name, SKU/code, description or size/color)
  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase().trim();
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.sizeColor && p.sizeColor.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
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
      <div className="bg-gradient-to-r from-rose-50 via-pink-50/70 to-purple-50/80 border border-rose-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold mb-1.5 shadow-xs">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Vitrine do Rx do Bazar de Sucesso
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Catálogo Online & Vitrine de Produtos
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Preços cheios, valores de bazar e descontos destacados diretamente na foto do produto! O catálogo se atualiza em tempo real conforme as peças são vendidas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsExportCatalogOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Gerar PDF / Imprimir</span>
          </button>

          <button
            onClick={() => setIsExportCatalogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

        {/* Search Bar by Product Name / Code */}
        <div className="pt-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar produto por nome, código ou detalhes na vitrine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5 px-1">
              <span>
                Filtrando por: <strong className="text-rose-600 dark:text-rose-400">"{searchTerm}"</strong> ({filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''})
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
              >
                Limpar filtro
              </button>
            </div>
          )}
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
            {searchTerm ? `Nenhum produto encontrado com o termo "${searchTerm}"` : 'Nenhum produto encontrado neste filtro'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm 
              ? 'Tente buscar por outro nome ou código, ou limpe a busca.' 
              : 'Tente alterar o filtro de estoque ou selecionar outra categoria.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm mt-2"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar Busca de Produtos</span>
            </button>
          )}
        </div>
      ) : viewMode === 'horizontal' ? (
        /* HORIZONTAL LAYOUT: COMPACT & ELEGANT ON BOTH MOBILE AND DESKTOP PC (2 COLUMNS ON DESKTOP) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                  isSoldOut 
                    ? 'border-slate-200 dark:border-slate-800 opacity-80' 
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col sm:flex-row group relative`}
              >
                {/* Photo Section */}
                <div className="relative w-full sm:w-5/12 h-44 sm:h-auto min-h-[170px] bg-slate-50 dark:bg-slate-800/80 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className={`w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500 ${
                        isSoldOut ? 'grayscale contrast-75' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Package className="h-10 w-10 mb-1 opacity-40" />
                      <span className="text-[10px] font-semibold">Sem foto cadastrada</span>
                    </div>
                  )}

                  {/* Stock Status Badge Overlay on Photo (Top Left) */}
                  <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
                    {isSoldOut ? (
                      <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-rose-400">
                        <XCircle className="h-3 w-3" />
                        ESGOTADO
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 animate-pulse border border-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        RESTAM {prod.quantity} UNID.
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Estoque: {prod.quantity}
                      </span>
                    )}
                  </div>

                  {/* Top Right Floating White Price Card Overlay on Photo */}
                  <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-0.5 max-w-[80%]">
                    <div className="bg-white/95 backdrop-blur-md text-slate-900 px-2 py-1 rounded-lg shadow-md border border-slate-200 text-right space-y-0.5">
                      {hasDiscount && (
                        <div className="text-[8px] sm:text-[9px] text-slate-500 font-bold leading-tight">
                          De: <span className="line-through text-slate-400 font-medium">{formatCurrency(fullPrice)}</span>
                        </div>
                      )}
                      <div className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight leading-none">
                        {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                      </div>
                      {hasDiscount && (
                        <div className="text-[7.5px] sm:text-[8.5px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                          {formatPercent(discountPercent)} de desconto
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Pill Bottom Left of Photo */}
                  <div className="absolute bottom-2 left-2 z-20">
                    <span className="bg-white/95 backdrop-blur-md text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                      {prod.category}
                    </span>
                  </div>

                  {/* Sold Out Dark Mask Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-2 text-center">
                      <div className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-xl uppercase border border-rose-400">
                        🔴 ESGOTADO
                      </div>
                    </div>
                  )}
                </div>

                {/* Description & Offer Details Container */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900">
                  <div className="space-y-1.5">
                    {/* Header Row: Product Title & SKU */}
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1">
                        {prod.name}
                      </h3>
                      {prod.sku && (
                        <span className="text-[9px] font-black bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-slate-700 shrink-0">
                          Cód: {prod.sku}
                        </span>
                      )}
                    </div>

                    {/* Attribute / Size */}
                    {prod.sizeColor && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        📏 {prod.sizeColor}
                      </p>
                    )}

                    {prod.expirationDate && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        📅 Validade: {prod.expirationDate}
                      </p>
                    )}

                    {/* Offer Box (Light Rose/Slate Box with De/Por on Left, % and Economia on Right) */}
                    <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        {/* Left: De / Por */}
                        <div>
                          {hasDiscount && (
                            <div className="text-[10px] font-medium text-slate-500">
                              De: <span className="line-through">{formatCurrency(fullPrice)}</span>
                            </div>
                          )}
                          <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                            {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                          </div>
                        </div>

                        {/* Right: Badges */}
                        {hasDiscount && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-black text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs">
                              🔥 {formatPercent(discountPercent)} de desconto
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              Economia. {formatCurrency(discountAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    {prod.description && (
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar - 2 compact buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleDownloadJpg(prod)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-extrabold text-[11px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-98"
                      title="Baixar imagem JPG do anúncio"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">Baixar JPG</span>
                    </button>

                    <button
                      onClick={() => {
                        setSendCustomerProduct(prod);
                        setIsSendCustomerOpen(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 shadow-xs active:scale-98"
                      title="Enviar anúncio para cliente"
                    >
                      <UserCheck className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Enviar Cliente</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID LAYOUT (VERTICAL CARDS) - 4 COMPACT COLUMNS ON DESKTOP PC (sm:2, md:3, lg:4) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                  isSoldOut ? 'border-slate-200 dark:border-slate-800 opacity-80' : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col justify-between group`}
              >
                <div>
                  {/* Photo Container - Compact height on PC */}
                  <div className="relative h-44 sm:h-48 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className={`w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500 ${
                          isSoldOut ? 'grayscale contrast-75' : ''
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="h-10 w-10 opacity-40" />
                      </div>
                    )}

                    {/* Stock status overlay on top left */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                      {isSoldOut ? (
                        <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md border border-rose-400">
                          🔴 ESGOTADO
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-md animate-pulse">
                          ⚡ RESTAM {prod.quantity} UNID.
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-md">
                          Estoque: {prod.quantity} un.
                        </span>
                      )}
                    </div>

                    {/* Top Right Floating White Price Card Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 z-10 max-w-[80%]">
                      <div className="bg-white/95 backdrop-blur-md text-slate-900 px-2 py-1 rounded-lg shadow-md text-right border border-slate-200 space-y-0.5">
                        {hasDiscount && (
                          <div className="text-[8px] text-slate-500 font-bold leading-tight">
                            De: <span className="line-through text-slate-400 font-medium">{formatCurrency(fullPrice)}</span>
                          </div>
                        )}
                        <div className="text-xs font-black text-emerald-600 leading-none">
                          {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                        </div>
                        {hasDiscount && (
                          <div className="text-[7.5px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                            {formatPercent(discountPercent)} de desconto
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category pill bottom left */}
                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md text-slate-700 text-[8.5px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-slate-200">
                      {prod.category}
                    </div>

                    {/* Sold Out Dark Overlay Mask */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-2 text-center">
                        <span className="bg-rose-600 text-white font-black text-[11px] px-3 py-1 rounded-lg shadow-xl uppercase border border-rose-400">
                          🔴 ESGOTADO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                        {prod.name}
                      </h3>
                      {prod.sku && (
                        <span className="text-[8.5px] font-black bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-slate-700 shrink-0">
                          Cód: {prod.sku}
                        </span>
                      )}
                    </div>

                    {prod.sizeColor && (
                      <p className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        📏 {prod.sizeColor}
                      </p>
                    )}

                    {prod.expirationDate && (
                      <p className="text-[9.5px] font-medium text-amber-600 dark:text-amber-400">
                        📅 Val: {prod.expirationDate}
                      </p>
                    )}

                    {/* Offer breakdown Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        {/* Left: De / Por */}
                        <div>
                          {hasDiscount && (
                            <div className="text-[9px] text-slate-500 font-medium">
                              De: <span className="line-through">{formatCurrency(fullPrice)}</span>
                            </div>
                          )}
                          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                            {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                          </div>
                        </div>

                        {/* Right: Badges */}
                        {hasDiscount && (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[8px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-xs">
                              🔥 {formatPercent(discountPercent)} OFF
                            </span>
                            <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              Econ. {formatCurrency(discountAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions - 2 buttons */}
                <div className="p-2 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleDownloadJpg(prod)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-extrabold text-[10.5px] py-1.5 px-1.5 rounded-lg transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-98"
                    title="Baixar imagem JPG do anúncio"
                  >
                    <Download className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Baixar JPG</span>
                  </button>

                  <button
                    onClick={() => {
                      setSendCustomerProduct(prod);
                      setIsSendCustomerOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10.5px] py-1.5 px-1.5 rounded-lg transition flex items-center justify-center gap-1 shadow-xs active:scale-98"
                    title="Enviar anúncio para cliente"
                  >
                    <UserCheck className="h-3 w-3 shrink-0" />
                    <span className="truncate">Enviar Cliente</span>
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
