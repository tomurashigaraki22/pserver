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

#                           #
#  ---End of App Routes---  #
#                           #







if __name__ == "__main__":
    setup_database()
    socketio.run(app, host="0.0.0.0", port=2345, use_reloader=True, debug=True)