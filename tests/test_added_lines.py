from app.ai_agent import get_added_lines

changed_files = [
    {
        "filename": "hello.py",
        "patch": """@@ -8,3 +8,6 @@ def divide(a, b):

 def multiply(a, b):
     return a * b
+
+def subtract(a, b):
+    return a - b."""
    }
]

result = get_added_lines(changed_files)

print("Added lines:", result)

assert result["hello.py"] == {11, 12, 13}

print("All tests passed!")