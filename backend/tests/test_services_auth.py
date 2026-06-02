from backend.services.auth_service import auth_service


# Верификация
def test_verify_password():
    hashed = auth_service.get_password_hash("password")
    assert auth_service.verify_password("password", hashed)
    assert not auth_service.verify_password("wrong", hashed)

# Хеширование
def test_get_password_hash():
    hashed = auth_service.get_password_hash("password")
    assert isinstance(hashed, str)
    assert hashed != "password"

# Авторизация
def test_create_access_token():
    token = auth_service.create_access_token({"sub": "user"})
    assert isinstance(token, str)
    assert len(token) > 0
