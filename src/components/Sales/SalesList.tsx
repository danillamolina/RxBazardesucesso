import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  DollarSign,
  User,
  Calendar,
  ExternalLink,
  Edit3,
  Wallet,
  Users,
  Send,
  CreditCard,
  MapPin,
  Truck
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Sale, PaymentStatus, PaymentMethod } from '../../types';
import { 
  formatCurrency, 
  formatDate, 
  getPaymentStatusLabel, 
  getPaymentMethodLabel,
  createWhatsAppReceiptFromSale,
  createWhatsAppCustomerSummaryLink
} from '../../utils/formatters';
import { PartialPaymentModal } from './PartialPaymentModal';
import { EditSaleModal } from './EditSaleModal';

interface SalesListProps {
  onOpenNewSale: () => void;
}

export const SalesList: React.FC<SalesListProps> = ({ onOpenNewSale }) => {
  const { sales, updateSaleStatus, deleteSale } = useBazar();

  const [viewMode, setViewMode] = useState<'vendas' | 'clientes'>('vendas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'todos'>('todos');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'todos'>('todos');

  // Modals state
  const [saleToPayPartially, setSaleToPayPartially] = useState<Sale | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerPhone && s.customerPhone.includes(search)) ||
      (s.customerNotes && s.customerNotes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || s.paymentStatus === statusFilter;
    const matchesMethod = methodFilter === 'todos' || s.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Group sales by customer for the Customer Summary view
  const customersGrouped = React.useMemo(() => {
    const map = new Map<string, Sale[]>();
    filteredSales.forEach((s) => {
      const key = s.customerName.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });

    return Array.from(map.entries()).map(([_, cSales]) => {
      const customerName = cSales[0].customerName;
      const phone = cSales.find(s => s.customerPhone)?.customerPhone;
      const address = cSales.find(s => s.customerAddress)?.customerAddress;
      const deliveryMethod = cSales.find(s => s.deliveryMethod)?.deliveryMethod;
      const notes = cSales.find(s => s.customerNotes)?.customerNotes;
      const totalSpent = cSales.reduce((acc, s) => acc + s.totalAmount, 0);
      const totalPaid = cSales.reduce((acc, s) => {
        if (s.paymentStatus === 'pago') return acc + s.totalAmount;
        return acc + (s.amountPaid || 0);
      }, 0);
      const totalRemaining = cSales.reduce((acc, s) => {
        if (s.paymentStatus === 'pago' || s.paymentStatus === 'cancelado') return acc;
        return acc + (s.remainingBalance ?? (s.totalAmount - (s.amountPaid || 0)));
      }, 0);

      return {
        customerName,
        phone,
        address,
        deliveryMethod,
        notes,
        salesCount: cSales.length,
        totalSpent,
        totalPaid,
        totalRemaining,
        cSales,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredSales]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-500" />
            Vendas, Clientes & Parcelamento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Envie o recibo do pedido total por WhatsApp e gerencie parcelamentos com clareza
          </p>
        </div>

        <button
          onClick={onOpenNewSale}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nova Venda</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800/70 p-1.5 rounded-2xl w-fit border border-slate-300/60 dark:border-slate-700">
        <button
          onClick={() => setViewMode('vendas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            viewMode === 'vendas'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Lista de Vendas ({filteredSales.length})</span>
        </button>

        <button
          onClick={() => setViewMode('clientes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            viewMode === 'clientes'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Extrato por Cliente ({customersGrouped.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">🟢 Pago (Confirmado)</option>
              <option value="parcial">🟧 Pagamento Parcial</option>
              <option value="pendente">🟡 Pendente (Aguardando)</option>
              <option value="fiado">🔵 Fiado / A Receber</option>
              <option value="cancelado">🔴 Cancelado</option>
            </select>
          </div>

          {/* Method Filter Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="todos">Todas as Formas</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="promissoria">Fiado / Promissória</option>
            </select>
          </div>

        </div>
      </div>

      {/* Mode 1: Individual Sales List */}
      {viewMode === 'vendas' && (
        <>
          {filteredSales.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
              <ShoppingCart className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhuma venda encontrada</p>
              <p className="text-xs mt-1">Não encontramos vendas para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => {
                const statusBadge = getPaymentStatusLabel(sale.paymentStatus);
                const waReceiptLink = createWhatsAppReceiptFromSale(sale);
                const isPartial = sale.paymentStatus === 'parcial' || (sale.amountPaid !== undefined && sale.amountPaid > 0 && sale.remainingBalance !== undefined && sale.remainingBalance > 0);

                const hasInstallments = sale.installmentsCount && sale.installmentsCount > 1;
                const instVal = sale.installmentValue || (sale.totalAmount / (sale.installmentsCount || 1));

                return (
                  <div
                    key={sale.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition hover:shadow-md space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Customer & Product Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white text-base">
                            {sale.customerName}
                          </span>

                          {sale.customerPhone && (
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                              <PhoneCall className="h-3 w-3 text-emerald-500" />
                              {sale.customerPhone}
                            </span>
                          )}

                          {sale.deliveryMethod && (
                            <span className="text-xs bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-sky-200 dark:border-sky-800">
                              <Truck className="h-3 w-3 text-sky-500" />
                              {sale.deliveryMethod}
                            </span>
                          )}

                          {sale.customerAddress && (
                            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                              <MapPin className="h-3 w-3 text-emerald-500" />
                              {sale.customerAddress}
                            </span>
                          )}

                          {sale.customerNotes && (
                            <span className="text-xs text-slate-400 italic">
                              • {sale.customerNotes}
                            </span>
                          )}
                        </div>

                        {sale.items && sale.items.length > 0 ? (
                          <div className="space-y-1 my-1">
                            <span className="text-xs text-slate-500 font-semibold block">Produtos no Pedido ({sale.items.length}):</span>
                            <ul className="text-xs space-y-0.5 pl-2 border-l-2 border-emerald-500/40">
                              {sale.items.map((item, idx) => (
                                <li key={idx} className="text-slate-800 dark:text-slate-200">
                                  <strong className="font-bold">{item.quantitySold}x</strong> {item.productName} ({formatCurrency(item.unitBazarPrice)} un.) = <span className="font-bold">{formatCurrency(item.quantitySold * item.unitBazarPrice)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Item: <strong className="text-slate-900 dark:text-white">{sale.quantitySold}x {sale.productName}</strong>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(sale.saleDate)}
                          </span>
                          <span>•</span>
                          <span>Forma: <strong className="text-slate-700 dark:text-slate-300">{getPaymentMethodLabel(sale.paymentMethod)}</strong></span>
                          
                          {hasInstallments && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md font-bold text-[11px] border border-sky-200 dark:border-sky-800">
                              <CreditCard className="h-3 w-3" />
                              {sale.installmentsCount}x de {formatCurrency(instVal)}
                            </span>
                          )}

                          {sale.discount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-rose-500 font-bold">Desconto: {formatCurrency(sale.discount)}</span>
                            </>
                          )}
                        </div>

                        {/* Partial Payment Info Banner */}
                        {isPartial && (
                          <div className="mt-2 inline-flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                            <span>Pago: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.amountPaid || 0)}</strong></span>
                            <span>•</span>
                            <span>Falta: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(sale.remainingBalance ?? (sale.totalAmount - (sale.amountPaid || 0)))}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Right: Amounts & Interactive Payment Status */}
                      <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left md:text-right">
                          <div className="text-xs text-slate-400 font-medium">Valor Total</div>
                          <div className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(sale.totalAmount)}
                          </div>
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            Lucro: {formatCurrency(sale.netProfit)}
                          </div>
                        </div>

                        {/* Integrated Status Changer Dropdown */}
                        <div className="space-y-1 text-right">
                          <select
                            value={sale.paymentStatus}
                            onChange={(e) => updateSaleStatus(sale.id, e.target.value as any)}
                            className={`text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${statusBadge.bgClass} ${statusBadge.colorClass} ${statusBadge.borderClass}`}
                          >
                            <option value="pago">🟢 Pago</option>
                            <option value="parcial">🟧 Parcial</option>
                            <option value="pendente">🟡 Pendente</option>
                            <option value="fiado">🔵 Fiado</option>
                            <option value="cancelado">🔴 Cancelado</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {sale.customerPhone && (
                          <a
                            href={waReceiptLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition"
                            title="Enviar recibo completo deste pedido via WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Enviar Pedido pelo WhatsApp</span>
                            <ExternalLink className="h-3 w-3 opacity-80" />
                          </a>
                        )}

                        {/* Add Partial Payment Button */}
                        {sale.paymentStatus !== 'pago' && sale.paymentStatus !== 'cancelado' && (
                          <button
                            onClick={() => setSaleToPayPartially(sale)}
                            className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 transition"
                          >
                            <Wallet className="h-3.5 w-3.5" />
                            <span>+ Abater / Receber Parcial</span>
                          </button>
                        )}

                        {/* Edit Sale Button */}
                        <button
                          onClick={() => setSaleToEdit(sale)}
                          className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Alterar Venda</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Excluir este registro de venda? O estoque será devolvido automaticamente.')) {
                            deleteSale(sale.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition flex items-center gap-1 font-medium"
                        title="Excluir Venda"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Mode 2: Customer Summary Extrato */}
      {viewMode === 'clientes' && (
        <div className="space-y-6">
          {customersGrouped.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
              <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhuma cliente encontrada</p>
            </div>
          ) : (
            customersGrouped.map((c) => {
              const waSummaryLink = createWhatsAppCustomerSummaryLink(c.customerName, c.phone, c.cSales);

              return (
                <div
                  key={c.customerName}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  {/* Customer Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {c.customerName}
                        </span>
                        {c.phone && (
                          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                            <PhoneCall className="h-3 w-3" />
                            {c.phone}
                          </span>
                        )}
                        {c.deliveryMethod && (
                          <span className="text-xs bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-sky-200 dark:border-sky-800">
                            <Truck className="h-3 w-3 text-sky-500" />
                            {c.deliveryMethod}
                          </span>
                        )}
                        {c.notes && (
                          <span className="text-xs text-slate-400 italic">
                            ({c.notes})
                          </span>
                        )}
                      </div>
                      {c.address && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 pt-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span>Endereço de Entrega: <strong className="text-slate-800 dark:text-white">{c.address}</strong></span>
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        {c.salesCount} pedido(s) realizado(s) no Bazar
                      </p>
                    </div>

                    {/* WhatsApp Button for Total Customer Statement */}
                    {c.phone ? (
                      <a
                        href={waSummaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                        <span>Enviar Pedido Total pelo WhatsApp</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                      </a>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                        Sem telefone cadastrado para WhatsApp
                      </span>
                    )}
                  </div>

                  {/* Customer Financial Overview Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total das Compras</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(c.totalSpent)}
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Já Quitado</div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.totalPaid)}
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border ${
                      c.totalRemaining > 0
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                    }`}>
                      <div className={`text-[10px] font-bold uppercase ${c.totalRemaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        Saldo Devedor Pendente
                      </div>
                      <div className={`text-lg font-black ${c.totalRemaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {formatCurrency(c.totalRemaining)}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Pedidos Breakdown List */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Histórico de Pedidos desta Cliente:
                    </h4>
                    
                    <div className="space-y-2">
                      {c.cSales.map((s, idx) => {
                        const statusBadge = getPaymentStatusLabel(s.paymentStatus);
                        const hasInstallments = s.installmentsCount && s.installmentsCount > 1;
                        const instVal = s.installmentValue || (s.totalAmount / (s.installmentsCount || 1));

                        return (
                          <div
                            key={s.id}
                            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                <span>Pedido #{idx + 1} ({formatDate(s.saleDate)})</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge.bgClass} ${statusBadge.colorClass}`}>
                                  {statusBadge.label}
                                </span>
                              </div>

                              {s.items && s.items.length > 0 ? (
                                <ul className="text-slate-600 dark:text-slate-300 space-y-0.5">
                                  {s.items.map((it, iIdx) => (
                                    <li key={iIdx}>
                                      • {it.quantitySold}x {it.productName} ({formatCurrency(it.unitBazarPrice)})
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-slate-600 dark:text-slate-300">
                                  • {s.quantitySold}x {s.productName}
                                </div>
                              )}

                              {hasInstallments && (
                                <div className="text-sky-600 dark:text-sky-400 font-bold text-[11px] flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  Parcelado em {s.installmentsCount}x de {formatCurrency(instVal)}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
                              <span className="font-black text-sm text-slate-900 dark:text-white">
                                {formatCurrency(s.totalAmount)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSaleToEdit(s)}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline font-medium"
                                >
                                  Editar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <PartialPaymentModal
        sale={saleToPayPartially}
        isOpen={!!saleToPayPartially}
        onClose={() => setSaleToPayPartially(null)}
      />

      <EditSaleModal
        sale={saleToEdit}
        isOpen={!!saleToEdit}
        onClose={() => setSaleToEdit(null)}
      />

    </div>
  );
};
