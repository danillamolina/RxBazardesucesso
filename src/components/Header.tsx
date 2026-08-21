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
  Store,
  Compass,
  BookOpen
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

            {/* Mobile Edition & New Bazar Buttons */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                onClick={() => setShowEditionModal(true)}
                className="flex items-center text-xs bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] px-2.5 py-1.5 rounded-lg border border-[#576945] transition"
                title="Bazar Atual"
              >
                <Calendar className="h-3.5 w-3.5 text-[#C2AD8E] mr-1.5" />
                <span className="truncate max-w-[100px]">{activeEditionName}</span>
              </button>

              <button
                onClick={() => {
                  setNewEditionName('');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-xs bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-bold px-2 py-1.5 rounded-lg shadow-sm transition"
                title="Criar Novo Bazar"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                <span>Novo Bazar</span>
              </button>
            </div>
          </div>

          {/* Desktop Edition Switcher & Quick Actions */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Edition Switcher & Create New Bazar Buttons */}
            <div className="hidden md:flex items-center bg-[#3A452F]/90 p-1 rounded-xl border border-[#576945] space-x-1.5">
              <button
                onClick={() => setShowEditionModal(true)}
                className="flex items-center text-xs text-[#F5F0E6] hover:bg-[#465437] px-2.5 py-1.5 rounded-lg transition"
                title="Bazar em Aberto / Trocar Edição"
              >
                <Calendar className="h-3.5 w-3.5 text-[#C2AD8E] mr-1.5" />
                <span className="font-semibold">{activeEditionName}</span>
              </button>

              <button
                onClick={() => {
                  setNewEditionName('');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-xs bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold px-2.5 py-1.5 rounded-lg transition shadow-sm"
                title="Criar Novo Bazar"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Criar Novo Bazar</span>
              </button>
            </div>

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

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <BookOpen className="h-4 w-4 text-[#CAD7BE]" />
            <span>Manual de Uso</span>
          </button>

          <button
            onClick={() => setActiveTab('next_steps')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap relative ${
              activeTab === 'next_steps'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#CAD7BE] hover:text-white hover:bg-[#3A452F] font-semibold'
            }`}
          >
            <Compass className="h-4 w-4 text-amber-300" />
            <span>Próximos Passos</span>
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          </button>

        </div>
      </div>

      {/* Edition Switcher & Create New Bazar Modal */}
      {showEditionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#242F1E] border border-[#3A4A30] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3A4A30]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-[#CAD7BE]" />
                Edições do Bazar
              </h3>
              <span className="text-xs bg-[#3A452F] text-[#CAD7BE] px-2.5 py-1 rounded-full font-medium border border-[#576945]">
                {editions.length} cadastrada(s)
              </span>
            </div>

            {/* List of existing bazares */}
            <div>
              <label className="block text-xs font-semibold text-[#D8C7AC] mb-2 uppercase tracking-wider">
                Selecione o Bazar em Aberto:
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {editions.map((ed) => (
                  <button
                    key={ed.id}
                    onClick={() => {
                      setActiveEditionId(ed.id);
                      setShowEditionModal(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition flex items-center justify-between ${
                      activeEditionId === ed.id
                        ? 'bg-[#4A5D3B] border-[#8FA079] text-white shadow-md'
                        : 'bg-[#1F2919] border-[#3A4A30] text-[#D8C7AC] hover:bg-[#2F3E26] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{ed.name}</span>
                        {ed.id === editions[0]?.id && (
                          <span className="text-[10px] bg-[#8FA079]/30 text-[#CAD7BE] px-2 py-0.5 rounded-full border border-[#8FA079]/40 font-normal">
                            Mais Recente
                          </span>
                        )}
                      </div>
                      {ed.notes && <div className="text-xs text-[#CAD7BE]/70 mt-0.5">{ed.notes}</div>}
                    </div>
                    {activeEditionId === ed.id && (
                      <span className="text-xs bg-[#8FA079] text-[#1F2919] font-extrabold px-2.5 py-1 rounded-full">
                        ✓ Em Aberto
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setActiveEditionId('all');
                    setShowEditionModal(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-2xl border transition flex items-center justify-between ${
                    activeEditionId === 'all'
                      ? 'bg-[#4A5D3B] border-[#8FA079] text-white shadow-md'
                      : 'bg-[#1F2919] border-[#3A4A30] text-[#D8C7AC] hover:bg-[#2F3E26] hover:text-white'
                  }`}
                >
                  <span className="font-medium text-xs">Visão Geral (Todas as Edições Juntas)</span>
                  {activeEditionId === 'all' && (
                    <span className="text-xs bg-[#8FA079] text-[#1F2919] font-extrabold px-2 py-0.5 rounded-full">
                      ✓ Ativo
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Create New Edition Form */}
            <form onSubmit={handleCreateEdition} className="pt-4 border-t border-[#3A4A30] space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[#CAD7BE]" />
                Criar Novo Bazar:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Bazar de Natal VIP, Edição Especial..."
                  value={newEditionName}
                  onChange={(e) => setNewEditionName(e.target.value)}
                  className="flex-1 bg-[#1F2919] border border-[#3A4A30] rounded-xl px-3 py-2 text-sm text-white placeholder-[#8FA079]/60 focus:outline-none focus:border-[#8FA079]"
                />
                <button
                  type="submit"
                  disabled={!newEditionName.trim()}
                  className="bg-[#8FA079] hover:bg-[#A3B48D] disabled:opacity-50 text-[#1F2919] font-extrabold px-4 py-2 rounded-xl text-sm transition shadow-sm whitespace-nowrap"
                >
                  + Criar & Abrir
                </button>
              </div>
            </form>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditionModal(false)}
                className="text-xs text-[#D8C7AC] hover:text-white px-4 py-2 rounded-xl bg-[#1F2919] border border-[#3A4A30] transition"
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
