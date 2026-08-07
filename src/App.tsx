/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BazarProvider } from './context/BazarContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/Inventory/ProductList';
import { ProductModal } from './components/Inventory/ProductModal';
import { SalesList } from './components/Sales/SalesList';
import { NewSaleModal } from './components/Sales/NewSaleModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ProfitReport } from './components/Reports/ProfitReport';
import { BazarCatalog } from './components/Catalog/BazarCatalog';
import { Product } from './types';
import { useBazar } from './context/BazarContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [preselectedProductForSale, setPreselectedProductForSale] = useState<Product | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { addProduct, updateProduct } = useBazar();

  const handleOpenNewProduct = (prod?: Product) => {
    setProductToEdit(prod || null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleOpenQuickSale = (prod?: Product) => {
    setPreselectedProductForSale(prod || null);
    setIsSaleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSale={() => handleOpenQuickSale()}
        onOpenNewProduct={() => handleOpenNewProduct()}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenNewSale={() => handleOpenQuickSale()}
            onOpenNewProduct={() => handleOpenNewProduct()}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductList
            onOpenNewProduct={(prod) => handleOpenNewProduct(prod)}
            onOpenQuickSale={(prod) => handleOpenQuickSale(prod)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesList
            onOpenNewSale={() => handleOpenQuickSale()}
          />
        )}

        {activeTab === 'reports' && (
          <ProfitReport />
        )}

        {activeTab === 'catalog' && (
          <BazarCatalog />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-rose-300">
            Rx do Bazar de Sucesso • Feito por <span className="text-white font-bold">@danillafinancas</span> © Todos os direitos reservados
          </p>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="hover:text-rose-400 transition"
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')} 
              className="hover:text-rose-400 transition"
            >
              Estoque
            </button>
            <button 
              onClick={() => setActiveTab('sales')} 
              className="hover:text-rose-400 transition"
            >
              Vendas
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className="hover:text-rose-400 transition"
            >
              Relatório de Lucro
            </button>
          </div>
        </div>
      </footer>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        preselectedProduct={preselectedProductForSale}
      />

      {/* Settings, Backup & PDF Reports Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <BazarProvider>
      <MainApp />
    </BazarProvider>
  );
}
