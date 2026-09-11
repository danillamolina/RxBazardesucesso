import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Download,
  ExternalLink,
  Info,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'auto' | 'ios' | 'android'>(() => {
    if (isIOS) return 'ios';
    return 'auto';
  });

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      const success = await install();
      setInstalling(false);
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else if (isIOS) {
      setActiveInstructionTab('ios');
    } else {
      setActiveInstructionTab('android');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#DDD3C2] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Header with Dark Green Brand Gradient */}
        <div className="bg-gradient-to-r from-[#1B2416] via-[#2A3722] to-[#3D4F31] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#CAD7BE] hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Real Rx Icon Preview */}
            <div className="relative shrink-0">
              <img
                src="/apple-touch-icon.png"
                alt="Ícone Rx"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl shadow-xl border-2 border-[#8FA079]/60 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-[#1F2919] p-1 rounded-full shadow-md">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8FA079]/30 border border-[#8FA079]/40 text-[#E5EBDE] text-[10px] sm:text-xs font-bold mb-1">
                <Smartphone className="h-3 w-3" />
                <span>Instalação na Área de Trabalho</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Rx do Bazar de Sucesso
              </h3>
              <p className="text-xs text-[#D8C7AC]">
                Tenha o app com ícone <strong>Rx</strong> na tela inicial do seu celular
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto no-scrollbar">
          
          {installSuccess ? (
            <div className="p-5 bg-[#E8EFE2] border border-[#8FA079] rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-extrabold text-[#1F2919]">
                Aplicativo Instalado com Sucesso!
              </h4>
              <p className="text-xs text-[#4A5D3B]">
                O ícone do <strong>Rx Bazar</strong> já está disponível na tela inicial do seu aparelho.
              </p>
            </div>
          ) : isInstalled ? (
            <div className="p-4 bg-[#E8EFE2] border border-[#8FA079] rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-[#2B3323]">
                <strong className="block font-bold text-[#1F2919]">Você já está usando o aplicativo instalado!</strong>
                O Rx do Bazar de Sucesso já está fixado na sua área de trabalho em modo tela cheia.
              </div>
            </div>
          ) : (
            <>
              {/* Primary 1-Click Install Button (When browser supports native prompt) */}
              {isInstallable && (
                <div className="space-y-2">
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#576945] hover:from-[#1F2919] hover:to-[#4A5D3B] text-white font-extrabold rounded-2xl shadow-lg shadow-[#2A3722]/20 flex items-center justify-center gap-2.5 transition active:scale-[0.98] border border-[#8FA079]/50"
                  >
                    <Download className="h-5 w-5 text-[#CAD7BE]" />
                    <span className="text-sm sm:text-base">
                      {installing ? 'Instalando...' : 'Adicionar à Área de Trabalho com Ícone Rx'}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-[#6A785E]">
                    Toque no botão acima para criar o atalho oficial na tela do seu celular em 1 segundo.
                  </p>
                </div>
              )}

              {/* Visual Guide Switcher Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2919] uppercase tracking-wider">
                    Como instalar no seu celular:
                  </span>
                  
                  <div className="flex bg-[#EAE2D3] p-0.5 rounded-xl text-xs">
                    <button
                      onClick={() => setActiveInstructionTab('ios')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        activeInstructionTab === 'ios'
                          ? 'bg-white text-[#1F2919] shadow-xs'
                          : 'text-[#6A785E] hover:text-[#1F2919]'
                      }`}
                    >
                      iPhone (iOS)
                    </button>
                    <button
                      onClick={() => setActiveInstructionTab('android')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        activeInstructionTab === 'android'
                          ? 'bg-white text-[#1F2919] shadow-xs'
                          : 'text-[#6A785E] hover:text-[#1F2919]'
                      }`}
                    >
                      Android / Chrome
                    </button>
                  </div>
                </div>

                {/* iPhone (iOS Safari) Instructions */}
                {(activeInstructionTab === 'ios' || (!isInstallable && isIOS)) && (
                  <div className="bg-white border border-[#DDD3C2] rounded-2xl p-4 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F2919] border-b border-[#F0EAE1] pb-2">
                      <span className="p-1 rounded-md bg-[#FAF8F5] border border-[#DDD3C2]">🍎</span>
                      <span>Passo a passo no Safari (iPhone ou iPad):</span>
                    </div>

                    <div className="space-y-3 text-xs text-[#33412A]">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          1
                        </span>
                        <div>
                          <p className="leading-snug">
                            No navegador Safari, toque no botão <strong>Compartilhar</strong> (ícone de um quadrado com uma seta para cima <Share2 className="inline h-3.5 w-3.5 text-blue-600 mx-0.5 -mt-0.5" /> no rodapé do Safari).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          2
                        </span>
                        <div>
                          <p className="leading-snug">
                            Role as opções para baixo e toque em <strong className="text-[#1F2919] inline-flex items-center gap-1 bg-[#F2EDE2] px-1.5 py-0.5 rounded border border-[#DDD3C2]"><PlusSquare className="h-3 w-3 text-emerald-700" /> Adicionar à Tela de Início</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          3
                        </span>
                        <div>
                          <p className="leading-snug">
                            Você verá o ícone verde escuro <strong>Rx</strong> e o nome <em>Rx Bazar</em>. Toque em <strong>Adicionar</strong> no canto superior direito.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Android (Chrome / Edge / Samsung) Instructions */}
                {(activeInstructionTab === 'android' || (!isInstallable && !isIOS)) && (
                  <div className="bg-white border border-[#DDD3C2] rounded-2xl p-4 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F2919] border-b border-[#F0EAE1] pb-2">
                      <span className="p-1 rounded-md bg-[#FAF8F5] border border-[#DDD3C2]">🤖</span>
                      <span>Passo a passo no Google Chrome ou Samsung Internet:</span>
                    </div>

                    <div className="space-y-3 text-xs text-[#33412A]">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          1
                        </span>
                        <div>
                          <p className="leading-snug">
                            Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do seu navegador Chrome.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          2
                        </span>
                        <div>
                          <p className="leading-snug">
                            Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFE2] text-[#254217] font-black flex items-center justify-center shrink-0 border border-[#8FA079]">
                          3
                        </span>
                        <div>
                          <p className="leading-snug">
                            Confirme a instalação. Pronto! O atalho com o ícone <strong>Rx</strong> estará na sua área de trabalho.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram / WhatsApp in-app browser alert */}
              <div className="p-3 bg-[#FEF9EE] border border-[#F5E6B8] rounded-2xl flex items-start gap-2.5 text-xs text-[#78350F]">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <strong>Abriu pelo Instagram ou WhatsApp?</strong> Toque nos 3 pontinhos do topo e selecione <em>"Abrir no Chrome"</em> ou <em>"Abrir no Safari"</em> para permitir a instalação na tela inicial.
                </p>
              </div>

              {/* Benefits of PWA */}
              <div className="bg-[#FAF8F5] border border-[#DDD3C2] rounded-2xl p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-[#556348] uppercase tracking-wider block">
                  Por que ter o app na sua área de trabalho?
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3A452F]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Acesso rápido em 1 toque</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Tela cheia sem barras</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Ícone exclusivo Rx</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Caixa e estoque ágeis</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#DDD3C2] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6A785E]">
            <img src="/apple-touch-icon.png" alt="Rx" className="w-5 h-5 rounded-md" />
            <span className="font-semibold text-[#1F2919]">Rx Bazar • @danillafinancas</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F2EDE2] hover:bg-[#EAE2D3] text-[#2B3323] font-bold rounded-xl text-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
