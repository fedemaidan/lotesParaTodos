#!/usr/bin/env python3
"""
Demo completo del nuevo sistema con ViewSets y routers automáticos.
Este script muestra todas las ventajas de usar las herramientas modernas de DRF.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"
headers = {'Content-Type': 'application/json'}

def print_separator(title):
    print("\n" + "="*70)
    print(f"🚀 {title}")
    print("="*70)

def print_response(response, description):
    print(f"\n📋 {description}")
    print(f"Status: {response.status_code}")
    print(f"URL: {response.url}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
        return data
    except:
        print(f"Response Text: {response.text}")
        return None

def main():
    print("🎉 DEMO: DJANGO REST FRAMEWORK CON VIEWSETS Y ROUTERS AUTOMÁTICOS")
    print("💡 Server: http://127.0.0.1:8001/")
    
    try:
        # 1. Explorar la API root
        print_separator("1. API ROOT - Router automático")
        response = requests.get(f"{BASE_URL}/")
        print_response(response, "Vista general de todas las APIs disponibles")
        
        # 2. Auth con ViewSets
        print_separator("2. AUTENTICACIÓN CON VIEWSETS")
        
        # Información de auth
        response = requests.get(f"{BASE_URL}/auth/")
        print_response(response, "Información de autenticación (ViewSet.list)")
        
        # Registro usando ViewSet action
        user_data = {
            "username": "demo_user_viewset",
            "email": "demo@viewset.com",
            "password": "password123seguro",
            "password_confirm": "password123seguro",
            "first_name": "Demo",
            "last_name": "ViewSet"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register/", 
                               headers=headers, 
                               data=json.dumps(user_data))
        register_data = print_response(response, "Registro con ViewSet (@action)")
        
        if response.status_code == 201:
            token = register_data['token']
            auth_headers = {**headers, 'Authorization': f'Token {token}'}
            
            # 3. Items CRUD automático
            print_separator("3. ITEMS - CRUD AUTOMÁTICO CON VIEWSETS")
            
            # Listar items (vacío inicialmente)
            response = requests.get(f"{BASE_URL}/items/", headers=auth_headers)
            print_response(response, "Listar items (ModelViewSet.list)")
            
            # Crear item
            item_data = {
                "nombre": "Mi Primer Item con ViewSet",
                "descripcion": "Este item fue creado usando ViewSets automáticos",
                "activo": True
            }
            
            response = requests.post(f"{BASE_URL}/items/", 
                                   headers=auth_headers,
                                   data=json.dumps(item_data))
            item_created = print_response(response, "Crear item (ModelViewSet.create)")
            
            if response.status_code == 201:
                item_id = item_created['item']['id']
                
                # Ver item específico
                response = requests.get(f"{BASE_URL}/items/{item_id}/", headers=auth_headers)
                print_response(response, "Ver item específico (ModelViewSet.retrieve)")
                
                # Actualizar item (PATCH - parcial)
                update_data = {"descripcion": "Descripción actualizada con PATCH"}
                response = requests.patch(f"{BASE_URL}/items/{item_id}/",
                                        headers=auth_headers,
                                        data=json.dumps(update_data))
                print_response(response, "Actualizar parcial (ModelViewSet.partial_update)")
                
                # 4. Actions personalizadas
                print_separator("4. ACTIONS PERSONALIZADAS")
                
                # Toggle activo
                response = requests.post(f"{BASE_URL}/items/{item_id}/toggle_activo/",
                                       headers=auth_headers)
                print_response(response, "Toggle estado (@action detail=True)")
                
                # Crear otro item para estadísticas
                item_data2 = {
                    "nombre": "Segundo Item",
                    "descripcion": "Para probar estadísticas"
                }
                requests.post(f"{BASE_URL}/items/", 
                            headers=auth_headers,
                            data=json.dumps(item_data2))
                
                # Mis items
                response = requests.get(f"{BASE_URL}/items/mis_items/", headers=auth_headers)
                print_response(response, "Mis items activos (@action detail=False)")
                
                # Estadísticas
                response = requests.get(f"{BASE_URL}/items/estadisticas/", headers=auth_headers)
                print_response(response, "Estadísticas de items (@action personalizada)")
                
                # 5. Funciones de búsqueda y filtros
                print_separator("5. BÚSQUEDA Y FILTROS AUTOMÁTICOS")
                
                # Búsqueda por nombre
                response = requests.get(f"{BASE_URL}/items/?search=Primer", headers=auth_headers)
                print_response(response, "Búsqueda automática (?search=Primer)")
                
                # Ordenamiento
                response = requests.get(f"{BASE_URL}/items/?ordering=-fecha_creacion", headers=auth_headers)
                print_response(response, "Ordenamiento (?ordering=-fecha_creacion)")
                
                # 6. Profile del usuario
                print_separator("6. PERFIL DE USUARIO")
                response = requests.get(f"{BASE_URL}/auth/profile/", headers=auth_headers)
                print_response(response, "Perfil del usuario autenticado")
                
                # 7. Logout
                print_separator("7. LOGOUT")
                response = requests.post(f"{BASE_URL}/auth/logout/", headers=auth_headers)
                print_response(response, "Logout (elimina token)")
        
        print_separator("VENTAJAS DE VIEWSETS Y ROUTERS")
        print("""
✅ URLS AUTOMÁTICAS: No necesitas escribir URLs manualmente
✅ CRUD AUTOMÁTICO: ModelViewSet crea todas las operaciones
✅ PAGINACIÓN: Automática para listas grandes
✅ FILTROS: Búsqueda y ordenamiento incluidos
✅ SERIALIZERS INTELIGENTES: Diferentes según la acción
✅ PERMISOS GRANULARES: Control fino sobre cada operación
✅ ACTIONS PERSONALIZADAS: Funcionalidades específicas
✅ INTERFACE WEB: Navegable desde el navegador
✅ DOCUMENTACIÓN: Auto-documentada y explorable

🎓 CONCEPTOS APRENDIDOS:
• ViewSets vs Views tradicionales
• Routers automáticos
• Actions personalizadas (@action)
• Serializers múltiples por ViewSet
• Filtros y búsqueda automática
• Paginación automática
• Permisos dinámicos
        """)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Servidor no disponible en http://127.0.0.1:8001/")
        print("💡 Ejecuta: python manage.py runserver 8001")

if __name__ == "__main__":
    main()