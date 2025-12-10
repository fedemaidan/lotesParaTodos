#!/usr/bin/env python3
"""
Script de prueba para demostrar el funcionamiento de las APIs de autenticación.
Este script muestra cómo interactuar con todas las APIs del sistema de login.

Uso:
    python test_api.py
"""

import requests
import json

# Configuración de la API
BASE_URL = "http://127.0.0.1:8000/api/auth"
headers = {'Content-Type': 'application/json'}

def print_separator(title):
    """Imprime un separador visual para organizar la salida."""
    print("\n" + "="*50)
    print(f"🔹 {title}")
    print("="*50)

def print_response(response, description):
    """Imprime la respuesta de la API de forma legible."""
    print(f"\n📋 {description}")
    print(f"Status Code: {response.status_code}")
    try:
        response_json = response.json()
        print(f"Response: {json.dumps(response_json, indent=2, ensure_ascii=False)}")
        return response_json
    except:
        print(f"Response Text: {response.text}")
        return None

def test_api_overview():
    """Prueba el endpoint de información general."""
    print_separator("INFORMACIÓN GENERAL DE LA API")
    response = requests.get(f"{BASE_URL}/")
    print_response(response, "Información de la API")
    return response.status_code == 200

def test_user_registration():
    """Prueba el registro de un nuevo usuario."""
    print_separator("REGISTRO DE NUEVO USUARIO")
    
    user_data = {
        "username": "usuario_prueba",
        "email": "prueba@example.com",
        "password": "mi_password_seguro123",
        "password_confirm": "mi_password_seguro123",
        "first_name": "Usuario",
        "last_name": "De Prueba"
    }
    
    print(f"📤 Datos a enviar:")
    print(json.dumps(user_data, indent=2, ensure_ascii=False))
    
    response = requests.post(f"{BASE_URL}/register/", 
                           headers=headers, 
                           data=json.dumps(user_data))
    
    response_data = print_response(response, "Registro de usuario")
    
    if response.status_code == 201 and response_data:
        return response_data.get('token'), response_data.get('user')
    return None, None

def test_user_login():
    """Prueba el login de usuario."""
    print_separator("LOGIN DE USUARIO")
    
    login_data = {
        "username": "usuario_prueba",
        "password": "mi_password_seguro123"
    }
    
    print(f"📤 Datos a enviar:")
    print(json.dumps(login_data, indent=2, ensure_ascii=False))
    
    response = requests.post(f"{BASE_URL}/login/", 
                           headers=headers, 
                           data=json.dumps(login_data))
    
    response_data = print_response(response, "Login de usuario")
    
    if response.status_code == 200 and response_data:
        return response_data.get('token'), response_data.get('user')
    return None, None

def test_user_profile(token):
    """Prueba obtener el perfil del usuario autenticado."""
    print_separator("PERFIL DE USUARIO (Requiere autenticación)")
    
    auth_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Token {token}'
    }
    
    print(f"📤 Header de autorización: Authorization: Token {token[:20]}...")
    
    response = requests.get(f"{BASE_URL}/profile/", headers=auth_headers)
    print_response(response, "Perfil de usuario")
    return response.status_code == 200

def test_user_logout(token):
    """Prueba el logout del usuario."""
    print_separator("LOGOUT DE USUARIO (Requiere autenticación)")
    
    auth_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Token {token}'
    }
    
    print(f"📤 Header de autorización: Authorization: Token {token[:20]}...")
    
    response = requests.post(f"{BASE_URL}/logout/", headers=auth_headers)
    print_response(response, "Logout de usuario")
    return response.status_code == 200

def test_protected_endpoint_without_auth():
    """Prueba acceder a un endpoint protegido sin autenticación."""
    print_separator("PRUEBA DE SEGURIDAD - Sin autenticación")
    
    print("📤 Intentando acceder al perfil sin token de autorización...")
    
    response = requests.get(f"{BASE_URL}/profile/", headers=headers)
    print_response(response, "Acceso sin autenticación (debe fallar)")
    return response.status_code == 401

def main():
    """Función principal que ejecuta todas las pruebas."""
    print("🚀 INICIANDO PRUEBAS DE LA API DE AUTENTICACIÓN")
    print("💡 Asegúrate de que el servidor Django esté ejecutándose en http://127.0.0.1:8000/")
    
    try:
        # Test 1: Información general
        if not test_api_overview():
            print("❌ Error: No se pudo conectar con la API")
            return
        
        # Test 2: Registro de usuario
        token, user = test_user_registration()
        if not token:
            print("❌ Error en el registro de usuario")
            return
        
        # Test 3: Login de usuario
        login_token, login_user = test_user_login()
        if not login_token:
            print("❌ Error en el login de usuario")
            return
        
        # Test 4: Perfil de usuario (autenticado)
        if not test_user_profile(login_token):
            print("❌ Error al obtener el perfil de usuario")
        
        # Test 5: Prueba de seguridad (sin autenticación)
        if not test_protected_endpoint_without_auth():
            print("❌ Error: El endpoint debería rechazar acceso sin autenticación")
        
        # Test 6: Logout
        if not test_user_logout(login_token):
            print("❌ Error en el logout de usuario")
        
        print_separator("RESUMEN DE PRUEBAS")
        print("✅ Todas las pruebas completadas!")
        print("🎉 La API de autenticación está funcionando correctamente.")
        print("\n💡 Consejos para seguir aprendiendo:")
        print("   • Explora el panel de administración en: http://127.0.0.1:8000/admin/")
        print("   • Prueba las APIs con herramientas como Postman o curl")
        print("   • Revisa el código en los archivos views.py y serializers.py")
        print("   • Experimenta modificando las validaciones y funcionalidades")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se pudo conectar con el servidor Django.")
        print("💡 Asegúrate de que el servidor esté ejecutándose:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    main()