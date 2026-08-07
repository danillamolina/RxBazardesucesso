import { Product, Sale, BazarEdition } from '../types';

export interface BazarBackupData {
  version: string;
  exportedAt: string;
  products: Product[];
  sales: Sale[];
  editions: BazarEdition[];
  activeEditionId?: string;
}

/**
 * Exports all Bazar data to a JSON file download
 */
export function exportBazarData(
  products: Product[],
  sales: Sale[],
  editions: BazarEdition[],
  activeEditionId: string
) {
  const backup: BazarBackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    products,
    sales,
    editions,
    activeEditionId,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bazar_sucesso_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports backup JSON file
 */
export function importBazarDataFromFile(
  file: File,
  onSuccess: (data: BazarBackupData) => void,
  onError: (errorMsg: string) => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Arquivo de backup inválido.');
      }

      if (!Array.isArray(parsed.products) || !Array.isArray(parsed.sales)) {
        throw new Error('O arquivo selecionado não contém uma estrutura válida do Bazar (faltam produtos/vendas).');
      }

      onSuccess({
        version: parsed.version || '1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        products: parsed.products,
        sales: parsed.sales,
        editions: Array.isArray(parsed.editions) ? parsed.editions : [],
        activeEditionId: parsed.activeEditionId || 'all',
      });
    } catch (err: any) {
      onError(err.message || 'Erro ao processar arquivo de backup.');
    }
  };

  reader.onerror = () => {
    onError('Erro de leitura do arquivo. Tente novamente.');
  };

  reader.readAsText(file);
}
