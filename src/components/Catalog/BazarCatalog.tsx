import React, { useState, useMemo, useEffect } from 'react';
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
  Share2,
  Camera,
  ShoppingBag,
  Store,
  Plus,
  Minus,
  ArrowRight,
  Instagram,
  FileDown
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { Product } from '../../types';
import { 
  shareProductJpgWhatsApp, 
  downloadProductJpg, 
  downloadMultipleProductsIndividualJpgs,
  downloadProductOriginalPhoto,
  downloadMultipleOriginalPhotosZip
} from '../../utils/productJpgGenerator';
import { ExportCatalogModal } from './ExportCatalogModal';
import { SendToCustomerModal } from './SendToCustomerModal';
import { CategoryManagementModal } from './CategoryManagementModal';
import { PhotoOptionsModal } from './PhotoOptionsModal';
import { OnlineStoreCartModal, CartItem } from './OnlineStoreCartModal';

export interface BazarCatalogProps {
  onOpenCustomerStoreView?: () => void;
}

export const BazarCatalog: React.FC<BazarCatalogProps> = ({ onOpenCustomerStoreView }) => {
  const { products, sales, categories, storeInfo } = useBazar();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [stockFilter, setStockFilter] = useState<'todos' | 'disponiveis' | 'pouco_estoque' | 'esgotados'>('todos');
  
  // Sort State
  const [sortBy, setSortBy] = useState<
    'categoria_sub' | 'nome_asc' | 'desconto_desc' | 'desconto_perc' | 'preco_asc' | 'preco_desc' | 'estoque_desc'
  >('categoria_sub');

  // View & UI State: default to classified grid by category & subcategory
  const [viewMode, setViewMode] = useState<'grid' | 'horizontal'>('grid');
  const [storeMode, setStoreMode] = useState<'store' | 'manager'>('store'); // 'store' = Loja Online, 'manager' = Painel Gestão
  const [isExportCatalogOpen, setIsExportCatalogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sendCustomerProduct, setSendCustomerProduct] = useState<Product | null>(null);
  const [isSendCustomerOpen, setIsSendCustomerOpen] = useState(false);

  // Online Store Cart & Photo Options State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bazar_online_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [photoModalProduct, setPhotoModalProduct] = useState<Product | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazar_online_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.quantity;
          return { ...item, quantity: Math.min(newQty, max) };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalCartValue = useMemo(() => cart.reduce((sum, item) => sum + (item.product.bazarPrice * item.quantity), 0), [cart]);

  // Selected Products for WhatsApp Vitrine Export
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // All vitrine eligible products
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

  // Group filtered products hierarchically by Category and Subcategory
  const groupedCategories = useMemo(() => {
    const map = new Map<string, Map<string, Product[]>>();

    filteredProducts.forEach((prod) => {
      const cat = prod.category?.trim() || 'Geral / Outros';
      const sub = prod.subcategory?.trim() || 'Produtos Diversos';

      if (!map.has(cat)) {
        map.set(cat, new Map<string, Product[]>());
      }
      const subMap = map.get(cat)!;
      if (!subMap.has(sub)) {
        subMap.set(sub, []);
      }
      subMap.get(sub)!.push(prod);
    });

    const result: Array<{
      categoryName: string;
      totalProducts: number;
      inStockCount: number;
      subcategories: Array<{
        subcategoryName: string;
        products: Product[];
      }>;
    }> = [];

    map.forEach((subMap, categoryName) => {
      const subcategories: Array<{ subcategoryName: string; products: Product[] }> = [];
      let totalCount = 0;
      let inStock = 0;

      subMap.forEach((prods, subcategoryName) => {
        totalCount += prods.length;
        inStock += prods.filter((p) => p.quantity > 0).length;
        subcategories.push({
          subcategoryName,
          products: prods,
        });
      });

      result.push({
        categoryName,
        totalProducts: totalCount,
        inStockCount: inStock,
        subcategories,
      });
    });

    return result;
  }, [filteredProducts]);

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

  const handleSelectCategoryProducts = (categoryName: string) => {
    const catProductIds = filteredProducts
      .filter((p) => (p.category?.trim() || 'Geral / Outros') === categoryName)
      .map((p) => p.id);
    
    const allSelected = catProductIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !catProductIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...catProductIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleOpenExportWithSelection = () => {
    setIsExportCatalogOpen(true);
  };

  const [isSavingToGallery, setIsSavingToGallery] = useState(false);
  const [isDownloadingOriginalsZip, setIsDownloadingOriginalsZip] = useState(false);

  const handleSaveSelectedToGallery = async () => {
    const selected = catalogProducts.filter((p) => selectedProductIds.includes(p.id));
    if (selected.length === 0) return;
    setIsSavingToGallery(true);
    try {
      await downloadMultipleProductsIndividualJpgs(selected);
    } catch (err) {
      console.error('Erro ao salvar fotos editadas na galeria:', err);
    } finally {
      setIsSavingToGallery(false);
    }
  };

  const handleDownloadSelectedOriginalsZip = async () => {
    const selected = catalogProducts.filter((p) => selectedProductIds.includes(p.id));
    if (selected.length === 0) return;
    setIsDownloadingOriginalsZip(true);
    try {
      await downloadMultipleOriginalPhotosZip(selected);
    } catch (err) {
      console.error('Erro ao baixar fotos originais em zip:', err);
    } finally {
      setIsDownloadingOriginalsZip(false);
    }
  };

  const handleDownloadJpg = async (prod: Product) => {
    try {
      await downloadProductJpg(prod);
    } catch (err) {
      console.error('Erro ao salvar foto editada na galeria:', err);
    }
  };

  const handleOpenSendCustomerPhoto = (prod: Product) => {
    setSendCustomerProduct(prod);
    setIsSendCustomerOpen(true);
  };

  const handleOpenPhotoOptions = (prod: Product) => {
    setPhotoModalProduct(prod);
    setIsPhotoModalOpen(true);
  };

  const handleShareProductPhotoAndText = async (prod: Product) => {
    try {
      await shareProductJpgWhatsApp(prod, 'standard', undefined, undefined, true);
    } catch (err) {
      console.error('Erro ao compartilhar foto e texto no WhatsApp:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20 notranslate" translate="no">
      
      {/* Header Banner - Clean Light Theme with Mode Switcher & Cart */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50/80 to-purple-50/80 border border-rose-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold shadow-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Vitrine & Loja Online do Bazar
            </div>

            {/* Mode Switcher Pills */}
            <div className="bg-white/80 dark:bg-slate-800/80 p-0.5 rounded-xl border border-rose-200/60 dark:border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => setStoreMode('store')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                  storeMode === 'store'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Modo Loja Online</span>
              </button>
              <button
                type="button"
                onClick={() => setStoreMode('manager')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                  storeMode === 'manager'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Modo Gestão</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            {storeMode === 'store' ? 'Loja Online do Bazar' : 'Vitrine de Produtos & Gestão de Fotos'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            {storeMode === 'store'
              ? 'Selecione as peças na sacola para fechar pedidos com os clientes, baixe fotos com preços ou envie direto no WhatsApp.'
              : 'Fotos de alta qualidade organizadas por seções. Baixe a foto limpa ou editada com preços e descontos ou envie aos clientes.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-white hover:bg-slate-50 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-rose-300 dark:border-rose-900 font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-sm flex items-center gap-2 transition active:scale-95 group"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-rose-600 group-hover:scale-110 transition" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span>Sacola da Loja</span>
            {totalCartValue > 0 && (
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-black px-2 py-0.5 rounded-lg">
                {formatCurrency(totalCartValue)}
              </span>
            )}
          </button>

          {/* Manage Categories Button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            title="Criar e gerenciar categorias e subcategorias"
          >
            <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500" />
            <span className="hidden sm:inline">Categorias</span>
          </button>

          {/* Export Vitrine to WhatsApp Button */}
          <button
            onClick={() => {
              setIsExportCatalogOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Exportar no WhatsApp</span>
          </button>

          {/* View as Customer Store Button */}
          {onOpenCustomerStoreView && (
            <button
              type="button"
              onClick={onOpenCustomerStoreView}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
              title="Ver e testar a Loja Online com Sacola exatamente como o cliente vê pelo WhatsApp"
            >
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Ver como</span> Cliente
            </button>
          )}
        </div>
      </div>

      {/* Mobile Special Banner: Loja Online com Sacola para Clientes */}
      {onOpenCustomerStoreView && (
        <div className="sm:hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-xs text-emerald-950 dark:text-emerald-100 truncate">
                  Loja Online com Sacola
                </h4>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
                  Cliente
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium truncate">
                O cliente escolhe e te envia o pedido no WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCustomerStoreView}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Abrir</span>
          </button>
        </div>
      )}

      {/* Boutique Store Profile Header in Online Store Mode */}
      {storeMode === 'store' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-500/30 shrink-0">
              <Store className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {storeInfo.name || 'Rx do Bazar de Sucesso'}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  🟢 Loja Online Aberta
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Navegue pelas peças, adicione à sacola e finalize o pedido no WhatsApp ou baixe as fotos dos produtos!
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                {storeInfo.whatsapp && (
                  <a
                    href={`https://wa.me/55${storeInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp da Loja</span>
                  </a>
                )}
                {storeInfo.instagram && (
                  <a
                    href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>{storeInfo.instagram}</span>
                  </a>
                )}
                {storeInfo.pixKey && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    🔑 PIX: {storeInfo.pixKey}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Ver Minha Sacola ({totalCartItems})</span>
            {totalCartValue > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">
                {formatCurrency(totalCartValue)}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Real-time Status, Search, Categories, Subcategories and Sorting Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        
        {/* Real-time sync message & stock status pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span>Vitrine Classificada em Tempo Real</span>
            <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Sincronizada automaticamente com seu estoque e vendas)</span>
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

        {/* Categories Horizontal Filter Pills Bar */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-rose-500" />
              Filtrar por Categoria:
            </span>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              + Gerenciar Categorias
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
              Todas as Categorias ({catalogProducts.length})
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap flex items-center gap-1.5 notranslate ${
                    selectedCategory === cat.name
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  translate="no"
                >
                  <span className="notranslate" translate="no">{cat.name}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Secondary Pills Bar */}
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 notranslate ${
                      selectedSubcategory === sub
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                    translate="no"
                  >
                    <span className="notranslate" translate="no">{sub}</span>
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
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grade de Cards por Categoria"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Grade de Fotos</span>
            </button>

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
                {selectedProductIds.length} foto{selectedProductIds.length > 1 ? 's' : ''} selecionada{selectedProductIds.length > 1 ? 's' : ''} para envio
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Selecione as fotos para baixar ou enviar no WhatsApp em lote
              </span>
            )}
          </div>
        </div>

        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Download edited cards */}
            <button
              onClick={handleSaveSelectedToGallery}
              disabled={isSavingToGallery}
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              title="Baixar cards com preços dos produtos selecionados"
            >
              <Download className="h-4 w-4 text-rose-500" />
              <span>{isSavingToGallery ? 'Baixando...' : `Cards com Preço (${selectedProductIds.length})`}</span>
            </button>

            {/* Download clean original photos ZIP */}
            <button
              onClick={handleDownloadSelectedOriginalsZip}
              disabled={isDownloadingOriginalsZip}
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              title="Baixar fotos originais limpas (sem preços) em arquivo ZIP"
            >
              <FileDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span>{isDownloadingOriginalsZip ? 'Compactando...' : `Fotos Originais (.ZIP)`}</span>
            </button>

            {/* Send to WhatsApp */}
            <button
              onClick={handleOpenExportWithSelection}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Enviar no WhatsApp ({selectedProductIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* CLASSIFIED VITRINE DISPLAY: Grouped by Category and Subcategory */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
            {searchTerm ? `Nenhuma foto encontrada com o termo "${searchTerm}"` : 'Nenhum produto cadastrado nesta categoria/filtro'}
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
      ) : (
        <div className="space-y-8 sm:space-y-10 pb-20 sm:pb-8">
          {groupedCategories.map((group) => {
            const allCatIds = group.subcategories.flatMap((s) => s.products.map((p) => p.id));
            const isCatAllSelected = allCatIds.length > 0 && allCatIds.every((id) => selectedProductIds.includes(id));

            return (
              <div
                key={group.categoryName}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-5 sm:space-y-6"
              >
                {/* Category Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 font-black text-base sm:text-lg shrink-0">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 notranslate" translate="no">
                        <span>{group.categoryName}</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        {group.totalProducts} item{group.totalProducts > 1 ? 's' : ''} • {group.inStockCount} em estoque
                      </p>
                    </div>
                  </div>

                  {/* Category Quick Select Button */}
                  <button
                    onClick={() => handleSelectCategoryProducts(group.categoryName)}
                    className={`inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-2 sm:py-1.5 rounded-xl border transition ${
                      isCatAllSelected
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <CheckSquare className={`h-3.5 w-3.5 ${isCatAllSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>{isCatAllSelected ? 'Desmarcar Categoria' : `Selecionar ${group.categoryName}`}</span>
                  </button>
                </div>

                {/* Subcategories Blocks */}
                <div className="space-y-5 sm:space-y-6">
                  {group.subcategories.map((subGroup) => (
                    <div key={subGroup.subcategoryName} className="space-y-3">
                      
                      {/* Subcategory Label & Divider */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-extrabold border border-slate-200 dark:border-slate-700 notranslate" translate="no">
                          <Layers className="h-3 w-3 text-rose-500 shrink-0" />
                          <span>{subGroup.subcategoryName}</span>
                          <span className="text-[10px] text-slate-400 font-bold ml-0.5">({subGroup.products.length})</span>
                        </span>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                      </div>

                      {/* Products Grid or Horizontal inside Subcategory */}
                      {viewMode === 'horizontal' ? (
                        /* HORIZONTAL LARGE PHOTO CARDS */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                          {subGroup.products.map((prod) => {
                            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
                            const isSoldOut = prod.quantity === 0;
                            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;
                            const isSelected = selectedProductIds.includes(prod.id);
                            const cartItem = cart.find((item) => item.product.id === prod.id);

                            return (
                              <div
                                key={prod.id}
                                translate="no"
                                className={`notranslate bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                                  isSelected
                                    ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                                    : isSoldOut 
                                    ? 'border-slate-200 dark:border-slate-800 opacity-80' 
                                    : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col sm:flex-row group relative`}
                              >
                                {/* Photo Section */}
                                <div 
                                  onClick={() => handleOpenPhotoOptions(prod)}
                                  className="relative w-full sm:w-5/12 h-52 sm:h-auto min-h-[190px] bg-slate-50 dark:bg-slate-800/80 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer group/photo"
                                  title="Clique para ver a foto, baixar ou enviar"
                                >
                                  
                                  {/* Selection Checkbox Overlay */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProductSelection(prod.id);
                                    }}
                                    className="absolute top-2.5 left-2.5 z-30 cursor-pointer p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                                    title={isSelected ? 'Desmarcar foto' : 'Incluir foto'}
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
                                      className={`w-full h-full object-contain p-2 group-hover/photo:scale-105 transition-transform duration-500 ${
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
                                  <div className="absolute top-2.5 left-11 z-20 flex flex-col gap-1 items-start">
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

                                  {/* Category & Subcategory Pill */}
                                  <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1 flex-wrap max-w-[90%] notranslate" translate="no">
                                    <span className="notranslate bg-white/95 backdrop-blur-md text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200" translate="no">
                                      {prod.category}
                                    </span>
                                    {prod.subcategory && (
                                      <span className="notranslate bg-rose-50/95 backdrop-blur-md text-rose-700 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-rose-200" translate="no">
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
                                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900 notranslate" translate="no">
                                  <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-1.5">
                                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 notranslate" translate="no">
                                        {prod.name}
                                      </h3>
                                      {prod.sku && (
                                        <span className="text-[9px] font-black bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-slate-700 shrink-0 notranslate" translate="no">
                                          Cód: {prod.sku}
                                        </span>
                                      )}
                                    </div>

                                    {prod.sizeColor && (
                                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 notranslate" translate="no">
                                        📏 {prod.sizeColor}
                                      </p>
                                    )}

                                    {prod.expirationDate && (
                                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium notranslate" translate="no">
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

                                    {prod.description && (
                                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug notranslate" translate="no">
                                        {prod.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Online Store Cart & Photo Actions */}
                                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {/* Cart Button or Counter */}
                                    {isSoldOut ? (
                                      <div className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl text-center">
                                        Peça Esgotada no Estoque
                                      </div>
                                    ) : cartItem ? (
                                      <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl p-1 shadow-xs">
                                        <button
                                          onClick={() => handleUpdateCartQuantity(prod.id, cartItem.quantity - 1)}
                                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-100 dark:hover:bg-slate-700 transition shadow-xs"
                                          title="Diminuir quantidade"
                                        >
                                          <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <div className="text-center">
                                          <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                                            {cartItem.quantity} na Sacola
                                          </span>
                                          <span className="text-[10px] text-slate-500 block font-semibold">
                                            {formatCurrency(prod.bazarPrice * cartItem.quantity)}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => handleAddToCart(prod)}
                                          disabled={cartItem.quantity >= prod.quantity}
                                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-100 dark:hover:bg-slate-700 transition shadow-xs disabled:opacity-30"
                                          title="Aumentar quantidade"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAddToCart(prod)}
                                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                                      >
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Adicionar à Sacola</span>
                                      </button>
                                    )}

                                    {/* Actions Bar: 3 Clear Direct Options */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                      <button
                                        onClick={() => handleOpenPhotoOptions(prod)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-extrabold text-[11px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95"
                                        title="Baixar foto (Original limpa ou Card com preços)"
                                      >
                                        <Download className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                        <span className="truncate">Baixar Fotos</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenSendCustomerPhoto(prod)}
                                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-extrabold text-[11px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800 active:scale-95"
                                        title="Enviar foto editada para um cliente"
                                      >
                                        <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">Para Cliente</span>
                                      </button>

                                      <button
                                        onClick={() => handleShareProductPhotoAndText(prod)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                                        title="Enviar foto editada e texto completo no WhatsApp"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">WhatsApp</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* GRID CARDS: 1 COL ON MOBILE, 2 ON TABLET, 4 ON DESKTOP */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                          {subGroup.products.map((prod) => {
                            const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
                            const isSoldOut = prod.quantity === 0;
                            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;
                            const isSelected = selectedProductIds.includes(prod.id);
                            const cartItem = cart.find((item) => item.product.id === prod.id);

                            return (
                              <div
                                key={prod.id}
                                translate="no"
                                className={`notranslate bg-white dark:bg-slate-900 text-slate-900 dark:text-white border ${
                                  isSelected
                                    ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                                    : isSoldOut 
                                    ? 'border-slate-200 dark:border-slate-800 opacity-80' 
                                    : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 hover:shadow-md'
                                } rounded-2xl overflow-hidden shadow-xs transition flex flex-col justify-between group`}
                              >
                                <div>
                                  {/* Photo Container */}
                                  <div 
                                    onClick={() => handleOpenPhotoOptions(prod)}
                                    className="relative h-48 sm:h-48 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer group/photo"
                                    title="Clique para ver a foto, baixar ou enviar"
                                  >
                                    
                                    {/* Selection Checkbox */}
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProductSelection(prod.id);
                                      }}
                                      className="absolute top-2 left-2 z-20 cursor-pointer p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleProductSelection(prod.id)}
                                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 pointer-events-none"
                                      />
                                    </div>

                                    {/* Photo */}
                                    {prod.imageUrl ? (
                                      <img
                                        src={prod.imageUrl}
                                        alt={prod.name}
                                        className={`w-full h-full object-contain p-2 group-hover/photo:scale-105 transition-transform duration-500 ${
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
                                    <div className="absolute top-2 left-10 z-10 flex flex-col gap-1 items-start">
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

                                    {/* Subcategory pill */}
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1 notranslate" translate="no">
                                      <span className="notranslate bg-white/95 backdrop-blur-md text-slate-800 text-[8.5px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200" translate="no">
                                        {prod.subcategory || prod.category}
                                      </span>
                                    </div>

                                    {/* Sold Out Dark Overlay */}
                                    {isSoldOut && (
                                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-2 text-center">
                                        <span className="bg-rose-600 text-white font-black text-[11px] px-3 py-1 rounded-lg shadow-xl uppercase border border-rose-400">
                                          🔴 ESGOTADO
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="p-3 space-y-1.5 notranslate" translate="no">
                                    <div className="flex items-start justify-between gap-1">
                                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 notranslate" translate="no">
                                        {prod.name}
                                      </h3>
                                      {prod.sku && (
                                        <span className="text-[8.5px] font-black bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-slate-700 shrink-0 notranslate" translate="no">
                                          Cód: {prod.sku}
                                        </span>
                                      )}
                                    </div>

                                    {prod.sizeColor && (
                                      <p className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 notranslate" translate="no">
                                        📏 {prod.sizeColor}
                                      </p>
                                    )}

                                    {prod.expirationDate && (
                                      <p className="text-[9.5px] font-medium text-amber-600 dark:text-amber-400 notranslate" translate="no">
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

                                 {/* Actions: Shopping Bag & Direct Product Actions */}
                                 <div className="p-2 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                   {/* Cart Button or Counter */}
                                   {isSoldOut ? (
                                     <div className="w-full py-1 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-[10.5px] rounded-lg text-center">
                                       Esgotado
                                     </div>
                                   ) : cartItem ? (
                                     <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-lg p-1 shadow-xs">
                                       <button
                                         onClick={() => handleUpdateCartQuantity(prod.id, cartItem.quantity - 1)}
                                         className="p-1 rounded bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-100 dark:hover:bg-slate-700 transition shadow-xs"
                                         title="Diminuir quantidade"
                                       >
                                         <Minus className="h-3 w-3" />
                                       </button>
                                       <span className="text-[10.5px] font-black text-rose-700 dark:text-rose-300">
                                         {cartItem.quantity} na Sacola
                                       </span>
                                       <button
                                         onClick={() => handleAddToCart(prod)}
                                         disabled={cartItem.quantity >= prod.quantity}
                                         className="p-1 rounded bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-100 dark:hover:bg-slate-700 transition shadow-xs disabled:opacity-30"
                                         title="Aumentar quantidade"
                                       >
                                         <Plus className="h-3 w-3" />
                                       </button>
                                     </div>
                                   ) : (
                                     <button
                                       onClick={() => handleAddToCart(prod)}
                                       className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                                     >
                                       <ShoppingBag className="h-3.5 w-3.5" />
                                       <span>Adicionar à Sacola</span>
                                     </button>
                                   )}

                                   {/* Photo Download and Share Buttons */}
                                   <div className="grid grid-cols-3 gap-1">
                                     <button
                                       onClick={() => handleOpenPhotoOptions(prod)}
                                       className="w-full bg-white hover:bg-slate-100 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-extrabold text-[10.5px] py-1.5 px-1 rounded-lg transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95"
                                       title="Baixar foto (Original limpa ou Card com preços)"
                                     >
                                       <Download className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                       <span className="truncate">Fotos</span>
                                     </button>

                                     <button
                                       onClick={() => handleOpenSendCustomerPhoto(prod)}
                                       className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-extrabold text-[10.5px] py-1.5 px-1 rounded-lg transition flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800 active:scale-95"
                                       title="Enviar foto editada para um cliente"
                                     >
                                       <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                       <span className="truncate">Cliente</span>
                                     </button>

                                     <button
                                       onClick={() => handleShareProductPhotoAndText(prod)}
                                       className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10.5px] py-1.5 px-1 rounded-lg transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                                       title="Enviar foto editada e texto no WhatsApp"
                                     >
                                       <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                       <span className="truncate">WhatsApp</span>
                                     </button>
                                   </div>
                                 </div>

                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MOBILE STICKY FLOATING ACTION BAR WHEN ITEMS ARE SELECTED */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-40 sm:hidden bg-slate-950/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-rose-600 text-white font-black text-xs px-2 py-1 rounded-lg shrink-0">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate">
              selecionada{selectedProductIds.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearSelection}
              className="text-[10px] text-slate-400 hover:text-white underline shrink-0 ml-1"
            >
              Limpar
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSaveSelectedToGallery}
              disabled={isSavingToGallery}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-600 flex items-center gap-1 active:scale-95 disabled:opacity-50"
              title="Baixar Fotos"
            >
              <Download className="h-3.5 w-3.5 text-rose-400" />
              <span>Baixar</span>
            </button>

            <button
              onClick={handleOpenExportWithSelection}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
              title="Enviar Fotos e Texto"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Shopping Bag Pill when Cart has items */}
      {totalCartItems > 0 && (
        <aside
          aria-label="Sacola de Compras"
          className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white dark:border-slate-800 transition active:scale-95 group"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition" />
              <span className="absolute -top-1.5 -right-2 bg-white text-rose-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartItems}
              </span>
            </div>
            <span>Minha Sacola</span>
            <span className="bg-rose-700/80 px-2 py-0.5 rounded-full text-xs font-extrabold">
              {formatCurrency(totalCartValue)}
            </span>
          </button>
        </aside>
      )}

      {/* Export Full/Selective Vitrine Modal */}
      <ExportCatalogModal
        isOpen={isExportCatalogOpen}
        onClose={() => setIsExportCatalogOpen(false)}
        products={products}
        initialSelectedProductIds={selectedProductIds}
        onOpenCustomerStoreView={onOpenCustomerStoreView}
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

      {/* Photo Options Modal (Download Card, Download Original, Share WhatsApp) */}
      <PhotoOptionsModal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setPhotoModalProduct(null);
        }}
        product={photoModalProduct}
      />

      {/* Online Store Shopping Cart Modal */}
      <OnlineStoreCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

    </div>
  );
};
