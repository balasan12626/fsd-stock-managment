import sys
print("Python:", sys.version)

try:
    import fastapi
    print("fastapi:", fastapi.__version__)
except ImportError as e:
    print("FAIL fastapi:", e)

try:
    import pydantic
    print("pydantic:", pydantic.__version__)
except ImportError as e:
    print("FAIL pydantic:", e)

try:
    import pandas
    print("pandas:", pandas.__version__)
except ImportError as e:
    print("FAIL pandas:", e)

try:
    import numpy
    print("numpy:", numpy.__version__)
except ImportError as e:
    print("FAIL numpy:", e)

try:
    import sklearn
    print("sklearn:", sklearn.__version__)
except ImportError as e:
    print("FAIL sklearn:", e)

try:
    import uvicorn
    print("uvicorn:", uvicorn.__version__)
except ImportError as e:
    print("FAIL uvicorn:", e)

# Test main.py syntax
try:
    import ast
    with open("main.py", "r") as f:
        ast.parse(f.read())
    print("main.py: SYNTAX OK")
except SyntaxError as e:
    print("main.py SYNTAX ERROR:", e)

print("ALL CHECKS DONE")
