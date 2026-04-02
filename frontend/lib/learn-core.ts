import type { LearnArticle, LearnHub, LearnTool } from "@/lib/learn-types";
import { text } from "@/lib/learn-types";


export const essentialTools: LearnTool[] = [
  {
    name: "Ghidra",
    version: "11.x",
    description: text("Engenharia reversa geral para binarios nativos.", "General reverse engineering for native binaries."),
    downloadUrl: "https://github.com/NationalSecurityAgency/ghidra/releases",
    os: ["Windows", "Linux", "macOS"],
    price: "Gratis",
  },
  {
    name: "dnSpy",
    version: "dnSpyEx",
    description: text("Melhor escolha para malware .NET e extracao de configuracao.", "Best choice for .NET malware and configuration extraction."),
    downloadUrl: "https://github.com/dnSpyEx/dnSpy/releases",
    os: ["Windows"],
    price: "Gratis",
  },
  {
    name: "PEStudio",
    version: "Atual",
    description: text("Triagem inicial rapida para executaveis PE.", "Fast initial triage for PE executables."),
    downloadUrl: "https://www.winitor.com/download",
    os: ["Windows"],
    price: "Gratis",
  },
  {
    name: "Any.run",
    version: "Web",
    description: text("Sandbox online para comportamento em tempo real.", "Online sandbox for real-time behavior."),
    downloadUrl: "https://app.any.run/",
    os: ["Web"],
    price: "Freemium",
  },
  {
    name: "Triage",
    version: "Web",
    description: text("Sandbox automatizada com bom contexto de familia.", "Automated sandbox with strong family context."),
    downloadUrl: "https://tria.ge/",
    os: ["Web"],
    price: "Freemium",
  },
  {
    name: "FLOSS",
    version: "Atual",
    description: text("Extracao de strings ofuscadas e geradas em runtime.", "Extracts obfuscated or runtime-generated strings."),
    downloadUrl: "https://github.com/mandiant/flare-floss/releases",
    os: ["Windows", "Linux", "macOS"],
    price: "Gratis",
  },
];

export const learnHub: LearnHub = {
  kind: "hub",
  slug: "",
  title: text("Gon Exposing Learn", "Gon Exposing Learn"),
  description: text(
    "Do basico ao avancado. Aprenda a analisar malware com ferramentas reais, entender limites da automacao e tomar decisoes seguras.",
    "From basics to advanced. Learn to analyze malware with real tools, understand automation limits, and make safe decisions."
  ),
  disclaimer: text(
    "A analise automatica do Gon serve para triagem. O Learn Hub ensina como ir mais fundo sem colocar sua maquina em risco.",
    "Gon automated analysis is triage. The Learn Hub teaches you how to go deeper without putting your machine at risk."
  ),
  paths: [
    {
      title: text("Trilha iniciante", "Beginner path"),
      items: [
        { href: "/learn/environment", label: text("Ambiente seguro", "Safe environment") },
        { href: "/learn/basics", label: text("Analise basica", "Basic analysis") },
        { href: "/learn/strings", label: text("Analise de strings", "String analysis") },
        { href: "/learn/pestudio", label: text("PEStudio", "PEStudio") },
      ],
    },
    {
      title: text("Trilha intermediaria", "Intermediate path"),
      items: [
        { href: "/learn/ghidra", label: text("Ghidra", "Ghidra") },
        { href: "/learn/dnspy", label: text("dnSpy para .NET", "dnSpy for .NET") },
        { href: "/learn/yara", label: text("YARA rules", "YARA rules") },
        { href: "/learn/python", label: text("Scripts Python", "Python scripts") },
      ],
    },
    {
      title: text("Trilha avancada", "Advanced path"),
      items: [
        { href: "/learn/dynamic", label: text("Analise dinamica", "Dynamic analysis") },
        { href: "/learn/labs", label: text("Laboratorio pratico", "Practical labs") },
        { href: "/learn/glossary", label: text("Glossario", "Glossary") },
      ],
    },
  ],
  tools: essentialTools,
  tips: [
    text("Strings nao sao tudo. Use FLOSS quando suspeitar de ofuscacao.", "Strings are not everything. Use FLOSS when you suspect obfuscation."),
    text("Verifique imports cedo. APIs importadas revelam capacidade real.", "Check imports early. Imported APIs reveal real capability."),
    text("Entropia acima de 7.0 costuma indicar packing ou criptografia.", "Entropy above 7.0 usually means packing or encryption."),
    text("Nunca execute fora de VM. Comece sempre com analise estatica.", "Never run outside a VM. Always start with static analysis."),
    text("Para .NET, dnSpy quase sempre rende mais que uma abordagem generica.", "For .NET, dnSpy usually gives more value than a generic approach."),
  ],
};

