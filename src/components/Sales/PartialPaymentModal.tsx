import React, { useState } from 'react';
import { X, DollarSign, Wallet, CheckCircle } from 'lucide-react';
import { Sale, PaymentMethod } from '../../types';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency } from '../../utils/formatters';

interface PartialPaymentModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const { addPartialPayment } = useBazar();
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');

  if (!isOpen || !sale) return null;

  const currentPaid = sale.amountPaid || 0;
  const currentRemaining = sale.remainingBalance ?? (sale.totalAmount - currentPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'number' ? amount : 0;
    if (numAmount <= 0) {
      alert('Informe um valor de pagamento válido maior que R$ 0,00.');
      return;
    }
    if (numAmount > currentRemaining) {
      if (!confirm(`O valor de ${formatCurrency(numAmount)} é maior que o saldo restante de ${formatCurrency(currentRemaining)}. Deseja registrar mesmo assim?`)) {
        return;
      }
    }

    addPartialPayment(sale.id, numAmount, paymentMethod, notes.trim() || undefined);
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-900 dark:text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Registrar Pagamento Parcial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cliente: <strong className="text-slate-800 dark:text-slate-200">{sale.customerName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sale Summary Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 mb-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Produto:</span>
            <strong className="text-slate-900 dark:text-white font-bold">{sale.quantitySold}x {sale.productName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Valor Total da Venda:</span>
            <strong className="text-slate-900 dark:text-white">{formatCurrency(sale.totalAmount)}</strong>
          </div>
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Já Pago:</span>
            <span>{formatCurrency(currentPaid)}</span>
          </div>
          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-extrabold text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Saldo Restante Pendente:</span>
            <span>{formatCurrency(currentRemaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Valor Recebido Agora (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder={`ex: ${currentRemaining > 0 ? currentRemaining.toFixed(2) : '50.00'}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Forma do Pagamento *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro em Espécie</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="promissoria">Fiado / Promissória</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Observação ou Referência
            </label>
            <input
              type="text"
              placeholder="ex: Sinal / 1ª Parcela do Bazar"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Confirmar Recebimento</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
