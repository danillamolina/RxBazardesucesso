import React from 'react';
import { 
  Sparkles, 
  Crown, 
  Target, 
  BookOpen, 
  MessageSquare, 
  ExternalLink, 
  Instagram, 
  GraduationCap, 
  UserCheck, 
  ArrowRight,
  CheckCircle2,
  Wallet,
  Building2,
  BadgePercent
} from 'lucide-react';

interface NextStepsProps {
  onNavigateTab?: (tab: string) => void;
  onOpenNewProduct?: () => void;
  onOpenNewSale?: () => void;
}

export const NextSteps: React.FC<NextStepsProps> = () => {
  const whatsappNumber = '5516992278393';
  const whatsappFormatted = '(16) 99227-8393';
  const instagramHandle = '@danillafinancas';
  const linktreeUrl = 'https://linktr.ee/danillamolina';
  const instagramUrl = 'https://instagram.com/danillafinancas';

  const handleOpenWhatsapp = (msg?: string) => {
    const message = msg || 'Olá Danilla! Gostaria de mais informações sobre como organizar as finanças pessoais e do meu negócio.';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#576945] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#3A4A30] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#8FA079]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#8FA079]/30 text-[#E5EBDE] border border-[#8FA079]/40 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Danilla Molina • Especialista em Finanças da Empreendedora
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                Vida Pessoal & Empresa
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Próximos Passos da Sua Vida Financeira
            </h1>
            <p className="text-[#D8C7AC] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Descubra os formatos de apoio e capacitação com <strong>Danilla Molina</strong> para transformar a gestão do seu dinheiro, aumentar sua margem e fazer seu negócio crescer com lucro real e paz de espírito.
            </p>
          </div>

          {/* Quick Contact Badge */}
          <div className="bg-[#1F2919]/90 border border-[#576945] p-4 rounded-2xl shrink-0 w-full md:w-auto shadow-inner flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CAD7BE] mb-1">
              Instagram Oficial
            </span>
            <span className="text-sm font-black text-white">Danilla Molina</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-300 font-bold mt-0.5 hover:underline flex items-center gap-1"
            >
              <Instagram className="h-3.5 w-3.5" />
              <span>{instagramHandle}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Action Links Bar */}
      <div className="bg-white dark:bg-[#2A3722] rounded-3xl p-5 sm:p-6 border border-[#E2D5C3] dark:border-[#3A4A30] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="h-12 w-12 rounded-2xl bg-[#4A5D3B] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              DM
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#2B3323] dark:text-[#F7F4EB]">
                Canais Oficiais de Contato e Inscrição
              </h3>
              <p className="text-xs text-[#715F46] dark:text-[#D8C7AC]">
                Acesse o Linktree com todos os cursos ou fale comigo no WhatsApp e Instagram
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Linktree Button */}
            <a
              href={linktreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-black text-xs py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Acessar Linktree</span>
            </a>

            {/* Instagram Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-[#F7F4EB] dark:bg-[#1F2919] hover:bg-[#E5EBDE] dark:hover:bg-[#3A452F] text-[#2B3323] dark:text-[#F7F4EB] font-bold text-xs py-3 px-4 rounded-xl border border-[#E2D5C3] dark:border-[#3A4A30] transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Instagram className="h-4 w-4 text-[#8FA079]" />
              <span>Instagram {instagramHandle}</span>
            </a>

            {/* WhatsApp Button */}
            <button
              type="button"
              onClick={() => handleOpenWhatsapp()}
              className="flex-1 sm:flex-initial bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="h-4 w-4 text-[#CAD7BE]" />
              <span>WhatsApp {whatsappFormatted}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Options Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#8FA079] dark:text-[#CAD7BE] flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Formatos de Atendimento & Aprendizado
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#2B3323] dark:text-[#F7F4EB] tracking-tight">
            Escolha o Próximo Passo Ideal Para Você
          </h2>
          <p className="text-xs sm:text-sm text-[#715F46] dark:text-[#D8C7AC]">
            Desde treinamentos práticos até acompanhamentos individuais exclusivos, selecione a opção que atende ao seu momento atual.
          </p>
        </div>

        <div className="space-y-5 pt-2">
          
          {/* 1. OPÇÃO CURSOS */}
          <div className="bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#4A5D3B] text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-xl relative overflow-hidden transition hover:scale-[1.005]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-[#1F2919] shadow">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-wider uppercase text-amber-300 block">
                    OPÇÃO 01 • EDUCAÇÃO & TREINAMENTOS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Cursos
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-400 text-[#1F2919]">
                Catálogo Completo no Linktree
              </span>
            </div>

            <div className="pt-5 space-y-4">
              <p className="text-sm sm:text-base text-[#F5F0E6] leading-relaxed font-medium">
                Tenha acesso ao catálogo completo com todos os cursos, capacitações e materiais educativos de finanças pessoais e empresariais. Todos os treinamentos estão centralizados e sempre atualizados no <strong>Linktree oficial</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Acesso a todos os cursos diretamente no Linktree</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Conteúdos práticos, aulas gravadas e materiais</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <Instagram className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Dicas diárias, bastidores e lives no Instagram</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Não precisa procurar curso por curso: tudo reunido em um só lugar</span>
                </div>
              </div>

              {/* Action Buttons for Cursos */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <ExternalLink className="h-4 w-4 text-[#1F2919]" />
                  <span>Acessar Cursos no Linktree ({linktreeUrl.replace('https://', '')})</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-[#1F2919]" />
                </a>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-auto bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm py-3.5 px-5 rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Instagram className="h-4 w-4 text-amber-300" />
                  <span>Ver Instagram {instagramHandle}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. OPÇÃO INDIVIDUAL */}
          <div className="bg-white dark:bg-[#2A3722] text-[#2B3323] dark:text-white rounded-3xl p-6 sm:p-7 border border-[#CCD8BF] dark:border-[#3A4A30] shadow-md transition hover:scale-[1.005]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#8FA079]/20 text-[#4A5D3B] dark:text-[#CAD7BE]">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-wider uppercase text-[#715F46] dark:text-[#CAD7BE] block">
                    OPÇÃO 02 • ATENDIMENTO DIRECIONADO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Individual
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#E5EBDE] dark:bg-[#1F2919] text-[#2B3323] dark:text-[#CAD7BE] border border-[#CCD8BF] dark:border-[#3A4A30]">
                Atendimento 1 a 1
              </span>
            </div>

            <div className="pt-4 space-y-3.5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#E5EBDE] leading-relaxed">
                Atendimento personalizado e individual para analisar pontualmente a sua realidade financeira, esclarecer dúvidas urgentes e traçar metas claras entre a sua vida pessoal e o seu negócio.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#E5EBDE] bg-slate-50 dark:bg-[#1F2919] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Diagnóstico direto das suas necessidades</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#E5EBDE] bg-slate-50 dark:bg-[#1F2919] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Separação segura de contas e definição de pró-labore</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsapp('Olá Danilla! Gostaria de informações sobre o Atendimento Individual.')}
                  className="w-full sm:w-auto bg-[#4A5D3B] hover:bg-[#3D4F2F] text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare className="h-4 w-4 text-[#CAD7BE]" />
                  <span>Solicitar Atendimento Individual no WhatsApp</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. OPÇÃO CONSULTORIA */}
          <div className="bg-white dark:bg-[#2A3722] text-[#2B3323] dark:text-white rounded-3xl p-6 sm:p-7 border border-[#CCD8BF] dark:border-[#3A4A30] shadow-md transition hover:scale-[1.005]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#4A5D3B]/20 text-[#3A452F] dark:text-amber-300">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-wider uppercase text-[#715F46] dark:text-[#CAD7BE] block">
                    OPÇÃO 03 • DIAGNÓSTICO & PLANO ESTRATÉGICO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Consultoria
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#E5EBDE] dark:bg-[#1F2919] text-[#2B3323] dark:text-[#CAD7BE] border border-[#CCD8BF] dark:border-[#3A4A30]">
                Análise Aprofundada
              </span>
            </div>

            <div className="pt-4 space-y-3.5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#E5EBDE] leading-relaxed">
                Sessão estratégica focada em identificar e destravar gargalos financeiros no seu negócio: validação de custos, formação de preço e margem de lucro real por produto, controle de fluxo de caixa e plano de ação estruturado para execução imediata.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#E5EBDE] bg-slate-50 dark:bg-[#1F2919] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Análise detalhada de custos, despesas e margem</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#E5EBDE] bg-slate-50 dark:bg-[#1F2919] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Plano prático de ação para estancar perdas e lucrar mais</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsapp('Olá Danilla! Gostaria de agendar uma Consultoria financeira com você.')}
                  className="w-full sm:w-auto bg-[#3A452F] hover:bg-[#465437] text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare className="h-4 w-4 text-[#CAD7BE]" />
                  <span>Agendar Consultoria no WhatsApp</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. OPÇÃO MENTORIA */}
          <div className="bg-gradient-to-r from-[#1F2919] via-[#2A3722] to-[#3A452F] text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl relative overflow-hidden transition hover:scale-[1.005]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-[#1F2919] shadow">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-wider uppercase text-amber-300 block">
                    OPÇÃO 04 • ACOMPANHAMENTO VIP EXCLUSIVO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Mentoria
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-400 text-[#1F2919]">
                O Topo da Aceleração
              </span>
            </div>

            <div className="pt-5 space-y-4">
              <p className="text-sm sm:text-base text-[#F5F0E6] leading-relaxed font-medium">
                O formato mais completo, próximo e exclusivo com Danilla Molina. Acompanhamento VIP contínuo desenhado para empreendedoras comprometidas em alinhar prosperidade patrimonial, rentabilidade e previsibilidade do negócio em alto nível.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Acompanhamento próximo, individualizado e contínuo</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Estratégia personalizada de escala e aumento de patrimônio</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Acesso direto e suporte estratégico com Danilla Molina</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Formação da sua Reserva da Paz e solidez financeira</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsapp('Olá Danilla! Gostaria de me candidatar para a sua Mentoria VIP exclusiva.')}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Crown className="h-4 w-4 text-[#1F2919]" />
                  <span>Candidatar-se à Mentoria com Danilla Molina</span>
                  <ArrowRight className="h-4 w-4 ml-1 text-[#1F2919]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Integration Banner: Pessoa Física & Empresa */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-3 px-5 py-3.5 bg-[#E5EBDE] dark:bg-[#1F2919] border border-[#CCD8BF] dark:border-[#3A4A30] rounded-2xl text-xs font-bold text-[#2B3323] dark:text-[#CAD7BE] max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-1.5 shrink-0 text-[#4A5D3B] dark:text-[#8FA079]">
            <Wallet className="h-4 w-4" />
            <Building2 className="h-4 w-4" />
          </div>
          <span>Metodologia Integrada: organize sua vida pessoal e faça sua empresa lucrar de verdade com Danilla Molina.</span>
        </div>
      </div>

      {/* Footer Contact Direct Box */}
      <div className="bg-gradient-to-r from-[#3A452F] to-[#2A3722] text-white rounded-3xl p-6 sm:p-7 border border-[#3A4A30] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-black text-base text-white">
            Ficou com dúvida sobre qual formato é o mais indicado para você?
          </h4>
          <p className="text-xs text-[#D8C7AC]">
            Mande uma mensagem diretamente para Danilla Molina no WhatsApp ({whatsappFormatted}) ou envie um direct no Instagram {instagramHandle}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 justify-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-4 rounded-2xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Instagram className="h-4 w-4 text-amber-300" />
            <span>Instagram</span>
          </a>
          <button
            type="button"
            onClick={() => handleOpenWhatsapp('Olá Danilla! Gostaria de tirar uma dúvida sobre qual é a melhor opção para o meu momento atual.')}
            className="bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs py-3 px-5 rounded-2xl transition active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Conversar no WhatsApp</span>
          </button>
        </div>
      </div>

    </div>
  );
};

