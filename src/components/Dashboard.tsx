import React from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShoppingCart, 
  ArrowUpRight, 
  Plus, 
  Tag, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Compass,
  BookOpen
} from 'lucide-react';
import { useBazar } from '../context/BazarContext';
import { formatCurrency, formatPercent, formatDateShort, getPaymentStatusLabel } from '../utils/formatters';

interface DashboardProps {
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewSale,
  onOpenNewProduct,
  onNavigateTab,
}) => {
  const { 
    products, 
    sales, 
    stockMetrics, 
    financialSummary, 
    adjustStock,
    updateSaleStatus
  } = useBazar();

  // Low stock products (< 3 items)
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 3);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  // Recent 5 sales
  const recentSales = [...sales].slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#576945] border border-[#3A4A30] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8FA079] via-[#CAD7BE] to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8FA079]/30 border border-[#8FA079]/40 text-[#E5EBDE] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Painel de Controle em Tempo Real
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Resumo do Rx do Bazar de Sucesso 🛍️
            </h2>
            <p className="text-[#D8C7AC] text-sm max-w-2xl leading-relaxed">
              Acompanhe seu estoque atualizado, margem de lucro por peça, clientes e o faturamento real das suas vendas em um único lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenNewSale}
              className="bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-[#8FA079]/20 flex items-center gap-2 transition active:scale-95 text-xs sm:text-sm"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Registrar Venda</span>
            </button>
            <button
              onClick={() => onNavigateTab('guide')}
              className="bg-[#3A452F] hover:bg-[#465437] text-white font-bold px-3.5 py-2.5 rounded-2xl border border-[#576945] flex items-center gap-2 transition shadow-md text-xs sm:text-sm"
              title="Abrir Guia e Manual Prático"
            >
              <BookOpen className="h-4 w-4 text-[#CAD7BE]" />
              <span>Manual de Uso</span>
            </button>
            <button
              onClick={() => onNavigateTab('next_steps')}
              className="bg-[#3A452F] hover:bg-[#465437] text-white font-bold px-3.5 py-2.5 rounded-2xl border border-[#576945] flex items-center gap-2 transition shadow-md text-xs sm:text-sm"
            >
              <Compass className="h-4 w-4 text-amber-300" />
              <span>Próximos Passos</span>
            </button>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="bg-[#3A452F]/70 hover:bg-[#3A452F] text-[#D8C7AC] font-medium px-3.5 py-2.5 rounded-2xl border border-[#576945] flex items-center gap-2 transition text-xs sm:text-sm"
            >
              <Tag className="h-4 w-4 text-[#CAD7BE]" />
              <span>Ver Vitrine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Lucro & Faturamento das Vendas
          </h3>
          <button 
            onClick={() => onNavigateTab('reports')} 
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
          >
            <span>Ver Relatório Completo</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Realized Profit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Lucro Realizado (Pago)</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(financialSummary.totalNetProfitRealized)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">{formatPercent(financialSummary.averageMarginPercent)}</span>
              <span>margem média sobre o custo</span>
            </p>
          </div>

          {/* Paid Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Recebido</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(financialSummary.totalRevenuePaid)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {financialSummary.paidSalesCount} venda(s) com pagamento confirmado
            </p>
          </div>

          {/* Pending Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pendente / A Receber</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(financialSummary.totalRevenuePending)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {financialSummary.pendingSalesCount} venda(s) reservadas ou no fiado
            </p>
          </div>

          {/* Potential Profit in Remaining Stock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Lucro Projetado do Estoque</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {formatCurrency(stockMetrics.totalPotentialProfit)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Se vender todos os {stockMetrics.totalItemsInStock} itens restantes
            </p>
          </div>

        </div>
      </div>

      {/* Realtime Inventory Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Estoque Disponível em Tempo Real
          </h3>
          <button 
            onClick={() => onNavigateTab('inventory')} 
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
          >
            <span>Gerenciar Todos os Produtos ({stockMetrics.totalProductsCount})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Itens em Estoque</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stockMetrics.totalItemsInStock} un.
            </div>
            <span className="text-[11px] text-slate-400">{stockMetrics.totalProductsCount} produtos cadastrados</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Investimento Total (Custo)</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(stockMetrics.totalCostValue)}
            </div>
            <span className="text-[11px] text-slate-400">Custo do estoque disponível</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Potencial de Venda (Bazar)</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(stockMetrics.totalBazarValue)}
            </div>
            <span className="text-[11px] text-slate-400">Valor total a preço de bazar</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alertas de Estoque</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-bold ${stockMetrics.lowStockItemsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stockMetrics.lowStockItemsCount} baixo
              </span>
              <span className="text-slate-400">/</span>
              <span className={`text-xl font-bold ${stockMetrics.outOfStockItemsCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {stockMetrics.outOfStockItemsCount} esgotado
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Atenção para repor peças</span>
          </div>

        </div>
      </div>

      {/* Two Column Layout: Low Stock Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Low Stock Alerts Section */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Alerta de Estoque Baixo & Zerados</h4>
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length + outOfStockProducts.length} itens
              </span>
            </div>

            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium">Estoque saudável! Todos os produtos estão com boas quantidades.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 notranslate" translate="no">
                {outOfStockProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    translate="no"
                    className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs notranslate"
                  >
                    <div className="truncate pr-2 notranslate" translate="no">
                      <p className="font-bold text-rose-900 dark:text-rose-200 truncate notranslate" translate="no">{prod.name}</p>
                      <p className="text-rose-700 dark:text-rose-400 mt-0.5 notranslate" translate="no">Esgotado (0 un) • {formatCurrency(prod.bazarPrice)}</p>
                    </div>
                    <button
                      onClick={() => adjustStock(prod.id, 1)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0"
                      title="Adicionar +1 unidade"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+1</span>
                    </button>
                  </div>
                ))}

                {lowStockProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    translate="no"
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs notranslate"
                  >
                    <div className="truncate pr-2 notranslate" translate="no">
                      <p className="font-bold text-amber-900 dark:text-amber-200 truncate notranslate" translate="no">{prod.name}</p>
                      <p className="text-amber-700 dark:text-amber-400 mt-0.5 notranslate" translate="no">Restam apenas {prod.quantity} un. • {formatCurrency(prod.bazarPrice)}</p>
                    </div>
                    <button
                      onClick={() => adjustStock(prod.id, 1)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0"
                      title="Adicionar +1 unidade"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+1</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={onOpenNewProduct}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Novo Produto
            </button>
          </div>
        </div>

        {/* Right: Recent Sales List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Últimas Vendas Registradas</h4>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Ver Todas as Vendas ({sales.length})
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <p>Nenhuma venda registrada ainda no bazar.</p>
              <button
                onClick={onOpenNewSale}
                className="mt-3 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Registrar Primeira Venda
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => {
                const statusBadge = getPaymentStatusLabel(sale.paymentStatus);
                return (
                  <div
                    key={sale.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {sale.customerName}
                        </span>
                        {sale.customerPhone && (
                          <span className="text-xs text-slate-400 flex items-center gap-0.5">
                            <PhoneCall className="h-3 w-3" />
                            {sale.customerPhone}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 notranslate" translate="no">
                        {sale.quantitySold}x <span className="font-medium text-slate-900 dark:text-slate-100 notranslate" translate="no">{sale.productName}</span>
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{formatDateShort(sale.saleDate)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Lucro: {formatCurrency(sale.netProfit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white text-base">
                          {formatCurrency(sale.totalAmount)}
                        </div>
                      </div>

                      {/* Quick Status Toggle */}
                      <select
                        value={sale.paymentStatus}
                        onChange={(e) => updateSaleStatus(sale.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${statusBadge.bgClass} ${statusBadge.colorClass} ${statusBadge.borderClass}`}
                      >
                        <option value="pago">🟢 Pago</option>
                        <option value="pendente">🟡 Pendente</option>
                        <option value="fiado">🔵 Fiado</option>
                        <option value="cancelado">🔴 Cancelado</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick Guide & Support Callout */}
      <div className="bg-white dark:bg-[#242F1E] border border-slate-200 dark:border-[#3A4A30] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#8FA079]/20 text-[#2B3323] dark:text-[#CAD7BE] rounded-2xl border border-[#8FA079]/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Precisa de ajuda ou quer tirar dúvidas sobre o sistema?
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#D8C7AC]">
              Acesse o Manual de Uso Prático com checklist do evento, dicas de fotos e fluxo passo a passo.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('guide')}
          className="bg-[#3A452F] hover:bg-[#4A5D3B] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-[#576945] transition shadow-sm whitespace-nowrap shrink-0"
        >
          Abrir Manual de Uso
        </button>
      </div>

    </div>
  );
};
