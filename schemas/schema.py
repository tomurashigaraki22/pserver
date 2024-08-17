from extensions.extensions import get_db_connection

def setup_database():
    conn = get_db_connection()
    cur = conn.cursor()

    # Create users_db table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users_db (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL,
            email VARCHAR(80) UNIQUE NOT NULL,
            password VARCHAR(250) NOT NULL,
            plan VARCHAR(250),
            amount VARCHAR(80) NOT NULL,
            number VARCHAR(20) NOT NULL
        )
    """)

    cur.execute("""
        UPDATE users_db
        SET plan = %s, amount = %s
        WHERE email = %s
    """, ("Standard", 300, "epe@gmail.com"))

    # Create balance_db table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS balance_db (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL,
            email VARCHAR(80) UNIQUE NOT NULL,
            balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            number VARCHAR(20) NOT NULL
        )
    """)

    conn.commit()
    cur.close()
    conn.close()