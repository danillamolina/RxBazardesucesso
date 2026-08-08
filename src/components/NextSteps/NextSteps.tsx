import React from 'react';
import { 
  Sparkles, 
  Crown, 
  Target, 
  BookOpen, 
  MessageSquare, 
  ExternalLink, 
  Instagram, 
  ArrowDown, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  User,
  Building2,
  Wallet
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

  const steps = [
    {
      stepNumber: 1,
      badge: 'PASSO 1: PASSO OBRIGATÓRIO DE ENTRADA',
      badgeColor: 'bg-[#8FA079] text-[#1F2919] font-black',
      title: 'Finanças em Dia',
      subtitle: 'Organização da Vida Financeira Pessoal & do Negócio da Empreendedora',
      description: 'O pilar essencial e indispensável para toda empreendedora. É onde você organiza a casa de forma completa: estrutura suas contas pessoais, estabelece seu pró-labore, separa definitivamente o dinheiro pessoal do dinheiro da empresa e passa a ter controle total do caixa.',
      details: 'Comece obrigatoriamente por aqui! Sem a vida financeira pessoal e o caixa da empresa organizados, qualquer receita a mais vira um balde furado.',
      whatsappMsg: 'Olá Danilla! Quero organizar minhas finanças pessoais e da minha empresa. Como faço para entrar no Finanças em Dia?',
      checkoutUrl: 'https://pay.kiwify.com.br/IDkxcPx',
      buttonText: 'Garantir Minha Vaga no Finanças em Dia (Kiwify)',
      bgColor: 'bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#4A5D3B]',
      borderColor: 'border-2 border-amber-400',
      textColor: 'text-white',
      icon: BookOpen,
      widthClass: 'w-full max-w-4xl mx-auto',
      isFirst: true,
      highlights: [
        'Separação da Pessoa Física e Jurídica',
        'Organização de Dívidas e Orçamento Pessoal',
        'Clareza e Controle do Caixa da Empresa',
        'Definição Segura do seu Pró-Labore'
      ]
    },
    {
      stepNumber: 2,
      badge: 'PASSO 2: MARGEM, PLANEJAMENTO E PLANILHA ÚNICA',
      badgeColor: 'bg-[#CAD7BE] text-[#1F2919] font-bold',
      title: 'Método os 3Rs da Riqueza',
      subtitle: 'Planejamento de Finanças Pessoais & do Negócio + Reserva da Paz',
      description: 'Com o curso Os 3 R’s da Riqueza, você vai descobrir, através de um passo a passo, como planejar suas finanças pessoais e do seu negócio, para que você possa economizar dinheiro, com uma planilha única onde você vai registrar seus gastos e ganhos, podendo ver com clareza o seu Custo de vida e as métricas essenciais para o seu Negócio e ter muito sucesso.',
      details: 'Se você é uma Empreendedora, autônoma ou profissional liberal que busca ter Tranquilidade financeira, este curso é para você. Descubra como Formar sua Reserva da paz.',
      whatsappMsg: 'Olá Danilla! Quero saber mais sobre o curso Os 3 R’s da Riqueza e formar minha Reserva da Paz.',
      checkoutUrl: 'https://pay.kiwify.com.br/5K14SJV',
      buttonText: 'Quero o Curso Os 3 R’s da Riqueza (Kiwify)',
      bgColor: 'bg-[#3A452F]',
      borderColor: 'border border-[#8FA079]',
      textColor: 'text-white',
      icon: Zap,
      widthClass: 'w-full max-w-3xl mx-auto',
      isFirst: false,
      highlights: [
        'Planilha Única de Gastos e Ganhos',
        'Clareza do Custo de Vida & Métricas do Negócio',
        'Formação da sua Reserva da Paz',
        'Para Empreendedoras, Autônomas e Profissionais Liberais'
      ]
    },
    {
      stepNumber: 3,
      badge: 'PASSO 3: DESTRAVA E DIAGNÓSTICO PONTUAL',
      badgeColor: 'bg-[#E5EBDE] text-[#2B3323] font-bold',
      title: 'Consultoria Sessão Única',
      subtitle: 'Atendimento Individual Direcionado (1h15)',
      description: 'Encontro individual focado para analisar pontualmente a vida financeira da empreendedora e da empresa. Destrave gargalos imediatos, valide precificações e receba um direcionamento prático para a sua empresa crescer.',
      details: 'Saia da sessão com um plano de ação claro para aplicar na sua vida pessoal e no seu negócio no dia seguinte.',
      whatsappMsg: 'Olá Danilla! Gostaria de agendar minha Consultoria Sessão Única de 1h15 com você.',
      buttonText: 'Agendar Minha Consultoria (1h15)',
      bgColor: 'bg-[#4A5D3B]',
      borderColor: 'border border-[#8FA079]',
      textColor: 'text-white',
      icon: Target,
      widthClass: 'w-full max-w-2xl mx-auto',
      isFirst: false,
      highlights: [
        'Diagnóstico Imediato de Gargalos',
        'Análise de Finanças Pessoais e da Empresa',
        'Plano de Ação Direcionado'
      ]
    },
    {
      stepNumber: 4,
      badge: 'PASSO 4: O ÁPICE DO ACOMPANHAMENTO VIP',
      badgeColor: 'bg-amber-400 text-[#1F2919] font-black',
      title: 'Mentoria Individual',
      subtitle: 'O Topo da Aceleração Financeira e Empresarial',
      description: 'Acompanhamento VIP e totalmente individualizado com Danilla Molina. Para a empreendedora que deseja alinhar a prosperidade da vida pessoal com uma empresa altamente previsível, escalável e lucrativa.',
      details: 'Para a empreendedora decidida a ter um acompanhamento próximo e estratégico para acelerar seus resultados.',
      whatsappMsg: 'Olá Danilla! Quero me candidatar para a sua Mentoria Individual exclusiva.',
      buttonText: 'Candidatar-se à Mentoria Individual',
      bgColor: 'bg-gradient-to-r from-[#1F2919] via-[#2A3722] to-[#3A452F]',
      borderColor: 'border-2 border-amber-300',
      textColor: 'text-white',
      icon: Crown,
      widthClass: 'w-full max-w-xl mx-auto',
      isFirst: false,
      highlights: [
        'Acompanhamento Estratégico Próximo',
        'Evolução Patrimonial e da Empresa',
        'Estruturação VIP Customizada'
      ]
    },
  ];

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
                Danilla Molina • Finanças da Empreendedora
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                Vida Pessoal & Negócio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Próximos Passos da Sua Vida Financeira
            </h1>
            <p className="text-[#D8C7AC] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Organize suas <strong>finanças pessoais e do seu negócio</strong> em uma jornada lógica e estruturada. Comece pelo <strong>Finanças em Dia</strong> e evolua com clareza e previsibilidade!
            </p>
          </div>

          {/* Quick Contact Badge */}
          <div className="bg-[#1F2919]/90 border border-[#576945] p-4 rounded-2xl shrink-0 w-full md:w-auto shadow-inner flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CAD7BE] mb-1">
              Contato Oficial
            </span>
            <span className="text-sm font-black text-white">Danilla Molina</span>
            <span className="text-xs text-amber-300 font-bold mt-0.5">{instagramHandle}</span>
          </div>
        </div>
      </div>

      {/* Official Links & Contact Bar */}
      <div className="bg-white dark:bg-[#2A3722] rounded-3xl p-5 sm:p-6 border border-[#E2D5C3] dark:border-[#3A4A30] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="h-12 w-12 rounded-2xl bg-[#4A5D3B] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              DM
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#2B3323] dark:text-[#F7F4EB]">
                Fale Diretamente Comigo
              </h3>
              <p className="text-xs text-[#715F46] dark:text-[#D8C7AC]">
                Danilla Molina • Mentoria & Educação Financeira para Empreendedoras
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Linktree Button */}
            <a
              href={linktreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-[#F7F4EB] dark:bg-[#1F2919] hover:bg-[#E5EBDE] dark:hover:bg-[#3A452F] text-[#2B3323] dark:text-[#F7F4EB] font-bold text-xs py-3 px-4 rounded-xl border border-[#E2D5C3] dark:border-[#3A4A30] transition flex items-center justify-center gap-2 active:scale-95"
            >
              <ExternalLink className="h-4 w-4 text-[#8FA079]" />
              <span>Linktree Oficial</span>
            </a>

            {/* Instagram Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-[#F7F4EB] dark:bg-[#1F2919] hover:bg-[#E5EBDE] dark:hover:bg-[#3A452F] text-[#2B3323] dark:text-[#F7F4EB] font-bold text-xs py-3 px-4 rounded-xl border border-[#E2D5C3] dark:border-[#3A4A30] transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Instagram className="h-4 w-4 text-[#8FA079]" />
              <span>{instagramHandle}</span>
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

      {/* Visual Inverted Pyramid Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#8FA079] dark:text-[#CAD7BE] flex items-center justify-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            Pirâmide de Crescimento Financeiro Invertida
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#2B3323] dark:text-[#F7F4EB] tracking-tight">
            Etapas Obrigatórias de Evolução
          </h2>
          <p className="text-xs sm:text-sm text-[#715F46] dark:text-[#D8C7AC]">
            Desenhada para que a empreendedora entenda com clareza: comece arrumando a vida pessoal e o caixa do negócio no <strong>Finanças em Dia</strong> antes de avançar para a precificação e mentorias.
          </p>
        </div>

        {/* Start Here Callout */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-[#1F2919] font-black text-xs sm:text-sm rounded-full shadow-lg border border-amber-300 animate-pulse">
            <ArrowDown className="h-4 w-4" />
            <span>PASSO OBRIGATÓRIO 1: FINANÇAS EM DIA (PESSOAL & NEGÓCIO)</span>
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        {/* Inverted Pyramid Flow */}
        <div className="space-y-5 pt-2">
          {steps.map((item, idx) => {
            const IconComp = item.icon;

            return (
              <div key={item.stepNumber} className="relative space-y-3">
                <div className={`${item.widthClass} transition-all duration-300 hover:scale-[1.01]`}>
                  <div className={`${item.bgColor} ${item.textColor} rounded-3xl p-6 sm:p-7 ${item.borderColor} shadow-xl relative overflow-hidden`}>
                    
                    {/* Visual Step Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl ${item.isFirst ? 'bg-amber-400 text-[#1F2919]' : 'bg-white/10 text-amber-300'}`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black tracking-wider uppercase text-[#CAD7BE] block">
                            ETAPA 0{item.stepNumber}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="pt-4 space-y-3">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                          {item.title}
                          {item.isFirst && (
                            <CheckCircle2 className="h-6 w-6 text-amber-400 inline" />
                          )}
                        </h3>
                        <p className="text-xs font-bold text-amber-300 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-[#E5EBDE] leading-relaxed font-medium">
                        {item.description}
                      </p>

                      {/* Feature Bullet Points */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.highlights.map((hl, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-white/90 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-[#D8C7AC] italic bg-black/20 p-3 rounded-xl border border-white/10">
                        💡 {item.details}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-5 mt-2 flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.checkoutUrl) {
                            window.open(item.checkoutUrl, '_blank');
                          } else {
                            handleOpenWhatsapp(item.whatsappMsg);
                          }
                        }}
                        className={`w-full font-black text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 group active:scale-98 ${
                          item.isFirst 
                            ? 'bg-amber-400 hover:bg-amber-300 text-[#1F2919]' 
                            : 'bg-white hover:bg-[#F7F4EB] text-[#2B3323]'
                        }`}
                      >
                        {item.checkoutUrl ? (
                          <ExternalLink className="h-4 w-4 text-[#3A452F] group-hover:scale-110 transition-transform" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-[#3A452F] group-hover:scale-110 transition-transform" />
                        )}
                        <span>{item.buttonText}</span>
                        <ArrowRight className="h-4 w-4 ml-auto text-[#3A452F]" />
                      </button>

                      {/* Secondary WhatsApp button if checkoutUrl exists */}
                      {item.checkoutUrl && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsapp(item.whatsappMsg)}
                          className="sm:w-auto font-bold text-xs py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center justify-center gap-1.5 shrink-0"
                          title="Tirar dúvidas no WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4 text-amber-300" />
                          <span className="hidden sm:inline">Dúvidas?</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Arrow Connector between steps */}
                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="p-1.5 bg-[#4A5D3B] text-white rounded-full border border-[#8FA079] shadow-sm">
                      <ArrowDown className="h-4 w-4 text-amber-300" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pyramid Apex Explanation */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-3 px-5 py-3.5 bg-[#E5EBDE] dark:bg-[#1F2919] border border-[#CCD8BF] dark:border-[#3A4A30] rounded-2xl text-xs font-bold text-[#2B3323] dark:text-[#CAD7BE] max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center gap-1 shrink-0 text-[#4A5D3B]">
              <User className="h-4 w-4" />
              <Building2 className="h-4 w-4" />
            </div>
            <span>Organização Integrada: alinhe a vida financeira pessoal e a gestão do seu negócio com Danilla Molina.</span>
          </div>
        </div>
      </div>

      {/* Footer Contact Reminder Box */}
      <div className="bg-gradient-to-r from-[#3A452F] to-[#2A3722] text-white rounded-3xl p-6 sm:p-7 border border-[#3A4A30] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-black text-base text-white">
            Precisa de ajuda para identificar seu momento atual?
          </h4>
          <p className="text-xs text-[#D8C7AC]">
            Fale diretamente com Danilla Molina pelo WhatsApp ({whatsappFormatted}) ou no Instagram {instagramHandle}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenWhatsapp('Olá Danilla! Gostaria de ajuda para saber por qual etapa das finanças pessoais e do negócio devo começar.')}
          className="bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs py-3 px-5 rounded-2xl transition shrink-0 active:scale-95 shadow-md"
        >
          Falar com Danilla no WhatsApp
        </button>
      </div>

    </div>
  );
};
