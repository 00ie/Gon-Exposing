rule Generic_Telegram_Exfiltration {
    meta:
        family = "Generic Telegram Exfil"
        support = "detection_only"
        severity = "HIGH"
        author = "Gon Exposing"
    strings:
        $api1 = "api.telegram.org/bot" ascii wide
        $api2 = "sendMessage" ascii wide
        $api3 = "sendDocument" ascii wide
        $api4 = "sendPhoto" ascii wide
        $api5 = "sendMediaGroup" ascii wide
        $api6 = "setWebhook" ascii wide
        $chat = "chat_id" ascii wide
        $token = /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/ ascii
    condition:
        $api1 and (($api2 or $api3 or $api4 or $api5 or $api6) and ($chat or $token))
}

rule Generic_Download_Cradle {
    meta:
        family = "Generic Downloader"
        support = "detection_only"
        severity = "HIGH"
        author = "Gon Exposing"
    strings:
        $s1 = "Invoke-WebRequest" ascii wide nocase
        $s2 = "DownloadString" ascii wide nocase
        $s3 = "DownloadFile" ascii wide nocase
        $s4 = "URLDownloadToFile" ascii wide nocase
        $s5 = "bitsadmin" ascii wide nocase
        $s6 = "certutil -urlcache" ascii wide nocase
    condition:
        2 of them
}
