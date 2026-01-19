import joblib
import numpy as np
import os
import time
import cv2
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import requests
from bs4 import BeautifulSoup
from collections import Counter
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pishing Detector API")

# Supabase Configuration (set via environment variables)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_KEY environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")
print(f"Looking for model at: {MODEL_PATH}")
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("ML Model loaded successfully")
else:
    model = None
    print(f"Warning: ML Model not found at {MODEL_PATH}. Please run train_model.py")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NewsAPI Configuration - Add your NewsAPI key here
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")  # Set environment variable or update this

def fetch_openphish_trends():
    """Fetch trending phishing targets from OpenPhish"""
    try:
        # Preferred: derive top targeted domains from the OpenPhish feed
        feed = requests.get(
            'https://openphish.com/feed.txt',
            headers={"User-Agent": "Mozilla/5.0 (compatible; PhishDashboard/1.0)"},
            timeout=10,
        )
        feed.raise_for_status()

        domains = []
        for line in feed.text.splitlines():
            url = line.strip()
            if not url:
                continue
            parsed = urlparse(url)
            if parsed.netloc:
                domains.append(parsed.netloc.lower())

        top_counts = Counter(domains).most_common(10)
        trends = [
            {"rank": str(idx + 1), "target": domain, "count": str(count)}
            for idx, (domain, count) in enumerate(top_counts)
        ]

        # Fallback: try scraping the homepage table if feed fails or is empty
        if not trends:
            response = requests.get(
                'https://openphish.com/',
                headers={"User-Agent": "Mozilla/5.0 (compatible; PhishDashboard/1.0)"},
                timeout=10,
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            if tables:
                rows = tables[0].find_all('tr')[1:11]
                for row in rows:
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        trends.append({
                            'rank': cols[0].text.strip() or 'N/A',
                            'target': cols[1].text.strip(),
                            'count': cols[2].text.strip() if len(cols) > 2 else 'N/A'
                        })

        return trends if trends else [{'message': 'Unable to fetch trends from OpenPhish (feed/table empty)'}]
    except Exception as e:
        print(f"Error fetching OpenPhish trends: {e}")
        return [{'message': 'Unable to fetch trends from OpenPhish. Please try again later.'}]

def fetch_phishtank_links():
    """Fetch top phishing links from PhishTank"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; PhishDashboard/1.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        links = []

        def try_rss(url: str):
            try:
                resp = requests.get(url, headers=headers, timeout=10)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.content, 'xml')
                items = soup.find_all('item')[:10]
                local_links = []
                for item in items:
                    title = item.find('title')
                    link = item.find('link')
                    pubDate = item.find('pubDate')
                    if title and link:
                        local_links.append({
                            'title': title.string,
                            'url': link.string,
                            'date': pubDate.string if pubDate else 'N/A'
                        })
                return local_links
            except Exception as rss_err:
                print(f"PhishTank RSS fetch failed ({url}): {rss_err}")
                return []

        # Try HTTPS RSS, then HTTP RSS as fallback
        links = try_rss('https://www.phishtank.com/phish_rss.php')
        if not links:
            links = try_rss('http://www.phishtank.com/phish_rss.php')

        # Fallback: scrape HTML search results if RSS empty
        if not links:
            try:
                html_resp = requests.get(
                    'https://www.phishtank.com/phish_search.php?verified=u&valid=u&active=y&Search=Search',
                    headers=headers,
                    timeout=10,
                )
                html_resp.raise_for_status()
                html_soup = BeautifulSoup(html_resp.content, 'html.parser')
                rows = html_soup.select('table tr')[1:11]
                for idx, row in enumerate(rows):
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        url_tag = cols[1].find('a')
                        links.append({
                            'title': cols[0].get_text(strip=True) or f'Phish #{idx+1}',
                            'url': url_tag['href'] if url_tag and url_tag.get('href') else cols[1].get_text(strip=True),
                            'date': cols[2].get_text(strip=True) if len(cols) > 2 else 'N/A'
                        })
            except Exception as html_err:
                print(f"PhishTank HTML scrape failed: {html_err}")

        return links if links else [{'message': 'No phishing links data available'}]
    except Exception as e:
        print(f"Error fetching PhishTank links: {e}")
        return [{'message': 'Unable to fetch data from PhishTank. Please try again later.'}]

def fetch_phishing_news():
    """Fetch latest news about phishing using NewsAPI"""
    try:
        if not NEWSAPI_KEY:
            return [{'message': 'NewsAPI key not configured. Please set NEWSAPI_KEY environment variable.'}]
        
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': 'phishing OR scam OR cybercrime',
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 10,
            'apiKey': NEWSAPI_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'ok':
            articles = []
            keywords = [
                'phishing', 'cyber', 'ransomware', 'malware', 'scam', 'scams',
                'scammer', 'scammers', 'fraud', 'credential', 'spoof', 'trojan',
                'breach', 'data leak', 'cybercrime', 'cyber attack', 'cyberattack'
            ]
            for article in data.get('articles', [])[:10]:
                title = (article.get('title') or '').lower()
                desc = (article.get('description') or '').lower()
                if any(k in title or k in desc for k in keywords):
                    articles.append({
                        'title': article.get('title', 'N/A'),
                        'description': article.get('description', 'N/A'),
                        'url': article.get('url', '#'),
                        'source': article.get('source', {}).get('name', 'N/A'),
                        'image': article.get('urlToImage', ''),
                        'publishedAt': article.get('publishedAt', 'N/A')
                    })
            return articles if articles else [{'message': 'No recent cybersecurity/phishing news found'}]
        else:
            return [{'message': 'Unable to fetch news. Please try again later.'}]
    except Exception as e:
        print(f"Error fetching news: {e}")
        return [{'message': 'Unable to fetch news. Please try again later.'}]

class ScanRequest(BaseModel):
    url: str

class EmailRequest(BaseModel):
    email_text: str

class ScanResponse(BaseModel):
    url: str
    is_phishing: bool
    confidence: float
    message: str
    scan_duration: float

def extract_features(url):
    # MUST match train_model.py
    try:
        features = []
        keywords = ["login", "verify", "secure", "account", "update", "bank", "signin", "password", "confirm"]
        
        features.append(len(url))
        features.append(url.count('.'))
        features.append(url.count('-'))
        features.append(url.count('@'))
        features.append(1 if "https" in url else 0)
        features.append(sum(c.isdigit() for c in url))
        features.append(sum(1 for k in keywords if k in url.lower()))
        
        return np.array(features).reshape(1, -1)
    except Exception as e:
        print(f"Error extracting URL features: {e}")
        raise

def analyze_url(url: str):
    start_time = time.time()
    features = extract_features(url)
    
    if model:
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        is_phishing = bool(prediction == 1)
        confidence = float(probabilities[1] if is_phishing else probabilities[0])
    else:
        is_phishing = False
        confidence = 0.0

    duration = time.time() - start_time
    
    
    if is_phishing:
        msg = "DANGER: AI-driven analysis detected phishing patterns."
    else:
        msg = "SAFE: No malicious patterns detected by AI."

    # Save to Supabase
    try:
        data = {
            "url": url,
            "is_phishing": is_phishing,
            "confidence": float(confidence),
            "scan_duration": float(duration)
        }
        supabase.table("scan_history").insert(data).execute()
        print(f"Scan saved to DB: {url}")
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
        
    return ScanResponse(
        url=url,
        is_phishing=is_phishing,
        confidence=round(confidence, 4),
        message=msg,
        scan_duration=round(duration, 2)
    )

def remove_emojis(text: str) -> str:
    """Remove emojis and special Unicode characters from text"""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001f926-\U0001f937"
        "\U00010000-\U0010ffff"
        "\u2640-\u2642"
        "\u2600-\u2B55"
        "\u200d"
        "\u23cf"
        "\u23e9"
        "\u231a"
        "\ufe0f"  # dingbats
        "\u3030"
        "]+",
        flags=re.UNICODE
    )
    cleaned = emoji_pattern.sub(r'', text)
    # Remove any remaining non-ASCII characters
    cleaned = cleaned.encode('ascii', 'ignore').decode('ascii')
    # Normalize spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def extract_email_features(email_text: str):
    """Extract features from email content for phishing detection"""
    try:
        # Remove emojis and unknown characters first
        clean_email = remove_emojis(email_text)
        
        features = []
        phishing_keywords = [
            "verify", "confirm", "update", "login", "password", "account", 
            "urgent", "act now", "click here", "suspicious", "unusual activity",
            "secure", "credit card", "bank", "paypal", "amazon", "apple",
            "validate", "reset", "reactivate", "limited time"
        ]
        
        features.append(len(clean_email))
        features.append(clean_email.count(' '))
        features.append(clean_email.count('http'))
        features.append(clean_email.count('click'))
        features.append(clean_email.count('!'))
        features.append(sum(1 for k in phishing_keywords if k.lower() in clean_email.lower()))
        features.append(1 if any(char.isupper() for char in clean_email) else 0)
        
        return np.array(features).reshape(1, -1)
    except Exception as e:
        print(f"Error extracting email features: {e}")
        raise

def analyze_email(email_text: str):
    """Analyze email content for phishing patterns"""
    start_time = time.time()
    clean_email = remove_emojis(email_text)
    features = extract_email_features(clean_email)
    
    if model:
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        is_phishing = bool(prediction == 1)
        confidence = float(probabilities[1] if is_phishing else probabilities[0])
    else:
        is_phishing = False
        confidence = 0.0

    duration = time.time() - start_time
    
    if is_phishing:
        msg = "DANGER: Email contains phishing indicators."
    else:
        msg = "SAFE: Email appears legitimate."

    # Save to Supabase
    try:
        data = {
            "url": f"[EMAIL] {clean_email[:50]}...",  # Store cleaned email
            "is_phishing": is_phishing,
            "confidence": float(confidence),
            "scan_duration": float(duration)
        }
        supabase.table("scan_history").insert(data).execute()
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
    
    return ScanResponse(
        url=f"[EMAIL SCAN]",
        is_phishing=is_phishing,
        confidence=round(confidence, 4),
        message=msg,
        scan_duration=round(duration, 2)
    )

@app.get("/")
def read_root():
    return {"status": "online", "message": "ScamShield Backend is Running (ML + QR Enabled)"}

@app.post("/api/scan", response_model=ScanResponse)
async def scan_url(request: ScanRequest):
    return analyze_url(request.url)

@app.post("/api/scan/qr", response_model=ScanResponse)
async def scan_qr(file: UploadFile = File(...)):
    # Read image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Decode QR Code
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(image)
    
    if not data:
        raise HTTPException(status_code=400, detail="No QR code found in image")
        
    return analyze_url(data)

@app.post("/api/scan/email", response_model=ScanResponse)
async def scan_email(request: EmailRequest):
    try:
        email_length = len(request.email_text)
        print(f"Email scan request received. Email text length: {email_length}")
        
        if not request.email_text or len(request.email_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Email text too short (minimum 10 characters)")
        
        return analyze_email(request.email_text)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in email scan: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing email")

@app.get("/api/history")
async def get_history():
    try:
        response = supabase.table("scan_history").select("*").order("created_at", desc=True).limit(20).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/openphish")
async def get_openphish_trends():
    """Get trending phishing targets from OpenPhish"""
    return {"data": fetch_openphish_trends()}

@app.get("/api/trends/phishtank")
async def get_phishtank_links():
    """Get top phishing links from PhishTank"""
    return {"data": fetch_phishtank_links()}

@app.get("/api/news")
async def get_phishing_news():
    """Get latest phishing/scam/cybercrime news"""
    return {"data": fetch_phishing_news()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
