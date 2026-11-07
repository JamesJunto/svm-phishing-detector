import requests

def is_url_reported_as_phishing(url):
    try:
        response = requests.post(
            "https://checkurl.phishtank.com/checkurl/",
            data={
                "url": url,
                "format": "json"
            },
            headers={
                "User-Agent": "phishtank/James"
            },
            timeout=10
        )

        response.raise_for_status()
        return response

    except requests.exceptions.RequestException as e:
        print("PhishTank API request failed:", e)
        return None
