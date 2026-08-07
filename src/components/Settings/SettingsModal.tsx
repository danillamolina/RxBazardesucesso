import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileText, 
  Printer, 
  RefreshCw, 
  Trash2,
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database,
  FileSpreadsheet,
  PieChart,
  ShoppingBag,
  PackageCheck
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { exportBazarData, importBazarDataFromFile } from '../../utils/backup';
import { generateStockPdf, generateSalesPdf, generateExecutiveSummaryPdf } from '../../utils/pdfGenerator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    sales, 
    editions, 
    activeEditionId, 
    stockMetrics, 
    financialSummary,
    importAllData,
    resetToInitialData,
    clearAllData
  } = useBazar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const activeEditionName = activeEditionId === 'all'
    ? 'Todas as Edições'
    : editions.find(e => e.id === activeEditionId)?.name || 'Edição Atual';

  // Export JSON Backup
  const handleExportData = () => {
    try {
      exportBazarData(products, sales, editions, activeEditionId);
      setNotification({
        type: 'success',
        message: 'Backup exportado com sucesso! O arquivo JSON foi baixado para seu dispositivo.',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Erro ao exportar o backup. Tente novamente.',
      });
    }
  };

  // Trigger file select for import
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  // Handle file import change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importBazarDataFromFile(
      file,
      (importedData) => {
        if (confirm(`Atenção: A importação substituirá os dados atuais por ${importedData.products.length} produtos e ${importedData.sales.length} vendas. Deseja continuar?`)) {
          importAllData(importedData);
          setNotification({
            type: 'success',
            message: `Dados importados com sucesso! (${importedData.products.length} produtos, ${importedData.sales.length} vendas)`,
          });
          setTimeout(() => setNotification(null), 6000);
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      (errorMsg) => {
        setNotification({
          type: 'error',
          message: errorMsg,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  // Handle Reset to Example Data
  const handleResetData = () => {
    if (confirm('Tem certeza que deseja restaurar os dados de exemplo do Bazar? Todas as alterações não salvas serão substituídas.')) {
      resetToInitialData();
      setNotification({
        type: 'success',
        message: 'Dados de exemplo restaurados com sucesso.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handle Clear All Data
  const handleClearAllData = () => {
    if (confirm('ATENÇÃO: Deseja REALMENTE limpar todos os dados do sistema (zerar catálogo de produtos e histórico de vendas)? Essa ação é irreversível.')) {
      clearAllData();
      setNotification({
        type: 'success',
        message: 'Todos os produtos e vendas foram zerados com sucesso!',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // PDF Generators
  const handleGenerateStockPdf = () => {
    generateStockPdf(products, stockMetrics, activeEditionName);
  };

  const handleGenerateSalesPdf = () => {
    generateSalesPdf(sales, activeEditionName);
  };

  const handleGenerateSummaryPdf = () => {
    generateExecutiveSummaryPdf(products, sales, stockMetrics, financialSummary, editions, activeEditionName);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-2xl border border-rose-500/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Configurações & Relatórios
              </h2>
              <p className="text-xs text-slate-400">
                Exportar/Importar Backup de Dados & Gerar PDFs Oficiais do Bazar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-100">
          
          {/* Notification Alert Banner */}
          {notification && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs sm:text-sm font-medium">{notification.message}</div>
            </div>
          )}

          {/* SECTION 1: PDF REPORT GENERATION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Printer className="h-4 w-4 text-rose-500" />
                Emissão de Relatórios em PDF
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Filtro: {activeEditionName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* PDF 1: Estoque & Produtos */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-500/50 transition">
                <div>
                  <div className="w-10 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-3">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    PDF do Estoque / Bazar
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Lista completa dos {products.length} produtos em estoque, valores de custo, preço bazar, margens e total investido.
                  </p>
                </div>
                <button
                  onClick={handleGenerateStockPdf}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  <span>Gerar PDF do Estoque</span>
                </button>
              </div>

              {/* PDF 2: Relatório de Vendas */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-500/50 transition">
                <div>
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    PDF de Relatório de Vendas
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Detalhamento dos {sales.length} pedidos de clientes com itens, valores pagos, saldo fiado e meio de pagamento.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSalesPdf}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Gerar PDF de Vendas</span>
                </button>
              </div>

              {/* PDF 3: Resumo Executivo */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-500/50 transition">
                <div>
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-3">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    PDF do Resumo Executivo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Balanço gerencial consolidado com faturamento, lucro líquido real, CMV, fiado pendente e indicadores gerais.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSummaryPdf}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  <span>Gerar PDF do Resumo</span>
                </button>
              </div>

            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* SECTION 2: EXPORT & IMPORT BACKUP */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-500" />
              Backup & Transferência de Dados (JSON)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Export Backup Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Download className="h-5 w-5 text-sky-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Exportar Dados (Backup)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Gere um arquivo de segurança no formato <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[11px]">.json</code> contendo todo o seu catálogo, estoque, histórico de vendas e edições.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar Arquivo de Backup</span>
                </button>
              </div>

              {/* Import Backup Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="h-5 w-5 text-amber-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Importar / Restaurar Dados
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Selecione um arquivo de backup <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[11px]">.json</code> gerado previamente para restaurar produtos e vendas neste dispositivo.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />

                <button
                  onClick={handleTriggerImport}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Upload className="h-4 w-4" />
                  <span>Selecionar Arquivo Backup (.json)</span>
                </button>
              </div>

            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* SECTION 3: SYSTEM ACTIONS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-rose-500" />
              Ações de Sistema & Reset
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Clear All Data */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Limpar Todos os Dados (Zerar)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Apaga permanentemente todo o estoque de produtos e histórico de vendas para iniciar um novo Bazar do zero.
                  </p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Limpar Todos os Dados</span>
                </button>
              </div>

              {/* Reset to Example Data */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RefreshCw className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Restaurar Dados de Exemplo
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Substitui os dados atuais pelos produtos e vendas demonstrativos de exemplo.
                  </p>
                </div>
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Restaurar Exemplo</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Dados armazenados localmente e seguros</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
