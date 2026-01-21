# Script to fetch OpenPhish feed and store in DB
import requests
from datetime import datetime
from main import SessionLocal, PhishingFeed

OPENPHISH_URL = "https://openphish.com/feed.txt"

def fetch_and_store():
    response = requests.get(OPENPHISH_URL, timeout=10)
    response.raise_for_status()
    urls = response.text.splitlines()
    now = datetime.utcnow()
    db = SessionLocal()
    for url in urls:
        # Avoid duplicate URLs for the same fetch time
        exists = db.query(PhishingFeed).filter_by(url=url, fetched_at=now).first()
        if not exists:
            db.add(PhishingFeed(url=url, fetched_at=now))
    db.commit()
    db.close()
    print(f"Stored {len(urls)} URLs for {now}")

if __name__ == "__main__":
    fetch_and_store()
