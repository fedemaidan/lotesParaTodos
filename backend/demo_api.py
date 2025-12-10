#!/usr/bin/env python3
"""
Script para demostrar las APIs de autenticación sin servidor externo.
Este script muestra los comandos curl que puedes usar para probar las APIs.
"""

def print_separator(title):
    print("\n" + "="*60)
    print(f"🔹 {title}")
    print("="*60)

def main():
    print("🚀 GUÍA DE COMANDOS PARA PROBAR LA API DE AUTENTICACIÓN")
    print("💡 Primero asegúrate de que el servidor Django esté ejecutándose:")
    print("   python manage.py runserver")
    print("\n🌐 Luego puedes usar estos comandos curl desde otra terminal:")
    
    print_separator("1. INFORMACIÓN GENERAL DE LA API")
    print("curl -X GET http://127.0.0.1:8000/api/auth/")
    
    print_separator("2. REGISTRAR UN NUEVO USUARIO")
    print('curl -X POST http://127.0.0.1:8000/api/auth/register/ \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{')
    print('    "username": "mi_usuario",')
    print('    "email": "usuario@example.com",')
    print('    "password": "mi_password_seguro123",')
    print('    "password_confirm": "mi_password_seguro123",')
    print('    "first_name": "Mi",')
    print('    "last_name": "Usuario"')
    print('  }\'')
    
    print_separator("3. INICIAR SESIÓN")
    print('curl -X POST http://127.0.0.1:8000/api/auth/login/ \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{')
    print('    "username": "mi_usuario",')
    print('    "password": "mi_password_seguro123"')
    print('  }\'')
    
    print_separator("4. VER PERFIL (Reemplaza TOKEN con el token recibido)")
    print('curl -X GET http://127.0.0.1:8000/api/auth/profile/ \\')
    print('  -H "Authorization: Token TU_TOKEN_AQUI"')
    
    print_separator("5. CERRAR SESIÓN")
    print('curl -X POST http://127.0.0.1:8000/api/auth/logout/ \\')
    print('  -H "Authorization: Token TU_TOKEN_AQUI"')
    
    print_separator("NAVEGADOR WEB")
    print("También puedes abrir estas URLs en tu navegador:")
    print("• http://127.0.0.1:8000/api/auth/ (Información general)")
    print("• http://127.0.0.1:8000/api/auth/register/ (Formulario de registro)")
    print("• http://127.0.0.1:8000/api/auth/login/ (Formulario de login)")
    print("• http://127.0.0.1:8000/admin/ (Panel de administración)")
    
    print_separator("FLUJO TÍPICO DE USO")
    print("1. 📝 Registrarse con /register/")
    print("2. 🔑 Obtener el token de la respuesta")
    print("3. 🔐 Usar el token en el header 'Authorization: Token <token>'")
    print("4. 👤 Acceder a endpoints protegidos como /profile/")
    print("5. 🚪 Cerrar sesión con /logout/")

if __name__ == "__main__":
    main()