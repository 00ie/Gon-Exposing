export type AppLanguage = "pt-BR" | "en";

export type TranslationDictionary = {
  languageLabel: string;
  languages: {
    pt: string;
    en: string;
  };
  header: {
    dashboard: string;
    reports: string;
    search: string;
    learn: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tags: {
        staticOnly: string;
        noExecution: string;
        responsibleReporting: string;
      };
      beginnerTitle: string;
      beginnerDescription: string;
      beginnerSteps: {
        send: {
          title: string;
          description: string;
        };
        review: {
          title: string;
          description: string;
        };
        decide: {
          title: string;
          description: string;
        };
      };
  };
  upload: {
    tabs: {
      file: string;
      url: string;
      hash: string;
    };
    actions: {
      file: string;
      url: string;
      hash: string;
      loading: string;
    };
    errors: {
      fileRequired: string;
      urlRequired: string;
      urlInvalid: string;
      hashRequired: string;
      hashInvalid: string;
      submissionFailed: string;
    };
    placeholders: {
      url: string;
      hash: string;
    };
    fileDrop: string;
    selected: string;
    maxSize: string;
    tos: string;
    apiOnline: string;
    apiOffline: string;
    apiChecking: string;
  };
  searchPanel: {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    button: string;
    searching: string;
    idle: string;
    empty: string;
    results: string;
  };
  community: {
    eyebrow: string;
    title: string;
    description: string;
    labels: {
      server: string;
      github: string;
      telegram: string;
      mode: string;
    };
    modeValue: string;
  };
  stats: {
    scans24h: string;
    threatsRecent: string;
    supportedFamilies: string;
    totalSamples: string;
  };
  recentScans: {
    eyebrow: string;
    title: string;
    rows: string;
    columns: {
      file: string;
      hash: string;
      family: string;
      status: string;
      time: string;
    };
    empty: string;
    unknown: string;
    statusText: {
      clean: string;
      malicious: string;
      unsure: string;
    };
  };
  score: {
    title: string;
    family: string;
    noFamily: string;
    defaultSummary: string;
    confidence: string;
  };
  analysis: {
    back: string;
    queued: string;
    taskId: string;
    status: string;
    loading: string;
    quickAccess: string;
    openExternalReport: string;
    openSampleContext: string;
    overviewTitle: string;
    overviewEyebrow: string;
    type: string;
    analysisTime: string;
      iocTitles: {
        webhooks: string;
        telegram: string;
        urls: string;
        ips: string;
        domains: string;
        tokens: string;
        paths: string;
    };
    streamUnavailable: string;
    loadError: string;
    pe: {
      eyebrow: string;
      title: string;
      packers: string;
      suspiciousImports: string;
      noSuspiciousImports: string;
      section: string;
      virtual: string;
      raw: string;
      entropy: string;
      flags: string;
      none: string;
      na: string;
    };
    actions: {
      eyebrow: string;
      title: string;
      officialGuidance: string;
      count: string;
    };
    strings: {
      eyebrow: string;
      title: string;
      total: string;
      ascii: string;
      utf16: string;
    };
    learn: {
      eyebrow: string;
      title: string;
      description: string;
      open: string;
      items: {
        basics: {
          title: string;
          description: string;
        };
        environment: {
          title: string;
          description: string;
        };
        dotnet: {
          title: string;
          description: string;
        };
        ghidra: {
          title: string;
          description: string;
        };
        unpacking: {
          title: string;
          description: string;
        };
        dynamic: {
          title: string;
          description: string;
        };
        yara: {
          title: string;
          description: string;
        };
      };
    };
  };
  iocs: {
    eyebrow: string;
    items: string;
    confidence: string;
  };
  behaviors: {
    eyebrow: string;
    title: string;
    findings: string;
  };
  intel: {
    eyebrow: string;
    title: string;
    noSources: string;
    enginesFlagged: string;
    notAvailable: string;
    noUrlhaus: string;
    openVirusTotal: string;
    knownSample: string;
    unknownType: string;
  };
  yara: {
    eyebrow: string;
    title: string;
    loaded: string;
    noMatches: string;
  };
  progress: {
    eyebrow: string;
    title: string;
    summary: string;
    currentStage: string;
    recentActivity: string;
    stepsTracked: string;
    latestEntry: string;
    queued: string;
    noSteps: string;
  };
  footer: {
    privacy: string;
    terms: string;
    navigation: string;
    contact: string;
    system: string;
    staticOnly: string;
    searchIndex: string;
    responsibleReporting: string;
    rights: string;
  };
  common: {
    expand: string;
    collapse: string;
    taskStatus: {
      queued: string;
      running: string;
      complete: string;
      failed: string;
    };
    risk: {
      CLEAN: string;
      LOW: string;
      MEDIUM: string;
      HIGH: string;
      CRITICAL: string;
    };
    severity: {
      LOW: string;
      MEDIUM: string;
      HIGH: string;
      CRITICAL: string;
    };
  };
};

