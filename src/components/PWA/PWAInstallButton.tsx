import React, { useState } from 'react';
import { Smartphone, Download, Sparkles, Plus, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile-bar' | 'banner' | 'drawer' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstalled, isInstallable, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode, show a small badge or hide in header
  if (isInstalled && (variant === 'header' || variant === 'mobile-bar')) {
    return null;
  }

  const handleClick = async () => {
    // If native install prompt is directly ready on Android/Chrome, we can trigger directly or open modal
    // Opening the modal with the option to install directly gives users the icon preview, instructions and reassurance
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 1. Header Variant (Desktop header bar) */}
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 bg-[#3A452F] hover:bg-[#465437] text-white px-3 py-1.5 rounded-xl border border-[#576945] shadow-xs text-xs font-semibold transition active:scale-95 group ${className}`}
          title="Instalar na Área de Trabalho com Ícone Rx"
        >
          <div className="relative w-5 h-5 rounded-md overflow-hidden shrink-0 border border-[#8FA079]">
            <img src="/apple-touch-icon.png" alt="Rx" className="w-full h-full object-cover" />
          </div>
          <span className="hidden sm:inline">Instalar App</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#8FA079] text-[#1F2919]">
            Rx
          </span>
        </button>
      )}

      {/* 2. Mobile Bar Variant (Top or mobile header) */}
      {variant === 'mobile-bar' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 bg-white hover:bg-[#F2EDE2] text-[#2B3323] px-2.5 py-1.5 rounded-lg border border-[#DDD3C2] shadow-xs text-[11px] font-bold transition active:scale-95 shrink-0 ${className}`}
          title="Instalar o app no celular com ícone Rx"
        >
          <img src="/apple-touch-icon.png" alt="Rx" className="w-4 h-4 rounded-sm shrink-0" />
          <span>App Rx</span>
          <Download className="h-3.5 w-3.5 text-[#556348]" />
        </button>
      )}

      {/* 3. Banner Variant (For Dashboard or Catalog) */}
      {variant === 'banner' && (
        <div
          className={`bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EAE2D3] border-2 border-[#8FA079]/50 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
        >
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/apple-touch-icon.png"
                alt="Ícone Rx"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-md border-2 border-[#8FA079] object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-[#1F2919] p-0.5 rounded-full shadow-xs">
                <Sparkles className="h-3 w-3" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8EFE2] text-[#2E4A1B] text-[10px] font-black uppercase tracking-wider mb-1">
                <Smartphone className="h-3 w-3" />
                <span>Aplicativo no Celular</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#1F2919] tracking-tight">
                Fixe o Rx na Área de Trabalho do Celular
              </h4>
              <p className="text-xs text-[#556348] max-w-xl">
                Acesse seu bazar com 1 toque direto da tela inicial, em tela cheia e com o ícone oficial <strong>Rx</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClick}
              className="w-full sm:w-auto py-2.5 px-4 bg-[#8FA079] hover:bg-[#7D9068] text-[#1F2919] font-black rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Adicionar à Área de Trabalho</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Drawer Variant (For MobileNavDrawer) */}
      {variant === 'drawer' && (
        <button
          onClick={handleClick}
          className={`w-full p-3 bg-gradient-to-r from-[#E8EFE2] to-[#F2EDE2] border border-[#8FA079] rounded-2xl flex items-center justify-between gap-3 text-left shadow-xs transition hover:brightness-95 active:scale-[0.98] ${className}`}
        >
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="Ícone Rx"
              className="w-9 h-9 rounded-xl shadow-xs border border-[#8FA079] shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#1F2919]">
                  Instalar App na Área de Trabalho
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#8FA079] text-[#1F2919] uppercase">
                  Ícone Rx
                </span>
              </div>
              <p className="text-[11px] text-[#4A5D3B] leading-tight">
                Acesse o bazar direto da tela inicial do celular
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white border border-[#DDD3C2] text-[#254217] shrink-0">
            <Download className="h-4 w-4" />
          </div>
        </button>
      )}

      {/* 5. Settings Variant */}
      {variant === 'settings' && (
        <div className={`p-4 bg-white border border-[#DDD3C2] rounded-2xl flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="Ícone Rx"
              className="w-10 h-10 rounded-xl shadow-xs border border-[#8FA079] shrink-0"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1F2919]">
                Ícone do App na Tela Inicial
              </h4>
              <p className="text-xs text-[#6A785E]">
                {isInstalled
                  ? 'O aplicativo já está instalado no seu dispositivo'
                  : 'Instale na área de trabalho do mobile com o ícone Rx oficial'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="py-2 px-3 bg-[#E8EFE2] hover:bg-[#DCE7D4] text-[#1F2919] font-bold rounded-xl text-xs border border-[#8FA079] transition shrink-0 flex items-center gap-1.5"
          >
            {isInstalled ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Instalado</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-[#3A5D28]" />
                <span>Instalar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* PWA Install Modal */}
      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
