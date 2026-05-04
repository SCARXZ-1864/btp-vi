from sqlalchemy import text
from backend.core.database import engine

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN mis_id VARCHAR;"))
    except Exception as e:
        print(f"mis_id exists or error: {e}")
        
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN cgpa FLOAT;"))
    except Exception as e:
        print(f"cgpa exists or error: {e}")

    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR;"))
    except Exception as e:
        print(f"profile_picture_url exists or error: {e}")
    conn.commit()
print("Migration done")
