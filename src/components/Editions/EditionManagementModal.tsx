import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Package,
  Search,
  AlertTriangle,
  ArrowLeft,
  Filter,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Copy,
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { BazarEdition, Product } from '../../types';
import { getStoreOnlineUrl, generateStoreInvitationWhatsAppText } from '../../utils/formatters';

interface EditionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'list' | 'create' | 'manage_products';
  targetEditionId?: string;
}

export const EditionManagementModal: React.FC<EditionManagementModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'list',
  targetEditionId,
}) => {
  const {
    editions,
    activeEditionId,
    setActiveEditionId,
    addEdition,
    deleteEdition,
    setEditionProducts,
    allProducts,
    allSales,
    categories,
    storeInfo,
  } = useBazar();

  const [copiedEditionId, setCopiedEditionId] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'manage_products'>(initialMode);
  const [selectedEditionForManagement, setSelectedEditionForManagement] = useState<BazarEdition | null>(null);

  // Create Edition Form State
  const [newEditionName, setNewEditionName] = useState('');
  const [newEditionNotes, setNewEditionNotes] = useState('');
  const [selectedProductIdsForNewEdition, setSelectedProductIdsForNewEdition] = useState<string[]>([]);

  // Manage Products for Existing Edition State
  const [managedProductIds, setManagedProductIds] = useState<string[]>([]);

  // Deletion Confirmation State
  const [editionToDelete, setEditionToDelete] = useState<BazarEdition | null>(null);
  const [deleteAssociatedSales, setDeleteAssociatedSales] = useState(false);

  // Filters for Product Selection
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Todas');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync mode and target edition when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFeedbackMessage(null);
      setEditionToDelete(null);

      if (initialMode === 'create') {
        setNewEditionName('');
        setNewEditionNotes('');
        // By default select all items with stock > 0 for new edition convenience
        const inStockIds = allProducts.filter((p) => p.quantity > 0).map((p) => p.id);
        setSelectedProductIdsForNewEdition(inStockIds);
      } else if (initialMode === 'manage_products') {
        const ed = editions.find((e) => e.id === (targetEditionId || activeEditionId)) || editions[0];
        if (ed) {
          setSelectedEditionForManagement(ed);
          const currentInEdition = allProducts
            .filter((p) => {
              if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
                return p.bazarEditionIds.includes(ed.id);
              }
              return p.bazarEditionId === ed.id;
            })
            .map((p) => p.id);
          setManagedProductIds(currentInEdition);
        }
      }
    }
  }, [isOpen, initialMode, targetEditionId, activeEditionId, editions, allProducts]);

  // Open manage products for a specific edition
  const handleOpenManageProducts = (edition: BazarEdition) => {
    setSelectedEditionForManagement(edition);
    const currentInEdition = allProducts
      .filter((p) => {
        if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
          return p.bazarEditionIds.includes(edition.id);
        }
        return p.bazarEditionId === edition.id;
      })
      .map((p) => p.id);
    setManagedProductIds(currentInEdition);
    setProductSearch('');
    setSelectedCategoryFilter('Todas');
    setMode('manage_products');
  };

  // Switch to Create Mode
  const handleOpenCreateMode = () => {
    setNewEditionName('');
    setNewEditionNotes('');
    const inStockIds = allProducts.filter((p) => p.quantity > 0).map((p) => p.id);
    setSelectedProductIdsForNewEdition(inStockIds);
    setProductSearch('');
    setSelectedCategoryFilter('Todas');
    setMode('create');
  };

  // Toggle single product selection for new edition
  const toggleProductForNewEdition = (productId: string) => {
    setSelectedProductIdsForNewEdition((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Toggle single product selection for existing edition
  const toggleProductForManagedEdition = (productId: string) => {
    setManagedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Bulk actions for product selector
  const handleSelectAll = (targetArraySetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    targetArraySetter(allProducts.map((p) => p.id));
  };

  const handleSelectInStock = (targetArraySetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    targetArraySetter(allProducts.filter((p) => p.quantity > 0).map((p) => p.id));
  };

  const handleClearSelection = (targetArraySetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    targetArraySetter([]);
  };

  // Create Edition Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;

    addEdition(newEditionName.trim(), newEditionNotes.trim() || undefined, selectedProductIdsForNewEdition);

    setFeedbackMessage(`Bazar "${newEditionName.trim()}" criado com ${selectedProductIdsForNewEdition.length} peças vinculadas!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Save Managed Products for Existing Edition
  const handleSaveManagedProducts = () => {
    if (!selectedEditionForManagement) return;

    setEditionProducts(selectedEditionForManagement.id, managedProductIds);
    setFeedbackMessage(`Produtos do bazar "${selectedEditionForManagement.name}" atualizados com sucesso!`);
    setTimeout(() => {
      setMode('list');
      setFeedbackMessage(null);
    }, 1200);
  };

  // Delete Edition Action
  const handleConfirmDeleteEdition = () => {
    if (!editionToDelete) return;

    deleteEdition(editionToDelete.id, deleteAssociatedSales);
    setFeedbackMessage(`Edição "${editionToDelete.name}" foi excluída. Seus produtos continuam no Estoque Geral.`);
    setEditionToDelete(null);
    setDeleteAssociatedSales(false);

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3000);
  };

  // Products filtered for the selector
  const filteredProductsForSelector = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.sizeColor && p.sizeColor.toLowerCase().includes(productSearch.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'Todas' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, productSearch, selectedCategoryFilter]);

  // Counts for each edition
  const editionStats = useMemo(() => {
    const stats: Record<string, { productCount: number; salesCount: number }> = {};
    editions.forEach((ed) => {
      const prodCount = allProducts.filter((p) => {
        if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
          return p.bazarEditionIds.includes(ed.id);
        }
        return p.bazarEditionId === ed.id;
      }).length;

      const salesCount = allSales.filter((s) => s.bazarEditionId === ed.id).length;

      stats[ed.id] = { productCount: prodCount, salesCount };
    });
    return stats;
  }, [editions, allProducts, allSales]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#242F1E] border border-[#3A4A30] rounded-3xl max-w-3xl w-full text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A4A30] bg-[#1F2919]/90 shrink-0">
          <div className="flex items-center gap-3">
            {mode !== 'list' && (
              <button
                type="button"
                onClick={() => setMode('list')}
                className="p-1.5 rounded-xl bg-[#2F3E26] hover:bg-[#3D4F2F] text-[#CAD7BE] transition"
                title="Voltar para a lista de edições"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-[#8FA079]" />
                {mode === 'list' && 'Edições do Bazar & Troca de Evento'}
                {mode === 'create' && 'Criar Novo Bazar com Produtos do Estoque'}
                {mode === 'manage_products' && `Selecionar Peças do Estoque: ${selectedEditionForManagement?.name || ''}`}
              </h3>
              <p className="text-xs text-[#CAD7BE]/80">
                {mode === 'list' && 'Gerencie edições anteriores, troque a edição ativa ou crie um novo bazar'}
                {mode === 'create' && 'Selecione produtos já cadastrados no estoque para este novo bazar'}
                {mode === 'manage_products' && 'Marque ou desmarque os produtos que participam desta edição'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#CAD7BE] hover:text-white rounded-xl hover:bg-[#2F3E26] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="bg-emerald-900/60 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-200 flex items-center gap-2 font-semibold animate-fadeIn shrink-0">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* VIEW 1: LIST OF EDITIONS */}
          {mode === 'list' && (
            <div className="space-y-4">
              
              {/* Top Quick Create Bar */}
              <div className="flex items-center justify-between bg-[#1C2616] border border-[#3A4A30] p-4 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#8FA079]/20 text-[#8FA079] rounded-2xl shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Estoque Geral Centralizado</h4>
                    <p className="text-xs text-[#CAD7BE]/70">
                      Você tem <span className="font-bold text-white">{allProducts.length} produto(s)</span> cadastrados no estoque geral prontos para usar em qualquer edição.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateMode}
                  className="bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar Novo Bazar</span>
                </button>
              </div>

              {/* List of Editions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#D8C7AC] uppercase tracking-wider px-1">
                  <span>Edições Cadastradas ({editions.length}):</span>
                  <span className="text-[11px] text-[#CAD7BE]/60 font-normal">Clique para alternar o bazar em aberto</span>
                </div>

                {editions.map((ed) => {
                  const isActive = activeEditionId === ed.id;
                  const stats = editionStats[ed.id] || { productCount: 0, salesCount: 0 };

                  return (
                    <div
                      key={ed.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-[#2F3E26] border-[#8FA079] shadow-md ring-1 ring-[#8FA079]/50'
                          : 'bg-[#1C2616] border-[#3A4A30] hover:bg-[#25321E]'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                            {ed.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] bg-[#8FA079] text-[#1F2919] font-extrabold px-2.5 py-0.5 rounded-full">
                              ✓ Em Aberto
                            </span>
                          )}
                          {ed.id === editions[0]?.id && (
                            <span className="text-[10px] bg-[#8FA079]/20 text-[#CAD7BE] px-2 py-0.5 rounded-full border border-[#8FA079]/30">
                              Mais Recente
                            </span>
                          )}
                        </div>

                        {ed.notes && (
                          <p className="text-xs text-[#CAD7BE]/80 line-clamp-1">{ed.notes}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-[#CAD7BE]/70 pt-1">
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-[#8FA079]" />
                            <strong className="text-white">{stats.productCount}</strong> produto(s) vinculado(s)
                          </span>
                          <span className="text-[#576945]">•</span>
                          <span>
                            <strong className="text-white">{stats.salesCount}</strong> venda(s) registrada(s)
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for this Edition */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3A4A30] justify-end">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveEditionId(ed.id);
                              onClose();
                            }}
                            className="bg-[#3A452F] hover:bg-[#4A5D3B] text-white text-xs font-semibold px-3 py-2 rounded-xl border border-[#576945] transition flex items-center gap-1.5"
                            title="Tornar esta edição o bazar ativo no aplicativo"
                          >
                            <Check className="h-3.5 w-3.5 text-[#8FA079]" />
                            <span>Abrir Bazar</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-[#8FA079] px-2 py-1 bg-[#1F2919] rounded-lg border border-[#8FA079]/40">
                            Ativo Agora
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const url = getStoreOnlineUrl(undefined, ed.id);
                            const text = generateStoreInvitationWhatsAppText(storeInfo, url, ed.name);
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-2 rounded-xl transition flex items-center gap-1 shadow-xs"
                          title={`Enviar link da Loja Online com a edição "${ed.name}" diretamente pelo WhatsApp`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Enviar</span> Link
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const url = getStoreOnlineUrl(undefined, ed.id);
                            navigator.clipboard.writeText(url);
                            setCopiedEditionId(ed.id);
                            setTimeout(() => setCopiedEditionId(null), 2500);
                          }}
                          className="bg-[#242F1E] hover:bg-[#34442B] text-[#CAD7BE] hover:text-white text-xs font-medium px-2.5 py-2 rounded-xl border border-[#3A4A30] transition flex items-center gap-1"
                          title="Copiar link da Loja com esta edição conectada"
                        >
                          {copiedEditionId === ed.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedEditionId === ed.id ? 'Copiado!' : 'Copiar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenManageProducts(ed)}
                          className="bg-[#242F1E] hover:bg-[#34442B] text-[#CAD7BE] hover:text-white text-xs font-medium px-3 py-2 rounded-xl border border-[#3A4A30] transition flex items-center gap-1"
                          title="Selecionar quais produtos do estoque participam desta edição"
                        >
                          <Layers className="h-3.5 w-3.5 text-[#8FA079]" />
                          <span className="hidden sm:inline">Gerenciar</span> Produtos
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setEditionToDelete(ed)}
                          className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 rounded-xl border border-rose-800/40 transition"
                          title="Excluir esta edição (os produtos continuarão intactos no estoque)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Option to View All Editions Combined */}
                <div
                  onClick={() => {
                    setActiveEditionId('all');
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    activeEditionId === 'all'
                      ? 'bg-[#2F3E26] border-[#8FA079] text-white shadow-md'
                      : 'bg-[#1C2616] border-[#3A4A30] text-[#CAD7BE] hover:bg-[#25321E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#8FA079]/10 rounded-xl text-[#8FA079]">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Visão Geral (Estoque Geral / Todas as Edições)</div>
                      <div className="text-[11px] text-[#CAD7BE]/70">Exibe todos os produtos cadastrados e todo o histórico financeiro consolidado</div>
                    </div>
                  </div>
                  {activeEditionId === 'all' && (
                    <span className="text-xs bg-[#8FA079] text-[#1F2919] font-extrabold px-2.5 py-1 rounded-full">
                      ✓ Ativo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CREATE NEW EDITION WITH PRODUCT SELECTION */}
          {mode === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Basic Edition Information */}
              <div className="bg-[#1C2616] border border-[#3A4A30] p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-[#D8C7AC] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#8FA079]" />
                  Dados do Novo Bazar:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#CAD7BE] mb-1">
                      Nome do Bazar / Edição: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Bazar de Primavera, Edição Especial VIP..."
                      value={newEditionName}
                      onChange={(e) => setNewEditionName(e.target.value)}
                      className="w-full bg-[#242F1E] border border-[#3A4A30] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8FA079]/50 focus:outline-none focus:border-[#8FA079] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#CAD7BE] mb-1">
                      Observações / Data (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Início em 15 de Outubro, foco em moda..."
                      value={newEditionNotes}
                      onChange={(e) => setNewEditionNotes(e.target.value)}
                      className="w-full bg-[#242F1E] border border-[#3A4A30] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8FA079]/50 focus:outline-none focus:border-[#8FA079] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selector Section */}
              <div className="bg-[#1C2616] border border-[#3A4A30] p-4 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A4A30] pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#D8C7AC] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-[#8FA079]" />
                      Selecione os Produtos do Estoque para esta Edição:
                    </h4>
                    <p className="text-xs text-[#CAD7BE]/70">
                      Não é preciso recriar os produtos! Escolha quais peças do estoque geral estarão neste bazar:
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(setSelectedProductIdsForNewEdition)}
                      className="text-[11px] bg-[#2F3E26] hover:bg-[#3D4F2F] text-[#CAD7BE] hover:text-white px-2.5 py-1 rounded-lg border border-[#3A4A30] transition"
                    >
                      Todos ({allProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectInStock(setSelectedProductIdsForNewEdition)}
                      className="text-[11px] bg-[#8FA079]/20 hover:bg-[#8FA079]/30 text-[#8FA079] px-2.5 py-1 rounded-lg border border-[#8FA079]/40 transition font-semibold"
                    >
                      Com Estoque (&gt;0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSelection(setSelectedProductIdsForNewEdition)}
                      className="text-[11px] bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 px-2 py-1 rounded-lg border border-rose-800/30 transition"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#CAD7BE]/60" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, SKU, tamanho..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-[#242F1E] border border-[#3A4A30] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8FA079]/50 focus:outline-none focus:border-[#8FA079]"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-[#242F1E] border border-[#3A4A30] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8FA079]"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Products List with Checkboxes */}
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#3A4A30]/40">
                  {filteredProductsForSelector.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#CAD7BE]/60">
                      Nenhum produto encontrado para o filtro.
                    </div>
                  ) : (
                    filteredProductsForSelector.map((p) => {
                      const isSelected = selectedProductIdsForNewEdition.includes(p.id);

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductForNewEdition(p.id)}
                          className={`pt-1.5 first:pt-0 pb-1.5 flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#2F3E26] border border-[#8FA079]/50'
                              : 'hover:bg-[#25321E] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-[#8FA079] shrink-0">
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[#8FA079]" />
                              ) : (
                                <Square className="h-4 w-4 text-[#576945]" />
                              )}
                            </div>

                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-9 w-9 rounded-lg object-cover bg-black/20 shrink-0"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-[#3A452F] flex items-center justify-center text-[#CAD7BE] shrink-0">
                                <Package className="h-4 w-4" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.sizeColor && (
                                  <span className="text-[10px] bg-[#3A452F] text-[#CAD7BE] px-1.5 py-0.5 rounded">
                                    {p.sizeColor}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#CAD7BE]/70 flex items-center gap-2">
                                <span>{p.category}</span>
                                <span>•</span>
                                <span className={p.quantity === 0 ? 'text-rose-400 font-semibold' : 'text-[#8FA079]'}>
                                  {p.quantity} un em estoque
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#CAD7BE]">
                              R$ {p.bazarPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-[#CAD7BE] flex items-center gap-2">
                  <span className="bg-[#8FA079] text-[#1F2919] font-extrabold px-2.5 py-0.5 rounded-full text-[11px]">
                    {selectedProductIdsForNewEdition.length}
                  </span>
                  <span>peça(s) selecionada(s) para este bazar</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="px-4 py-2.5 rounded-xl bg-[#1F2919] hover:bg-[#2F3E26] text-xs text-[#CAD7BE] border border-[#3A4A30] transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newEditionName.trim()}
                    className="bg-[#8FA079] hover:bg-[#A3B48D] disabled:opacity-50 text-[#1F2919] font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Bazar & Abrir</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* VIEW 3: MANAGE PRODUCTS OF EXISTING EDITION */}
          {mode === 'manage_products' && selectedEditionForManagement && (
            <div className="space-y-4">
              <div className="bg-[#1C2616] border border-[#3A4A30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8FA079]" />
                    {selectedEditionForManagement.name}
                  </h4>
                  <p className="text-xs text-[#CAD7BE]/70">
                    Marque os produtos do seu estoque geral que você quer disponibilizar neste bazar:
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(setManagedProductIds)}
                    className="text-[11px] bg-[#2F3E26] hover:bg-[#3D4F2F] text-[#CAD7BE] hover:text-white px-2.5 py-1 rounded-lg border border-[#3A4A30] transition"
                  >
                    Todos ({allProducts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectInStock(setManagedProductIds)}
                    className="text-[11px] bg-[#8FA079]/20 hover:bg-[#8FA079]/30 text-[#8FA079] px-2.5 py-1 rounded-lg border border-[#8FA079]/40 transition font-semibold"
                  >
                    Com Estoque (&gt;0)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearSelection(setManagedProductIds)}
                    className="text-[11px] bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 px-2 py-1 rounded-lg border border-rose-800/30 transition"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#CAD7BE]/60" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, SKU, tamanho..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#1C2616] border border-[#3A4A30] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8FA079]/50 focus:outline-none focus:border-[#8FA079]"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-[#1C2616] border border-[#3A4A30] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8FA079]"
                >
                  <option value="Todas">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Products List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#3A4A30]/40">
                {filteredProductsForSelector.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#CAD7BE]/60">
                    Nenhum produto encontrado para os filtros.
                  </div>
                ) : (
                  filteredProductsForSelector.map((p) => {
                    const isSelected = managedProductIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductForManagedEdition(p.id)}
                        className={`pt-1.5 first:pt-0 pb-1.5 flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#2F3E26] border border-[#8FA079]/50'
                            : 'hover:bg-[#25321E] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-[#8FA079] shrink-0">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-[#8FA079]" />
                            ) : (
                              <Square className="h-4 w-4 text-[#576945]" />
                            )}
                          </div>

                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-9 w-9 rounded-lg object-cover bg-black/20 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-[#3A452F] flex items-center justify-center text-[#CAD7BE] shrink-0">
                              <Package className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.sizeColor && (
                                <span className="text-[10px] bg-[#3A452F] text-[#CAD7BE] px-1.5 py-0.5 rounded">
                                  {p.sizeColor}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#CAD7BE]/70 flex items-center gap-2">
                              <span>{p.category}</span>
                              <span>•</span>
                              <span className={p.quantity === 0 ? 'text-rose-400 font-semibold' : 'text-[#8FA079]'}>
                                {p.quantity} un em estoque
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#CAD7BE]">
                            R$ {p.bazarPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Save */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#3A4A30]">
                <div className="text-xs text-[#CAD7BE]">
                  <strong className="text-white">{managedProductIds.length}</strong> produto(s) vinculado(s) a este bazar
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="px-4 py-2.5 rounded-xl bg-[#1F2919] hover:bg-[#2F3E26] text-xs text-[#CAD7BE] border border-[#3A4A30] transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveManagedProducts}
                    className="bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salvar Produtos Desta Edição</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#3A4A30] bg-[#1F2919]/90 flex items-center justify-between text-xs text-[#CAD7BE]/70 shrink-0">
          <span>Estoque total: {allProducts.length} itens cadastrados</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#CAD7BE] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#2F3E26] transition font-medium"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* CONFIRMATION DIALOG: DELETE EDITION */}
      {editionToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#242F1E] border border-rose-800/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[#3A4A30]">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Excluir Edição Anterior?
                </h3>
                <p className="text-xs text-rose-300 font-semibold">{editionToDelete.name}</p>
              </div>
            </div>

            {/* Reassurance statement */}
            <div className="bg-[#1C2616] border border-[#3A4A30] p-3.5 rounded-2xl space-y-2 text-xs text-[#CAD7BE]">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                Seus produtos NÃO serão apagados!
              </p>
              <p className="text-[#CAD7BE]/80">
                Todos os produtos cadastrados permanecerão seguros e disponíveis no seu <strong>Estoque Geral</strong> para uso em qualquer outro bazar.
              </p>
              <div className="text-[11px] pt-1 text-[#8FA079]">
                • {editionStats[editionToDelete.id]?.productCount || 0} produto(s) serão desvinculados desta edição.
                <br />
                • {editionStats[editionToDelete.id]?.salesCount || 0} venda(s) associadas registradas.
              </div>
            </div>

            {/* Optional checkbox for sales deletion */}
            {(editionStats[editionToDelete.id]?.salesCount || 0) > 0 && (
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteAssociatedSales}
                  onChange={(e) => setDeleteAssociatedSales(e.target.checked)}
                  className="mt-0.5 rounded bg-black/40 border-rose-800 text-rose-500 focus:ring-0"
                />
                <span className="text-rose-200">
                  Excluir também as <strong>{editionStats[editionToDelete.id]?.salesCount} vendas</strong> registradas nesta edição.
                  <span className="block text-[11px] text-rose-300/70 font-normal">
                    (Deixe desmarcado para preservar seus relatórios de lucro e histórico financeiro).
                  </span>
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditionToDelete(null);
                  setDeleteAssociatedSales(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1F2919] hover:bg-[#2F3E26] text-xs font-semibold text-[#CAD7BE] transition border border-[#3A4A30]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEdition}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-extrabold text-white transition shadow-md shadow-rose-900/30 flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir Edição</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
