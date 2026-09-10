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
import { EditionManagementModal } from './Editions/EditionManagementModal';

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
  const { editions, activeEditionId } = useBazar();
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [editionModalMode, setEditionModalMode] = useState<'list' | 'create' | 'manage_products'>('list');

  const activeEditionName = activeEditionId === 'all' 
    ? 'Todas as Edições' 
    : editions.find(e => e.id === activeEditionId)?.name || 'Edição Atual';

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
                onClick={() => {
                  setEditionModalMode('list');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-[11px] bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] px-2.5 py-1.5 rounded-lg border border-[#576945] transition max-w-[105px]"
                title="Bazar Atual & Edições"
              >
                <Calendar className="h-3 w-3 text-[#C2AD8E] mr-1 shrink-0" />
                <span className="truncate">{activeEditionName}</span>
              </button>

              {/* Quick Vitrine Button for Mobile */}
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center text-[11px] ${
                  activeTab === 'catalog'
                    ? 'bg-rose-600 text-white font-black shadow-sm ring-1 ring-rose-400'
                    : 'bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] font-bold'
                } px-2.5 py-1.5 rounded-lg border border-[#576945] transition shrink-0`}
                title="Vitrine de Fotos"
              >
                <Share2 className="h-3.5 w-3.5 mr-0.5 text-emerald-300" />
                <span>Vitrine</span>
              </button>

              <button
                onClick={() => onOpenNewSale()}
                className="flex items-center text-[11px] bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-black px-2.5 py-1.5 rounded-lg shadow-sm transition active:scale-95 shrink-0"
                title="Nova Venda"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                <span>+ Venda</span>
              </button>

              <button
                onClick={() => onOpenNewProduct()}
                className="flex items-center text-[11px] bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] font-bold px-2 py-1.5 rounded-lg border border-[#576945] transition shrink-0"
                title="Novo Produto"
              >
                <Package className="h-3 w-3 mr-0.5 text-[#C2AD8E]" />
                <span>+ Item</span>
              </button>

              <button
                onClick={() => onOpenSettings()}
                className="p-1.5 text-[#D8C7AC] hover:text-white bg-[#3A452F] rounded-lg border border-[#576945] transition shrink-0"
                title="Configurações"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Edition Switcher & Quick Actions */}
          <div className="hidden md:flex items-center space-x-2 w-full md:w-auto justify-end">
            {/* Edition Switcher & Create New Bazar Buttons */}
            <div className="hidden md:flex items-center bg-[#3A452F]/90 p-1 rounded-xl border border-[#576945] space-x-1.5">
              <button
                onClick={() => {
                  setEditionModalMode('list');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-xs text-[#F5F0E6] hover:bg-[#465437] px-2.5 py-1.5 rounded-lg transition"
                title="Bazar em Aberto / Trocar Edição"
              >
                <Calendar className="h-3.5 w-3.5 text-[#C2AD8E] mr-1.5" />
                <span className="font-semibold">{activeEditionName}</span>
              </button>

              <button
                onClick={() => {
                  setEditionModalMode('create');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-xs bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold px-2.5 py-1.5 rounded-lg transition shadow-sm"
                title="Criar Novo Bazar com produtos já cadastrados no estoque"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Criar Novo Bazar</span>
              </button>
            </div>

            {/* New Sale Quick Button */}
            <button
              onClick={() => onOpenNewSale()}
              className="flex items-center bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-1.5" />
              <span>Nova Venda</span>
            </button>

            {/* New Product Quick Button */}
            <button
              onClick={() => onOpenNewProduct()}
              className="flex items-center bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] font-medium text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#576945] transition"
            >
              <Package className="h-4 w-4 mr-1 text-[#C2AD8E]" />
              <span>+ Produto</span>
            </button>

            {/* Settings & PDF Button */}
            <button
              onClick={() => onOpenSettings()}
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
          
          {/* 1. Dashboard */}
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

          {/* 2. Estoque e Margens */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Estoque e Margens</span>
          </button>

          {/* 3. Vendas e Clientes */}
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Vendas e Clientes</span>
          </button>

          {/* 4. Vitrine */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <Share2 className="h-4 w-4 text-emerald-400" />
            <span>Vitrine</span>
          </button>

          {/* 5. Relatórios */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold'
                : 'text-[#D8C7AC] hover:text-white hover:bg-[#3A452F]'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Relatórios</span>
          </button>

          {/* 6. Dados da Loja */}
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

          {/* 7. Manual de Uso */}
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

          {/* 8. Próximos Passos */}
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

      {/* Edition Management Modal */}
      <EditionManagementModal
        isOpen={showEditionModal}
        onClose={() => setShowEditionModal(false)}
        initialMode={editionModalMode}
      />
    </header>
  );
};
