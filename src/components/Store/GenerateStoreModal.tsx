import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Store,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  QrCode,
  Share2,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Eye,
  Tag,
  Package
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { getStoreOnlineUrl, generateStoreInvitationWhatsAppText, formatCurrency } from '../../utils/formatters';
import { buildWhatsAppDirectUrl } from '../../utils/productJpgGenerator';

interface GenerateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerStoreView: (editionId?: string) => void;
  defaultEditionId?: string;
}

export const GenerateStoreModal: React.FC<GenerateStoreModalProps> = ({
  isOpen,
  onClose,
  onOpenCustomerStoreView,
  defaultEditionId,
}) => {
  const { editions, activeEditionId, storeInfo, allProducts } = useBazar();

  // Selected edition for generating the store link
  const [selectedEdition, setSelectedEdition] = useState<string>(() => {
    if (defaultEditionId) return defaultEditionId;
    if (activeEditionId && activeEditionId !== 'all') return activeEditionId;
    return editions[0]?.id || 'all';
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const selectedEditionObj = useMemo(() => {
    if (selectedEdition === 'all') return null;
    return editions.find((e) => e.id === selectedEdition) || null;
  }, [selectedEdition, editions]);

  // Count products for selected edition
  const editionProductsCount = useMemo(() => {
    if (selectedEdition === 'all') {
      return allProducts.filter((p) => p.showInCatalog !== false).length;
    }
    return allProducts.filter((p) => {
      if (p.showInCatalog === false) return false;
      if (p.bazarEditionIds && p.bazarEditionIds.length > 0) {
        return p.bazarEditionIds.includes(selectedEdition);
      }
      return p.bazarEditionId === selectedEdition;
    }).length;
  }, [allProducts, selectedEdition]);

  // The official generated store URL
  const generatedStoreUrl = useMemo(() => {
    return getStoreOnlineUrl(
      undefined,
      selectedEdition !== 'all' ? selectedEdition : undefined,
      selectedEditionObj?.name
    );
  }, [selectedEdition, selectedEditionObj]);

  // Complete WhatsApp invitation message
  const whatsappInvitationText = useMemo(() => {
    return generateStoreInvitationWhatsAppText(
      storeInfo,
      generatedStoreUrl,
      selectedEditionObj?.name
    );
  }, [storeInfo, generatedStoreUrl, selectedEditionObj]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappInvitationText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const handleSendWhatsApp = (destination: 'standard' | 'business' = 'standard') => {
    const directUrl = buildWhatsAppDirectUrl(whatsappInvitationText, undefined, destination, true);
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenStorePreview = () => {
    onClose();
    onOpenCustomerStoreView(selectedEdition !== 'all' ? selectedEdition : undefined);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=${encodeURIComponent(
    generatedStoreUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-lg shadow-black/10 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Gerar Loja Online com Sacola
                </h2>
                <span className="bg-emerald-200 text-emerald-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Visão do Cliente
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                Gere o link interativo para suas clientes abrirem no WhatsApp, montarem a sacola e te enviarem o pedido pronto!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 no-scrollbar">
          
          {/* Step 1: Escolha a Edição / Catálogo */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              <span>1. Escolha a Edição ou Catálogo deste Link:</span>
            </label>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-sm border-2 border-emerald-400 dark:border-emerald-600 rounded-xl px-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {editions.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    🏷️ {ed.name} {ed.id === activeEditionId ? '★ (Edição Ativa Agora)' : ''}
                  </option>
                ))}
                <option value="all">🌐 Catálogo Completo (Todas as Peças da Loja)</option>
              </select>

              <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0">
                <Package className="h-4 w-4 text-emerald-600" />
                <span>{editionProductsCount} {editionProductsCount === 1 ? 'peça vinculada' : 'peças vinculadas'}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Link Gerado */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>2. Link Oficial Gerado para o Cliente:</span>
              </label>
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                Pronto para Enviar
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-emerald-900 dark:text-emerald-300 truncate shadow-2xs select-all">
                {generatedStoreUrl}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-200 font-black text-xs shadow-2xs transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-emerald-600" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-medium">
                Dica: Cole na bio do Instagram, no status do WhatsApp ou envie direto no privado!
              </span>
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 ml-auto"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQrCode ? 'Ocultar QR Code' : 'Exibir QR Code'}</span>
              </button>
            </div>

            {/* Optional QR Code section */}
            {showQrCode && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 text-center space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Escaneie com a câmera do celular para abrir a loja instantaneamente:
                </p>
                <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code da Loja Online"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <a
                  href={qrCodeUrl}
                  download="qrcode-loja-online.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:underline inline-block"
                >
                  Baixar imagem do QR Code para imprimir
                </a>
              </div>
            )}
          </div>

          {/* Step 3: Ações Rápidas de Compartilhamento e Teste */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span>
              <span>3. Ações Rápidas:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button: Enviar no WhatsApp */}
              <button
                type="button"
                onClick={() => handleSendWhatsApp('standard')}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-black leading-tight">Enviar no WhatsApp</div>
                    <div className="text-[10px] text-emerald-100 font-normal">Mensagem pronta com link</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Button: Ver Loja como Cliente (Testar) */}
              <button
                type="button"
                onClick={handleOpenStorePreview}
                className="p-3.5 rounded-2xl bg-teal-900 hover:bg-teal-800 text-white font-black text-xs sm:text-sm shadow-md shadow-teal-900/20 transition active:scale-95 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4 text-teal-300" />
                  </div>
                  <div className="text-left">
                    <div className="font-black leading-tight">Ver como Cliente</div>
                    <div className="text-[10px] text-teal-200 font-normal">Testar sacola no celular</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-teal-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Copy invitation text */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                {copiedMessage ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                <span>{copiedMessage ? 'Mensagem Copiada com Sucesso!' : 'Copiar Texto Completo do Convite para o WhatsApp'}</span>
              </button>
            </div>
          </div>

          {/* Informational Customer Workflow Box */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💡</span>
              <span>Como seu cliente faz o pedido pela Loja:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-400 block">1. Clica no Link:</strong>
                Abre a loja online com visual profissional e preços promocionais.
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-400 block">2. Coloca na Sacola:</strong>
                Escolhe as peças, cores e tamanhos sem precisar de login.
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-400 block">3. Envia no WhatsApp:</strong>
                O pedido chega formatado com peças, endereço e opção PIX!
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleOpenStorePreview}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <Store className="h-4 w-4" />
            <span>Abrir Loja Agora (Testar)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
