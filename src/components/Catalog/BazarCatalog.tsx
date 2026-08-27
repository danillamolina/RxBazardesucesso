import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Package, 
  Sparkles, 
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
  X,
  Layers,
  ArrowUpDown,
  Settings2,
  CheckSquare,
  Square,
  Send,
  SlidersHorizontal,
  Share2
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { Product } from '../../types';
import { shareProductJpgWhatsApp, downloadProductJpg } from '../../utils/productJpgGenerator';
import { ExportCatalogModal } from './ExportCatalogModal';
import { SendToCustomerModal } from './SendToCustomerModal';
import { CategoryManagementModal } from './CategoryManagementModal';

export const BazarCatalog: React.FC = () => {
  const { products, sales, categories } = useBazar();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [stockFilter, setStockFilter] = useState<'todos' | 'disponiveis' | 'pouco_estoque' | 'esgotados'>('todos');
  
  // Sort State: 'categoria_sub' is the default for category/subcategory organization
  const [sortBy, setSortBy] = useState<
    'categoria_sub' | 'nome_asc' | 'desconto_desc' | 'desconto_perc' | 'preco_asc' | 'preco_desc' | 'estoque_desc'
  >('categoria_sub');

  // View & UI State
  const [viewMode, setViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [isExportCatalogOpen, setIsExportCatalogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sendCustomerProduct, setSendCustomerProduct] = useState<Product | null>(null);
  const [isSendCustomerOpen, setIsSendCustomerOpen] = useState(false);

  // Selected Products for WhatsApp Catalog Export
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  // All catalog eligible products
  const catalogProducts = useMemo(() => {
    return products.filter((p) => p.showInCatalog !== false);
  }, [products]);

  // Counts for live stock summary
  const inStockCount = catalogProducts.filter((p) => p.quantity > 0).length;
  const lowStockCount = catalogProducts.filter((p) => p.quantity > 0 && p.quantity <= 3).length;
  const soldOutCount = catalogProducts.filter((p) => p.quantity === 0).length;

  // Subcategories available for selected category
  const activeCategoryObj = categories.find((c) => c.name === selectedCategory);
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = [...catalogProducts];

    // Filter by category
    if (selectedCategory !== 'Todas') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'Todas' && selectedCategory !== 'Todas') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Filter by stock status
    if (stockFilter === 'disponiveis') {
      list = list.filter((p) => p.quantity > 0);
    } else if (stockFilter === 'pouco_estoque') {
      list = list.filter((p) => p.quantity > 0 && p.quantity <= 3);
    } else if (stockFilter === 'esgotados') {
      list = list.filter((p) => p.quantity === 0);
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.sizeColor && p.sizeColor.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      );
    }

    // Sort products
    list.sort((a, b) => {
      if (sortBy === 'categoria_sub') {
        const catCompare = (a.category || '').localeCompare(b.category || '', 'pt-BR');
        if (catCompare !== 0) return catCompare;
        const subCompare = (a.subcategory || '').localeCompare(b.subcategory || '', 'pt-BR');
        if (subCompare !== 0) return subCompare;
        return a.name.localeCompare(b.name, 'pt-BR');
      }

      if (sortBy === 'nome_asc') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }

      const detailsA = getProductPriceDetails(a);
      const detailsB = getProductPriceDetails(b);

      if (sortBy === 'desconto_desc') {
        return detailsB.discountAmount - detailsA.discountAmount;
      }
      if (sortBy === 'desconto_perc') {
        return detailsB.discountPercent - detailsA.discountPercent;
      }
      if (sortBy === 'preco_asc') {
        return detailsA.bazarPrice - detailsB.bazarPrice;
      }
      if (sortBy === 'preco_desc') {
        return detailsB.bazarPrice - detailsA.bazarPrice;
      }
      if (sortBy === 'estoque_desc') {
        return b.quantity - a.quantity;
      }

      return 0;
    });

    return list;
  }, [catalogProducts, selectedCategory, selectedSubcategory, stockFilter, searchTerm, sortBy]);

  // Selection handlers
  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleOpenExportWithSelection = () => {
    setIsExportCatalogOpen(true);
  };

  const handleDownloadJpg = async (prod: Product) => {
    try {
      await downloadProductJpg(prod);
    } catch (err) {
      console.error('Erro ao baixar imagem JPG:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner - Clean Light Theme */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50/80 to-purple-50/80 border border-rose-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold mb-1.5 shadow-xs">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Vitrine do Rx do Bazar de Sucesso
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Catálogo Online & Vitrine de Produtos
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Organize por categorias e subcategorias, selecione os produtos e envie catálogos elegantes diretamente para o WhatsApp!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Manage Categories Button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            title="Criar e gerenciar categorias e subcategorias"
          >
            <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500" />
            <span>Gerenciar Categorias</span>
          </button>

          {/* Export Catalog Button */}
          <button
            onClick={() => {
              setIsExportCatalogOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Exportar para WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Real-time Status, Search, Categories, Subcategories and Sorting Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        
        {/* Real-time sync message & stock status pills */}
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

        {/* Search & Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-7 lg:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, código SKU, categoria, subcategoria ou detalhes..."
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

          {/* Sort Selector */}
          <div className="md:col-span-5 lg:col-span-4 flex items-center gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
              >
                <option value="categoria_sub">📁 Por Categoria & Subcategoria (A-Z)</option>
                <option value="nome_asc">🔤 Nome do Produto (A-Z)</option>
                <option value="desconto_desc">💰 Maior Desconto em R$</option>
                <option value="desconto_perc">🔥 Maior % de Desconto (OFF)</option>
                <option value="preco_asc">🏷️ Menor Preço Bazar</option>
                <option value="preco_desc">💎 Maior Preço Bazar</option>
                <option value="estoque_desc">📦 Maior Quantidade em Estoque</option>
              </select>
            </div>
          </div>

        </div>

        {/* Categories Horizontal Pills Bar */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-rose-500" />
              Categorias:
            </span>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              + Adicionar / Editar Categorias
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory('Todas');
                setSelectedSubcategory('Todas');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                selectedCategory === 'Todas'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Todas ({catalogProducts.length})
            </button>

            {categories.map((cat) => {
              const count = catalogProducts.filter((p) => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory('Todas');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Secondary Pills Bar (Shown when a category with subcategories is selected) */}
        {selectedCategory !== 'Todas' && availableSubcategories.length > 0 && (
          <div className="bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layers className="h-3 w-3 text-rose-500" />
              <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Subcategorias de {selectedCategory}:
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedSubcategory('Todas')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  selectedSubcategory === 'Todas'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Todas as Subcategorias
              </button>

              {availableSubcategories.map((sub) => {
                const count = catalogProducts.filter(
                  (p) => p.category === selectedCategory && p.subcategory === sub
                ).length;

                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                      selectedSubcategory === sub
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub}</span>
                    <span className="text-[9.5px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Filter Buttons & View Mode Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          
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
              <span>Todos</span>
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
              <span>⚡ Poucas Unid.</span>
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
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
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
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grade de Cards"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Grade</span>
            </button>
          </div>
        </div>

      </div>

      {/* Multi-Selection Sticky Quick Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSelectAllVisible}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            <CheckSquare className="h-4 w-4 text-rose-500" />
            <span>Selecionar Visíveis ({filteredProducts.length})</span>
          </button>

          {selectedProductIds.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 px-2 py-1 transition"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar Seleção</span>
            </button>
          )}

          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
            {selectedProductIds.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                {selectedProductIds.length} produto{selectedProductIds.length > 1 ? 's' : ''} selecionado{selectedProductIds.length > 1 ? 's' : ''} para envio
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Clique na caixinha de cada produto para escolher o que enviar no WhatsApp
              </span>
            )}
          </div>
        </div>

        {selectedProductIds.length > 0 && (
          <button
            onClick={handleOpenExportWithSelection}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span>Enviar Selecionados ({selectedProductIds.length}) para WhatsApp</span>
          </button>
        )}
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
              : 'Tente alterar o filtro de estoque ou selecionar outra categoria/subcategoria.'}
          </p>
          {(searchTerm || selectedCategory !== 'Todas') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todas');
                setSelectedSubcategory('Todas');
              }}
              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm mt-2"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar Filtros e Busca</span>
            </button>
          )}
        </div>
      ) : viewMode === 'horizontal' ? (
        /* HORIZONTAL LAYOUT: 2 COLUMNS ON DESKTOP */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;
            const isSelected = selectedProductIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                  isSelected
                    ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                    : isSoldOut 
                    ? 'border-slate-200 dark:border-slate-800 opacity-80' 
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col sm:flex-row group relative`}
              >
                {/* Photo Section with Selection Checkbox Overlay */}
                <div className="relative w-full sm:w-5/12 h-48 sm:h-auto min-h-[180px] bg-slate-50 dark:bg-slate-800/80 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                  
                  {/* Selection Checkbox Overlay (Top Left) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProductSelection(prod.id);
                    }}
                    className="absolute top-2.5 left-2.5 z-30 cursor-pointer p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                    title={isSelected ? 'Desmarcar do catálogo' : 'Incluir no catálogo'}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProductSelection(prod.id)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 pointer-events-none"
                    />
                  </div>

                  {/* Photo with Perfect Framing */}
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className={`w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ${
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

                  {/* Stock Status Badge Overlay */}
                  <div className="absolute top-2.5 left-10 z-20 flex flex-col gap-1 items-start">
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

                  {/* Price Overlay on Photo */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-0.5 max-w-[75%]">
                    <div className="bg-white/95 backdrop-blur-md text-slate-900 px-2 py-1 rounded-lg shadow-md border border-slate-200 text-right space-y-0.5">
                      {hasDiscount && (
                        <div className="text-[8.5px] text-slate-500 font-bold leading-tight">
                          De: <span className="line-through text-slate-400 font-medium">{formatCurrency(fullPrice)}</span>
                        </div>
                      )}
                      <div className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight leading-none">
                        {hasDiscount ? `Por ${formatCurrency(bazarPrice)}` : formatCurrency(bazarPrice)}
                      </div>
                      {hasDiscount && (
                        <div className="text-[8px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                          {formatPercent(discountPercent)} de desconto
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category & Subcategory Pill Bottom Left */}
                  <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1 flex-wrap max-w-[90%]">
                    <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
                      {prod.category}
                    </span>
                    {prod.subcategory && (
                      <span className="bg-rose-50/95 backdrop-blur-md text-rose-700 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-rose-200">
                        {prod.subcategory}
                      </span>
                    )}
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

                {/* Details Section */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900">
                  <div className="space-y-1.5">
                    {/* Header Row */}
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

                    {/* Offer Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
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

                        {hasDiscount && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-black text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs">
                              🔥 {formatPercent(discountPercent)} de desconto
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              Economia: {formatCurrency(discountAmount)}
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

                  {/* Actions Bar */}
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
        /* GRID LAYOUT (VERTICAL CARDS): 4 COLUMNS ON DESKTOP */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {filteredProducts.map((prod) => {
            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
            const isSoldOut = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;
            const isSelected = selectedProductIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                  isSelected
                    ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                    : isSoldOut 
                    ? 'border-slate-200 dark:border-slate-800 opacity-80' 
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col justify-between group`}
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-44 sm:h-48 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                    
                    {/* Selection Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProductSelection(prod.id);
                      }}
                      className="absolute top-2 left-2 z-20 cursor-pointer p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(prod.id)}
                        className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300 pointer-events-none"
                      />
                    </div>

                    {/* Photo with Perfect Framing */}
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className={`w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ${
                          isSoldOut ? 'grayscale contrast-75' : ''
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="h-10 w-10 opacity-40" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-2 left-9 z-10 flex flex-col gap-1 items-start">
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

                    {/* Price Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 z-10 max-w-[75%]">
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

                    {/* Category pill */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[8.5px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
                        {prod.category}
                      </span>
                      {prod.subcategory && (
                        <span className="bg-rose-50/95 backdrop-blur-md text-rose-700 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-rose-200">
                          {prod.subcategory}
                        </span>
                      )}
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

                  {/* Content */}
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

                {/* Actions */}
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

      {/* Export Full/Selective Catalog Modal */}
      <ExportCatalogModal
        isOpen={isExportCatalogOpen}
        onClose={() => setIsExportCatalogOpen(false)}
        products={products}
        initialSelectedProductIds={selectedProductIds}
      />

      {/* Send to Customer Modal */}
      <SendToCustomerModal
        isOpen={isSendCustomerOpen}
        onClose={() => setIsSendCustomerOpen(false)}
        product={sendCustomerProduct}
        sales={sales}
      />

      {/* Category & Subcategory Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

    </div>
  );
};
