import { text, type Localized } from "@/lib/learn-types";

export type LearnGlossaryTerm = {
  slug: string;
  term: Localized;
  category: Localized;
  summary: Localized;
  details: Localized;
};

export const learnGlossaryTerms: LearnGlossaryTerm[] = [
  {
    slug: "malware",
    term: text("Malware", "Malware"),
    category: text("Termo geral", "General term"),
    summary: text("Nome generico para software malicioso.", "Generic name for malicious software."),
    details: text(
      "Malware e o guarda-chuva que cobre virus, trojan, ransomware, stealer, spyware, worm e outras familias maliciosas.",
      "Malware is the umbrella term that covers viruses, trojans, ransomware, stealers, spyware, worms, and other malicious families."
    ),
  },
  {
    slug: "virus",
    term: text("Virus", "Virus"),
    category: text("Familia classica", "Classic family"),
    summary: text("Codigo que se replica ao infectar outros arquivos.", "Code that replicates by infecting other files."),
    details: text(
      "Hoje nem todo malware e um virus. O termo ficou popular, mas tecnicamente um virus tende a se anexar a outros arquivos para se espalhar.",
      "Today, not every malware sample is a virus. The word became popular, but technically a virus tends to attach itself to other files to spread."
    ),
  },
  {
    slug: "trojan",
    term: text("Trojan", "Trojan"),
    category: text("Entrega enganosa", "Deceptive delivery"),
    summary: text("Malware disfarçado de arquivo ou programa legitimo.", "Malware disguised as a legitimate file or program."),
    details: text(
      "Trojan normalmente depende de engenharia social. A vitima abre algo que parece legitimo e o codigo malicioso entra em acao.",
      "A trojan normally depends on social engineering. The victim opens something that looks legitimate and the malicious code starts running."
    ),
  },
  {
    slug: "worm",
    term: text("Worm", "Worm"),
    category: text("Propagacao", "Propagation"),
    summary: text("Malware que se espalha sozinho pela rede ou por falhas.", "Malware that spreads by itself through networks or vulnerabilities."),
    details: text(
      "Ao contrario de um trojan puro, um worm procura se propagar automaticamente para outros hosts.",
      "Unlike a pure trojan, a worm tries to spread automatically to other hosts."
    ),
  },
  {
    slug: "ransomware",
    term: text("Ransomware", "Ransomware"),
    category: text("Impacto", "Impact"),
    summary: text("Malware que cifra arquivos e exige resgate.", "Malware that encrypts files and demands payment."),
    details: text(
      "Sinais comuns incluem uso de APIs criptograficas, notas de resgate, novas extensoes de arquivos e delecao de shadow copies.",
      "Common signs include cryptographic APIs, ransom notes, new file extensions, and deletion of shadow copies."
    ),
  },
  {
    slug: "stealer",
    term: text("Stealer", "Stealer"),
    category: text("Roubo de dados", "Data theft"),
    summary: text("Malware focado em roubar credenciais, cookies e tokens.", "Malware focused on stealing credentials, cookies, and tokens."),
    details: text(
      "Stealers buscam caminhos de navegadores, carteiras, clientes de jogos e apps de chat para exfiltrar dados rapidamente.",
      "Stealers search browser paths, wallets, game clients, and chat apps to exfiltrate data quickly."
    ),
  },
  {
    slug: "keylogger",
    term: text("Keylogger", "Keylogger"),
    category: text("Coleta", "Collection"),
    summary: text("Componente que registra teclas digitadas.", "Component that records keystrokes."),
    details: text(
      "Indicadores comuns incluem GetAsyncKeyState, SetWindowsHookEx e rotinas de captura continua de teclado.",
      "Common indicators include GetAsyncKeyState, SetWindowsHookEx, and continuous keyboard capture routines."
    ),
  },
  {
    slug: "rat",
    term: text("RAT", "RAT"),
    category: text("Controle remoto", "Remote control"),
    summary: text("Remote Access Trojan: acesso remoto ao sistema comprometido.", "Remote Access Trojan: remote access to a compromised system."),
    details: text(
      "RATs costumam ter C2, persistencia, funcoes de shell remota, screenshot, keylogger e controle de arquivos.",
      "RATs usually include C2, persistence, remote shell, screenshot, keylogger, and file control features."
    ),
  },
  {
    slug: "spyware",
    term: text("Spyware", "Spyware"),
    category: text("Espionagem", "Surveillance"),
    summary: text("Malware focado em monitorar a vitima sem chamar atencao.", "Malware focused on monitoring the victim quietly."),
    details: text(
      "Spyware pode capturar tela, clipboard, browser data, audio, localizacao e historico de uso.",
      "Spyware can capture screen, clipboard, browser data, audio, location, and user activity history."
    ),
  },
  {
    slug: "loader",
    term: text("Loader", "Loader"),
    category: text("Entrega", "Delivery"),
    summary: text("Codigo que prepara e entrega outra carga maliciosa.", "Code that prepares and delivers another malicious payload."),
    details: text(
      "Loaders frequentemente baixam, descriptografam ou injetam o malware final e por isso podem parecer menores que o payload principal.",
      "Loaders often download, decrypt, or inject the final malware, so they can look smaller than the main payload."
    ),
  },
  {
    slug: "dropper",
    term: text("Dropper", "Dropper"),
    category: text("Entrega", "Delivery"),
    summary: text("Arquivo que escreve outros artefatos no disco e os solta no sistema.", "File that writes other artifacts to disk and drops them onto the system."),
    details: text(
      "Um dropper costuma criar arquivos temporarios, extrair DLLs ou scripts embutidos e iniciar a proxima fase da infeccao.",
      "A dropper often creates temporary files, extracts embedded DLLs or scripts, and launches the next infection stage."
    ),
  },
  {
    slug: "downloader",
    term: text("Downloader", "Downloader"),
    category: text("Entrega", "Delivery"),
    summary: text("Malware que busca payloads adicionais na internet.", "Malware that fetches additional payloads from the internet."),
    details: text(
      "Imports como URLDownloadToFile, WinINet, bitsadmin, curl e PowerShell costumam denunciar esse comportamento.",
      "Imports such as URLDownloadToFile, WinINet, bitsadmin, curl, and PowerShell often expose this behavior."
    ),
  },
  {
    slug: "packer",
    term: text("Packer", "Packer"),
    category: text("Ofuscacao", "Obfuscation"),
    summary: text("Camada que comprime ou esconde o binario real.", "Layer that compresses or hides the real binary."),
    details: text(
      "UPX, Themida, VMProtect e similares reduzem a visibilidade de strings, imports e fluxo ate o unpack.",
      "UPX, Themida, VMProtect, and similar tools reduce visibility into strings, imports, and flow until unpacking."
    ),
  },
  {
    slug: "crypter",
    term: text("Crypter", "Crypter"),
    category: text("Ofuscacao", "Obfuscation"),
    summary: text("Ferramenta que cifra ou embrulha malware para dificultar deteccao.", "Tool that encrypts or wraps malware to make detection harder."),
    details: text(
      "Crypters podem esconder configuracoes, alterar hashes e retardar a atribuicao de familia.",
      "Crypters can hide configuration, alter hashes, and delay family attribution."
    ),
  },
  {
    slug: "obfuscation",
    term: text("Ofuscacao", "Obfuscation"),
    category: text("Analise", "Analysis"),
    summary: text("Tecnicas para deixar codigo e dados mais dificeis de entender.", "Techniques that make code and data harder to understand."),
    details: text(
      "Base64 em camadas, XOR, nomes sem sentido, strings fragmentadas e control flow baguncado sao sinais comuns.",
      "Layered Base64, XOR, meaningless names, split strings, and messy control flow are common signs."
    ),
  },
  {
    slug: "exfiltration",
    term: text("Exfiltracao", "Exfiltration"),
    category: text("Saida de dados", "Data egress"),
    summary: text("Envio de dados roubados para fora da maquina ou rede.", "Sending stolen data out of the machine or network."),
    details: text(
      "Discord webhooks, bots do Telegram, APIs HTTP, FTP e paines PHP sao canais classicos de exfiltracao.",
      "Discord webhooks, Telegram bots, HTTP APIs, FTP, and PHP panels are classic exfiltration channels."
    ),
  },
  {
    slug: "webhook",
    term: text("Webhook", "Webhook"),
    category: text("Destino", "Destination"),
    summary: text("Endpoint HTTP usado para receber mensagens ou dados.", "HTTP endpoint used to receive messages or data."),
    details: text(
      "Stealers costumam usar webhooks para despejar credenciais, arquivos e logs roubados.",
      "Stealers often use webhooks to dump stolen credentials, files, and logs."
    ),
  },
  {
    slug: "bot-token",
    term: text("Bot token", "Bot token"),
    category: text("Telegram", "Telegram"),
    summary: text("Credencial que identifica e autoriza um bot do Telegram.", "Credential that identifies and authorizes a Telegram bot."),
    details: text(
      "Se um malware guarda bot token no binario, isso costuma indicar automacao de envio ou controle pelo Telegram.",
      "If malware stores a bot token in the binary, that usually points to Telegram-based sending or control automation."
    ),
  },
  {
    slug: "chat-id",
    term: text("Chat ID", "Chat ID"),
    category: text("Telegram", "Telegram"),
    summary: text("Identificador do chat, grupo ou canal alvo de um bot.", "Identifier of the target chat, group, or channel for a bot."),
    details: text(
      "Junto com bot token e endpoint da API, o chat_id mostra para onde a exfiltracao pode ser enviada.",
      "Together with a bot token and API endpoint, the chat_id shows where exfiltration may be sent."
    ),
  },
  {
    slug: "c2",
    term: text("C2", "C2"),
    category: text("Infraestrutura", "Infrastructure"),
    summary: text("Servidor de comando e controle usado pelo atacante.", "Command-and-control server used by the attacker."),
    details: text(
      "O C2 envia comandos, recebe dados e mantem a sessao com a maquina comprometida.",
      "The C2 sends commands, receives data, and maintains the session with the compromised machine."
    ),
  },
  {
    slug: "persistence",
    term: text("Persistencia", "Persistence"),
    category: text("Sobrevivencia", "Survival"),
    summary: text("Mecanismo para voltar a executar depois de reinicio ou logon.", "Mechanism that makes malware run again after reboot or logon."),
    details: text(
      "Registry Run, servicos, tarefas agendadas, atalhos no Startup e WMI sao tecnicas comuns de persistencia.",
      "Registry Run keys, services, scheduled tasks, Startup shortcuts, and WMI are common persistence techniques."
    ),
  },
  {
    slug: "mutex",
    term: text("Mutex", "Mutex"),
    category: text("Execucao", "Execution"),
    summary: text("Marcador usado para impedir varias instancias do mesmo malware.", "Marker used to prevent multiple instances of the same malware."),
    details: text(
      "Mutex ajuda a identificar familia, campanha ou variante e costuma aparecer em configs de RATs e stealers.",
      "A mutex helps identify family, campaign, or variant and often appears in RAT and stealer configs."
    ),
  },
  {
    slug: "sandbox",
    term: text("Sandbox", "Sandbox"),
    category: text("Laboratorio", "Lab"),
    summary: text("Ambiente isolado para observar comportamento com mais seguranca.", "Isolated environment used to observe behavior more safely."),
    details: text(
      "Any.run, Triage e VMs locais sao formas comuns de sandbox para confirmar o que a triagem estatica sugeriu.",
      "Any.run, Triage, and local VMs are common sandbox approaches to confirm what static triage suggested."
    ),
  },
  {
    slug: "phishing",
    term: text("Phishing", "Phishing"),
    category: text("Entrada", "Initial access"),
    summary: text("Engenharia social usada para enganar a vitima e abrir caminho para o malware.", "Social engineering used to trick the victim and open a path for malware."),
    details: text(
      "Emails falsos, paginas clonadas, instaladores adulterados e anexos enganosos continuam sendo vetores comuns.",
      "Fake emails, cloned pages, trojanized installers, and deceptive attachments remain common vectors."
    ),
  },
  {
    slug: "botnet",
    term: text("Botnet", "Botnet"),
    category: text("Infraestrutura", "Infrastructure"),
    summary: text("Rede de maquinas infectadas controladas por um operador.", "Network of infected machines controlled by an operator."),
    details: text(
      "Botnets podem servir para DDoS, brute force, spam, proxy residencial e distribuicao de outras cargas.",
      "Botnets can be used for DDoS, brute force, spam, residential proxying, and payload distribution."
    ),
  },
];

export const glossaryPreviewSlugs = ["malware", "trojan", "keylogger", "stealer", "webhook", "bot-token", "c2", "persistence"];
