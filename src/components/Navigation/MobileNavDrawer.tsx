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
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      badge: null,
    },
    {
      id: 'inventory',
      num: 2,
      name: 'Estoque e Margens',
      subtitle: 'Fotos nítidas, custos reais e cálculo automático da margem de lucro',
      icon: Package,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
      badge: '⭐ Cadastre 1º aqui',
    },
    {
      id: 'sales',
      num: 3,
      name: 'Vendas e Clientes',
      subtitle: 'Caixa ágil com baixa automática de estoque, fiado e clientes',
      icon: ShoppingCart,
      color: 'text-blue-400 bg-blue-950/60 border-blue-800/40',
      badge: null,
    },
    {
      id: 'catalog',
      num: 4,
      name: 'Vitrine',
      subtitle: 'Catálogo de fotos com preços De/Por e mensagens prontas para WhatsApp',
      icon: Share2,
      color: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
      badge: 'WhatsApp',
    },
    {
      id: 'reports',
      num: 5,
      name: 'Relatórios',
      subtitle: 'Apuração detalhada de lucro líquido real, comissão e gráficos',
      icon: TrendingUp,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
      badge: null,
    },
    {
      id: 'store',
      num: 6,
      name: 'Dados da Loja',
      subtitle: 'Sua chave PIX, telefone de atendimento WhatsApp e perfil do Instagram',
      icon: Store,
      color: 'text-teal-400 bg-teal-950/60 border-teal-800/40',
      badge: 'PIX',
    },
    {
      id: 'guide',
      num: 7,
      name: 'Manual de Uso',
      subtitle: 'Passo a passo didático, checklist pré-bazar e download em PDF impresso',
      icon: BookOpen,
      color: 'text-lime-400 bg-lime-950/60 border-lime-800/40',
      badge: 'Didático',
    },
    {
      id: 'next_steps',
      num: 8,
      name: 'Próximos Passos',
      subtitle: 'Cursos oficiais, consultoria financeira individual e mentoria VIP com Danilla',
      icon: Compass,
      color: 'text-amber-300 bg-amber-900/60 border-amber-700/40',
      badge: 'Cursos & Mentoria',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* Slide-up Container */}
      <div className="w-full max-w-xl mx-auto bg-[#1F2919] border-t-2 border-[#576945] rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-white animate-slideUp">
        
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-[#576945] rounded-full mx-auto mt-3 shrink-0" />

        {/* Drawer Header */}
        <div className="px-5 pt-3 pb-4 border-b border-[#3A4A30] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8FA079]/20 rounded-xl text-[#8FA079]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Menu de Navegação do App
              </h3>
              <p className="text-xs text-[#D8C7AC]">
                Todas as 8 abas na ordem ideal de uso
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-[#D8C7AC] hover:text-white bg-[#3A452F] hover:bg-[#465437] rounded-full transition"
            title="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bazar Selector Box */}
        <div className="px-5 py-3 bg-[#172013] border-b border-[#3A4A30] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="h-4 w-4 text-[#C2AD8E] shrink-0" />
            <span className="text-xs text-[#D8C7AC]">Bazar Atual:</span>
            <span className="text-xs font-bold text-white truncate bg-[#3A452F] px-2 py-0.5 rounded-md">
              {activeEditionName}
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenEditionModal();
            }}
            className="text-[11px] font-bold text-[#8FA079] hover:text-[#A3B48D] underline shrink-0"
          >
            Trocar / Novo Bazar
          </button>
        </div>

        {/* Didactic Tip Banner */}
        <div className="px-5 py-2.5 bg-[#FAF7F2]/10 border-b border-[#3A4A30] flex items-start gap-2.5 text-xs text-[#D8C7AC] shrink-0">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong className="text-amber-300">Dica da Danilla:</strong> Cadastre suas peças no <strong>Estoque</strong> antes de abrir o evento. Facilita todo o processo!
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
                    ? 'bg-[#4A5D3B] text-white border-[#8FA079] shadow-lg shadow-[#4A5D3B]/40 ring-1 ring-[#8FA079]'
                    : 'bg-[#2A3722]/80 hover:bg-[#3A452F] text-[#D8C7AC] border-[#3A4A30]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#8FA079]">
                        {item.num}.
                      </span>
                      <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-100'}`}>
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#CAD7BE] mt-0.5 leading-tight">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className={`h-4 w-4 shrink-0 transition ${isActive ? 'text-white' : 'text-[#8FA079]'}`} />
              </button>
            );
          })}
        </div>

        {/* Quick Action Footer inside Drawer */}
        <div className="p-4 bg-[#172013] border-t border-[#3A4A30] grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenNewSale();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-black rounded-xl text-xs shadow-md transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Venda</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewProduct();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#3A452F] hover:bg-[#465437] text-white font-bold rounded-xl text-xs border border-[#576945] transition active:scale-95"
          >
            <Package className="h-4 w-4 text-[#CAD7BE]" />
            <span>+ Novo Produto</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2A3722] hover:bg-[#3A452F] text-[#CAD7BE] hover:text-white font-medium rounded-xl text-xs border border-[#3A4A30] transition"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações, Backup & Relatórios em PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
