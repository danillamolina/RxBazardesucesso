import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  ShoppingCart, 
  Share2, 
  TrendingUp, 
  Store, 
  ShieldCheck, 
  Smartphone, 
  Camera, 
  Search, 
  FileText, 
  Download, 
  HelpCircle, 
  ArrowRight, 
  Plus, 
  Calendar, 
  Zap, 
  DollarSign, 
  Tag, 
  Info,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Compass,
  Printer
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { generateUserGuidePdf } from '../../utils/pdfGenerator';

interface UserGuideProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewProduct: () => void;
  onOpenNewSale: () => void;
  onOpenEditionModal?: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({
  onNavigateTab,
  onOpenNewProduct,
  onOpenNewSale,
  onOpenEditionModal,
}) => {
  const { editions, activeEditionId } = useBazar();
  const activeEditionName = editions.find(e => e.id === activeEditionId)?.name || 'Geral';

  const [activeSection, setActiveSection] = useState<'flow' | 'modules' | 'checklist' | 'faq'>('flow');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);

  const handlePrintPdf = () => {
    generateUserGuidePdf(activeEditionName);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  const modules = [
    {
      title: '1. Criar o Bazar: Edições & Link Exclusivo (Passo 1)',
      icon: Calendar,
      badge: '⭐ 1º Passo: Comece Criando o Evento',
      color: 'from-emerald-600 to-emerald-700',
      summary: 'O primeiro passo é criar o bazar para definir o evento, selecionar os produtos e gerar o link exclusivo para as clientes.',
      steps: [
        'CRIAR O BAZAR PRIMEIRO: Clique em "1. Bazar" ou "+ Criar Novo Bazar" no menu para abrir uma nova edição (ex: "Bazar de Inverno VIP", "Bazar Relâmpago 48h", "Edição Especial de Aniversário").',
        'Vínculo de Produtos ao Bazar: Escolha quais peças do seu estoque farão parte desta edição específica ou ative todo o estoque de uma vez.',
        'Link Exclusivo com Produtos Conectados: O sistema gera automaticamente um link exclusivo da edição (?loja=1&edicao=...), garantindo que suas clientes vejam exatamente e somente as peças desse evento!',
        'Alternar e Histórico de Bazares: Você pode alternar entre bazares a qualquer momento para ver o faturamento de cada edição individualmente ou selecionar "Todas as Edições" para uma visão consolidada.'
      ]
    },
    {
      title: '2. Produtos: Cadastro no Estoque, Fotos & Margens (Passo 2)',
      icon: Package,
      badge: '2º Passo: Cadastre suas Peças',
      color: 'from-amber-600 to-amber-700',
      summary: 'Cadastre suas peças no estoque com fotos nítidas, custos e preços De/Por com cálculo de lucro automático.',
      steps: [
        'Como cadastrar: Clique em "+ Novo Produto" ou na aba "2. Produtos".',
        'Foto Otimizada: Tire foto na hora com a câmera do celular ou selecione da galeria. O sistema otimiza e comprime a foto automaticamente em alta resolução sem travar o celular.',
        'Preço de Custo (obrigatório): Digite quanto você pagou ou gastou na peça para que o sistema saiba seu lucro real.',
        'Preço Cheio de Loja & Valor no Bazar: Defina o preço original de loja e o valor promocional do bazar. O sistema calcula na hora a economia da cliente, a porcentagem de desconto e a sua Margem de Lucro em R$ e %.',
        'Tamanho, Cor, Categoria e Subcategoria: Preencha para que suas fotos fiquem organizadas na vitrine virtual e com filtros rápidos para as clientes.'
      ]
    },
    {
      title: '3. Vendas: Registro Ágil & Caixa com Baixa de Estoque (Passo 3)',
      icon: ShoppingCart,
      badge: '3º Passo: Caixa Rápido',
      color: 'from-blue-600 to-blue-700',
      summary: 'Lançamento de vendas em segundos com baixa de estoque automática e cálculo de lucro real.',
      steps: [
        'Clique no botão "+ Nova Venda" (no topo da tela, no rodapé ou direto no card da peça).',
        'Selecione o produto vendido e a quantidade.',
        'Informe o nome da cliente e WhatsApp (excelente para histórico e pós-venda).',
        'Escolha a forma de pagamento: PIX, Dinheiro, Cartão de Crédito, Cartão de Débito ou Fiado / A Prazo.',
        'Desconto Especial (opcional): Se conceder um desconto extra para fechar a compra, o sistema recalcula o lucro líquido da transação em tempo real.',
        'Ao confirmar a venda, o estoque da peça é baixado na mesma hora e o valor do lucro entra diretamente no seu Dashboard e Relatórios.'
      ]
    },
    {
      title: '4. Vitrine: Fotos, Loja Online com Sacola & WhatsApp (Passo 4)',
      icon: Share2,
      badge: '4º Passo: Divulgação & Pedidos',
      color: 'from-rose-600 to-rose-700',
      summary: 'Link exclusivo da edição, fotos com De/Por e sacolinha onde o cliente monta o pedido e envia no WhatsApp.',
      steps: [
        'Link Oficial da Edição Selecionada: O link com o código do bazar fica em destaque no topo da Vitrine para ser copiado ou enviado no WhatsApp com 1 toque.',
        'Visão do Cliente (Loja com Sacola): Ao abrir o link, a cliente visualiza apenas os produtos daquela edição com fotos nítidas, valores De/Por e botão de "Adicionar à Sacola".',
        'Pedido Pronto no WhatsApp da Loja: Ao finalizar a sacola, a cliente clica em "Enviar Pedido no WhatsApp". O sistema monta o texto completo com as peças, valores, chave PIX da loja e dados de entrega.',
        'Baixar Fotos Editadas: Você também pode baixar as imagens em alta definição com preços De/Por para postar nos Stories do Instagram ou enviar nos grupos VIP do WhatsApp.'
      ]
    },
    {
      title: '5. Relatórios & Dashboard de Lucro Líquido Real (Passo 5)',
      icon: TrendingUp,
      badge: '5º Passo: Dinheiro no Bolso',
      color: 'from-teal-600 to-teal-700',
      summary: 'Acompanhamento do lucro líquido real no bolso, métricas do evento e gráficos.',
      steps: [
        'Faturamento vs Lucro Real: O painel mostra o valor total vendido e o Lucro Líquido Real (descontando o custo das peças).',
        'Margem Média: Saiba exatamente a porcentagem de ganho de cada edição do seu bazar.',
        'Top Produtos & Formas de Pagamento: Descubra quais produtos foram campeões de venda e se o PIX foi o meio mais utilizado.',
        'Relatório de Lucro e Impressão PDF: Na aba Relatórios, visualize cada venda com seu custo, receita e margem, com opção de exportar ou imprimir um PDF profissional.'
      ]
    },
    {
      title: '6. Dados da Loja, Chave PIX & Backup Seguro (Passo 6)',
      icon: Store,
      badge: '6º Passo: Identidade & Segurança',
      color: 'from-indigo-600 to-indigo-700',
      summary: 'Cadastre sua chave PIX, contatos e faça backup para nunca perder informações.',
      steps: [
        'Acesse a aba "6. Dados da Loja" para cadastrar o nome da sua marca, telefone WhatsApp, chave PIX e Instagram.',
        'Essas informações são inseridas automaticamente na loja online, nas mensagens de pedido e em todos os materiais compartilhados.',
        'Backup de Segurança: Clique no botão de Configurações (ícone de engrenagem) e faça o download do arquivo de backup JSON periodicamente.',
        'Troca de Aparelho: Se você trocar de celular ou computador, basta importar esse arquivo para restaurar todos os seus bazares, produtos, fotos e vendas em 1 clique.'
      ]
    },
    {
      title: '7. Manual de Uso: Consulta e Treinamento (Passo 7)',
      icon: BookOpen,
      badge: '7º Passo: Guia Didático',
      color: 'from-lime-700 to-lime-800',
      summary: 'Consulte o passo a passo a qualquer momento e imprima o manual em PDF.',
      steps: [
        'Consulte este manual a qualquer momento no menu para esclarecer dúvidas ou treinar ajudantes e vendedoras do seu bazar.',
        'Checklist Pré-Bazar: Utilize a lista de verificação integrada para garantir que nada seja esquecido antes de abrir os portões.',
        'Versão Impressa em PDF: Clique em "Imprimir / Salvar PDF" no topo para gerar um arquivo para impressão rápida.'
      ]
    },
    {
      title: '8. Próximos Passos: Cursos & Mentoria VIP com Danilla (Passo 8)',
      icon: Compass,
      badge: '8º Passo: Escala & Crescimento',
      color: 'from-amber-700 to-amber-800',
      summary: 'Eleve seu bazar a outro nível com cursos de precificação, gestão financeira e mentoria VIP.',
      steps: [
        'Cursos Oficiais Danilla Finanças: Aulas práticas para precificar com margens saudáveis e atrair multidões para o seu evento.',
        'Consultoria Individual: Diagnóstico financeiro personalizado para transformar estoque parado em dinheiro vivo.',
        'Mentoria VIP: Acompanhamento exclusivo passo a passo para dobrar os lucros da sua próxima edição.'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Qual é a ordem e o fluxo ideal recomendado para realizar o bazar?',
      answer: 'O fluxo ideal e mais organizado segue exatamente esta sequência de 8 passos: 1º Criar o Bazar (definir a edição e gerar o link exclusivo conectado aos produtos); 2º Produtos (cadastrar no estoque com fotos nítidas, custos e preços De/Por com margem automática); 3º Vendas (registrar saídas no caixa ágil com baixa automática de estoque); 4º Vitrine (enviar o link da edição selecionada para clientes montarem pedidos na sacola pelo WhatsApp); 5º Relatórios (conferir faturamento e o lucro líquido real no bolso); 6º Dados da Loja (manter chave PIX e WhatsApp atualizados); 7º Manual de Uso (consultar o guia didático e imprimir em PDF para a equipe); 8º Próximos Passos (cursos de precificação e mentoria VIP com a Danilla).'
    },
    {
      question: 'Como faço para não perder minhas fotos e dados se eu trocar de celular ou computador?',
      answer: 'O Rx do Bazar armazena seus dados em um banco local seguro e de alta capacidade (IndexedDB). Para garantir total tranquilidade, vá em "Configurações" (ícone de engrenagem no topo) e clique em "Fazer Backup (Download JSON)". Guarde esse arquivo no seu Google Drive, WhatsApp ou e-mail. No novo aparelho, basta clicar em "Restaurar Backup" e selecionar o arquivo.'
    },
    {
      question: 'Por que o aplicativo não trava mais ao colocar muitas fotos?',
      answer: 'Implementamos um otimizador automático de fotos em canvas. Ao tirar foto com a câmera ou carregar da galeria, a imagem é comprimida e redimensionada na medida ideal para a vitrine virtual, consumindo pouquíssima memória do seu aparelho e permitindo cadastrar dezenas ou centenas de peças com rapidez.'
    },
    {
      question: 'Como calcular o preço de venda sem ter prejuízo no bazar?',
      answer: 'A regra de ouro do Rx do Bazar: certifique-se sempre de que o "Valor no Bazar" seja superior ao "Preço de Custo". O sistema mostra o "Lucro Unitário" em tempo real no cadastro. Idealmente, busque margens acima de 30% a 50% para cobrir taxas de cartão e despesas operacionais.'
    },
    {
      question: 'Como buscar uma peça rapidamente na hora que a cliente perguntar no WhatsApp?',
      answer: 'Abra a aba "Vitrine de Fotos" e digite parte do nome da peça, cor ou código na barra de busca no topo. A vitrine filtra na mesma hora. Você pode clicar no botão "Copiar Texto" ou "Enviar Foto" e mandar direto para a cliente com os valores calculados.'
    },
    {
      question: 'Como colocar o aplicativo na área de trabalho do meu celular com o ícone Rx?',
      answer: 'É muito simples e prático! Toque no botão "App Rx" ou "Instalar App" disponível no topo e no menu de abas do sistema. No iPhone (Safari), toque no botão Compartilhar (ícone com quadrado e seta para cima no rodapé do Safari) e selecione "Adicionar à Tela de Início". No Android (Google Chrome), toque em "Adicionar à Área de Trabalho" ou toque nos 3 pontinhos no canto superior e escolha "Instalar aplicativo". O sistema criará o ícone verde escuro oficial "Rx" na sua tela inicial, permitindo que você acerte seu estoque e registre vendas em tela cheia com 1 toque!'
    },
    {
      question: 'O que significa a opção "Todas as Edições" no seletor de bazar?',
      answer: 'Permite que você visualize todo o estoque e o faturamento histórico somado de todos os bazares que você já realizou. Para o dia a dia do evento, recomendamos manter selecionada a edição específica do bazar atual.'
    }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2A3722] via-[#3A452F] to-[#4A5D3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#3A4A30] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-[#8FA079]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#8FA079] text-[#1F2919] font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <BookOpen className="h-3.5 w-3.5" />
                Manual Prático do Usuário
              </span>
              <span className="bg-white/10 text-[#CAD7BE] font-medium text-xs px-3 py-1 rounded-full border border-white/10">
                Versão 2.0 • Didático & Rápido
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Guia Completo do Rx do Bazar de Sucesso 🛍️
            </h2>
            <p className="text-xs sm:text-sm text-[#D8C7AC] leading-relaxed">
              Aprenda em poucos minutos a cadastrar produtos com fotos, divulgar sua vitrine com De/Por, registrar vendas ágeis no PDV e acompanhar seu <strong>lucro líquido no bolso</strong> em tempo real.
            </p>
          </div>

          {/* Action shortcuts */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onOpenEditionModal ? onOpenEditionModal() : onNavigateTab('dashboard')}
              className="bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>1. Criar / Ver Bazar</span>
            </button>
            <button
              onClick={() => onOpenNewProduct()}
              className="bg-[#242F1E] hover:bg-[#34442B] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-[#576945] transition flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>2. Cadastrar Produto</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
              title="Gera uma versão formatada para impressão ou salvamento em PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-[#242F1E] p-1.5 rounded-2xl border border-slate-200 dark:border-[#3A4A30] shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveSection('flow')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSection === 'flow'
              ? 'bg-[#3A452F] text-white shadow-md'
              : 'text-slate-600 dark:text-[#D8C7AC] hover:bg-slate-100 dark:hover:bg-[#2F3E26]'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Fluxo Ideal (8 Passos)</span>
        </button>

        <button
          onClick={() => setActiveSection('modules')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSection === 'modules'
              ? 'bg-[#3A452F] text-white shadow-md'
              : 'text-slate-600 dark:text-[#D8C7AC] hover:bg-slate-100 dark:hover:bg-[#2F3E26]'
          }`}
        >
          <Package className="h-4 w-4 text-emerald-400" />
          <span>Módulos Passo a Passo</span>
        </button>

        <button
          onClick={() => setActiveSection('checklist')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSection === 'checklist'
              ? 'bg-[#3A452F] text-white shadow-md'
              : 'text-slate-600 dark:text-[#D8C7AC] hover:bg-slate-100 dark:hover:bg-[#2F3E26]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
          <span>Checklist do Evento</span>
        </button>

        <button
          onClick={() => setActiveSection('faq')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSection === 'faq'
              ? 'bg-[#3A452F] text-white shadow-md'
              : 'text-slate-600 dark:text-[#D8C7AC] hover:bg-slate-100 dark:hover:bg-[#2F3E26]'
          }`}
        >
          <HelpCircle className="h-4 w-4 text-rose-400" />
          <span>Perguntas Frequentes</span>
        </button>
      </div>

      {/* SECTION 1: FLUXO EM 4 PASSOS */}
      {activeSection === 'flow' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#242F1E] border border-slate-200 dark:border-[#3A4A30] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-xs font-bold text-[#8FA079] uppercase tracking-wider">Como funciona o Rx do Bazar</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                O Ciclo Perfeito para um Bazar Lucrativo
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#CAD7BE]">
                Siga esta sequência recomendada para organizar, vender e faturar com facilidade e controle financeiro absoluto.
              </p>
            </div>

            {/* Dica de Ouro: O Fluxo Ideal e Completo do Bazar */}
            <div className="bg-[#FAF7F2] dark:bg-[#1A2315] border-2 border-[#8FA079]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 bg-[#8FA079]/20 text-[#2A3722] dark:text-[#D8C7AC] rounded-xl shrink-0">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    Fluxo Ideal Recomendado
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    1. Criar o Bazar ➔ 2. Produtos ➔ 3. Vendas ➔ 4. Vitrine ➔ 5. Relatórios ➔ 6. Dados ➔ 7. Manual ➔ 8. Próximos Passos
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                  Comece criando o <strong>Bazar</strong> para definir a edição e gerar o link exclusivo conectado aos produtos. Depois cadastre os <strong>Produtos</strong>, registre as <strong>Vendas</strong> no caixa, envie a <strong>Vitrine</strong> com sacola no WhatsApp e confira os <strong>Relatórios</strong> de lucro real!
                </p>
              </div>
            </div>

            {/* Grid com os 8 Passos do Fluxo Ideal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Step 1: Criar o Bazar */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border-2 border-[#8FA079]/60 dark:border-[#8FA079]/40 rounded-2xl p-4 relative flex flex-col justify-between space-y-3 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      1
                    </span>
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      ⭐ 1º Passo: O Evento
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      1. Criar o Bazar
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Crie a edição do evento (ex: "Bazar VIP"), selecione as peças e gere o link exclusivo oficial conectado aos produtos.
                  </p>
                </div>
                <button
                  onClick={() => onOpenEditionModal ? onOpenEditionModal() : onNavigateTab('dashboard')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>+ Criar / Ver Bazar</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 2: Produtos */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      2
                    </span>
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      Estoque & Margens
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      2. Produtos
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Cadastre suas peças com foto nítida, preço de custo, valor promocional e desconto De/Por automático.
                  </p>
                </div>
                <button
                  onClick={() => onOpenNewProduct()}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>+ Cadastrar Produto</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 3: Vendas */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      3
                    </span>
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                      Caixa Ágil
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      3. Vendas
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Lance vendas no balcão ou WhatsApp em segundos com baixa de estoque automática e cálculo de lucro real.
                  </p>
                </div>
                <button
                  onClick={() => onOpenNewSale()}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>+ Registrar Venda</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 4: Vitrine */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      4
                    </span>
                    <Share2 className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                      Loja Online & Sacola
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      4. Vitrine
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Envie o link exclusivo com os produtos da edição selecionada onde a cliente monta a sacola e manda no WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Abrir Vitrine</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 5: Relatórios */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      5
                    </span>
                    <TrendingUp className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">
                      Lucro no Bolso
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      5. Relatórios
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Acompanhe faturamento, margem média, formas de pagamento e o lucro líquido real de cada edição.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('dashboard')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Ver Relatórios</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 6: Dados da Loja */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      6
                    </span>
                    <Store className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                      Identidade & PIX
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      6. Dados da Loja
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Configure o nome da marca, telefone WhatsApp, chave PIX e realize o backup seguro dos dados.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('store')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Dados da Loja</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 7: Manual de Uso */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      7
                    </span>
                    <BookOpen className="h-4 w-4 text-lime-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-lime-600 dark:text-lime-400">
                      Guia Didático
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      7. Manual de Uso
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Consulte dúvidas, acerte sua equipe e imprima o manual didático completo em PDF.
                  </p>
                </div>
                <button
                  onClick={handlePrintPdf}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Imprimir PDF</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 8: Próximos Passos */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-4 relative flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-xs flex items-center justify-center shadow">
                      8
                    </span>
                    <Compass className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      Escala & Lucro
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      8. Próximos Passos
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Cursos oficiais de precificação, finanças e mentoria individual com a Danilla para dobrar seus resultados.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('next_steps')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Cursos & Mentoria</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

            </div>
          </div>

          {/* Highlight Card: Regra do Lucro Real */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#1F2919] text-white p-6 sm:p-7 rounded-3xl border border-emerald-700/60 shadow-lg flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 shrink-0">
              <DollarSign className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                Princípio Financeiro Fundamental
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white">
                Faturamento não é Lucro: O que importa é o que sobra no seu bolso!
              </h4>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Vender R$ 5.000,00 com custo de R$ 4.500,00 deixa apenas R$ 500,00 de lucro. O <strong>Rx do Bazar</strong> calcula e separa o custo de cada produto automaticamente para você saber com exatidão sua margem líquida real.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition shadow-md whitespace-nowrap shrink-0"
            >
              Ver Relatório de Lucro
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: MÓDULOS PASSO A PASSO */}
      {activeSection === 'modules' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#242F1E] border border-slate-200 dark:border-[#3A4A30] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Explicação Detalhada de Cada Módulo do Sistema
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#CAD7BE] mb-6">
              Clique no módulo desejado para ver as instruções práticas e dicas operacionais.
            </p>

            <div className="space-y-3">
              {modules.map((mod, idx) => {
                const IconComponent = mod.icon;
                const isOpen = openModuleIndex === idx;

                return (
                  <div 
                    key={idx}
                    className="border border-slate-200 dark:border-[#3A4A30] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#1F2919]/50 transition"
                  >
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 dark:hover:bg-[#2F3E26]/60 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-[#3A452F] text-white shadow-sm shrink-0">
                          <IconComponent className="h-5 w-5 text-[#CAD7BE]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {mod.title}
                            </h4>
                            <span className="text-[10px] font-extrabold bg-[#8FA079]/20 text-[#2B3323] dark:text-[#CAD7BE] px-2.5 py-0.5 rounded-full border border-[#8FA079]/30">
                              {mod.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-[#D8C7AC] mt-0.5 line-clamp-1">
                            {mod.summary}
                          </p>
                        </div>
                      </div>
                      <div className="p-1 rounded-lg text-slate-400 dark:text-[#CAD7BE]">
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-2 border-t border-slate-200 dark:border-[#3A4A30] bg-white dark:bg-[#242F1E] space-y-3">
                        <p className="text-xs font-semibold text-slate-700 dark:text-[#E5EBDE]">
                          {mod.summary}
                        </p>
                        <ul className="space-y-2">
                          {mod.steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-[#D8C7AC]">
                              <span className="w-4 h-4 rounded-full bg-[#8FA079] text-[#1F2919] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: CHECKLIST DO EVENTO */}
      {activeSection === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#242F1E] border border-slate-200 dark:border-[#3A4A30] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#8FA079] uppercase tracking-wider">Passo a Passo Prático</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Checklist Operacional do Bazar de Sucesso
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#CAD7BE]">
                  Use este checklist para garantir que nada passe despercebido antes, durante e depois do seu bazar.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrintPdf}
                className="bg-[#3A452F] hover:bg-[#4A5D3B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition shrink-0"
              >
                <Printer className="h-4 w-4 text-amber-400" />
                <span>Imprimir Checklist (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Phase 1 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#3A4A30]">
                  <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                    FASE 1
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Antes do Bazar (1 semana)
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#D8C7AC]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>1º Passo:</strong> Criar o Bazar (ou selecionar a edição do evento) e gerar o link exclusivo da edição com as peças conectadas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>2º Passo:</strong> Cadastrar ou conferir os <strong>Produtos</strong> no estoque com fotos nítidas, custos reais e preços promocionais De/Por.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>3º Passo:</strong> Conferir Chave PIX, WhatsApp e contatos na aba <strong>Dados da Loja</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>4º Passo:</strong> Divulgar a <strong>Vitrine</strong> com link da edição e sacola para pedidos rápidos via WhatsApp.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Gerar fotos JPG com mensagens prontas para aquecimento no Instagram/WhatsApp.</span>
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#3A4A30]">
                  <span className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs">
                    FASE 2
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Durante o Bazar (Dia D)
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#D8C7AC]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Deixar o app aberto na tela de <strong>Vitrine</strong> com a busca ativa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Conforme as clientes reservarem, lançar a venda imediatamente em <strong>+ Nova Venda</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Copiar o texto formatado para mandar comprovante e confirmação no WhatsApp.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Acompanhar peças esgotadas e itens com pouco estoque pelo filtro da vitrine.</span>
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#3A4A30]">
                  <span className="p-1.5 rounded-lg bg-blue-500 text-white font-black text-xs">
                    FASE 3
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Pós-Bazar (Fechamento & Lucro)
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#D8C7AC]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Acessar o <strong>Dashboard</strong> e conferir o Faturamento e Lucro Líquido Real.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Exportar o <strong>Relatório de Lucro em PDF</strong> para salvar seu arquivo financeiro.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Fazer o <strong>Download do Backup JSON</strong> em Configurações.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Separar o lucro para a sua <strong>Reserva da Paz</strong> e reinvestimento!</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PERGUNTAS FREQUENTES (FAQ) */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#242F1E] border border-slate-200 dark:border-[#3A4A30] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Perguntas Frequentes & Dicas Práticas
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#CAD7BE] mt-1">
                Tire suas dúvidas operacionais para extrair o máximo do sistema.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-[#3A4A30] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#1F2919]/50 transition"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 dark:hover:bg-[#2F3E26]/60 transition"
                    >
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-[#8FA079] shrink-0" />
                        {faq.question}
                      </span>
                      <div className="p-1 rounded-lg text-slate-400 dark:text-[#CAD7BE] shrink-0">
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-2 border-t border-slate-200 dark:border-[#3A4A30] bg-white dark:bg-[#242F1E]">
                        <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation CTA */}
      <div className="bg-[#2A3722] text-[#D8C7AC] border border-[#3A4A30] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#8FA079]/20 rounded-2xl border border-[#8FA079]/30 text-[#CAD7BE]">
            <Compass className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Quer dar o próximo passo nas suas finanças?</h4>
            <p className="text-xs text-[#CAD7BE]">Conheça os cursos e mentorias de Danilla Molina para organizar seu negócio.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('next_steps')}
          className="bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs px-5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
        >
          Ver Próximos Passos
        </button>
      </div>

    </div>
  );
};
