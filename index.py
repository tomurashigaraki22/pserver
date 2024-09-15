from extensions.extensions import get_db_connection, app, socketio
from flask import request, jsonify
from flask_socketio import emit
from schemas.schema import setup_database
from functions.auth import login, signup, get_investment_plan_amount, get_balance
from functions.balance import update_balance
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from functions.add_balance_invest import add_daily_earnings



# Schedule the add_daily_earnings function to run daily
scheduler = BackgroundScheduler()
scheduler.add_job(func=add_daily_earnings, trigger="interval", days=1)
scheduler.start()

# To ensure the scheduler shuts down properly when the app exits
import atexit
atexit.register(lambda: scheduler.shutdown())




#                                 #
#  ---Beginning Of App Routes---  #
#                                 #

@app.route("/logins", methods=["GET", "POST"])
def logins():
    print("Hello World")
    return login()

@app.route("/signups", methods=["GET", "POST"])
def signups():
    print("Woweee")
    return signup()

@app.route("/update_balance", methods=["GET", "POST"])
def update_balances():
    return update_balance()

@app.route("/getinvestmentdetails", methods=["GET", "POST"])
def getinvestment():
    return get_investment_plan_amount()

@app.route("/get_balance", methods=["GET", "POST"])
def get_balances():
    return get_balance()

@app.route("/getaddress", methods=["GET", "POST"])
def getAddress():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Create table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS lightning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                address VARCHAR(80) NOT NULL DEFAULT 'wowwwwwww'
            )
        """)

        # Retrieve the address (should only be one row)
        cur.execute("SELECT address FROM lightning LIMIT 1")
        row = cur.fetchone()

        if row:
            address = row[0]
        else:
            address = 'wowwwwwww'  # Default address if table is empty

        conn.commit()
        cur.close()
        conn.close()

        # Return the address as a JSON response
        return jsonify({"address": address})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred while fetching the address."}), 500

# Route to update the lightning address (ensures only one row exists)
@app.route("/updateaddress", methods=["POST"])
def updateAddress():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get the new address from the request body
        new_address = request.form.get('address')

        if not new_address:
            return jsonify({"error": "Address field is required."}), 400

        # Ensure only one row exists, update it if it exists, or insert if it doesn't

        cur.execute("""
            CREATE TABLE IF NOT EXISTS lightning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                address VARCHAR(80) NOT NULL DEFAULT 'wowwwwwww'
            )
        """)
        cur.execute("SELECT id FROM lightning LIMIT 1")
        row = cur.fetchone()

        if row:
            # Update the existing row
            cur.execute("UPDATE lightning SET address = %s WHERE id = %s", (new_address, row[0]))
        else:
            # Insert a new row if none exists
            cur.execute("INSERT INTO lightning (address) VALUES (%s)", (new_address,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Address updated successfully."})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred while updating the address."}), 500
    

@app.route("/update_investment_plan", methods=["POST"])
def update_investment_plan_amount():
    email = request.form.get("email")
    plan = request.form.get("plan")
    amount = request.form.get("amount")
    
    # Ensure all required fields are provided
    if not email or not plan or not amount:
        return jsonify({"status": 400, "message": "Email, plan, and amount are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the user exists
        cur.execute("SELECT email FROM users_db WHERE email = %s", (email,))
        user = cur.fetchone()

        if not user:
            return jsonify({"status": 404, "message": "User not found"}), 404

        # Update the investment plan and amount
        cur.execute("""
            UPDATE users_db 
            SET plan = %s, amount = %s 
            WHERE email = %s
        """, (plan, amount, email))

        conn.commit()

        # Return success message
        return jsonify({
            "status": 200,
            "message": "Investment plan and amount updated successfully"
        }), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": 500, "message": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()


#                           #
#  ---End of App Routes---  #
#                           #







if __name__ == "__main__":
    setup_database()
    socketio.run(app, host="0.0.0.0", port=2345, use_reloader=True, debug=True)