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
  BookOpen,
  Menu,
  ShoppingBag
} from 'lucide-react';
import { useBazar } from '../context/BazarContext';
import { EditionManagementModal } from './Editions/EditionManagementModal';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu?: () => void;
  onOpenCustomerStoreView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSale,
  onOpenNewProduct,
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCustomerStoreView,
}) => {
  const { editions, activeEditionId } = useBazar();
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [editionModalMode, setEditionModalMode] = useState<'list' | 'create' | 'manage_products'>('list');

  const activeEditionName = activeEditionId === 'all' 
    ? 'Todas as Edições' 
    : editions.find(e => e.id === activeEditionId)?.name || 'Edição Atual';

  return (
    <header className="bg-[#FAF8F5] md:bg-[#2A3722] text-[#2B3323] md:text-white shadow-xs md:shadow-lg border-b border-[#E5DDD0] md:border-[#3A4A30] sticky top-0 z-30 transition-colors">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          
          {/* Logo, Title & Mobile Header Controls */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center space-x-2.5">
              <div className="bg-gradient-to-tr from-[#8FA079] via-[#576945] to-[#3A452F] p-2 rounded-xl shadow-md">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#1F2919] md:text-white flex items-center gap-1.5">
                  Rx do Bazar de Sucesso
                </h1>
                <p className="text-[11px] sm:text-xs text-[#6A785E] md:text-[#D8C7AC]">
                  Gestão & Precificação • <span className="text-[#4A5D3B] md:text-[#8FA079] font-bold">@danillafinancas</span>
                </p>
              </div>
            </div>

            {/* Mobile Top Controls: Edition + Install + Settings + Menu */}
            <div className="md:hidden flex items-center gap-1.5">
              <PWAInstallButton variant="mobile-bar" />

              <button
                onClick={() => {
                  setEditionModalMode('list');
                  setShowEditionModal(true);
                }}
                className="flex items-center text-[11px] bg-white hover:bg-[#F2EDE2] text-[#2B3323] px-2 py-1.5 rounded-lg border border-[#DDD3C2] shadow-xs transition max-w-[100px]"
                title="Bazar Atual & Edições"
              >
                <Calendar className="h-3.5 w-3.5 text-[#71845B] mr-1 shrink-0" />
                <span className="truncate font-semibold">{activeEditionName}</span>
              </button>

              <button
                onClick={() => onOpenSettings()}
                className="p-2 text-[#556348] hover:text-[#1F2919] bg-white hover:bg-[#F2EDE2] rounded-lg border border-[#DDD3C2] shadow-xs transition shrink-0"
                title="Configurações & Backup"
              >
                <Settings className="h-4 w-4" />
              </button>

              {onOpenMobileMenu && (
                <button
                  onClick={onOpenMobileMenu}
                  className="flex items-center gap-1 text-[11px] bg-[#E8EFE2] hover:bg-[#DCE7D4] text-[#254217] px-2.5 py-1.5 rounded-lg border border-[#8FA079] transition shrink-0 font-bold shadow-xs"
                  title="Abrir Menu de Abas"
                >
                  <Menu className="h-4 w-4 text-[#3A5D28]" />
                  <span>Abas</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Quick Action Buttons Bar (Second Row on Mobile) */}
          <div className="md:hidden w-full grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => onOpenNewSale()}
              className="flex items-center justify-center gap-1 py-2 px-1.5 bg-[#8FA079] hover:bg-[#7D9068] text-[#1F2919] font-black rounded-xl text-xs shadow-sm transition active:scale-95"
              title="Registrar Nova Venda"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Venda</span>
            </button>

            <button
              onClick={() => onOpenNewProduct()}
              className="flex items-center justify-center gap-1 py-2 px-1.5 bg-white hover:bg-[#F7F4EC] text-[#2B3323] font-bold rounded-xl text-xs border border-[#DDD3C2] shadow-xs transition active:scale-95"
              title="Cadastrar Novo Produto"
            >
              <Package className="h-3.5 w-3.5 text-[#556348]" />
              <span>+ Peça</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold border transition ${
                activeTab === 'catalog'
                  ? 'bg-[#E6F4EA] text-[#1B4D2E] border-[#8FA079] shadow-sm'
                  : 'bg-white hover:bg-[#F7F4EC] text-[#334D28] border-[#DDD3C2] shadow-xs'
              }`}
              title="Ver Vitrine com Fotos"
            >
              <Share2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Vitrine</span>
            </button>

            <button
              onClick={() => (onOpenCustomerStoreView ? onOpenCustomerStoreView() : setActiveTab('catalog'))}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs transition active:scale-95 border border-emerald-500"
              title="Abrir Loja Online com Sacola (Visão do Cliente)"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Loja</span>
            </button>
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

            {/* PWA Install Button with Rx Icon */}
            <PWAInstallButton variant="header" />

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
      <div className="bg-[#F4EFE6] md:bg-[#1F2919]/95 border-t border-[#E5DDD0] md:border-[#3A4A30] px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          
          {/* 1. Criar o Bazar (Edições) */}
          <button
            onClick={() => {
              setEditionModalMode('list');
              setShowEditionModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#CAD7BE] md:hover:text-white md:hover:bg-[#3A452F]"
            title="Criar novo bazar ou alternar edições"
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#28381E] md:bg-emerald-800 md:text-emerald-100">1</span>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 md:text-emerald-400" />
            <span className="font-bold">Bazar: <span className="font-normal opacity-90">{activeEditionName}</span></span>
          </button>

          {/* 2. Produtos (Estoque e Margens) */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#33412A] md:bg-black/25 md:text-[#CAD7BE]">2</span>
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Produtos</span>
          </button>

          {/* 3. Vendas e Clientes */}
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'sales'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#33412A] md:bg-black/25 md:text-[#CAD7BE]">3</span>
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Vendas</span>
          </button>

          {/* 4. Vitrine */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#22543D] md:bg-black/25 md:text-emerald-300">4</span>
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 md:text-emerald-400" />
            <span>Vitrine</span>
          </button>

          {/* 5. Relatórios e Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' || activeTab === 'reports'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#33412A] md:bg-black/25 md:text-[#CAD7BE]">5</span>
            <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Relatórios</span>
          </button>

          {/* 6. Dados da Loja */}
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'store'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#33412A] md:bg-black/25 md:text-[#CAD7BE]">6</span>
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Dados da Loja</span>
          </button>

          {/* 7. Manual de Uso */}
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#D8C7AC] md:hover:text-white md:hover:bg-[#3A452F]'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#33412A] md:bg-black/25 md:text-[#CAD7BE]">7</span>
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Manual de Uso</span>
          </button>

          {/* 8. Próximos Passos */}
          <button
            onClick={() => setActiveTab('next_steps')}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 relative ${
              activeTab === 'next_steps'
                ? 'bg-[#4A5D3B] text-white shadow-md shadow-[#4A5D3B]/40 font-bold ring-1 ring-[#8FA079]'
                : 'text-[#4F5D42] hover:text-[#1F2919] hover:bg-[#EBE4D6] md:text-[#CAD7BE] md:hover:text-white md:hover:bg-[#3A452F] font-semibold'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#DDD3C2] text-[#78350F] md:bg-black/25 md:text-amber-300">8</span>
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 md:text-amber-300" />
            <span>Próximos Passos</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 md:bg-amber-400 animate-pulse" />
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
