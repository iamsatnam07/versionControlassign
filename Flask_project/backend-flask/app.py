from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
client = pymongo.MongoClient(MONGO_URL)
db = client['user_database']
collection = db['user_details']

app = Flask(__name__)
CORS(app)

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

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json or request.form.to_dict()
        collection.insert_one(data)
        return jsonify({"message": "User registered successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
