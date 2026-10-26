def extract_url_features_csv_compatible(url: str) -> dict:
    import re
    from urllib.parse import urlparse

    u = url.strip()

    # URLLength: strip scheme, replace https with http
    normalized = u.replace("https://", "http://", 1) if u.startswith("https://") else u
    url_len = len(normalized)

    # Parse host
    parse_target = u if "://" in u else "http://" + u
    host = urlparse(parse_target).netloc.split("@")[-1].split(":")[0].lower()
    parts = host.split(".")
    tld = parts[-1] if len(parts) >= 2 else ""

    # DomainLength: length of full host (matches CSV)
    domain_len = len(host)

    # IsDomainIP: strict IP check
    import ipaddress
    try:
        ipaddress.ip_address(host)
        is_ip = 1
    except ValueError:
        is_ip = 0

    # NoOfSubDomain: number of dots - 1 (floored at 0)
    no_sub = max(0, host.count(".") - 1)

    # Obfuscation: same as before (%XX)
    obf_chars = len(re.findall(r"%[0-9A-Fa-f]{2}", u))
    has_obf = int(obf_chars > 0)
    obf_ratio = obf_chars / max(1, url_len)

    # CRITICAL: host without "www." prefix
    host_wo_www = host[4:] if host.startswith("www.") else host

    # NoOfLettersInURL = letters in host_wo_www[:-1]
    # (The -1 reproduces the CSV's off-by-one; may be a bug in the original code)
    sld_and_tld = host_wo_www[:-1]
    n_letters = sum(c.isalpha() for c in sld_and_tld)

    # NoOfDegitsInURL = digits in full URL? or in host_wo_www?
    # From samples, all had 0 digits, can't distinguish. Use host_wo_www to be safe.
    n_digits = sum(c.isdigit() for c in host_wo_www)

    # NoOfOtherSpecialCharsInURL = specials in host_wo_www[:-1]
    n_other_special = sum(1 for c in sld_and_tld if not c.isalnum())

    # From CSV ratios:
    # LetterRatioInURL = n_letters / url_len
    # For voicefmradio: 15 / 29 = 0.517 ✅
    # DegitRatioInURL = n_digits / url_len
    # SpacialCharRatioInURL = n_other_special / url_len
    # For southbank: 1 / 31 = 0.032 ✅
    # For voicefmradio: 2 / 29 = 0.069 ✅
    # For uni-mainz: 2 / 23 = 0.087 ✅

    return {
        "URLLength": float(url_len),
        "DomainLength": float(domain_len),
        "IsDomainIP": float(is_ip),
        "TLDLength": float(len(tld)),
        "NoOfSubDomain": float(no_sub),
        "HasObfuscation": float(has_obf),
        "NoOfObfuscatedChar": float(obf_chars),
        "ObfuscationRatio": round(obf_ratio, 3),
        "NoOfLettersInURL": float(n_letters),
        "LetterRatioInURL": round(n_letters / max(1, url_len), 3),
        "NoOfDegitsInURL": float(n_digits),
        "DegitRatioInURL": round(n_digits / max(1, url_len), 3),
        "NoOfEqualsInURL": float(u.count("=")),
        "NoOfQMarkInURL": float(u.count("?")),
        "NoOfAmpersandInURL": float(u.count("&")),
        "NoOfOtherSpecialCharsInURL": float(n_other_special),
        "SpacialCharRatioInURL": round(n_other_special / max(1, url_len), 3),
        "IsHTTPS": float(u.lower().startswith("https://")),
    }