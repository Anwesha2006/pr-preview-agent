
from app.github_client import (
    generate_app_jwt,
    get_installation_token
)


print("Testing GitHub App authentication...")

try:
    # Test 1: Generate JWT
    app_jwt = generate_app_jwt()

    print("JWT generated successfully!")

    # Test 2: Generate installation token
    installation_token = get_installation_token()

    print("GitHub authentication successful!")
    print("Installation token received!")
    print("Token length:", len(installation_token))

except Exception as error:
    print("Authentication failed!")
    print(type(error).__name__, str(error))
