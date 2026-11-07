
from app.ai_reviewer import review_code


# Sample Python code containing a bug
sample_code = """
def calculate_average(numbers):
    return sum(numbers) / len(numbers)
"""


print("Starting AI Code Review...")

try:

    result = review_code(
        file_path="calculator.py",
        code=sample_code
    )

    print("\n========== GEMINI REVIEW ==========")
    print(result)

    print("\nAI Review completed successfully!")

except Exception as error:

    print("\nAI Review failed!")
    print(type(error).__name__, str(error))
