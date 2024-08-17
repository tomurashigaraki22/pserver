from extensions.extensions import app, socketio, get_db_connection
from flask import request, jsonify

def update_balance():
    try:
        email = request.form.get("email")
        amount = float(request.form.get("amount"))
        username = request.form.get("username")

        if not email or not amount or not username:
            return jsonify({"message": "Invalid input", "status": 400}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the user exists in users_db
        cur.execute("""
            SELECT * FROM users_db WHERE username = %s AND email = %s
        """, (username, email))
        user = cur.fetchone()

        if user is not None:
            # User found, update balance
            cur.execute("""
                UPDATE balance_db 
                SET balance = balance + %s 
                WHERE email = %s
            """, (amount, email))
            
            conn.commit()

            socketio.emit("status", {"status": 200, "message": "Balance updated successfully."})
            return jsonify({"message": "Balance updated successfully!", "status": 200, "amount": amount}), 200
        else:
            # User not found
            socketio.emit("status", {"status": 404, "message": "No user found"})
            return jsonify({"message": "No such user found", "status": 404}), 404

    except Exception as e:
        print(e)
        return jsonify({"message": "Error updating balance", "status": 500}), 500

    finally:
        cur.close()
        conn.close()
