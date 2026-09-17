import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Instagram, 
  QrCode, 
  FileText, 
  Save, 
  Check, 
  Copy, 
  ExternalLink,
  Store,
  Sparkles,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { getStoreOnlineUrl, generateStoreInvitationWhatsAppText } from '../../utils/formatters';
import { buildWhatsAppDirectUrl } from '../../utils/productJpgGenerator';

interface StoreDetailsProps {
  onOpenCustomerStoreView?: (editionId?: string) => void;
  onOpenGenerateStoreModal?: () => void;
}

export const StoreDetails: React.FC<StoreDetailsProps> = ({
  onOpenCustomerStoreView,
  onOpenGenerateStoreModal,
}) => {
  const { storeInfo, updateStoreInfo, editions, activeEditionId, setActiveEditionId } = useBazar();

  const [formData, setFormData] = useState({
    name: storeInfo.name || '',
    address: storeInfo.address || '',
    phone: storeInfo.phone || '',
    whatsapp: storeInfo.whatsapp || '',
    whatsappGroupLink: storeInfo.whatsappGroupLink || '',
    instagram: storeInfo.instagram || '',
    pixKey: storeInfo.pixKey || '',
    notes: storeInfo.notes || '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedStoreUrl, setCopiedStoreUrl] = useState(false);

  // Selected edition for sharing the store link (defaults to activeEditionId if specific, or latest edition)
  const [selectedEditionForLink, setSelectedEditionForLink] = useState<string>(() => {
    if (activeEditionId && activeEditionId !== 'all') return activeEditionId;
    return editions[0]?.id || 'all';
  });

  useEffect(() => {
    if (activeEditionId && activeEditionId !== 'all') {
      setSelectedEditionForLink(activeEditionId);
    }
  }, [activeEditionId]);

  const selectedEditionObj = useMemo(() => {
    if (selectedEditionForLink === 'all') return null;
    return editions.find(e => e.id === selectedEditionForLink) || null;
  }, [selectedEditionForLink, editions]);

  const storeUrl = useMemo(() => {
    return getStoreOnlineUrl(
      undefined, 
      selectedEditionForLink !== 'all' ? selectedEditionForLink : undefined,
      selectedEditionObj?.name
    );
  }, [selectedEditionForLink, selectedEditionObj]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  const formattedWhatsappNumber = formData.whatsapp.replace(/\D/g, '');

  const getCardText = () => {
    const storeDisplayName = (formData.name && !formData.name.toLowerCase().includes('rx do bazar')) 
      ? formData.name 
      : 'Nossa Loja';
    return (
      `🏪 *${storeDisplayName}*\n\n` +
      `📍 *Endereço:* ${formData.address || 'Não informado'}\n` +
      `📞 *Telefone:* ${formData.phone || 'Não informado'}\n` +
      `💬 *WhatsApp:* ${formData.whatsapp || 'Não informado'}\n` +
      (formData.whatsappGroupLink ? `👥 *Grupo da Promoção / VIP:* ${formData.whatsappGroupLink}\n` : '') +
      (formData.instagram ? `📸 *Instagram:* ${formData.instagram}\n` : '') +
      (formData.pixKey ? `🔑 *Chave Pix:* ${formData.pixKey}\n` : '') +
      (formData.notes ? `\nℹ️ *Informações:* ${formData.notes}\n` : '')
    );
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(getCardText());
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 3000);
  };

  const handleOpenWhatsapp = () => {
    if (!formattedWhatsappNumber) return;
    let num = formattedWhatsappNumber;
    if (num.length === 10 || num.length === 11) {
      num = `55${num}`;
    }
    window.open(`https://wa.me/${num}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareStoreLinkWhatsApp = () => {
    const text = generateStoreInvitationWhatsAppText(storeInfo, storeUrl, selectedEditionObj?.name);
    const url = buildWhatsAppDirectUrl(text, undefined, 'standard', true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyStoreUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedStoreUrl(true);
    setTimeout(() => setCopiedStoreUrl(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#576945] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#3A4A30] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#8FA079]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-gradient-to-tr from-[#8FA079] to-[#4A5D3B] rounded-2xl shadow-lg shadow-[#8FA079]/20">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Dados da Loja
                </h1>
                <span className="bg-[#8FA079]/20 text-[#CAD7BE] border border-[#8FA079]/40 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Perfil Oficial
                </span>
              </div>
              <p className="text-[#D8C7AC] text-xs sm:text-sm mt-1">
                Cadastre e gerencie as informações de contato, endereço e WhatsApp da sua loja.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCard}
              className="flex-1 sm:flex-initial bg-[#3A452F] hover:bg-[#465437] text-[#F5F0E6] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#576945] transition flex items-center justify-center gap-2"
              title="Copiar texto com todos os dados da loja para enviar no WhatsApp"
            >
              {copiedCard ? (
                <>
                  <Check className="h-4 w-4 text-[#CAD7BE]" />
                  <span>Cartão Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#D8C7AC]" />
                  <span>Copiar Cartão da Loja</span>
                </>
              )}
            </button>

            {formattedWhatsappNumber && (
              <button
                onClick={handleOpenWhatsapp}
                className="flex-1 sm:flex-initial bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Abrir WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {isSaved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Dados salvos com sucesso!</p>
              <p className="text-xs opacity-90">As informações da sua loja foram atualizadas e estão salvas no sistema.</p>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 LOJA ONLINE INTERATIVA COM SACOLA (Link e Convite para Clientes) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                  Link Oficial da Loja Online com Sacola
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700">
                  Visão do Cliente
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">
                Envie este link para os clientes pelo WhatsApp ou Instagram. Eles acessam uma loja virtual completa, adicionam peças na sacola e te enviam o pedido com 1 clique!
              </p>
            </div>
          </div>
        </div>

        {/* Edition Selector for the store link */}
        <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <span>🏷️</span>
              <span>Edição conectada a este link:</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedEditionForLink}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedEditionForLink(newId);
                if (newId) setActiveEditionId(newId);
              }}
              className="w-full sm:w-auto text-xs font-extrabold bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            >
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.name} {ed.id === activeEditionId ? '★ (Edição Ativa Agora)' : ''}
                </option>
              ))}
              <option value="all">🌐 Catálogo Completo (Todas as Peças da Loja)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl px-4 py-3 text-xs font-mono text-emerald-900 dark:text-emerald-300 truncate shadow-2xs">
            <span className="truncate select-all">{storeUrl}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleCopyStoreUrl}
              className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-200 font-bold text-xs shadow-2xs transition active:scale-95 flex items-center gap-1.5"
              title="Copiar link da Loja Online para colar no WhatsApp ou Instagram"
            >
              {copiedStoreUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-emerald-600" />}
              <span>{copiedStoreUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareStoreLinkWhatsApp}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center gap-1.5"
              title="Enviar mensagem com o link da loja pelo WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Enviar no WhatsApp</span>
            </button>

            {onOpenGenerateStoreModal && (
              <button
                type="button"
                onClick={onOpenGenerateStoreModal}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center gap-1.5"
                title="Abrir gerador completo da loja online com QR Code e opções"
              >
                <Sparkles className="h-4 w-4 text-emerald-200" />
                <span>Gerar Loja & QR Code</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onOpenCustomerStoreView) {
                  onOpenCustomerStoreView(selectedEditionForLink !== 'all' ? selectedEditionForLink : undefined);
                } else {
                  window.open(storeUrl, '_blank');
                }
              }}
              className="px-4 py-3 rounded-xl bg-teal-900 hover:bg-teal-800 text-white font-extrabold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
              title="Visualizar a loja exatamente como a cliente visualiza no celular"
            >
              <ExternalLink className="h-4 w-4 text-teal-300" />
              <span>Abrir como Cliente</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Editable Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#2A3722] rounded-3xl p-6 sm:p-8 border border-[#E2D5C3] dark:border-[#3A4A30] shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#F5F0E6] dark:border-[#3A4A30]">
            <div>
              <h2 className="text-lg font-bold text-[#2B3323] dark:text-[#F7F4EB] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#8FA079]" />
                Editar Informações da Loja
              </h2>
              <p className="text-xs text-[#715F46] dark:text-[#D8C7AC]">
                Preencha os campos abaixo para atualizar os dados visíveis no seu sistema.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Nome da Loja */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                <Store className="h-4 w-4 text-[#8FA079]" />
                Nome da Loja <span className="text-[#8FA079]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Minha Loja"
                className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
              />
            </div>

            {/* Endereço da Loja */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#8FA079]" />
                Endereço da Loja <span className="text-[#8FA079]">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
                className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
              />
            </div>

            {/* Telefone & WhatsApp em 2 colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Telefone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#8FA079]" />
                  Telefone da Loja <span className="text-[#8FA079]">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Ex: (11) 3333-4444"
                  className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
                />
              </div>

              {/* WhatsApp da Loja */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-[#576945]" />
                  WhatsApp da Loja <span className="text-[#8FA079]">*</span>
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="Ex: (11) 99999-8888"
                  className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#576945] focus:bg-white dark:focus:bg-[#2A3722] transition"
                />
              </div>

            </div>

            {/* Link do Grupo de Promoções / WhatsApp */}
            <div className="bg-[#FAF7F2] dark:bg-[#1A2315] border border-[#8FA079]/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A3722] dark:text-[#E5EBDE] flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Link do Grupo de Promoções no WhatsApp (Grupo VIP / Opcional)
                </label>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  Opcional
                </span>
              </div>
              <p className="text-xs text-[#5C6E4D] dark:text-[#CAD7BE] leading-relaxed">
                Cole o link de convite do grupo do WhatsApp definido para promoções ou clientes VIP. Na Loja Online, as clientes podem enviar o pedido para a loja no privado ou para este grupo definido na promoção!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  name="whatsappGroupLink"
                  value={formData.whatsappGroupLink}
                  onChange={handleChange}
                  placeholder="Ex: https://chat.whatsapp.com/ExemploDoGrupo"
                  className="flex-1 bg-white dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-2.5 text-xs text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] transition font-mono"
                />
                {formData.whatsappGroupLink && (
                  <a
                    href={formData.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition"
                    title="Testar link do grupo"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Testar Grupo</span>
                  </a>
                )}
              </div>
            </div>

            {/* Instagram & Chave Pix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Instagram */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-[#8FA079]" />
                  Instagram / Redes Sociais
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Ex: @bazardesucesso"
                  className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
                />
              </div>

              {/* Chave Pix */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-[#576945]" />
                  Chave Pix Oficial
                </label>
                <input
                  type="text"
                  name="pixKey"
                  value={formData.pixKey}
                  onChange={handleChange}
                  placeholder="Ex: CPF/CNPJ, Celular ou E-mail"
                  className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl px-4 py-3 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
                />
              </div>

            </div>

            {/* Observações / Informações de Atendimento */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#332C22] dark:text-[#F7F4EB] mb-1.5 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#8FA079]" />
                Horário de Atendimento & Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Ex: Segunda a Sábado das 09h às 18h. Retiradas mediante agendamento prévio."
                className="w-full bg-[#F7F4EB] dark:bg-[#1F2919] border border-[#E2D5C3] dark:border-[#3A4A30] rounded-xl p-4 text-sm text-[#2B3323] dark:text-[#F7F4EB] placeholder-[#C2AD8E] focus:outline-none focus:ring-2 focus:ring-[#8FA079] focus:bg-white dark:focus:bg-[#2A3722] transition"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-[#4A5D3B]/20 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Save className="h-5 w-5" />
                <span>Salvar Dados da Loja</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Visual Card Preview */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-[#2A3722] via-[#3A452F] to-[#1F2919] text-white rounded-3xl p-6 border border-[#3A4A30] shadow-lg space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#3A4A30]">
              <span className="text-xs font-black uppercase tracking-widest text-[#D8C7AC]">
                Cartão Virtual da Loja
              </span>
              <span className="bg-[#4A5D3B]/40 text-[#CAD7BE] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#576945]">
                Ativo
              </span>
            </div>

            {/* Main Store Branding Header */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#8FA079] to-[#4A5D3B] flex items-center justify-center text-white font-black text-xl shadow-md">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'L'}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white leading-snug">
                  {formData.name || 'Nome da Sua Loja'}
                </h3>
                <p className="text-xs text-[#CAD7BE]">Dados oficiais de atendimento</p>
              </div>
            </div>

            {/* Info List */}
            <div className="space-y-3 pt-2 text-xs text-[#E5EBDE]">
              
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#8FA079] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#CAD7BE] font-bold block">Endereço:</span>
                  <span className="font-medium text-white">{formData.address || 'Não cadastrado'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 text-[#8FA079] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#CAD7BE] font-bold block">Telefone:</span>
                  <span className="font-medium text-white">{formData.phone || 'Não cadastrado'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MessageSquare className="h-4 w-4 text-[#CAD7BE] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#CAD7BE] font-bold block">WhatsApp:</span>
                  <span className="font-bold text-[#E5EBDE]">{formData.whatsapp || 'Não cadastrado'}</span>
                </div>
              </div>

              {formData.whatsappGroupLink && (
                <div className="flex items-start space-x-2.5">
                  <Users className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#CAD7BE] font-bold block">Grupo da Promoção (WhatsApp):</span>
                    <a 
                      href={formData.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-300 underline text-[11px] break-all hover:text-emerald-200"
                    >
                      {formData.whatsappGroupLink}
                    </a>
                  </div>
                </div>
              )}

              {formData.instagram && (
                <div className="flex items-start space-x-2.5">
                  <Instagram className="h-4 w-4 text-[#8FA079] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#CAD7BE] font-bold block">Instagram:</span>
                    <span className="font-medium text-white">{formData.instagram}</span>
                  </div>
                </div>
              )}

              {formData.pixKey && (
                <div className="flex items-start space-x-2.5">
                  <QrCode className="h-4 w-4 text-[#D8C7AC] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#CAD7BE] font-bold block">Chave Pix:</span>
                    <span className="font-mono text-[#D8C7AC] font-bold">{formData.pixKey}</span>
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="flex items-start space-x-2.5 pt-2 border-t border-[#3A4A30]">
                  <FileText className="h-4 w-4 text-[#8FA079] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#CAD7BE] font-bold block">Observações:</span>
                    <span className="text-[#E5EBDE] italic">{formData.notes}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons inside Card */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleCopyCard}
                className="w-full bg-[#3A452F] hover:bg-[#465437] text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-[#576945] transition flex items-center justify-center gap-2"
              >
                {copiedCard ? (
                  <>
                    <Check className="h-4 w-4 text-[#CAD7BE]" />
                    <span>Texto do Cartão Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#D8C7AC]" />
                    <span>Copiar Texto do Cartão</span>
                  </>
                )}
              </button>
            </div>

          </div>

          <div className="bg-[#F7F4EB] dark:bg-[#1F2919] rounded-3xl p-5 border border-[#E2D5C3] dark:border-[#3A4A30] text-xs text-[#715F46] dark:text-[#D8C7AC] space-y-2">
            <h4 className="font-bold text-[#2B3323] dark:text-[#F7F4EB] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#8FA079]" />
              Como estes dados são usados?
            </h4>
            <p className="leading-relaxed">
              Estes dados são armazenados com segurança no seu aplicativo e servem para identificar sua loja ao gerar anúncios de produtos em imagem (JPG), relatórios em PDF, exportações e mensagens diretas para clientes no WhatsApp!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
