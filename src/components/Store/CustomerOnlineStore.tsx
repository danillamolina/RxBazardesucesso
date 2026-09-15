import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  Sparkles, 
  Filter, 
  Plus, 
  Minus, 
  MessageSquare, 
  Instagram, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  X, 
  ArrowRight, 
  Store, 
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronRight,
  Users
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Product } from '../../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { OnlineStoreCartModal, CartItem } from '../Catalog/OnlineStoreCartModal';

interface CustomerOnlineStoreProps {
  isAdminPreview?: boolean;
  onExitToAdmin?: () => void;
}

export const CustomerOnlineStore: React.FC<CustomerOnlineStoreProps> = ({ 
  isAdminPreview = false,
  onExitToAdmin 
}) => {
  const { products, allProducts, categories, storeInfo, editions, activeEditionId, setActiveEditionId } = useBazar();

  // Target Edition from URL (e.g. ?loja=1&edicao=edition_123)
  const targetEditionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('edicao') || params.get('bazar') || params.get('edition') || params.get('editionId');
      if (urlParam) return urlParam;
    }
    return (activeEditionId && activeEditionId !== 'all') ? activeEditionId : null;
  }, [activeEditionId]);

  const targetEdition = useMemo(() => {
    if (!targetEditionId || targetEditionId === 'all') return null;
    return editions.find(e => 
      e.id === targetEditionId || 
      (e as any).slug === targetEditionId ||
      e.name.toLowerCase().trim() === decodeURIComponent(targetEditionId).toLowerCase().trim()
    ) || null;
  }, [targetEditionId, editions]);

  // Sync active edition in context if visiting a specific edition link
  useEffect(() => {
    if (targetEdition && activeEditionId !== targetEdition.id) {
      setActiveEditionId(targetEdition.id);
    }
  }, [targetEdition, activeEditionId, setActiveEditionId]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');

  // Photo Lightbox Modal
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);

  // Cart State (Persisted in localStorage so customer doesn't lose items on mobile refresh)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bazar_customer_cart_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazar_customer_cart_v1', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // Update dynamic document title for store
  useEffect(() => {
    const storeDisplayName = (storeInfo.name && !storeInfo.name.toLowerCase().includes('rx do bazar'))
      ? storeInfo.name.trim()
      : 'Loja Online';
    const cleanEdition = targetEdition?.name && !targetEdition.name.toLowerCase().includes('rx do bazar')
      ? ` • ${targetEdition.name.trim()}`
      : '';
    document.title = `${storeDisplayName}${cleanEdition} • Catálogo & Sacola de Pedidos`;
  }, [storeInfo.name, targetEdition]);

  // Cart totals
  const totalCartItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const totalCartValue = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product.bazarPrice * item.quantity), 0);
  }, [cart]);

  // Available visible products - automatically connected to the edition link if specified
  const catalogProducts = useMemo(() => {
    const sourceProducts = (allProducts && allProducts.length > 0) ? allProducts : products;
    return sourceProducts.filter((p) => {
      if (p.showInCatalog === false) return false;

      // When a specific bazar edition link is used, strictly show only that edition's products
      if (targetEdition) {
        if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
          return p.bazarEditionIds.includes(targetEdition.id);
        }
        return p.bazarEditionId === targetEdition.id;
      }

      if (activeEditionId && activeEditionId !== 'all') {
        if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
          return p.bazarEditionIds.includes(activeEditionId);
        }
        return p.bazarEditionId === activeEditionId;
      }

      return true;
    });
  }, [allProducts, products, targetEdition, activeEditionId]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCategory = (p.category || '').toLowerCase().includes(q);
        const matchSubcategory = (p.subcategory || '').toLowerCase().includes(q);
        const matchSize = (p.sizeColor || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCategory && !matchSubcategory && !matchSize) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) {
        return false;
      }

      // Subcategory
      if (selectedSubcategory !== 'Todas' && p.subcategory !== selectedSubcategory) {
        return false;
      }

      // Stock
      if (onlyInStock && p.quantity <= 0) {
        return false;
      }

      // Discount
      if (onlyWithDiscount) {
        const { hasDiscount } = getProductPriceDetails(p);
        if (!hasDiscount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.bazarPrice - b.bazarPrice;
      if (sortBy === 'price-desc') return b.bazarPrice - a.bazarPrice;
      if (sortBy === 'discount') {
        const da = a.fullPrice ? (a.fullPrice - a.bazarPrice) / a.fullPrice : 0;
        const db = b.fullPrice ? (b.fullPrice - b.bazarPrice) / b.fullPrice : 0;
        return db - da;
      }
      return 0; // featured/default
    });
  }, [catalogProducts, searchQuery, selectedCategory, selectedSubcategory, onlyInStock, onlyWithDiscount, sortBy]);

  // Subcategories for current category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'Todas') return [];
    const catObj = categories.find((c) => c.name === selectedCategory);
    return catObj?.subcategories || [];
  }, [categories, selectedCategory]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.quantity;
          return { ...item, quantity: Math.min(quantity, max) };
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

  const handleCopyPix = () => {
    if (!storeInfo.pixKey) return;
    navigator.clipboard.writeText(storeInfo.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const storeCleanWhatsapp = (storeInfo.whatsapp || storeInfo.phone || '').replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans antialiased pb-28 notranslate" translate="no">
      
      {/* Merchant Preview Mode Bar (ONLY visible if merchant explicitly clicked Preview from Admin Panel) */}
      {isAdminPreview && onExitToAdmin && (
        <div className="bg-slate-900 text-amber-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Modo Pré-visualização do Lojista (Seus clientes NÃO veem este aviso)</span>
          </div>
          <button
            type="button"
            onClick={onExitToAdmin}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1 rounded-lg text-xs transition active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span>← Voltar ao Painel</span>
          </button>
        </div>
      )}

      {/* Top Header & Store Banner (Clean, warm boutique styling) */}
      <header className="bg-white border-b border-rose-100 shadow-xs sticky top-0 z-30">
        
        {/* Top Mini Bar: Status & Boutique Highlights (Clean for Customers - No Admin Buttons) */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-4 py-1.5 text-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0"></span>
              <span className="truncate">🛍️ Loja Online Aberta • Pronta Entrega</span>
            </div>
            <div className="text-[11px] font-medium text-rose-100 hidden sm:block">
              ✨ Peças e ofertas selecionadas para pronta entrega
            </div>
          </div>
        </div>

        {/* Boutique Main Branding Bar */}
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Boutique Logo/Avatar */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  {(storeInfo.name && !storeInfo.name.toLowerCase().includes('rx do bazar')) ? storeInfo.name : 'Loja Online'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide">
                  <Sparkles className="h-3 w-3" />
                  Loja Oficial
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-medium line-clamp-1">
                {storeInfo.description || 'Peças selecionadas com preços imperdíveis e ofertas especiais!'}
              </p>
            </div>
          </div>

          {/* Cart Trigger in Header */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-rose-600/20 flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-white text-rose-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Minha Sacola</span>
            {totalCartValue > 0 && (
              <span className="bg-rose-700/80 px-2 py-0.5 rounded-lg text-xs font-black">
                {formatCurrency(totalCartValue)}
              </span>
            )}
          </button>
        </div>

        {/* Store Quick Info Chips (WhatsApp, PIX, Instagram, Address) */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar text-xs">
            
            {storeInfo.whatsappGroupLink && (
              <a
                href={storeInfo.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-xs transition shrink-0"
                title="Acessar o Grupo da Promoção no WhatsApp"
              >
                <Users className="h-3.5 w-3.5 text-emerald-100" />
                <span>Grupo da Promoção (WhatsApp)</span>
                <ExternalLink className="h-3 w-3 text-emerald-200" />
              </a>
            )}

            {storeCleanWhatsapp && (
              <a
                href={`https://wa.me/55${storeCleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition shrink-0"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp: {storeInfo.whatsapp || storeInfo.phone}</span>
              </a>
            )}

            {storeInfo.pixKey && (
              <button
                onClick={handleCopyPix}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold hover:bg-purple-100 transition shrink-0"
                title="Clique para copiar a chave PIX"
              >
                {copiedPix ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-purple-600" />
                    <span>PIX Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-purple-600" />
                    <span>Chave PIX: {storeInfo.pixKey}</span>
                  </>
                )}
              </button>
            )}

            {storeInfo.instagram && (
              <a
                href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-bold hover:bg-pink-100 transition shrink-0"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-600" />
                <span>@{storeInfo.instagram.replace('@', '')}</span>
              </a>
            )}

            {storeInfo.address && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium shrink-0">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{storeInfo.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Edition Indicator Banner (When opened with ?edicao=...) */}
        {targetEdition && (
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-t border-b border-rose-200 px-4 py-2.5">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0">
                  <Sparkles className="h-3 w-3" />
                  Edição Conectada
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Coleção / Promoção: <strong className="text-rose-700 font-extrabold">{targetEdition.name}</strong>
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  ({catalogProducts.length} {catalogProducts.length === 1 ? 'peça vinculada' : 'peças vinculadas'})
                </span>
              </div>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('edicao');
                    url.searchParams.delete('bazar');
                    url.searchParams.delete('edition');
                    url.searchParams.delete('editionId');
                    window.location.href = url.toString();
                  }
                }}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 shrink-0 ml-auto"
                title="Limpar filtro de edição e ver todas as peças da loja"
              >
                <span>Ver todas as peças da loja</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero How-it-works Bar */}
      <section className="bg-gradient-to-r from-rose-50 via-pink-50/70 to-purple-50/70 border-b border-rose-100 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="p-1 rounded-lg bg-rose-100 text-rose-700 font-black">1</span>
            <span className="font-semibold">Escolha suas peças</span>
            <ChevronRight className="h-3 w-3 text-slate-400 hidden sm:inline" />
            <span className="p-1 rounded-lg bg-rose-100 text-rose-700 font-black hidden sm:inline">2</span>
            <span className="font-semibold hidden sm:inline">Monte sua sacola</span>
            <ChevronRight className="h-3 w-3 text-slate-400 hidden sm:inline" />
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 font-black hidden sm:inline">3</span>
            <span className="font-semibold text-emerald-800 hidden sm:inline">Envie no WhatsApp no privado ou no grupo da promoção!</span>
          </div>

          <span className="font-bold text-rose-700 bg-white px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs self-start sm:self-auto">
            {catalogProducts.length} peças disponíveis
          </span>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Search & Filtering Section */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          
          {/* Search Bar & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vestidos, blusas, calçados, tamanho P, M, G..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition"
              >
                <option value="featured">✨ Em Destaque</option>
                <option value="price-asc">💰 Menor Preço</option>
                <option value="price-desc">💎 Maior Preço</option>
                <option value="discount">🔥 Maior Desconto %</option>
              </select>

              {/* Only with discount toggle */}
              <button
                type="button"
                onClick={() => setOnlyWithDiscount(!onlyWithDiscount)}
                className={`text-xs font-extrabold px-3 py-2.5 rounded-xl border transition flex items-center gap-1.5 shrink-0 ${
                  onlyWithDiscount
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ofertas</span>
              </button>
            </div>
          </div>

          {/* Category Chips (Horizontal Scrollable) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSelectedSubcategory('Todas');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === 'Todas'
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Todas as Peças</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'Todas' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {catalogProducts.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = catalogProducts.filter((p) => p.category === cat.name).length;
                if (count === 0) return null;

                const isSelected = selectedCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSelectedSubcategory('Todas');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subcategory Chips if Available */}
            {availableSubcategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1">Subcategorias:</span>
                
                <button
                  onClick={() => setSelectedSubcategory('Todas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    selectedSubcategory === 'Todas'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas
                </button>

                {availableSubcategories.map((sub) => {
                  const count = catalogProducts.filter(
                    (p) => p.category === selectedCategory && p.subcategory === sub
                  ).length;
                  if (count === 0) return null;

                  const isSubSelected = selectedSubcategory === sub;

                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                        isSubSelected
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Results Counter & Active Filters Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> peças encontradas
          </span>
          {(searchQuery || selectedCategory !== 'Todas' || onlyWithDiscount) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
                setSelectedSubcategory('Todas');
                setOnlyWithDiscount(false);
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Nenhuma peça encontrada</h3>
            <p className="text-slate-500 text-xs">
              Tente buscar por outro termo ou mude a categoria selecionada para ver mais produtos da loja.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
                setSelectedSubcategory('Todas');
                setOnlyWithDiscount(false);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              Ver Todas as Peças
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredProducts.map((prod) => {
              const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(prod);
              const isSoldOut = prod.quantity <= 0;
              const cartItem = cart.find((item) => item.product.id === prod.id);
              const isJustAdded = justAddedId === prod.id;

              return (
                <article
                  key={prod.id}
                  className={`bg-white rounded-2xl overflow-hidden border ${
                    cartItem 
                      ? 'border-rose-400 ring-2 ring-rose-500/20 shadow-md' 
                      : 'border-slate-200/80 hover:border-rose-200 hover:shadow-md'
                  } transition flex flex-col justify-between group`}
                >
                  <div>
                    {/* Photo Container with Zoom Lightbox Click */}
                    <div 
                      onClick={() => setLightboxProduct(prod)}
                      className="relative h-44 sm:h-60 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center cursor-pointer group/img"
                      title="Clique para ver a foto ampliada"
                    >
                      {/* Product Image */}
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className={`w-full h-full object-contain p-1.5 sm:p-2 group-hover/img:scale-105 transition-transform duration-500 ${
                            isSoldOut ? 'grayscale contrast-75' : ''
                          }`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-400">
                          <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px] sm:text-xs font-bold">Foto</span>
                        </div>
                      )}

                      {/* Top Badges: Discount % & Low Stock */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {hasDiscount && (
                          <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            🔥 {discountPercent}% OFF
                          </span>
                        )}
                        {prod.quantity > 0 && prod.quantity <= 2 && (
                          <span className="bg-amber-600 text-white text-[8.5px] sm:text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                            ⚡ Restam {prod.quantity} un.
                          </span>
                        )}
                      </div>

                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-10">
                          <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/20">
                            Esgotado
                          </span>
                        </div>
                      )}

                      {/* Category Pill */}
                      <span className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-xs text-slate-700 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs border border-slate-200/60 max-w-[85%] truncate">
                        {prod.subcategory ? `${prod.category} • ${prod.subcategory}` : prod.category}
                      </span>
                    </div>

                    {/* Product Information */}
                    <div className="p-2.5 sm:p-3.5 space-y-1 sm:space-y-2">
                      
                      {/* Name & Size */}
                      <div>
                        <h4 
                          onClick={() => setLightboxProduct(prod)}
                          className="font-black text-xs sm:text-sm text-slate-900 line-clamp-2 hover:text-rose-600 transition cursor-pointer"
                        >
                          {prod.name}
                        </h4>
                        
                        {prod.sizeColor && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-full">
                            <span>Tam:</span>
                            <span className="text-rose-700 font-extrabold truncate">{prod.sizeColor}</span>
                          </div>
                        )}
                      </div>

                      {/* Short Description */}
                      {prod.description && (
                        <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      )}

                      {/* Price Section De/Por */}
                      <div className="pt-1.5 sm:pt-2 border-t border-slate-100">
                        {hasDiscount && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through block font-medium">
                            De {formatCurrency(fullPrice)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-sm sm:text-lg font-black text-rose-700">
                            {formatCurrency(bazarPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                              (Economize {formatCurrency(discountAmount)})
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="p-2 sm:p-3 pt-0">
                    {isSoldOut ? (
                      <div className="w-full py-1.5 sm:py-2 bg-slate-100 text-slate-400 font-bold text-[10px] sm:text-xs rounded-xl text-center">
                        Esgotado
                      </div>
                    ) : cartItem ? (
                      <div className="flex items-center justify-between bg-rose-50 border border-rose-300 rounded-xl p-0.5 sm:p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(prod.id, cartItem.quantity - 1)}
                          className="p-1 sm:p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-100 transition shadow-xs"
                          title="Diminuir quantidade"
                        >
                          <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <div className="text-center px-1">
                          <span className="text-[10.5px] sm:text-xs font-black text-rose-700">
                            {cartItem.quantity} na Sacola
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-500 block font-semibold">
                            {formatCurrency(prod.bazarPrice * cartItem.quantity)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(prod)}
                          disabled={cartItem.quantity >= prod.quantity}
                          className="p-1 sm:p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-100 transition shadow-xs disabled:opacity-30"
                          title="Aumentar quantidade"
                        >
                          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] sm:text-xs py-2 sm:py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition active:scale-95 group/btn"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/btn:scale-110 transition shrink-0" />
                        <span className="hidden sm:inline">Adicionar à Sacola</span>
                        <span className="sm:hidden inline">+ Sacola</span>
                      </button>
                    )}
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </main>

      {/* Floating Shopping Bag Bar (Visible on mobile & desktop when items in cart) */}
      {totalCartItems > 0 && (
        <aside
          aria-label="Sacola de Compras Flutuante"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 sm:gap-4 max-w-lg mx-auto sm:w-96">
            
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-rose-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">Total na Sacola:</div>
                <div className="text-base font-black text-white">{formatCurrency(totalCartValue)}</div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>Ver Sacola</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </aside>
      )}

      {/* Cart & Checkout Modal */}
      <OnlineStoreCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        editionName={targetEdition?.name}
        editionId={targetEdition?.id}
      />

      {/* Lightbox / Zoom Photo Modal */}
      {lightboxProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="relative h-80 bg-slate-50 flex items-center justify-center border-b border-slate-100">
              <button
                onClick={() => setLightboxProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {lightboxProduct.imageUrl ? (
                <img
                  src={lightboxProduct.imageUrl}
                  alt={lightboxProduct.name}
                  className="w-full h-full object-contain p-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShoppingBag className="h-16 w-16 text-slate-300" />
              )}
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  {lightboxProduct.category}
                </span>
                {lightboxProduct.sizeColor && (
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {lightboxProduct.sizeColor}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900">{lightboxProduct.name}</h3>
              {lightboxProduct.description && (
                <p className="text-xs text-slate-600 leading-relaxed">{lightboxProduct.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  {lightboxProduct.fullPrice && lightboxProduct.fullPrice > lightboxProduct.bazarPrice && (
                    <span className="text-xs text-slate-400 line-through block">
                      De {formatCurrency(lightboxProduct.fullPrice)}
                    </span>
                  )}
                  <span className="text-xl font-black text-rose-700">
                    {formatCurrency(lightboxProduct.bazarPrice)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(lightboxProduct);
                    setLightboxProduct(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Adicionar à Sacola</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
