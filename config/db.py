import pymongo

myclient = pymongo.MongoClient("URI String")

mydb = myclient["db_TB_web_app"]
# print(myclient.list_database_names())
mycollection = mydb["Patient_Info"]
# print(mydb.list_collection_names())

# mydict = { "name": "John", "address": "Highway 37" }
# x = mycollection.insert_one(mydict)
