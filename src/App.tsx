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
import { StoreDetails } from './components/Store/StoreDetails';
import { NextSteps } from './components/NextSteps/NextSteps';
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
    <div className="min-h-screen bg-[#F7F4EB] dark:bg-[#1A2216] text-[#2B3323] dark:text-[#F7F4EB] font-sans antialiased flex flex-col selection:bg-[#8FA079] selection:text-white transition-colors duration-300">
      
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

        {activeTab === 'store' && (
          <StoreDetails />
        )}

        {activeTab === 'next_steps' && (
          <NextSteps
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewProduct={() => handleOpenNewProduct()}
            onOpenNewSale={() => handleOpenQuickSale()}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2A3722] text-[#D8C7AC] border-t border-[#3A4A30] py-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-[#CAD7BE]">
            Rx do Bazar de Sucesso • Feito por <span className="text-white font-bold">@danillafinancas</span> © Todos os direitos reservados
          </p>
          <div className="flex items-center space-x-4 overflow-x-auto py-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Estoque
            </button>
            <button 
              onClick={() => setActiveTab('sales')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Vendas
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Relatórios
            </button>
            <button 
              onClick={() => setActiveTab('store')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Dados da Loja
            </button>
            <button 
              onClick={() => setActiveTab('next_steps')} 
              className="hover:text-[#F7F4EB] transition font-bold text-amber-300 flex items-center gap-1"
            >
              Próximos Passos
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
