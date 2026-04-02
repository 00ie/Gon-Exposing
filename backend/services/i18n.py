from __future__ import annotations


LanguageCode = str


def resolve_language(value: str | None) -> LanguageCode:
    normalized = (value or "").strip().lower()
    if normalized.startswith("pt"):
        return "pt-BR"
    if normalized.startswith("en"):
        return "en"
    return "en"


def t(language: LanguageCode, pt: str, en: str) -> str:
    return en if language == "en" else pt


def auth_error_detail(error_code: str, language: LanguageCode) -> str:
    messages = {
        "auth_header_invalid": (
            "Formato invalido do cabecalho Authorization.",
            "Invalid Authorization header format.",
        ),
        "bearer_invalid": (
            "Token bearer invalido ou expirado.",
            "Invalid or expired bearer token.",
        ),
        "api_key_invalid": (
            "API key invalida.",
            "Invalid API key.",
        ),
    }
    pt, en = messages.get(error_code, ("Falha de autenticacao.", "Authentication failed."))
    return t(language, pt, en)


def localize_validation_errors(errors: list[dict], language: LanguageCode) -> list[dict]:
    localized: list[dict] = []
    for error in errors:
        error_type = str(error.get("type", ""))
        ctx = error.get("ctx") or {}
        msg = error.get("msg", "")

        if error_type == "missing":
            localized_msg = t(language, "Campo obrigatorio.", "Field required.")
        elif error_type == "string_too_short":
            min_length = ctx.get("min_length")
            localized_msg = t(
                language,
                f"O texto deve ter pelo menos {min_length} caracteres." if min_length is not None else "O texto esta muito curto.",
                f"The text must have at least {min_length} characters." if min_length is not None else "The text is too short.",
            )
        elif error_type == "string_too_long":
            max_length = ctx.get("max_length")
            localized_msg = t(
                language,
                f"O texto deve ter no maximo {max_length} caracteres." if max_length is not None else "O texto esta muito longo.",
                f"The text must have at most {max_length} characters." if max_length is not None else "The text is too long.",
            )
        elif error_type == "string_pattern_mismatch":
            localized_msg = t(language, "O valor informado nao segue o formato esperado.", "The provided value does not match the expected format.")
        elif error_type == "json_invalid":
            localized_msg = t(language, "JSON invalido.", "Invalid JSON.")
        elif error_type.startswith("value_error"):
            localized_msg = t(language, "Valor invalido.", "Invalid value.")
        else:
            localized_msg = msg if language == "en" else msg

        localized.append({**error, "msg": localized_msg})

    return localized
