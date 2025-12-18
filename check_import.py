try:
    from langgraph.checkpoint.mongodb import AsyncMongoDBSaver

    print("Found AsyncMongoDBSaver in langgraph.checkpoint.mongodb")
except ImportError:
    print("Not found in langgraph.checkpoint.mongodb")

try:
    from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver

    print("Found AsyncMongoDBSaver in langgraph.checkpoint.mongodb.aio")
except ImportError:
    print("Not found in langgraph.checkpoint.mongodb.aio")

import langgraph.checkpoint.mongodb

print(dir(langgraph.checkpoint.mongodb))
