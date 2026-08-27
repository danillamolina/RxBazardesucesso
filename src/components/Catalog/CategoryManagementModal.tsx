import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  FolderPlus, 
  Layers, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { CategoryStructure } from '../../types';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory, addSubcategory, deleteSubcategory, products } = useBazar();

  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Editing category name state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Adding subcategory to existing category state
  const [activeCatForNewSub, setActiveCatForNewSub] = useState<string | null>(null);
  const [newSubInput, setNewSubInput] = useState('');

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subs = newCatSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addCategory(newCatName.trim(), subs);
    setNewCatName('');
    setNewCatSubs('');
    setIsCreatingNew(false);
  };

  const handleStartEdit = (cat: CategoryStructure) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleSaveEdit = (cat: CategoryStructure) => {
    if (!editingCatName.trim()) return;
    updateCategory(cat.id, editingCatName.trim(), cat.subcategories);
    setEditingCatId(null);
    setEditingCatName('');
  };

  const handleAddSubcategory = (catId: string) => {
    if (!newSubInput.trim()) return;
    addSubcategory(catId, newSubInput.trim());
    setNewSubInput('');
    setActiveCatForNewSub(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Categorias & Subcategorias do Catálogo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organize e classifique as peças do seu bazar para facilitar a navegação e envio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Action Bar: Create Category Toggle */}
          {!isCreatingNew ? (
            <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">{categories.length} categorias</span> e dezenas de subcategorias ativas.
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Categoria</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateCategory} className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <FolderPlus className="h-4 w-4 text-rose-500" />
                  Cadastrar Nova Categoria
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fitness, Praia, Acessórios Pet..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subcategorias Iniciais (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tops, Shorts, Leggings, Conjuntos"
                    value={newCatSubs}
                    onChange={(e) => setNewCatSubs(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const productsCount = products.filter((p) => p.category === cat.name).length;

              return (
                <div 
                  key={cat.id}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition"
                >
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        <Tag className="h-4 w-4 text-rose-500" />
                      </div>

                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-rose-400 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white w-full focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                            title="Salvar"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300"
                            title="Cancelar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {cat.name}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {productsCount} {productsCount === 1 ? 'peça' : 'peças'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {editingCatId !== cat.id && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Renomear Categoria"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja remover a categoria "${cat.name}"? Os produtos vinculados manterão o texto.`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Chips & Actions */}
                  <div className="pl-10 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Subcategorias ({cat.subcategories.length}):
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub}
                          className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/80 border border-slate-200/80 dark:border-slate-600/80 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg group"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => deleteSubcategory(cat.id, sub)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition"
                            title={`Remover subcategoria "${sub}"`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add subcategory inline button / input */}
                      {activeCatForNewSub === cat.id ? (
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-rose-300 rounded-lg p-0.5">
                          <input
                            type="text"
                            placeholder="Nome da subcategoria"
                            value={newSubInput}
                            onChange={(e) => setNewSubInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubcategory(cat.id);
                              }
                            }}
                            className="text-xs px-2 py-0.5 bg-transparent focus:outline-none text-slate-900 dark:text-white w-36"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubcategory(cat.id)}
                            className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded"
                            title="Adicionar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCatForNewSub(null);
                              setNewSubInput('');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCatForNewSub(cat.id);
                            setNewSubInput('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-900/60 px-2 py-1 rounded-lg transition"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Adicionar Subcategoria</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-extrabold px-6 py-2.5 rounded-xl transition"
          >
            Concluir & Voltar ao Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};
