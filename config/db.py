import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

DB_URI = os.getenv("DB_URI")
if not DB_URI:
    raise ValueError("DB_URI not found in environment variables")

myclient = pymongo.MongoClient(DB_URI)

mydb = myclient["db_TB_web_app"]
mycollection = mydb["Patient_Info"]
users_collection = mydb["Users"]
