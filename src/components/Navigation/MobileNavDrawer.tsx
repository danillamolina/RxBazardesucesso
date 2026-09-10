import React from 'react';
import {
  X,
  Sparkles,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Share2,
  TrendingUp,
  Store,
  BookOpen,
  Compass,
  Calendar,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onOpenSettings: () => void;
  onOpenEditionModal: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenNewSale,
  onOpenNewProduct,
  onOpenSettings,
  onOpenEditionModal,
}) => {
  const { editions, activeEditionId } = useBazar();

  if (!isOpen) return null;

  const activeEditionName = activeEditionId === 'all' 
    ? 'Todas as Edições' 
    : editions.find(e => e.id === activeEditionId)?.name || 'Edição Atual';

  const menuItems = [
    {
      id: 'dashboard',
      num: 1,
      name: 'Dashboard',
      subtitle: 'Resumo geral em tempo real, lucro realizado e faturamento',
      icon: LayoutDashboard,
      color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
      badge: null,
    },
    {
      id: 'inventory',
      num: 2,
      name: 'Estoque e Margens',
      subtitle: 'Fotos nítidas, custos reais e cálculo automático da margem de lucro',
      icon: Package,
      color: 'text-amber-700 bg-amber-100 border-amber-200',
      badge: '⭐ Cadastre 1º aqui',
    },
    {
      id: 'sales',
      num: 3,
      name: 'Vendas e Clientes',
      subtitle: 'Caixa ágil com baixa automática de estoque, fiado e clientes',
      icon: ShoppingCart,
      color: 'text-blue-700 bg-blue-100 border-blue-200',
      badge: null,
    },
    {
      id: 'catalog',
      num: 4,
      name: 'Vitrine',
      subtitle: 'Catálogo de fotos com preços De/Por e mensagens prontas para WhatsApp',
      icon: Share2,
      color: 'text-rose-700 bg-rose-100 border-rose-200',
      badge: 'WhatsApp',
    },
    {
      id: 'reports',
      num: 5,
      name: 'Relatórios',
      subtitle: 'Apuração detalhada de lucro líquido real, comissão e gráficos',
      icon: TrendingUp,
      color: 'text-purple-700 bg-purple-100 border-purple-200',
      badge: null,
    },
    {
      id: 'store',
      num: 6,
      name: 'Dados da Loja',
      subtitle: 'Sua chave PIX, telefone de atendimento WhatsApp e perfil do Instagram',
      icon: Store,
      color: 'text-teal-700 bg-teal-100 border-teal-200',
      badge: 'PIX',
    },
    {
      id: 'guide',
      num: 7,
      name: 'Manual de Uso',
      subtitle: 'Passo a passo didático, checklist pré-bazar e download em PDF impresso',
      icon: BookOpen,
      color: 'text-lime-800 bg-lime-100 border-lime-200',
      badge: 'Didático',
    },
    {
      id: 'next_steps',
      num: 8,
      name: 'Próximos Passos',
      subtitle: 'Cursos oficiais, consultoria financeira individual e mentoria VIP com Danilla',
      icon: Compass,
      color: 'text-amber-800 bg-amber-100 border-amber-200',
      badge: 'Cursos & Mentoria',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* Slide-up Container */}
      <div className="w-full max-w-xl mx-auto bg-[#FAF8F5] border-t-2 border-[#8FA079] rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-[#2B3323] animate-slideUp">
        
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-[#D8C7AC] rounded-full mx-auto mt-3 shrink-0" />

        {/* Drawer Header */}
        <div className="px-5 pt-3 pb-4 border-b border-[#E8E0D2] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8FA079]/20 rounded-xl text-[#4A5D3B]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1F2919] tracking-tight">
                Menu de Navegação do App
              </h3>
              <p className="text-xs text-[#6A785E]">
                Todas as 8 abas na ordem ideal de uso
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-[#6A785E] hover:text-[#1F2919] bg-[#F2EDE2] hover:bg-[#EAE2D3] rounded-full transition"
            title="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bazar Selector Box */}
        <div className="px-5 py-3 bg-[#F4EFE6] border-b border-[#E8E0D2] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="h-4 w-4 text-[#8A7962] shrink-0" />
            <span className="text-xs text-[#6A785E]">Bazar Atual:</span>
            <span className="text-xs font-bold text-[#1F2919] truncate bg-white border border-[#DDD3C2] px-2.5 py-0.5 rounded-md shadow-xs">
              {activeEditionName}
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenEditionModal();
            }}
            className="text-[11px] font-bold text-[#3A5D28] hover:text-[#254217] underline shrink-0"
          >
            Trocar / Novo Bazar
          </button>
        </div>

        {/* Didactic Tip Banner */}
        <div className="px-5 py-2.5 bg-[#FEF9EE] border-b border-[#F5E6B8] flex items-start gap-2.5 text-xs text-[#78350F] shrink-0">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong className="text-amber-800 font-extrabold">Dica da Danilla:</strong> Cadastre suas peças no <strong>Estoque</strong> antes de abrir o evento. Facilita todo o processo!
          </p>
        </div>

        {/* Scrollable Tabs List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-[#E8EFE2] text-[#1F2919] border-2 border-[#8FA079] shadow-sm ring-1 ring-[#8FA079]'
                    : 'bg-white hover:bg-[#F5F0E6] text-[#2B3323] border-[#E5DDD0] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#4A5D3B]">
                        {item.num}.
                      </span>
                      <h4 className="text-sm font-bold text-[#1F2919]">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-[#4A5A3D]' : 'text-[#667258]'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className={`h-4 w-4 shrink-0 transition ${isActive ? 'text-[#3A5D28]' : 'text-[#8FA079]'}`} />
              </button>
            );
          })}
        </div>

        {/* Quick Action Footer inside Drawer */}
        <div className="p-4 bg-white border-t border-[#E8E0D2] grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenNewSale();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#8FA079] hover:bg-[#7D9068] text-[#1F2919] font-black rounded-xl text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Venda</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewProduct();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#F2EDE2] hover:bg-[#EAE2D3] text-[#2B3323] font-bold rounded-xl text-xs border border-[#DDD3C2] transition active:scale-95 shadow-xs"
          >
            <Package className="h-4 w-4 text-[#576945]" />
            <span>+ Novo Produto</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F2EDE2] text-[#556348] hover:text-[#1F2919] font-medium rounded-xl text-xs border border-[#E0D7C6] transition"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações, Backup & Relatórios em PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
