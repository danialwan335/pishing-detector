# Example delivery method stats seed for initial DB population
from datetime import datetime
from main import SessionLocal, DeliveryMethodStat

db = SessionLocal()

stats = [
    {"method": "email", "percentage": 68, "source": "APWG Phishing Activity Trends", "report_date": datetime(2025, 12, 1)},
    {"method": "direct_link", "percentage": 22, "source": "APWG Phishing Activity Trends", "report_date": datetime(2025, 12, 1)},
    {"method": "qr", "percentage": 7, "source": "Proofpoint Threat Report", "report_date": datetime(2025, 12, 1)},
    {"method": "sms", "percentage": 3, "source": "Verizon DBIR", "report_date": datetime(2025, 12, 1)},
]

for stat in stats:
    exists = db.query(DeliveryMethodStat).filter_by(method=stat["method"]).first()
    if not exists:
        db.add(DeliveryMethodStat(**stat))

db.commit()
db.close()
print("Seeded delivery method stats.")
