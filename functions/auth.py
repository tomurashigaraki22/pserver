from extensions.extensions import get_db_connection, app, socketio
from flask import request, jsonify
import bcrypt
import jwt
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")


def signup():
    try:
        email = request.form.get("email")
        password = request.form.get("password")
        username = email.split("@")[0]
        number = request.form.get("number")

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        cur = conn.cursor()

        try:
            # Insert into users table
            cur.execute("""
                INSERT INTO users_db (username, email, password, number, amount)
                VALUES (%s, %s, %s, %s, %s)
            """, (username, email, hashed_password.decode('utf-8'), number, 0))

            # Insert into balance table with an initial balance of 0.00
            cur.execute("""
                INSERT INTO balance_db (username, email, balance, number)
                VALUES (%s, %s, %s, %s)
            """, (username, email, 0.00, number))

            conn.commit()

        except Exception as sql_error:
            conn.rollback()  # Rollback in case of SQL errors
            print(sql_error)
            return jsonify({"message": "Error registering user", "status": 500}), 500

        finally:
            cur.close()
            conn.close()

        payload = {
            'username': username,
            'email': email,
            'number': number,
            'plan': "null",
            'amount': '0',
            'balance': 0.00
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return jsonify({"message": "User registered successfully!", "status": 200, "token": token})

    except Exception as e:
        print(e)
        return jsonify({"message": "Error registering user", "status": 500}), 500
    
def calculate_earnings(investment_amount, days_passed):
    daily_earnings = (investment_amount * 1.8) / 7
    print(f"DAILY*TIME: {daily_earnings} {days_passed}")
    return daily_earnings * days_passed


def get_balance():
    email = request.form.get('email')

    if not email:
        return jsonify({"status": 400, "message": "Email is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Call the get_investment_plan_amount function to get plan and amount
        plan_amount_response = get_investment_plan_amount()
        if plan_amount_response[1] != 200:
            return plan_amount_response  # If there was an issue, return the error
        
        plan_amount_data = plan_amount_response[0].get_json()
        print(f"W: {plan_amount_data}")
        investment_amount = plan_amount_data.get("amount")

        # Fetch user's balance and last update time
        cur.execute("""
            SELECT balance, last_update 
            FROM balance_db
            WHERE email = %s
        """, (email,))
        
        result = cur.fetchone()

        if result is None:
            return jsonify({"status": 404, "message": "No balance found for this email"}), 404

        balance, last_update = result

        # Calculate days passed since the last update
        last_update = datetime.strptime(str(last_update), '%Y-%m-%d %H:%M:%S')
        now = datetime.utcnow()
        days_passed = (now - last_update).days
        print(f"DAYS: {days_passed}")

        # If days have passed, calculate earnings and update balance
        if days_passed > 0:
            earnings = calculate_earnings(investment_amount, days_passed)
            balance += earnings

            # Update the balance and last_update in the database
            cur.execute("""
                UPDATE balance_db 
                SET balance = %s, last_update = %s 
                WHERE email = %s
            """, (balance, now, email))

            conn.commit()

        return jsonify({"status": 200, "balance": balance}), 200

    except Exception as e:
        print(f"Exception error: {e}")
        return jsonify({"status": 500, "message": "Internal Server Error", "Exception": str(e)}), 500

    finally:
        cur.close()
        conn.close()

def get_investment_plan_amount():
    email = request.form.get("email")
    
    if not email:
        return jsonify({"status": 400, "message": "Email is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Fetch user's investment plan and amount
        cur.execute("""
            SELECT plan, amount FROM users_db WHERE email = %s
        """, (email,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"status": 404, "message": "User not found"}), 404
        
        plan, amount = user
        
        # Return investment plan and amount
        return jsonify({
            "status": 200,
            "plan": plan,
            "amount": amount
        }), 200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": 500, "message": "Internal server error"}), 500
    
    finally:
        cur.close()
        conn.close()


def login():
    try:
        email = request.form.get("email")
        password = request.form.get("password")

        conn = get_db_connection()
        cur = conn.cursor()

        try:
            cur.execute("""
                SELECT username, password, number, plan, amount FROM users_db WHERE email = %s
            """, (email,))
            user = cur.fetchone()

            if not user:
                return jsonify({"message": "Invalid email or password", "status": 404})

            # Check password
            if bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
                cur.execute("""
                    SELECT balance FROM balance_db WHERE email = %s
                """, (email,))
                bal = cur.fetchone()

                balance = float(bal[0]) if bal else 0.00

                payload = {
                    'username': user[0],
                    'email': email,
                    'balance': balance,
                    'number': user[2],
                    'plan': user[3],
                    'amount': user[4]
                }
                token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

                return jsonify({"message": "Login successful!", "status": 200, "token": token})
            else:
                return jsonify({"message": "Invalid email or password", "status": 404})

        except Exception as sql_error:
            print(sql_error)
            return jsonify({"message": "Error logging in", "status": 500}), 500

        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print(e)
        return jsonify({"message": "Error logging in", "status": 500}), 500
