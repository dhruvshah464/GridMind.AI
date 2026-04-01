import os
import sqlite3
import psycopg2

# Replicate the Node hybrid logic ensuring sync across the stack
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_9btheHapkA5U@ep-holy-credit-a1u14hmv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

def get_db_connection():
    if "postgresql" in DATABASE_URL:
        # PostgreSQL Connection (Neon)
        conn = psycopg2.connect(DATABASE_URL)
        return conn, True
    else:
        # SQLite Connection (Local Fallback Runtime)
        db_path = os.path.join(os.path.dirname(__file__), '../backend/local.db')
        conn = sqlite3.connect(db_path)
        return conn, False

def insert_energy_data(timestamp, consumption, solar, temp):
    conn, is_postgres = get_db_connection()
    cur = conn.cursor()
    
    try:
        if is_postgres:
            cur.execute("""
                INSERT INTO energy_data (timestamp, consumption, solar, temperature)
                VALUES (%s, %s, %s, %s)
            """, (timestamp, consumption, solar, temp))
        else:
            cur.execute("""
                INSERT INTO energy_data (timestamp, consumption, solar, temperature)
                VALUES (?, ?, ?, ?)
            """, (timestamp, consumption, solar, temp))
            
        conn.commit()
        print(f"[DB] Synced {consumption}kWh @ {timestamp}")
    except Exception as e:
        print(f"[DB_ERROR] Failed to insert data: {e}")
    finally:
        cur.close()
        conn.close()
