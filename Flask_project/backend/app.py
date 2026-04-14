from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import pymongo

# from flask_cors import CORS
# app = Flask(__name__)
# CORS(app, resources={r"/signup": {"origins": "http://localhost:9000"}})

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

connection = pymongo.MongoClient(MONGO_URL)

db = connection.test

collection = db['user_details']

app = Flask(__name__)

@app.route('/signup', methods=['POST'])
def submit():
    try:
        form_data = dict(request.json)
        collection.insert_one(form_data)
        return "Data submitted succesfully"
    except Exception as e:
        return jsonify({"error": str(e)}), 500  
    
@app.route('/fetch', methods=['GET'])
def fetch():
    data = collection.find()
    data = list(data)

    for elem in data:
        print(elem)
        del elem['_id']

    data ={
        'data':data
    }
    return data

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8000, debug=True)