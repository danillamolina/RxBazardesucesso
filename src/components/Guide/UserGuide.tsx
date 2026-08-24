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
}

export const UserGuide: React.FC<UserGuideProps> = ({
  onNavigateTab,
  onOpenNewProduct,
  onOpenNewSale,
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
      title: '1. Edições do Bazar (Gestão de Múltiplos Bazares)',
      icon: Calendar,
      badge: 'Organização',
      color: 'from-amber-600 to-amber-700',
      summary: 'Como criar edições, manter o último bazar em aberto e analisar históricos.',
      steps: [
        'O aplicativo sempre abre automaticamente no seu bazar mais recente para você não perder tempo.',
        'Para criar um novo evento (ex: "Bazar de Natal", "Bazar Relâmpago"), clique no botão "+ Novo Bazar" no topo da tela.',
        'Você pode alternar entre bazares a qualquer momento ou selecionar "Todas as Edições" para uma visão consolidada de faturamento e estoque.',
        'Cada produto e venda pode ser vinculado ao bazar correspondente, mantendo o lucro de cada edição 100% isolado e claro.'
      ]
    },
    {
      title: '2. Estoque & Cadastro Inteligente de Produtos',
      icon: Package,
      badge: 'Precificação & Fotos',
      color: 'from-emerald-600 to-emerald-700',
      summary: 'Fotos direto da câmera ou galeria com compressão que não trava o celular.',
      steps: [
        'Clique em "+ Novo Produto" no menu superior ou na aba Estoque.',
        'Foto do Produto: tire uma foto na hora com a câmera do celular ou selecione fotos da galeria. O sistema otimiza e comprime a foto automaticamente para o app ficar super rápido e sem limite de fotos.',
        'Preço de Custo (obrigatório): quanto você pagou ou gastou para produzir a peça.',
        'Preço Cheio de Loja (opcional): o valor original de tabela para mostrar a promoção De/Por.',
        'Desconto no Bazar & Valor no Bazar: defina o preço final que a cliente vai pagar. O sistema calcula na hora seu Lucro Unitário em R$ e sua Margem de Lucro %.',
        'Tamanho, Cor e Categoria: preencha para facilitar a busca e os filtros na vitrine.',
        'Data de Validade (opcional): ótimo para cosméticos, maquiagens e produtos perecíveis.'
      ]
    },
    {
      title: '3. Vitrine Virtual & Compartilhamento no WhatsApp',
      icon: Share2,
      badge: 'Divulgação & Vendas',
      color: 'from-blue-600 to-blue-700',
      summary: 'Busca por nome, cartões elegantes e geração de fotos em JPG para redes sociais.',
      steps: [
        'Busca Rápida: use a barra de busca no topo da vitrine para digitar o nome da peça ou código e achar o produto em 1 segundo.',
        'Visualização Flexível: alterne entre o modo "Cartão Completo" (com foto em destaque) e "Grade Compacta".',
        'Sobreposição Limpa: as fotos possuem caixa branca com "Preço Cheio" riscado e valor "Por R$..." em destaque.',
        'Copiar Texto WhatsApp: clique no botão de copiar para gerar uma mensagem pronta com emojis, descrição e dados de pagamento para colar no WhatsApp.',
        'Enviar Foto JPG ao Cliente: clique no ícone de compartilhamento do produto para gerar um card visual em JPG de alta definição já com sua chave PIX, telefone e foto da peça.',
        'Exportar Catálogo Completo: no botão superior da vitrine, baixe o catálogo inteiro em PDF ou imagem contínua para enviar em grupos VIP.'
      ]
    },
    {
      title: '4. Registro de Vendas & PDV do Bazar',
      icon: ShoppingCart,
      badge: 'Agilidade no Caixa',
      color: 'from-purple-600 to-purple-700',
      summary: 'Lançamento de vendas em segundos com baixa de estoque automática.',
      steps: [
        'Clique no botão "+ Nova Venda" (no topo da tela ou direto no produto).',
        'Selecione o produto vendido e a quantidade.',
        'Informe o nome da cliente (opcional, mas excelente para fidelização).',
        'Escolha a forma de pagamento: PIX, Dinheiro, Cartão de Crédito, Cartão de Débito ou Fiado / A Prazo.',
        'Desconto Especial (opcional): se você conceder um desconto extra para fechar a venda, o sistema recalcula o lucro líquido da transação em tempo real.',
        'Ao confirmar a venda, o estoque da peça é baixado automaticamente e o lucro entra no seu Dashboard instantaneamente.'
      ]
    },
    {
      title: '5. Dashboard & Relatórios Financeiros',
      icon: TrendingUp,
      badge: 'Lucro Real',
      color: 'from-rose-600 to-rose-700',
      summary: 'Acompanhamento do lucro líquido no bolso e métricas do evento.',
      steps: [
        'Faturamento vs Lucro Real: o painel mostra o valor total vendido e, mais importante, o Lucro Líquido Real (já descontando o custo das peças).',
        'Margem Média: saiba exatamente a porcentagem de ganho do seu bazar.',
        'Top Produtos & Formas de Pagamento: descubra quais produtos foram campeões de venda e se o PIX foi o meio mais utilizado.',
        'Relatório de Lucro: na aba Relatórios, visualize cada venda com seu custo, receita e margem, com opção de exportar um PDF profissional e organizado.'
      ]
    },
    {
      title: '6. Dados da Loja, Chave PIX & Backup Seguro',
      icon: Store,
      badge: 'Segurança & Configuração',
      color: 'from-slate-700 to-slate-800',
      summary: 'Personalize seus contatos e faça backup para nunca perder informações.',
      steps: [
        'Acesse a aba "Dados da Loja" para cadastrar o nome da sua marca, telefone WhatsApp, chave PIX e Instagram.',
        'Essas informações são inseridas automaticamente em todos os anúncios e imagens compartilhadas com as clientes.',
        'Backup de Segurança: clique no botão de Configurações (ícone de engrenagem) e faça o download do arquivo de backup JSON.',
        'Se você trocar de celular ou computador, basta importar esse arquivo para restaurar todos os seus produtos, fotos e vendas em 1 clique.'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Como faço para não perder minhas fotos e dados se eu trocar de celular ou computador?',
      answer: 'O Rx do Bazar armazena seus dados em um banco local seguro e de alta capacidade (IndexedDB). Para garantir total tranquilidade, vá em "Configurações" (ícone de engrenagem no topo) e clique em "Fazer Backup (Download JSON)". Guarde esse arquivo no seu Google Drive, WhatsApp ou e-mail. No novo aparelho, basta clicar em "Restaurar Backup" e selecionar o arquivo.'
    },
    {
      question: 'Por que o aplicativo não trava mais ao colocar muitas fotos?',
      answer: 'Implementamos um otimizador automático de fotos em canvas. Ao tirar foto com a câmera ou carregar da galeria, a imagem é comprimida e redimensionada na medida ideal para a vitrine e catálogo, consumindo pouquíssima memória do seu aparelho e permitindo cadastrar dezenas ou centenas de peças com rapidez.'
    },
    {
      question: 'Como calcular o preço de venda sem ter prejuízo no bazar?',
      answer: 'A regra de ouro do Rx do Bazar: certifique-se sempre de que o "Valor no Bazar" seja superior ao "Preço de Custo". O sistema mostra o "Lucro Unitário" em tempo real no cadastro. Idealmente, busque margens acima de 30% a 50% para cobrir taxas de cartão e despesas operacionais.'
    },
    {
      question: 'Como buscar uma peça rapidamente na hora que a cliente perguntar no WhatsApp?',
      answer: 'Abra a aba "Vitrine & WhatsApp" e digite parte do nome da peça, cor ou código na barra de busca no topo. O catálogo filtra na mesma hora. Você pode clicar no botão "Copiar Texto" ou "Enviar Foto" e mandar direto para a cliente com os valores calculados.'
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
              onClick={handlePrintPdf}
              className="bg-amber-400 hover:bg-amber-300 text-[#1F2919] font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
              title="Gera uma versão formatada para impressão ou salvamento em PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onOpenNewProduct}
              className="bg-[#8FA079] hover:bg-[#A3B48D] text-[#1F2919] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar 1º Produto</span>
            </button>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="bg-[#1F2919] hover:bg-[#2F3E26] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-[#576945] transition flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4 text-[#CAD7BE]" />
              <span>Ver Vitrine Virtual</span>
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
          <span>Fluxo em 4 Passos</span>
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
                Siga esta sequência simples para organizar, vender e faturar com controle financeiro absoluto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Step 1 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-sm flex items-center justify-center shadow">
                      1
                    </span>
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Abrir o Bazar
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Crie a edição do evento (ex: "Bazar de Outono VIP") ou utilize a edição ativa que já abre automaticamente.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('dashboard')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Ver Bazar Aberto</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-sm flex items-center justify-center shadow">
                      2
                    </span>
                    <Camera className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Cadastrar com Fotos
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Tire fotos direto da câmera ou pegue da galeria. Defina Custo, Preço Cheio de Loja e Valor do Bazar.
                  </p>
                </div>
                <button
                  onClick={onOpenNewProduct}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>+ Adicionar Peça</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-sm flex items-center justify-center shadow">
                      3
                    </span>
                    <Share2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Divulgar na Vitrine
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Busque produtos por nome, copie textos prontos para WhatsApp e exporte imagens JPG com sua chave PIX.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>Abrir Catálogo</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 dark:bg-[#1F2919] border border-slate-200 dark:border-[#3A4A30] rounded-2xl p-5 relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#8FA079] text-[#1F2919] font-black text-sm flex items-center justify-center shadow">
                      4
                    </span>
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Vender & Apurar Lucro
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#D8C7AC] leading-relaxed">
                    Lance as vendas no caixa, dê baixa automática de estoque e acompanhe o Lucro Líquido Real no Dashboard.
                  </p>
                </div>
                <button
                  onClick={onOpenNewSale}
                  className="text-xs font-bold text-[#8FA079] hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-[#3A4A30]"
                >
                  <span>+ Registrar Venda</span>
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
                    <span>Cadastrar o nome da nova edição em <strong>+ Novo Bazar</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Conferir Chave PIX e WhatsApp na aba <strong>Dados da Loja</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Fotografar e cadastrar todas as peças com fotos nítidas e boa luz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Revisar Preço de Custo e Preço De/Por de cada produto.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Exportar o Catálogo em PDF ou gerar fotos JPG para aquecimento no Instagram/WhatsApp.</span>
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
