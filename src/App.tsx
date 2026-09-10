/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Share2, 
  BookOpen, 
  TrendingUp,
  Store,
  Compass
} from 'lucide-react';
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
import { UserGuide } from './components/Guide/UserGuide';
import { Product } from './types';
import { useBazar } from './context/BazarContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Na versão mobile, abre diretamente na Vitrine conforme solicitado pelo usuário
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'catalog';
    }
    return 'dashboard';
  });
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [preselectedProductForSale, setPreselectedProductForSale] = useState<Product | null>(null);
  const [preselectedCustomerForSale, setPreselectedCustomerForSale] = useState<{
    name: string;
    phone?: string;
    address?: string;
    deliveryMethod?: string;
    notes?: string;
  } | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { addProduct, updateProduct } = useBazar();

  const handleOpenNewProduct = (prod?: Product) => {
    // Defend against DOM/React synthetic events being passed as prod
    if (prod && typeof prod === 'object' && 'id' in prod && 'name' in prod && !('nativeEvent' in (prod as any))) {
      setProductToEdit(prod);
    } else {
      setProductToEdit(null);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleOpenQuickSale = (prod?: Product, cust?: any) => {
    // Defend against DOM/React synthetic events being passed as prod or cust
    const validProd = prod && typeof prod === 'object' && 'id' in prod && 'name' in prod && !('nativeEvent' in (prod as any)) ? prod : null;
    const validCust = cust && typeof cust === 'object' && 'name' in cust && !('nativeEvent' in (cust as any)) ? cust : null;
    
    setPreselectedProductForSale(validProd);
    setPreselectedCustomerForSale(validCust);
    setIsSaleModalOpen(true);
  };

  return (
    <div className="min-h-screen notranslate bg-[#F7F4EB] dark:bg-[#1A2216] text-[#2B3323] dark:text-[#F7F4EB] font-sans antialiased flex flex-col selection:bg-[#8FA079] selection:text-white transition-colors duration-300 pb-20 md:pb-0" translate="no">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSale={() => handleOpenQuickSale()}
        onOpenNewProduct={() => handleOpenNewProduct()}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 notranslate" translate="no">
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
            onOpenNewSale={(cust) => handleOpenQuickSale(undefined, cust)}
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

        {activeTab === 'guide' && (
          <UserGuide
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewProduct={() => handleOpenNewProduct()}
            onOpenNewSale={() => handleOpenQuickSale()}
          />
        )}

        {activeTab === 'next_steps' && (
          <NextSteps
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewProduct={() => handleOpenNewProduct()}
            onOpenNewSale={() => handleOpenQuickSale()}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1F2919]/95 backdrop-blur-md border-t border-[#3A4A30] shadow-2xl py-2 px-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-white font-bold bg-[#3A452F]'
                : 'text-[#D8C7AC]/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'inventory'
                ? 'text-white font-bold bg-[#3A452F]'
                : 'text-[#D8C7AC]/70 hover:text-white'
            }`}
          >
            <Package className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Estoque</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'sales'
                ? 'text-white font-bold bg-[#3A452F]'
                : 'text-[#D8C7AC]/70 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Vendas</span>
          </button>

          {/* Prominent Vitrine Tab */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
              activeTab === 'catalog'
                ? 'text-white font-black bg-[#4A5D3B] ring-2 ring-[#8FA079] shadow-lg'
                : 'text-[#CAD7BE] font-bold hover:text-white bg-[#3A452F]/60'
            }`}
          >
            <Share2 className="h-5 w-5 mb-0.5 text-emerald-400" />
            <span className="text-[10px] leading-tight font-black text-emerald-300">Vitrine</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'guide'
                ? 'text-white font-bold bg-[#3A452F]'
                : 'text-[#D8C7AC]/70 hover:text-white'
            }`}
          >
            <BookOpen className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Manual</span>
          </button>

        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-[#2A3722] text-[#D8C7AC] border-t border-[#3A4A30] py-6 text-center text-xs mt-auto hidden md:block">
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
              Estoque e Margens
            </button>
            <button 
              onClick={() => setActiveTab('sales')} 
              className="hover:text-[#F7F4EB] transition"
            >
              Vendas e Clientes
            </button>
            <button 
              onClick={() => setActiveTab('catalog')} 
              className="hover:text-[#F7F4EB] transition font-semibold text-[#8FA079]"
            >
              Vitrine
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
              onClick={() => setActiveTab('guide')} 
              className="hover:text-[#F7F4EB] transition font-semibold text-[#8FA079] flex items-center gap-1"
            >
              Manual de Uso
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
        preselectedCustomer={preselectedCustomerForSale}
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