export const translations: Record<AppLanguage, TranslationDictionary> = {
  "pt-BR": {
    languageLabel: "Idioma",
    languages: {
      pt: "PT",
      en: "EN",
    },
    header: {
      dashboard: "Painel",
      reports: "Relatorios",
      search: "Pesquisa",
      learn: "Aprender",
    },
    home: {
      eyebrow: "Visao geral",
      title: "Analise estatica direta, clara e organizada para arquivos, URLs e hashes.",
      subtitle:
        "Pipeline focado em triagem segura: extracao, score, IOC, contexto de threat intel e preparo de reporte responsavel, tudo sem executar a amostra.",
      tags: {
        staticOnly: "Somente estatico",
        noExecution: "Sem execucao",
        responsibleReporting: "Reporte responsavel",
      },
      beginnerTitle: "Como usar",
      beginnerDescription: "Fluxo simples para quem quer verificar um arquivo antes de abrir ou executar no proprio computador.",
      beginnerSteps: {
        send: {
          title: "Envie o arquivo, URL ou hash",
          description: "Escolha o artefato suspeito e inicie a triagem sem executar nada no servidor.",
        },
        review: {
          title: "Leia o relatorio com calma",
          description: "Veja score, IOC, comportamentos, secoes PE e contexto externo em uma tela organizada.",
        },
        decide: {
          title: "Siga o proximo passo seguro",
          description: "Abra um tutorial, compartilhe com quem entende mais ou descarte o arquivo sem tocar nele.",
        },
      },
    },
    upload: {
      tabs: {
        file: "ARQUIVO",
        url: "URL",
        hash: "HASH",
      },
      actions: {
        file: "ANALISAR ARQUIVO",
        url: "ANALISAR URL",
        hash: "CONSULTAR HASH",
        loading: "PROCESSANDO...",
      },
      errors: {
        fileRequired: "Selecione um arquivo para iniciar a analise.",
        urlRequired: "Informe uma URL para continuar.",
        urlInvalid: "Informe uma URL valida com http ou https.",
        hashRequired: "Informe um hash para continuar.",
        hashInvalid: "Informe um MD5, SHA1, SHA256 ou SHA512 valido em hexadecimal.",
        submissionFailed: "Falha ao iniciar a analise.",
      },
      placeholders: {
        url: "https://exemplo.com/payload ou https://api.telegram.org/bot...",
        hash: "MD5, SHA1, SHA256 ou SHA512",
      },
      fileDrop: "Solte o arquivo aqui ou clique para enviar",
      selected: "selecionado",
      maxSize: "Tamanho maximo: 100 MB",
      tos: "Ao enviar, voce concorda com nossos Termos de Uso",
      apiOnline: "API online",
      apiOffline: "API offline",
      apiChecking: "Verificando status da API...",
    },
    searchPanel: {
      eyebrow: "Pesquisa",
      title: "Pesquisar no indice",
      description: "Busque por nome do arquivo, hash, familia, URL, dominio ou qualquer IOC salvo no banco local.",
      placeholder: "Pesquise por nome, hash, link, dominio ou familia",
      button: "PESQUISAR",
      searching: "Pesquisando...",
      idle: "Digite algo para pesquisar nas analises indexadas.",
      empty: "Nenhum resultado encontrado para essa consulta.",
      results: "resultados",
    },
    community: {
      eyebrow: "Projeto",
      title: "Canais e contatos",
      description: "Acesso rapido aos canais principais do Gon Exposing, com o mesmo padrao visual do restante da plataforma.",
      labels: {
        server: "Servidor",
        github: "GitHub",
        telegram: "Telegram",
        mode: "Modo",
      },
      modeValue: "Analise estatica apenas",
    },
    stats: {
      scans24h: "Analises (24h)",
      threatsRecent: "Ameacas (recentes)",
      supportedFamilies: "Familias suportadas",
      totalSamples: "Total de amostras",
    },
    recentScans: {
      eyebrow: "Analises recentes",
      title: "Ultimos relatorios indexados",
      rows: "linhas",
      columns: {
        file: "Arquivo",
        hash: "Hash",
        family: "Familia",
        status: "Status",
        time: "Tempo",
      },
      empty: "Nenhuma analise indexada ainda.",
      unknown: "Desconhecida",
      statusText: {
        clean: "Limpo",
        malicious: "Malicioso",
        unsure: "Suspeito",
      },
    },
    score: {
      title: "Score de risco",
      family: "Familia",
      noFamily: "Nenhuma familia atribuida",
      defaultSummary: "A saida atual prioriza clareza, evidencia e atribuicao conservadora em vez de rotulos agressivos.",
      confidence: "confianca",
    },
    analysis: {
      back: "Voltar ao painel",
      queued: "Analise em fila",
      taskId: "ID da tarefa",
      status: "Status",
      loading: "carregando",
      quickAccess: "Acessos rapidos",
      openExternalReport: "Abrir relatorio externo",
      openSampleContext: "Abrir contexto da amostra",
      overviewTitle: "Visao geral",
      overviewEyebrow: "Arquivo",
      type: "Tipo",
      analysisTime: "Tempo de analise",
      iocTitles: {
        webhooks: "Webhooks detectados",
        telegram: "Destinos Telegram",
        urls: "URLs",
        ips: "IPs",
        domains: "Dominios",
        tokens: "Tokens",
        paths: "Caminhos e chaves",
      },
      streamUnavailable: "Fluxo ao vivo indisponivel. Atualizacao automatica ativa.",
      loadError: "Nao foi possivel carregar o resultado.",
      pe: {
        eyebrow: "Analise PE",
        title: "Secoes, imports e indicios de packer",
        packers: "Indicadores de packer",
        suspiciousImports: "Imports suspeitos",
        noSuspiciousImports: "Nenhum import suspeito foi extraido.",
        section: "Secao",
        virtual: "Virtual",
        raw: "Raw",
        entropy: "Entropia",
        flags: "Flags",
        none: "Nenhum",
        na: "n/a",
      },
      actions: {
        eyebrow: "Acoes responsaveis",
        title: "Fluxo de reporte preparado",
        officialGuidance: "Orientacao oficial",
        count: "acoes",
      },
      strings: {
        eyebrow: "Strings",
        title: "Resumo das strings extraidas",
        total: "Total",
        ascii: "ASCII",
        utf16: "UTF-16",
      },
      learn: {
        eyebrow: "Aprendizado",
        title: "Proximos passos recomendados",
        description: "Sugestoes automaticas para ajudar quem ainda nao domina engenharia reversa ou triagem manual.",
        open: "Abrir guia",
        items: {
          basics: {
            title: "Interpretar o resultado",
            description: "Entenda score, IOC, familias e como validar o que o sistema marcou.",
          },
          environment: {
            title: "Montar ambiente seguro",
            description: "Aprenda a analisar dentro de VM e sem colocar sua maquina principal em risco.",
          },
          dotnet: {
            title: "Abrir no dnSpy",
            description: "Arquivos .NET costumam ficar muito mais claros no dnSpy do que em engenharia reversa generica.",
          },
          ghidra: {
            title: "Continuar no Ghidra",
            description: "Ideal para aprofundar fluxo de execucao, strings, imports e referencias cruzadas.",
          },
          unpacking: {
            title: "Desempacotar antes de analisar",
            description: "Packer e alta entropia reduzem a visibilidade; vale tratar isso antes de prosseguir.",
          },
          dynamic: {
            title: "Ir para analise dinamica",
            description: "Quando o score e alto, uma sandbox ajuda a ver o comportamento real com seguranca.",
          },
          yara: {
            title: "Criar regra YARA",
            description: "Depois da triagem, transforme os achados em deteccao reaproveitavel.",
          },
        },
      },
    },
    iocs: {
      eyebrow: "IOC",
      items: "itens",
      confidence: "confianca",
    },
    behaviors: {
      eyebrow: "Comportamentos",
      title: "Achados com contexto e MITRE",
      findings: "achados",
    },
    intel: {
      eyebrow: "Enriquecimento",
      title: "Contexto de threat intel",
      noSources: "sem fontes",
      enginesFlagged: "motores marcaram a amostra",
      notAvailable: "Indisponivel.",
      noUrlhaus: "Nenhum hit retornado pelo URLhaus.",
      openVirusTotal: "Abrir no VirusTotal",
      knownSample: "Amostra conhecida",
      unknownType: "tipo desconhecido",
    },
    yara: {
      eyebrow: "YARA",
      title: "Regras acionadas",
      loaded: "carregadas",
      noMatches: "Nenhuma regra acionada para esta amostra.",
    },
    progress: {
      eyebrow: "Pipeline",
      title: "Progresso em tempo real",
      summary: "Resumo",
      currentStage: "Etapa atual",
      recentActivity: "Atividade recente",
      stepsTracked: "Etapas rastreadas",
      latestEntry: "Ultimas atualizacoes",
      queued: "Aguardando inicio",
      noSteps: "A tarefa ainda nao publicou eventos de progresso.",
    },
    footer: {
      privacy: "Privacidade",
      terms: "Termos",
      navigation: "Navegacao",
      contact: "Contato",
      system: "Sistema",
      staticOnly: "Analise estatica",
      searchIndex: "Busca no indice local",
      responsibleReporting: "Reporte responsavel",
      rights: "Todos os direitos reservados.",
    },
    common: {
      expand: "Expandir",
      collapse: "Recolher",
      taskStatus: {
        queued: "em fila",
        running: "em execucao",
        complete: "concluida",
        failed: "falhou",
      },
      risk: {
        CLEAN: "Limpo",
        LOW: "Baixo",
        MEDIUM: "Medio",
        HIGH: "Alto",
        CRITICAL: "Critico",
      },
      severity: {
        LOW: "Baixo",
        MEDIUM: "Medio",
        HIGH: "Alto",
        CRITICAL: "Critico",
      },
    },
  },
  en: {
    languageLabel: "Language",
    languages: {
      pt: "PT",
      en: "EN",
    },
    header: {
      dashboard: "Dashboard",
      reports: "Reports",
      search: "Search",
      learn: "Learn",
    },
    home: {
      eyebrow: "Overview",
      title: "Direct, clear, and organized static analysis for files, URLs, and hashes.",
      subtitle:
        "A safe triage pipeline focused on extraction, scoring, IOC review, threat-intel context, and responsible reporting, all without executing the sample.",
      tags: {
        staticOnly: "Static only",
        noExecution: "No execution",
        responsibleReporting: "Responsible reporting",
      },
      beginnerTitle: "How to use it",
      beginnerDescription: "A simple path for people who just want to check a file before opening or executing it on their own machine.",
      beginnerSteps: {
        send: {
          title: "Send a file, URL, or hash",
          description: "Choose the suspicious artifact and start triage without executing anything on the server.",
        },
        review: {
          title: "Read the report calmly",
          description: "Inspect score, IOC, behaviors, PE sections, and outside context in one organized screen.",
        },
        decide: {
          title: "Take the next safe step",
          description: "Open a tutorial, share it with someone more experienced, or discard the file without touching it.",
        },
      },
    },
    upload: {
      tabs: {
        file: "FILE",
        url: "URL",
        hash: "HASH",
      },
      actions: {
        file: "ANALYZE FILE",
        url: "ANALYZE URL",
        hash: "LOOK UP HASH",
        loading: "PROCESSING...",
      },
      errors: {
        fileRequired: "Select a file to start the analysis.",
        urlRequired: "Enter a URL to continue.",
        urlInvalid: "Enter a valid http or https URL.",
        hashRequired: "Enter a hash to continue.",
        hashInvalid: "Enter a valid hexadecimal MD5, SHA1, SHA256, or SHA512.",
        submissionFailed: "Failed to start the analysis.",
      },
      placeholders: {
        url: "https://example.com/payload or https://api.telegram.org/bot...",
        hash: "MD5, SHA1, SHA256, or SHA512",
      },
      fileDrop: "Drop the file here or click to upload",
      selected: "selected",
      maxSize: "Max file size: 100 MB",
      tos: "By uploading, you agree to our Terms of Service",
      apiOnline: "API online",
      apiOffline: "API offline",
      apiChecking: "Checking API status...",
    },
    searchPanel: {
      eyebrow: "Search",
      title: "Search the index",
      description: "Search by filename, hash, family, URL, domain, or any IOC stored in the local database.",
      placeholder: "Search by name, hash, link, domain, or family",
      button: "SEARCH",
      searching: "Searching...",
      idle: "Type something to search indexed analyses.",
      empty: "No results found for this query.",
      results: "results",
    },
    community: {
      eyebrow: "Project",
      title: "Channels and contacts",
      description: "Quick access to Gon Exposing channels with the same visual language as the rest of the platform.",
      labels: {
        server: "Server",
        github: "GitHub",
        telegram: "Telegram",
        mode: "Mode",
      },
      modeValue: "Static analysis only",
    },
    stats: {
      scans24h: "Scans (24h)",
      threatsRecent: "Threats (recent)",
      supportedFamilies: "Supported families",
      totalSamples: "Total samples",
    },
    recentScans: {
      eyebrow: "Recent scans",
      title: "Latest indexed reports",
      rows: "rows",
      columns: {
        file: "File",
        hash: "Hash",
        family: "Family",
        status: "Status",
        time: "Time",
      },
      empty: "No indexed analyses yet.",
      unknown: "Unknown",
      statusText: {
        clean: "Clean",
        malicious: "Malicious",
        unsure: "Unsure",
      },
    },
    score: {
      title: "Risk score",
      family: "Family",
      noFamily: "No family assigned",
      defaultSummary: "Current output prioritizes clarity, evidence, and conservative attribution instead of aggressive labeling.",
      confidence: "confidence",
    },
    analysis: {
      back: "Back to dashboard",
      queued: "Queued analysis",
      taskId: "Task ID",
      status: "Status",
      loading: "loading",
      quickAccess: "Quick access",
      openExternalReport: "Open external report",
      openSampleContext: "Open sample context",
      overviewTitle: "Overview",
      overviewEyebrow: "File",
      type: "Type",
      analysisTime: "Analysis time",
      iocTitles: {
        webhooks: "Detected webhooks",
        telegram: "Telegram destinations",
        urls: "URLs",
        ips: "IPs",
        domains: "Domains",
        tokens: "Tokens",
        paths: "Paths and keys",
      },
      streamUnavailable: "Live stream unavailable. Automatic refresh is active.",
      loadError: "Unable to load the result.",
      pe: {
        eyebrow: "PE analysis",
        title: "Sections, imports, and packer hints",
        packers: "Packer indicators",
        suspiciousImports: "Suspicious imports",
        noSuspiciousImports: "No suspicious imports were extracted.",
        section: "Section",
        virtual: "Virtual",
        raw: "Raw",
        entropy: "Entropy",
        flags: "Flags",
        none: "None",
        na: "n/a",
      },
      actions: {
        eyebrow: "Responsible actions",
        title: "Prepared reporting workflow",
        officialGuidance: "Official guidance",
        count: "actions",
      },
      strings: {
        eyebrow: "Strings",
        title: "Extracted strings summary",
        total: "Total",
        ascii: "ASCII",
        utf16: "UTF-16",
      },
      learn: {
        eyebrow: "Learn",
        title: "Recommended next steps",
        description: "Automatic suggestions to help users who do not yet know reverse engineering or manual triage.",
        open: "Open guide",
        items: {
          basics: {
            title: "Interpret the result",
            description: "Understand score, IOC, families, and how to validate what the system flagged.",
          },
          environment: {
            title: "Build a safe lab",
            description: "Learn how to analyze inside a VM without putting your main machine at risk.",
          },
          dotnet: {
            title: "Open it in dnSpy",
            description: ".NET files are usually much clearer in dnSpy than in generic reverse engineering tools.",
          },
          ghidra: {
            title: "Continue in Ghidra",
            description: "Best for deeper flow analysis, strings, imports, and cross-references.",
          },
          unpacking: {
            title: "Unpack before going deeper",
            description: "Packers and high entropy reduce visibility, so it helps to handle that first.",
          },
          dynamic: {
            title: "Move to dynamic analysis",
            description: "When the score is high, a sandbox helps you see real behavior safely.",
          },
          yara: {
            title: "Write a YARA rule",
            description: "After triage, turn findings into reusable detection logic.",
          },
        },
      },
    },
    iocs: {
      eyebrow: "IOC",
      items: "items",
      confidence: "confidence",
    },
    behaviors: {
      eyebrow: "Behaviors",
      title: "Findings with context and MITRE",
      findings: "findings",
    },
    intel: {
      eyebrow: "Enrichment",
      title: "Threat-intel context",
      noSources: "no sources",
      enginesFlagged: "engines flagged the sample",
      notAvailable: "Not available.",
      noUrlhaus: "No URLhaus hits returned.",
      openVirusTotal: "Open VirusTotal",
      knownSample: "Known sample",
      unknownType: "unknown type",
    },
    yara: {
      eyebrow: "YARA",
      title: "Matched rules",
      loaded: "loaded",
      noMatches: "No rules matched this sample.",
    },
    progress: {
      eyebrow: "Pipeline",
      title: "Live progress",
      summary: "Summary",
      currentStage: "Current stage",
      recentActivity: "Recent activity",
      stepsTracked: "Tracked steps",
      latestEntry: "Latest updates",
      queued: "Waiting to start",
      noSteps: "This task has not published progress events yet.",
    },
    footer: {
      privacy: "Privacy",
      terms: "Terms",
      navigation: "Navigation",
      contact: "Contact",
      system: "System",
      staticOnly: "Static analysis",
      searchIndex: "Local index search",
      responsibleReporting: "Responsible reporting",
      rights: "All rights reserved.",
    },
    common: {
      expand: "Expand",
      collapse: "Collapse",
      taskStatus: {
        queued: "queued",
        running: "running",
        complete: "complete",
        failed: "failed",
      },
      risk: {
        CLEAN: "Clean",
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
        CRITICAL: "Critical",
      },
      severity: {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
        CRITICAL: "Critical",
      },
    },
  },
};
