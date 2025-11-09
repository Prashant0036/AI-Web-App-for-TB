# config/db.py
import os
from dotenv import load_dotenv
import pymongo

# Load .env locally; Streamlit Cloud will supply env via st.secrets and we set os.environ in frontend.
load_dotenv()

DB_URI = os.getenv("DB_URI")
if not DB_URI:
    raise RuntimeError("Missing DB_URI environment variable. Set DB_URI locally or in Streamlit secrets.")

client = pymongo.MongoClient(DB_URI)
mydb = client["db_TB_web_app"]
mycollection = mydb["Patient_Info"]
