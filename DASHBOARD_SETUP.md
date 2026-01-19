# Phishing Detector - Dashboard Setup Guide

## Overview
Your phishing detector now includes a comprehensive dashboard that displays:
1. **Top Targeted Brands & Sectors** - Trending phishing targets from OpenPhish
2. **Top 10 Famous Phishing Links** - Latest phishing URLs from PhishTank
3. **Latest Phishing & Cybercrime News** - Recent news from NewsAPI

## Setup Instructions

### 1. Install Required Dependencies

Update your Python dependencies by running:
```bash
pip install -r backend/requirements.txt
```

The following packages will be installed:
- `requests` - For making HTTP requests
- `beautifulsoup4` - For web scraping
- `lxml` - For XML parsing (required by beautifulsoup4)

### 2. Get NewsAPI Key (IMPORTANT for News Feature)

To enable the news fetching feature, you need to:

1. Go to [https://newsapi.org/](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Set the environment variable before running the backend:

**On Windows (PowerShell):**
```powershell
$env:NEWSAPI_KEY = "your_api_key_here"
python backend/main.py
```

**On Windows (Command Prompt):**
```cmd
set NEWSAPI_KEY=your_api_key_here
python backend/main.py
```

**On macOS/Linux:**
```bash
export NEWSAPI_KEY="your_api_key_here"
python backend/main.py
```

**Or create a `.env` file in the backend directory:**
```
NEWSAPI_KEY=your_api_key_here
```

### 3. Start Your Application

Run the application as usual:
```bash
npm start
```

This will start both the React frontend and Python backend.

### 4. Access the Dashboard

Once your application is running:
1. Navigate to `http://localhost:3000`
2. Click on the "Dashboard" link in the navbar
3. Or go directly to `http://localhost:3000/dashboard`

## Features

### Top Targeted Brands & Sectors
- Displays trending phishing targets
- Shows the rank and incident counts
- Auto-refreshes with the refresh button
- Data sourced from OpenPhish.com

### Top 10 Famous Phishing Links
- Lists the most recent phishing URLs
- Includes the reported date
- Direct links to view details (use with caution!)
- Data sourced from PhishTank.com

### Latest Phishing & Cybercrime News
- Displays 10 most recent news articles
- Includes article preview images
- Shows source and publication date
- Clickable cards to read full articles
- News query: "phishing OR scam OR cybercrime"
- Data sourced from NewsAPI.org

## API Endpoints

The backend provides the following endpoints:

### Get OpenPhish Trends
```
GET http://localhost:8000/api/trends/openphish
```
Response:
```json
{
  "data": [
    {
      "rank": "1",
      "target": "Amazon",
      "count": "145"
    }
  ]
}
```

### Get PhishTank Links
```
GET http://localhost:8000/api/trends/phishtank
```
Response:
```json
{
  "data": [
    {
      "title": "Phishing link description",
      "url": "http://phishing-url.com",
      "date": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### Get Phishing News
```
GET http://localhost:8000/api/news
```
Response:
```json
{
  "data": [
    {
      "title": "Article Title",
      "description": "Article summary",
      "url": "https://news-source.com/article",
      "source": "Source Name",
      "image": "https://image-url.com/image.jpg",
      "publishedAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

## Troubleshooting

### News Section Shows Error
- Make sure you have set the `NEWSAPI_KEY` environment variable
- Verify your API key is valid at [https://newsapi.org/](https://newsapi.org/)
- Check that your free tier hasn't exceeded the rate limit (100 requests/day)

### Trends Not Loading
- The OpenPhish website structure may have changed. Check the browser console for errors
- Try using the refresh button to retry

### Links Not Loading
- PhishTank.com may be temporarily unavailable
- Check your internet connection

### CORS Errors
- Make sure both frontend (port 3000) and backend (port 8000) are running
- The backend already has CORS enabled for all origins

## Rate Limiting

### NewsAPI
- Free tier: 100 requests per day
- The dashboard makes 1 request when loaded
- Each manual refresh counts as 1 request

### OpenPhish & PhishTank
- No official rate limits for basic usage
- Recommended: Refresh at most every 1-2 hours per user to be respectful

## Security Notes

⚠️ **WARNING:** The PhishTank links displayed are actual phishing URLs. 
- Do NOT click on them unless you understand the risks
- Do NOT enter credentials on those sites
- Use for educational and analysis purposes only

## Future Enhancements

Possible improvements:
- Add caching to reduce API calls
- Implement auto-refresh at configurable intervals
- Add filtering by source/industry
- Store trends history for analysis
- Add threat severity indicators
- Email alerts for critical news

## Support

For issues with:
- **OpenPhish**: Visit https://openphish.com/
- **PhishTank**: Visit https://www.phishtank.com/
- **NewsAPI**: Visit https://newsapi.org/
- **Your Application**: Check the browser console (F12) and backend logs
