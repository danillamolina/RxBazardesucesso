import React, { useState } from 'react';
import { 
  Sparkles, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Share2, 
  Plus, 
  Calendar, 
  Settings,
  LayoutDashboard,
  Store
} from 'lucide-react';
import { useBazar } from '../context/BazarContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSale,
  onOpenNewProduct,
  onOpenSettings,
}) => {
  const { editions, activeEditionId, setActiveEditionId, addEdition, resetToInitialData } = useBazar();
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [newEditionName, setNewEditionName] = useState('');

  const activeEditionName = activeEditionId === 'all' 
    ? 'Todas as Edições' 
    : editions.find(e => e.id === activeEditionId)?.name || 'Edição Atual';

  const handleCreateEdition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;
    addEdition(newEditionName.trim());
    setNewEditionName('');
    setShowEditionModal(false);
  };

  return (
    <header className="bg-[#2A3722] text-white shadow-lg border-b border-[#3A4A30] sticky top-0 z-30">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center space-x-2.5">
              <div className="bg-gradient-to-tr from-[#8FA079] via-[#576945] to-[#3A452F] p-2 rounded-xl shadow-lg shadow-[#8FA079]/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Rx do Bazar de Sucesso
                </h1>
                <p className="text-xs text-[#D8C7AC] hidden sm:block">Controle de Estoque, Margens & Lucro em Tempo Real</p>
              </div>
            </div>

            {/* Mobile Edition Selector Badge */}
            <button
              onClick={() => setShowEditionModal(true)}
              className="md:hidden flex items-center text-xs bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] px-2.5 py-1.5 rounded-lg border border-[#576945] transition"
            >
              <Calendar className="h-3.5 w-3.5 text-[#C2AD8E] mr-1.5" />
              <span className="truncate max-w-[120px]">{activeEditionName}</span>
            </button>
          </div>

          {/* Desktop Edition Switcher & Quick Actions */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Edition Switcher Button */}
            <button
              onClick={() => setShowEditionModal(true)}
              className="hidden md:flex items-center text-xs bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] px-3 py-2 rounded-lg border border-[#576945] transition"
              title="Trocar ou Criar Edição do Bazar"
            >
              <Calendar className="h-4 w-4 text-[#C2AD8E] mr-2" />
              <span className="font-medium mr-1">{activeEditionName}</span>
            </button>

            {/* New Sale Quick Button */}
            <button
              onClick={onOpenNewSale}
              className="flex items-center bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-1.5" />
              <span>Nova Venda</span>
            </button>

            {/* New Product Quick Button */}
            <button
              onClick={onOpenNewProduct}
              className="flex items-center bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] font-medium text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#576945] transition"
            >
              <Package className="h-4 w-4 mr-1 text-[#C2AD8E]" />
              <span>+ Produto</span>
            </button>

            {/* Settings & PDF Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center bg-[#3A452F] hover:bg-[#465437] text-[#D8C7AC] hover:text-white font-medium text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#576945] transition"
              title="Configurações, Backup & Relatórios PDF"
            >
              <Settings className="h-4 w-4 mr-1 text-[#C2AD8E]" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-[#1F2919]/90 border-t border-[#3A4A30] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Estoque & Margens</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Vendas & Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Relatório de Lucro</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Vitrine & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'store'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Dados da Loja</span>
          </button>

        </div>
      </div>

      {/* Edition Switcher Modal */}
      {showEditionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-400" />
              Selecionar Edição do Bazar
            </h3>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setActiveEditionId('all');
                  setShowEditionModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center justify-between ${
                  activeEditionId === 'all'
                    ? 'bg-rose-500/20 border-rose-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="font-medium">Todas as Edições (Visão Geral)</span>
                {activeEditionId === 'all' && <span className="text-xs bg-rose-500 px-2 py-0.5 rounded-full text-white">Ativo</span>}
              </button>

              {editions.map((ed) => (
                <button
                  key={ed.id}
                  onClick={() => {
                    setActiveEditionId(ed.id);
                    setShowEditionModal(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center justify-between ${
                    activeEditionId === ed.id
                      ? 'bg-rose-500/20 border-rose-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{ed.name}</div>
                    {ed.notes && <div className="text-xs text-slate-400 mt-0.5">{ed.notes}</div>}
                  </div>
                  {activeEditionId === ed.id && <span className="text-xs bg-rose-500 px-2 py-0.5 rounded-full text-white">Ativo</span>}
                </button>
              ))}
            </div>

            {/* Create New Edition Form */}
            <form onSubmit={handleCreateEdition} className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Criar Nova Edição de Bazar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Bazar de Natal VIP"
                  value={newEditionName}
                  onChange={(e) => setNewEditionName(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition"
                >
                  Criar
                </button>
              </div>
            </form>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditionModal(false)}
                className="text-sm text-slate-400 hover:text-white px-3 py-1.5"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
