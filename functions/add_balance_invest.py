from extensions.extensions import get_db_connection, app, socketio

def add_daily_earnings():
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch all users with their investment plans and amounts
    cur.execute("""
        SELECT username, email, plan, amount 
        FROM users_db
        WHERE plan IS NOT NULL AND amount > 0
    """)
    users = cur.fetchall()

    for user in users:
        username, email, plan, amount = user

        # Example: calculate daily earnings (1.8% over 7 days)
        if plan.lower() != 'null':
            daily_earnings = (amount * 1.8) / 7
        else:
            daily_earnings = 0  # Default to 0 if plan is unknown

        # Update the user's balance in the balance_db table
        cur.execute("""
            UPDATE balance_db 
            SET balance = balance + %s 
            WHERE email = %s
        """, (daily_earnings, email))

    conn.commit()
    cur.close()
    conn.close()
