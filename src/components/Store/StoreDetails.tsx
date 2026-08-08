import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';

export const StoreDetails: React.FC = () => {
  const { storeInfo, updateStoreInfo } = useBazar();

  const [formData, setFormData] = useState({
    name: storeInfo.name || '',
    address: storeInfo.address || '',
    phone: storeInfo.phone || '',
    whatsapp: storeInfo.whatsapp || '',
    instagram: storeInfo.instagram || '',
    pixKey: storeInfo.pixKey || '',
    notes: storeInfo.notes || '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

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
    return (
      `🏪 *${formData.name || 'Nossa Loja'}*\n\n` +
      `📍 *Endereço:* ${formData.address || 'Não informado'}\n` +
      `📞 *Telefone:* ${formData.phone || 'Não informado'}\n` +
      `💬 *WhatsApp:* ${formData.whatsapp || 'Não informado'}\n` +
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
                placeholder="Ex: Rx do Bazar de Sucesso"
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
