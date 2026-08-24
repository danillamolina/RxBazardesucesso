import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Share2, 
  LayoutGrid, 
  List as ListIcon,
  AlertTriangle,
  TrendingUp,
  Tag,
  Calendar
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Product, ProductCategory } from '../../types';
import { formatCurrency, formatPercent, createWhatsAppProductShareLink } from '../../utils/formatters';
import { ShareProductModal } from '../Catalog/ShareProductModal';
import { ExportCatalogModal } from '../Catalog/ExportCatalogModal';
import { generateStockPdf } from '../../utils/pdfGenerator';
import { Download } from 'lucide-react';

interface ProductListProps {
  onOpenNewProduct: (productToEdit?: Product) => void;
  onOpenQuickSale: (product: Product) => void;
}

const CATEGORIES: (ProductCategory | 'Todas')[] = [
  'Todas',
  'Roupas',
  'Calçados',
  'Bolsas & Acessórios',
  'Cosméticos & Perfumes',
  'Semijoias',
  'Casa & Decoração',
  'Outros',
];

export const ProductList: React.FC<ProductListProps> = ({
  onOpenNewProduct,
  onOpenQuickSale,
}) => {
  const { products, adjustStock, deleteProduct, stockMetrics, editions, activeEditionId } = useBazar();

  const activeEditionName = editions.find(e => e.id === activeEditionId)?.name || 'Geral';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todas'>('Todas');
  const [stockFilter, setStockFilter] = useState<'todos' | 'disponivel' | 'baixo' | 'esgotado'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [productToShare, setProductToShare] = useState<Product | null>(null);
  const [isExportCatalogOpen, setIsExportCatalogOpen] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.sizeColor && p.sizeColor.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todas' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'disponivel') matchesStock = p.quantity > 0;
    if (stockFilter === 'baixo') matchesStock = p.quantity <= 3;
    if (stockFilter === 'esgotado') matchesStock = p.quantity === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-rose-500" />
            Estoque & Margem de Lucro em Tempo Real
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gerencie o custo, preço no bazar, estoque disponível e margem de cada produto
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => generateStockPdf(filteredProducts, stockMetrics, activeEditionName)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition"
            title="Exportar inventário filtrado em PDF"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => setIsExportCatalogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95"
            title="Exportar todas as fotos e informações de 1 vez"
          >
            <Share2 className="h-4 w-4" />
            <span>Exportar Catálogo (Fotos + Texto)</span>
          </button>

          <button
            onClick={() => onOpenNewProduct()}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código SKU ou tamanho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition"
            >
              <option value="todos">Todos os Estoques</option>
              <option value="disponivel">Em Estoque (&gt;0)</option>
              <option value="baixo">Estoque Baixo / Zerado (0-3)</option>
              <option value="esgotado">Esgotado (0)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Product Content List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
          <Package className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhum produto encontrado</p>
          <p className="text-xs mt-1">Tente ajustar seus filtros de busca ou cadastre uma nova peça.</p>
          <button
            onClick={() => onOpenNewProduct()}
            className="mt-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            + Cadastrar Produto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const unitProfit = prod.bazarPrice - prod.costPrice;
            const isOutOfStock = prod.quantity === 0;
            const isLowStock = prod.quantity > 0 && prod.quantity <= 3;

            return (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header & Image */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <Package className="h-16 w-16" />
                      </div>
                    )}

                    {/* Stock Badge Overlay */}
                    <div className="absolute top-3 left-3">
                      {isOutOfStock ? (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                          Esgotado
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                          Baixo ({prod.quantity} un)
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                          Em Estoque ({prod.quantity} un)
                        </span>
                      )}
                    </div>

                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {prod.category}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1">
                          {prod.name}
                        </h3>
                        {prod.sku && (
                          <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                            Cód: {prod.sku}
                          </span>
                        )}
                      </div>
                      {prod.sizeColor && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                          {prod.sizeColor}
                        </p>
                      )}
                      {prod.expirationDate && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>Validade: {prod.expirationDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Cost vs Bazaar Price Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
                      {prod.fullPrice && prod.fullPrice > prod.bazarPrice && (
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Preço Cheio:</span>
                          <span className="line-through">{formatCurrency(prod.fullPrice)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Preço Custo:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(prod.costPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span className="text-slate-900 dark:text-white">Valor no Bazar:</span>
                        <div className="text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 block">{formatCurrency(prod.bazarPrice)}</span>
                          {prod.fullPrice && prod.fullPrice > prod.bazarPrice && (
                            <span className="text-[10px] text-rose-500 font-bold block">
                              ({formatCurrency(prod.fullPrice - prod.bazarPrice)} OFF)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          Margem: +{formatPercent(prod.profitMarginPercent)}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                          Lucro Un: {formatCurrency(unitProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Stock Quick Controls */}
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                        Estoque:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(prod.id, -1)}
                          disabled={prod.quantity <= 0}
                          className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-700 dark:text-slate-200 transition disabled:opacity-30"
                          title="-1 estoque"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-black text-sm text-slate-900 dark:text-white min-w-[24px] text-center">
                          {prod.quantity}
                        </span>
                        <button
                          onClick={() => adjustStock(prod.id, 1)}
                          className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-700 dark:text-slate-200 transition"
                          title="+1 estoque"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenNewProduct(prod)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setProductToShare(prod)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl transition"
                      title="Divulgar no WhatsApp"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${prod.name}" do estoque?`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenQuickSale(prod)}
                    disabled={isOutOfStock}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Vender</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Custo (R$)</th>
                  <th className="p-4">Valor Bazar (R$)</th>
                  <th className="p-4">Margem %</th>
                  <th className="p-4">Lucro Un.</th>
                  <th className="p-4 text-center">Estoque</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredProducts.map((prod) => {
                  const unitProfit = prod.bazarPrice - prod.costPrice;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-3">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.name}</span>
                              {prod.sku && (
                                <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                                  Cód: {prod.sku}
                                </span>
                              )}
                            </div>
                            {prod.sizeColor && <div className="text-xs text-rose-500">{prod.sizeColor}</div>}
                            {prod.expirationDate && (
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>Val: {prod.expirationDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{prod.category}</td>
                      <td className="p-4">{formatCurrency(prod.costPrice)}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{formatCurrency(prod.bazarPrice)}</td>
                      <td className="p-4 text-purple-600 dark:text-purple-400 font-bold">+{formatPercent(prod.profitMarginPercent)}</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(unitProfit)}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                          <button
                            onClick={() => adjustStock(prod.id, -1)}
                            disabled={prod.quantity <= 0}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-extrabold text-sm">{prod.quantity}</span>
                          <button
                            onClick={() => adjustStock(prod.id, 1)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setProductToShare(prod)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition"
                            title="Divulgar no WhatsApp"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenQuickSale(prod)}
                            disabled={prod.quantity <= 0}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                          >
                            Vender
                          </button>
                          <button
                            onClick={() => onOpenNewProduct(prod)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remover "${prod.name}" do estoque?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Share Product Modal */}
      <ShareProductModal
        isOpen={!!productToShare}
        onClose={() => setProductToShare(null)}
        product={productToShare}
      />

      {/* Export Full Catalog Modal */}
      <ExportCatalogModal
        isOpen={isExportCatalogOpen}
        onClose={() => setIsExportCatalogOpen(false)}
        products={products}
      />

    </div>
  );
};
