import os
from supabase import create_client, Client

# Supabase Configuration
SUPABASE_URL = "https://lzncmebhvthpmantdwbq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bmNtZWJodnRocG1hbnRkd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjcxNzUsImV4cCI6MjA4MDkwMzE3NX0.xSPvU2LPDOLVN9RocBxMdeMVK3aFE7R13L37n6tD5wM"

def test_connection():
    try:
        print(f"Connecting to {SUPABASE_URL}...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("Attempting to fetch scan_history...")
        response = supabase.table("scan_history").select("*").limit(5).execute()
        
        print("Connection Successful!")
        print(f"Data retrieved: {response.data}")
        
    except Exception as e:
        print("\nConnection FAILED!")
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connection()
