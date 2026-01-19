import os
from supabase import create_client, Client


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
