import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    id: "gocase-s24-print",
    brand: "gocase",
    title: "Impressão descascando — Capinha Samsung S24",
    severity: "alta",
    signal: "+412% reviews negativos em 60 min",
    context: "87 reviews 1★ citando \"impressão descascando\" na última hora, concentrados no modelo Samsung S24.",
    rootCause: "Lote L-2410-07 do SKU GC-S24-PRINT produzido com cura UV abaixo da especificação (máquina UV-03).",
    sku: "GC-S24-PRINT",
    logs: [
      "detector  ▸ anomaly score 0.97 on reviews.negative_rate",
      "invest.   ▸ cruzando reviews × base de SKUs…",
      "invest.   ▸ 94% das reclamações → SKU GC-S24-PRINT",
      "invest.   ▸ rastreando lote de produção… L-2410-07",
      "invest.   ▸ MES log: UV-03 cure_time 38s (spec 60s)",
      "resolver  ▸ gerando plano de contingência…",
    ],
    actions: [
      { id: "a1", type: "bloqueio", label: "Pausar lote L-2410-07 na fábrica", description: "Suspende expedição de 1.240 unidades em estoque." },
      { id: "a2", type: "comunicacao", label: "E-mail de troca grátis", description: "Enviar para 612 clientes que compraram o lote." },
      { id: "a3", type: "ticket", label: "Ticket para Eng. de Produto", description: "Recalibrar máquina UV-03 e auditar lotes adjacentes." },
    ],
    emailSubject: "Sua capinha Gocase merece ser perfeita — troca por nossa conta",
    emailBody:
      "Oi, {nome}!\n\nIdentificamos que algumas capinhas do modelo Samsung S24 saíram com um defeito na impressão. Se a sua foi uma delas, pedimos desculpas.\n\nJá separamos uma nova para você, com frete grátis e sem precisar devolver a antiga.\n\nÉ só confirmar seu endereço no link abaixo.\n\nCom carinho,\nTime Gocase",
    avoidedLoss: 184_300,
  },
  {
    id: "gobeaute-serum-sp",
    brand: "gobeaute",
    title: "Ruptura local — Sérum X no CD São Paulo",
    severity: "alta",
    signal: "Estoque CD-SP = 0 · 312 pedidos com promessa D+1",
    context: "O CD de São Paulo zerou o estoque do Sérum X, mas o site segue vendendo com promessa de entrega em 1 dia.",
    rootCause: "Sincronização WMS→site atrasada 3h40 no CD-SP; CD-MG possui 2.870 unidades disponíveis.",
    sku: "GB-SERUM-X-30ML",
    logs: [
      "detector  ▸ stock_mismatch on GB-SERUM-X-30ML @ CD-SP",
      "invest.   ▸ consultando WMS… last_sync 3h40m ago",
      "invest.   ▸ 312 pedidos abertos sem cobertura",
      "invest.   ▸ CD-MG disponível: 2.870 un · lead time D+2",
      "resolver  ▸ simulando roteamento alternativo…",
      "resolver  ▸ gerando plano de contingência…",
    ],
    actions: [
      { id: "a1", type: "bloqueio", label: "Rotear pedidos para CD Minas Gerais", description: "Redireciona 312 pedidos abertos e novos pedidos da região SE." },
      { id: "a2", type: "bloqueio", label: "Alterar prazo no site para D+2", description: "Atualiza promessa dinamicamente para CEPs atendidos pelo CD-SP." },
      { id: "a3", type: "comunicacao", label: "Avisar clientes sobre novo prazo", description: "E-mail proativo com cupom de 10%." },
    ],
    emailSubject: "Seu Sérum X chega em breve — e com um mimo",
    emailBody:
      "Olá, {nome}!\n\nSeu pedido do Sérum X vai sair do nosso centro em Minas Gerais e chegará em até 2 dias úteis.\n\nPelo atraso de 1 dia, deixamos um cupom de 10% para a sua próxima compra: VOLTEI10.\n\nObrigada pela paciência!\nTime Gobeaute",
    avoidedLoss: 96_750,
  },
  {
    id: "payments-pix-drop",
    brand: "multi",
    title: "Queda na aprovação de PIX no checkout",
    severity: "media",
    signal: "Aprovação PIX −40% em 10 min",
    context: "A taxa de aprovação de PIX caiu de 97% para 58% nos últimos 10 minutos em todas as marcas.",
    rootCause: "Gateway PayFlux retornando timeout (HTTP 504) na geração de QR Code desde 22:04.",
    sku: "CHECKOUT-PIX",
    logs: [
      "detector  ▸ pix.approval_rate 97% → 58% (Δ -40%)",
      "invest.   ▸ segmentando por gateway… PayFlux 100% afetado",
      "invest.   ▸ 1.184 requisições HTTP 504 em /qrcode",
      "invest.   ▸ status page PayFlux: sem incidente declarado",
      "resolver  ▸ gerando plano de contingência…",
    ],
    actions: [
      { id: "a1", type: "bloqueio", label: "Ocultar PIX temporariamente", description: "Prioriza cartão e boleto até normalização." },
      { id: "a2", type: "ticket", label: "Notificar gateway PayFlux", description: "Abrir chamado P1 com evidências de logs." },
      { id: "a3", type: "comunicacao", label: "Recuperar carrinhos abandonados", description: "Disparar e-mail para 438 checkouts não concluídos." },
    ],
    emailSubject: "Seu carrinho está te esperando",
    emailBody:
      "Oi, {nome}!\n\nTivemos uma instabilidade no PIX há pouco e seu pedido não foi concluído.\n\nJá está tudo normal — seu carrinho continua salvo. Finalize com cartão ou boleto em um clique.\n\nAté já!",
    avoidedLoss: 62_400,
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id)!;

export const BRAND_LABEL = { gocase: "Gocase", gobeaute: "Gobeaute", multi: "Multi-marca" } as const;
