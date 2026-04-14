from flask import Flask,render_template, request
import requests

app = Flask(__name__)

BACKEND_URL = 'http://localhost:8000'

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def submit():
    form_data = dict(request.form)
    requests.post(BACKEND_URL + '/signup', json=form_data)
       
    return "Data submitted succesfully"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=9000,debug=True)