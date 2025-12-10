#!/usr/bin/env python3
"""
Demo completo del sistema de roles y permisos con Django Groups nativo.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"
headers = {'Content-Type': 'application/json'}

def print_separator(title):
    print("\n" + "="*70)
    print(f"🎯 {title}")
    print("="*70)

def print_response(response, description):
    print(f"\n📋 {description}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
        return data
    except:
        print(f"Response Text: {response.text}")
        return None

def demo_roles():
    print("🎉 DEMO: SISTEMA DE ROLES CON DJANGO GROUPS Y PERMISSIONS")
    print("🔐 Sistema nativo de Django + permisos personalizados")
    
    try:
        # 1. Ver información de roles disponibles
        print_separator("1. INFORMACIÓN DE ROLES DEL SISTEMA")
        response = requests.get(f"{BASE_URL}/auth/info_roles/")
        print_response(response, "Roles disponibles en el sistema")
        
        # 2. Crear usuarios de diferentes roles para testing
        print_separator("2. CREANDO USUARIOS DE PRUEBA")
        
        # Usuario normal
        usuario_data = {
            "username": "usuario_normal",
            "email": "usuario@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "first_name": "Usuario",
            "last_name": "Normal"
        }
        response = requests.post(f"{BASE_URL}/auth/register/", 
                               headers=headers, 
                               data=json.dumps(usuario_data))
        user_token = print_response(response, "Registro usuario normal")
        
        if response.status_code == 201:
            user_token = user_token['token']
            
            # 3. Crear items como usuario normal
            print_separator("3. CREAR ITEMS COMO USUARIO NORMAL")
            
            auth_headers = {**headers, 'Authorization': f'Token {user_token}'}
            
            item_data = {
                "nombre": "Item de Usuario Normal",
                "descripcion": "Este item fue creado por un usuario normal"
            }
            
            response = requests.post(f"{BASE_URL}/items/", 
                                   headers=auth_headers,
                                   data=json.dumps(item_data))
            print_response(response, "Crear item como usuario normal")
            
            # 4. Ver items del usuario normal
            response = requests.get(f"{BASE_URL}/items/", headers=auth_headers)
            print_response(response, "Ver items como usuario normal")
            
            # 5. Login como administrador
            print_separator("4. LOGIN COMO ADMINISTRADOR")
            
            admin_login = {
                "username": "alexisadmin",
                "password": "admin123"
            }
            
            response = requests.post(f"{BASE_URL}/auth/login/", 
                                   headers=headers,
                                   data=json.dumps(admin_login))
            admin_data = print_response(response, "Login como administrador")
            
            if response.status_code == 200:
                admin_token = admin_data['token']
                admin_auth_headers = {**headers, 'Authorization': f'Token {admin_token}'}
                
                # 6. Ver todos los items como admin
                print_separator("5. VER TODOS LOS ITEMS COMO ADMINISTRADOR")
                
                response = requests.get(f"{BASE_URL}/items/todos_los_items/", 
                                      headers=admin_auth_headers)
                print_response(response, "Ver todos los items (solo admin/moderador)")
                
                # 7. Asignar rol de moderador a usuario
                print_separator("6. ASIGNAR ROL DE MODERADOR")
                
                # Primero obtener ID del usuario
                response = requests.get(f"{BASE_URL}/auth/listar_usuarios/", 
                                      headers=admin_auth_headers)
                usuarios_data = print_response(response, "Listar todos los usuarios (solo admin)")
                
                # Buscar ID del usuario normal
                usuario_id = None
                if usuarios_data:
                    for user in usuarios_data.get('usuarios', []):
                        if user['username'] == 'usuario_normal':
                            usuario_id = user['id']
                            break
                
                if usuario_id:
                    asignar_rol_data = {
                        "usuario_id": usuario_id,
                        "rol_nombre": "Moderador"
                    }
                    
                    response = requests.post(f"{BASE_URL}/auth/asignar_rol/",
                                           headers=admin_auth_headers,
                                           data=json.dumps(asignar_rol_data))
                    print_response(response, "Asignar rol de Moderador a usuario")
                
                # 8. Verificar nuevo rol del usuario
                print_separator("7. VERIFICAR NUEVOS PERMISOS")
                
                response = requests.get(f"{BASE_URL}/auth/profile/", headers=auth_headers)
                print_response(response, "Perfil actualizado con nuevos roles")
                
                # 9. Ahora el usuario puede ver todos los items (como moderador)
                response = requests.get(f"{BASE_URL}/items/todos_los_items/", 
                                      headers=auth_headers)
                print_response(response, "Usuario (ahora moderador) puede ver todos los items")
        
        print_separator("RESUMEN DEL SISTEMA DE ROLES")
        print("""
🔐 SISTEMA NATIVO DE DJANGO:
✅ Groups (Roles): Administrador, Moderador, Usuario, Invitado  
✅ Permissions: Basados en modelos + permisos personalizados
✅ Signals: Creación automática de UserProfile
✅ Permisos granulares: Por acción y por objeto

🎯 ROLES IMPLEMENTADOS:
• Administrador: Acceso completo (gestión de usuarios, todos los items)
• Moderador: Gestión de contenido (ver/editar todos los items)
• Usuario: Solo sus propios items  
• Invitado: Solo lectura

⚡ VENTAJAS:
• Sistema nativo de Django (robusto y probado)
• Permisos a nivel de base de datos
• Escalable y flexible
• Integración con admin de Django
• Auditoría y logs automáticos

🔧 PERMISOS IMPLEMENTADOS:
• IsOwnerOrReadOnly: Solo propietarios pueden editar
• RoleBasedPermission: Permisos dinámicos por rol
• CanManageUsers: Solo admin gestiona usuarios
• Permisos por ViewSet action: Granularidad máxima
        """)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Servidor no disponible en http://127.0.0.1:8001/")
        print("💡 Ejecuta: python manage.py runserver 8001")

if __name__ == "__main__":
    demo_roles()