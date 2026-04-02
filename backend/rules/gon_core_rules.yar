rule AsyncRAT_Config {
    meta:
        family = "AsyncRAT"
        support = "full"
        severity = "HIGH"
        author = "GON EXPOSING"
    strings:
        $cfg1 = "Ports" ascii wide
        $cfg2 = "Hosts" ascii wide
        $cfg3 = "Install" ascii wide
        $cfg4 = "Pastebin" ascii wide
        $mutex = "AsyncMutex" ascii wide
    condition:
        3 of ($cfg*) and $mutex
}

rule Generic_Discord_Stealer {
    meta:
        family = "Generic Token Stealer"
        support = "full"
        severity = "HIGH"
        author = "GON EXPOSING"
    strings:
        $webhook = /https:\/\/discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+/
        $target1 = "Local Storage" ascii wide
        $target2 = "leveldb" ascii wide
        $target3 = "discord" ascii wide nocase
        $token1 = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/ ascii
        $token2 = /mfa\.[\w-]{84}/ ascii
    condition:
        $webhook and ($token1 or $token2 or 2 of ($target*))
}

rule XMRig_Miner {
    meta:
        family = "XMRig"
        support = "full"
        severity = "MEDIUM"
        author = "GON EXPOSING"
    strings:
        $s1 = "xmrig" ascii nocase
        $s2 = "stratum+tcp://" ascii
        $s3 = "stratum+ssl://" ascii
        $s4 = "monero" ascii nocase
    condition:
        2 of them
}

rule LockBit_Ransomware {
    meta:
        family = "LockBit"
        support = "full"
        severity = "CRITICAL"
        author = "GON EXPOSING"
    strings:
        $note1 = "LockBit" ascii wide nocase
        $note2 = "Restore-My-Files" ascii wide
        $shadow = "vssadmin delete shadows" ascii nocase
        $bcdedit = "bcdedit /set {default}" ascii nocase
    condition:
        1 of ($note*) and ($shadow or $bcdedit)
}
