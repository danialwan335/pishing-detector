import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import re

# 1. Dataset Creation
# In a real scenario, we would load a large CSV. Here we create a synthetic dataset for demonstration.
data = [
    # Phishing Samples (Target = 1)
    ("http://secure-login-apple.com/account", 1),
    ("http://paypal-verification-update.net/login", 1),
    ("http://bank-of-america-secure.info/update", 1),
    ("http://netflix-payment-issue.com/signin", 1),
    ("http://verify-your-identity-google.com", 1),
    ("http://amazon-order-refund.net", 1),
    ("http://facebook-security-alert.xyz", 1),
    ("http://instagram-verified-badge.top", 1),
    ("http://wells-fargo-banking.security-update.com", 1),
    ("http://crypto-wallet-connect.site", 1),
    ("http://microsoft-office-365-upgrade.net", 1),
    ("http://login.confirm-password.com", 1),
    ("http://billing-issue-resolution.com", 1),
    ("http://secure.account-update.info", 1),
    ("http://verify.user-data.net", 1),
    ("http://support.help-desk-ticket.com", 1),
    ("http://admin.webmail-server.com", 1),
    ("http://update.payment-details.net", 1),
    ("http://account-suspended.action-required.com", 1),
    ("http://free-gift-card-claim.xyz", 1),
    
    # Legitimate Samples (Target = 0)
    ("https://www.google.com", 0),
    ("https://www.youtube.com", 0),
    ("https://www.facebook.com", 0),
    ("https://www.amazon.com", 0),
    ("https://www.wikipedia.org", 0),
    ("https://www.reddit.com", 0),
    ("https://www.netflix.com", 0),
    ("https://www.linkedin.com", 0),
    ("https://www.microsoft.com", 0),
    ("https://www.apple.com", 0),
    ("https://www.instagram.com", 0),
    ("https://twitter.com", 0),
    ("https://stackoverflow.com", 0),
    ("https://github.com", 0),
    ("https://www.nytimes.com", 0),
    ("https://www.cnn.com", 0),
    ("https://www.paypal.com", 0),
    ("https://www.bankofamerica.com", 0),
    ("https://www.wellsfargo.com", 0),
    ("https://www.chase.com", 0)
]

# Add more variations to make it robust
keywords = ["login", "verify", "secure", "account", "update", "bank", "signin", "password", "confirm"]
domains = [".com", ".net", ".org", ".io", ".co"]
suspicious_tlds = [".xyz", ".top", ".site", ".info", ".net"]

# Generate synthetic patterns
# (In a real app, use a CSV like 'phishtank.csv')
for _ in range(50):
    k = np.random.choice(keywords)
    d = np.random.choice(domains)
    data.append((f"http://{k}-service{d}/user", 1))

for _ in range(50):
    k = np.random.choice(["blog", "news", "shop", "forum", "wiki"])
    d = np.random.choice(domains)
    data.append((f"https://www.{k}-daily{d}", 0))

df = pd.DataFrame(data, columns=["url", "label"])

# 2. Feature Extraction Function
# We manually extract features, but for the Pipeline we need a custom transformer or simple vectorizer.
# For simplicity, we'll use TF-IDF on Character N-grams + Custom Features in a manual way before training.

def extract_features(url):
    features = []
    # Feature 1: Length of URL
    features.append(len(url))
    # Feature 2: Count of dots
    features.append(url.count('.'))
    # Feature 3: Count of hyphens
    features.append(url.count('-'))
    # Feature 4: Count of @ symbol
    features.append(url.count('@'))
    # Feature 5: Has 'https'
    features.append(1 if "https" in url else 0)
    # Feature 6: Digit count
    features.append(sum(c.isdigit() for c in url))
    # Feature 7: Presence of suspicious keywords
    suspicious = sum(1 for k in keywords if k in url.lower())
    features.append(suspicious)
    
    return np.array(features)

# Prepare X and y
X = np.array([extract_features(url) for url in df["url"]])
y = df["label"].values

# 3. Model Training
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluation
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"Model trained with accuracy: {acc * 100:.2f}%")

# 5. Save Model
joblib.dump(model, "backend/phishing_model.pkl")
print("Model saved to backend/phishing_model.pkl")