export const topLearnArticles: LearnArticle[] = [
  {
    kind: "article",
    slug: "environment",
    title: text("Ambiente seguro de analise", "Safe analysis environment"),
    description: text("Como montar um laboratorio seguro antes de tocar em qualquer amostra.", "How to build a safe lab before touching any sample."),
    difficulty: "beginner",
    minutes: 20,
    safety: "vm-required",
    steps: [
      {
        id: "why",
        title: text("Por que isso importa", "Why this matters"),
        paragraphs: [
          text("Nao analise malware no computador principal. Mesmo uma analise descuidada pode levar a execucao acidental.", "Do not analyze malware on your main computer. A careless workflow can still lead to accidental execution."),
          text("O ponto de partida seguro e uma VM isolada, com snapshot limpo, sem pastas compartilhadas e com rede controlada.", "The safe starting point is an isolated VM with a clean snapshot, no shared folders, and controlled networking."),
        ],
        callout: {
          type: "danger",
          text: text("Nao use arrastar e soltar, clipboard compartilhado ou pasta compartilhada para transportar amostras para a VM.", "Do not use drag and drop, shared clipboard, or shared folders to move samples into the VM."),
        },
      },
      {
        id: "options",
        title: text("Opcoes de ambiente", "Environment options"),
        paragraphs: [
          text("VirtualBox e VMware Player cobrem a maioria dos casos locais. Any.run e Triage ajudam quando voce precisa de uma sandbox pronta.", "VirtualBox and VMware Player cover most local cases. Any.run and Triage help when you need a ready-made sandbox."),
        ],
        bullets: [
          text("RAM: 4 GB minimo, 8 GB ideal", "RAM: 4 GB minimum, 8 GB ideal"),
          text("Rede: host-only ou desconectada", "Network: host-only or disconnected"),
          text("Snapshot limpo antes e depois de cada analise", "Clean snapshot before and after every analysis"),
        ],
      },
      {
        id: "transfer",
        title: text("Transferencia segura da amostra", "Safe sample transfer"),
        paragraphs: [
          text("Compacte a amostra com senha antes de mover para a VM. Isso evita execucao acidental por clique duplo ou tratamento automatico do host.", "Archive the sample with a password before moving it into the VM. This helps prevent accidental execution or host-side automatic handling."),
        ],
        code: {
          language: "bash",
          value: "zip -P infected sample.zip payload.exe",
        },
      },
    ],
    tools: essentialTools.slice(0, 5),
    related: ["/learn/basics", "/learn/dynamic/local"],
  },
  {
    kind: "article",
    slug: "basics",
    title: text("Como ler um resultado", "How to read a result"),
    description: text("Interpretar score, IOC, strings, imports e proximos passos.", "Interpret score, IOC, strings, imports, and next steps."),
    difficulty: "beginner",
    minutes: 18,
    safety: "static-only",
    steps: [
      {
        id: "type",
        title: text("Identifique o tipo real do arquivo", "Identify the real file type"),
        paragraphs: [
          text("Extensao nao basta. Use magic bytes, Detect It Easy e a deteccao do proprio relatorio.", "Extensions are not enough. Use magic bytes, Detect It Easy, and the report itself."),
          text("Para binario .NET, avance para dnSpy. Para PE nativo, PEStudio e Ghidra costumam ser o caminho.", "For .NET binaries, move to dnSpy. For native PE files, PEStudio and Ghidra are usually the right next step."),
        ],
      },
      {
        id: "entropy",
        title: text("Cheque entropia antes de se aprofundar", "Check entropy before going deeper"),
        paragraphs: [
          text("Entropia alta em secao executavel indica packing ou criptografia. Isso reduz visibilidade de strings e imports.", "High entropy in executable sections usually means packing or encryption. That reduces visibility into strings and imports."),
        ],
        bullets: [
          text("Abaixo de 5.0: mais legivel", "Below 5.0: more readable"),
          text("Entre 6.0 e 7.0: moderado", "Between 6.0 and 7.0: moderate"),
          text("Acima de 7.0: suspeita forte de packing", "Above 7.0: strong packing suspicion"),
        ],
      },
      {
        id: "floss",
        title: text("Quando usar FLOSS", "When to use FLOSS"),
        paragraphs: [
          text("Se as strings estiverem pobres, tente FLOSS antes de concluir que o binario nao tem IOC.", "If strings are poor, try FLOSS before deciding the binary has no IOC."),
        ],
        code: {
          language: "bash",
          value: "floss.exe sample.exe > strings_output.txt",
        },
      },
    ],
    related: ["/learn/strings", "/learn/pestudio"],
  },
  {
    kind: "article",
    slug: "strings",
    title: text("Analise de strings", "String analysis"),
    description: text("Encontrar URLs, tokens, webhooks, paths e pistas de familia rapidamente.", "Find URLs, tokens, webhooks, paths, and family hints quickly."),
    difficulty: "beginner",
    minutes: 16,
    safety: "static-only",
    steps: [
      {
        id: "classes",
        title: text("O que procurar primeiro", "What to look for first"),
        paragraphs: [
          text("Procure URLs, dominios, webhooks, tokens, nomes de mutex, rotas de navegadores e APIs sensiveis.", "Look for URLs, domains, webhooks, tokens, mutex names, browser paths, and sensitive APIs."),
        ],
        bullets: [
          text("Discord, Telegram, Slack e Teams para exfiltracao", "Discord, Telegram, Slack, and Teams for exfiltration"),
          text("Login Data, Cookies e Local State para roubo de credenciais", "Login Data, Cookies, and Local State for credential theft"),
          text("CurrentVersion\\\\Run e SCHTASKS para persistencia", "CurrentVersion\\\\Run and SCHTASKS for persistence"),
        ],
      },
      {
        id: "telegram",
        title: text("Telegram tambem e canal de envio", "Telegram is also an exfil channel"),
        paragraphs: [
          text("Nao limite sua triagem a Discord. URLs da API de bot, tokens e chat_id podem indicar coleta e envio de dados.", "Do not limit triage to Discord. Bot API URLs, tokens, and chat_id values may indicate data collection and exfiltration."),
        ],
      },
    ],
    related: ["/learn/python/extract-strings", "/learn/ghidra/strings"],
  },
  {
    kind: "article",
    slug: "ghidra",
    title: text("Ghidra Deep Dive", "Ghidra deep dive"),
    description: text("Fluxo completo para navegar, localizar IOC e entender o caminho do binario.", "Full workflow to navigate, find IOC, and understand the binary path."),
    difficulty: "intermediate",
    minutes: 35,
    safety: "static-only",
    group: "ghidra",
    steps: [
      {
        id: "why",
        title: text("Quando usar", "When to use it"),
        paragraphs: [
          text("Use Ghidra para PE nativo, DLLs, loaders, binarios Linux, Go, Rust e casos em que imports e fluxo importam.", "Use Ghidra for native PE files, DLLs, loaders, Linux binaries, Go, Rust, and cases where imports and flow matter."),
        ],
      },
      {
        id: "workflow",
        title: text("Fluxo recomendado", "Recommended workflow"),
        paragraphs: [
          text("Importe, rode analise automatica, olhe strings, siga XRefs, abra decompiler e renomeie funcoes relevantes.", "Import, run auto-analysis, inspect strings, follow XRefs, open the decompiler, and rename relevant functions."),
        ],
      },
    ],
    related: ["/learn/ghidra/install", "/learn/ghidra/decompiler", "/learn/ghidra/scripts"],
  },
  {
    kind: "article",
    slug: "dnspy",
    title: text("dnSpy para .NET", "dnSpy for .NET"),
    description: text("Melhor escolha para AsyncRAT, XWorm, NanoCore e outros .NET.", "Best choice for AsyncRAT, XWorm, NanoCore, and other .NET malware."),
    difficulty: "intermediate",
    minutes: 28,
    safety: "static-only",
    group: "dnspy",
    steps: [
      {
        id: "why",
        title: text("Por que usar", "Why use it"),
        paragraphs: [
          text("Para .NET, dnSpy mostra C# quase original. Isso acelera muito a extracao de C2, chaves e logica de persistencia.", "For .NET, dnSpy shows near-original C#. That speeds up extracting C2, keys, and persistence logic."),
        ],
      },
      {
        id: "targets",
        title: text("O que procurar", "What to look for"),
        paragraphs: [
          text("Comece por classes Config, Settings, Program e Utils. Muitas familias deixam configuracao centralizada.", "Start with Config, Settings, Program, and Utils classes. Many families centralize configuration."),
        ],
      },
    ],
    related: ["/learn/dnspy/find-config", "/learn/dnspy/patch"],
  },
  {
    kind: "article",
    slug: "pestudio",
    title: text("PEStudio para triagem rapida", "PEStudio for quick triage"),
    description: text("Ganhe contexto em segundos antes de abrir engenharia reversa pesada.", "Get context in seconds before opening heavy reverse engineering tools."),
    difficulty: "beginner",
    minutes: 10,
    safety: "static-only",
    steps: [
      {
        id: "indicators",
        title: text("Comece pela aba Indicators", "Start with the Indicators tab"),
        paragraphs: [
          text("Indicators e o atalho mais rapido para URLs, imports suspeitos, strings sensiveis e sinais de packing.", "Indicators is the fastest shortcut to URLs, suspicious imports, sensitive strings, and packing hints."),
        ],
      },
      {
        id: "workflow",
        title: text("Fluxo de cinco minutos", "Five-minute workflow"),
        bullets: [
          text("Copie o SHA256 e consulte VirusTotal", "Copy the SHA256 and query VirusTotal"),
          text("Veja a entropia das secoes", "Inspect section entropy"),
          text("Leia imports em vermelho", "Read red-highlighted imports"),
          text("Filtre strings por http, discord, telegram e run", "Filter strings by http, discord, telegram, and run"),
        ],
        paragraphs: [text("Se o binario estiver muito opaco, avance para desempacotamento ou para Ghidra/dnSpy.", "If the binary is too opaque, move to unpacking or to Ghidra/dnSpy.")],
      },
    ],
    related: ["/learn/basics", "/learn/ghidra"],
  },
  {
    kind: "article",
    slug: "yara",
    title: text("YARA rules", "YARA rules"),
    description: text("Transforme aprendizado manual em deteccao automatica reaproveitavel.", "Turn manual learning into reusable automated detection."),
    difficulty: "intermediate",
    minutes: 26,
    safety: "static-only",
    group: "yara",
    steps: [
      {
        id: "why",
        title: text("Para que serve", "Why it matters"),
        paragraphs: [
          text("Depois de entender uma familia, YARA permite detectar outras amostras sem recomecar do zero.", "Once you understand a family, YARA helps detect other samples without starting from zero."),
        ],
      },
      {
        id: "flow",
        title: text("Fluxo minimo", "Minimum workflow"),
        bullets: [
          text("Escolha strings exclusivas", "Pick distinctive strings"),
          text("Adicione condicoes por tipo de arquivo", "Add file-type conditions"),
          text("Teste contra amostras e contra arquivos limpos", "Test against samples and clean files"),
        ],
        paragraphs: [text("Regra boa e regra testada.", "A good rule is a tested rule.")],
      },
    ],
    related: ["/learn/yara/basics", "/learn/yara/write", "/learn/yara/test"],
  },
  {
    kind: "article",
    slug: "dynamic",
    title: text("Analise dinamica", "Dynamic analysis"),
    description: text("Quando sair do estatico e levar a amostra para sandbox.", "When to leave static analysis and move into a sandbox."),
    difficulty: "advanced",
    minutes: 30,
    safety: "sandbox-required",
    group: "dynamic",
    steps: [
      {
        id: "when",
        title: text("Quando usar", "When to use it"),
        paragraphs: [
          text("Use sandbox quando o score esta alto, o binario esta empacotado ou a configuracao aparece apenas em runtime.", "Use a sandbox when the score is high, the binary is packed, or configuration only appears at runtime."),
        ],
      },
      {
        id: "limits",
        title: text("Limites e cuidados", "Limits and care"),
        paragraphs: [
          text("Analise dinamica sem isolamento real nao e aceitavel. O host deve ficar fora da zona de risco.", "Dynamic analysis without real isolation is not acceptable. The host must stay outside the blast radius."),
        ],
      },
    ],
    related: ["/learn/dynamic/any-run", "/learn/dynamic/triage", "/learn/dynamic/local"],
  },
  {
    kind: "article",
    slug: "python",
    title: text("Scripts Python para automacao", "Python scripts for automation"),
    description: text("Reproduza partes da triagem com scripts pequenos e auditaveis.", "Reproduce pieces of triage with small, auditable scripts."),
    difficulty: "intermediate",
    minutes: 24,
    safety: "static-only",
    group: "python",
    steps: [
      {
        id: "why",
        title: text("Por que automatizar", "Why automate"),
        paragraphs: [
          text("Scripts pequenos ajudam a repetir tarefas e revisar sua propria logica de triagem.", "Small scripts help repeat tasks and review your own triage logic."),
        ],
      },
      {
        id: "rule",
        title: text("Regra de ouro", "Golden rule"),
        paragraphs: [
          text("Trate tudo como bytes e texto. Seus scripts nao devem executar, abrir ou carregar a amostra como programa.", "Treat everything as bytes and text. Your scripts must not execute, open, or load the sample as a program."),
        ],
      },
    ],
    related: ["/learn/python/extract-strings", "/learn/python/parse-pe", "/learn/python/detect-webhooks"],
  },
  {
    kind: "article",
    slug: "labs",
    title: text("Laboratorio pratico", "Practical labs"),
    description: text("Roteiros guiados com amostras reais obtidas em fontes publicas.", "Guided workflows with real samples from public sources."),
    difficulty: "advanced",
    minutes: 40,
    safety: "vm-required",
    group: "labs",
    steps: [
      {
        id: "rule",
        title: text("Regras do laboratorio", "Lab rules"),
        paragraphs: [
          text("Toda amostra deve ficar em VM. Senha de arquivo compactado, snapshot limpo e zero reutilizacao do host.", "Every sample stays in a VM. Use archive passwords, clean snapshots, and zero host reuse."),
        ],
      },
      {
        id: "sources",
        title: text("Fontes", "Sources"),
        paragraphs: [
          text("MalwareBazaar e o melhor ponto de partida para praticas seguras com familias publicas.", "MalwareBazaar is a strong starting point for safe practice with public families."),
        ],
      },
    ],
    related: ["/learn/labs/lab-01", "/learn/labs/lab-02", "/learn/labs/lab-03"],
  },
  {
    kind: "article",
    slug: "glossary",
    title: text("Glossario", "Glossary"),
    description: text(
      "Termos centrais para nao se perder entre malware, trojan, keylogger, stealer, C2, packer e MITRE.",
      "Core terms so you do not get lost between malware, trojans, keyloggers, stealers, C2, packers, and MITRE."
    ),
    difficulty: "beginner",
    minutes: 12,
    safety: "static-only",
    steps: [
      {
        id: "terms",
        title: text("Termos essenciais", "Essential terms"),
        bullets: [
          text("Malware, virus e trojan: nomes que parecem iguais, mas nao sao", "Malware, virus, and trojan: names that sound alike but are not the same"),
          text("Keylogger, stealer e spyware: formas de coleta e espionagem", "Keylogger, stealer, and spyware: collection and surveillance patterns"),
          text("IOC: evidencias de compromisso", "IOC: indicators of compromise"),
          text("C2: servidor de comando e controle", "C2: command and control server"),
          text("Packer: camada que esconde o binario real", "Packer: layer that hides the real binary"),
          text("Mutex: marcador de instancia", "Mutex: instance marker"),
          text("Imphash: hash baseado em imports PE", "Imphash: PE import-based hash"),
          text("Webhook: endpoint usado para exfiltracao ou notificacao", "Webhook: endpoint used for exfiltration or notification"),
        ],
        paragraphs: [
          text(
            "Use o glossario como apoio rapido durante a leitura dos relatorios e dos tutoriais. Ele cobre termos comuns em discussao de virus, trojans, stealers, ransomware, keyloggers e exfiltracao.",
            "Use the glossary as quick support while reading reports and tutorials. It covers common terms used when discussing viruses, trojans, stealers, ransomware, keyloggers, and exfiltration."
          ),
        ],
      },
    ],
  },
];
