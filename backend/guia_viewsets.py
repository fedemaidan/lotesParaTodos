#!/usr/bin/env python3
"""
Guía de comandos para probar el nuevo sistema con ViewSets.
Muestra todas las URLs automáticas creadas por los routers.
"""

def print_section(title):
    print(f"\n{'='*60}")
    print(f"🚀 {title}")
    print(f"{'='*60}")

def main():
    print("🎉 GUÍA COMPLETA: VIEWSETS Y ROUTERS AUTOMÁTICOS")
    print("🌐 Server: http://127.0.0.1:8001/")
    
    print_section("1. API ROOT (Router automático)")
    print("# Ver todas las APIs disponibles")
    print("curl http://127.0.0.1:8001/api/")
    
    print_section("2. AUTENTICACIÓN (AuthViewSet)")
    print("# Información general de autenticación")
    print("curl http://127.0.0.1:8001/api/auth/")
    print()
    print("# Registrar usuario")
    print("""curl -X POST http://127.0.0.1:8001/api/auth/register/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "mi_usuario",
    "email": "usuario@example.com", 
    "password": "password123seguro",
    "password_confirm": "password123seguro",
    "first_name": "Mi",
    "last_name": "Usuario"
  }'""")
    print()
    print("# Login")
    print("""curl -X POST http://127.0.0.1:8001/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "mi_usuario",
    "password": "password123seguro"
  }'""")
    
    print_section("3. ITEMS CRUD AUTOMÁTICO (ItemViewSet)")
    print("# IMPORTANTE: Reemplaza TOKEN con el token obtenido del login")
    print()
    print("# Listar todos mis items (GET /api/items/)")
    print('curl -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/')
    print()
    print("# Crear nuevo item (POST /api/items/)")
    print("""curl -X POST http://127.0.0.1:8001/api/items/ \\
  -H "Authorization: Token TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Mi Item Automático",
    "descripcion": "Creado con ViewSets",
    "activo": true
  }'""")
    print()
    print("# Ver item específico (GET /api/items/{id}/)")
    print('curl -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/1/')
    print()
    print("# Actualizar item completo (PUT /api/items/{id}/)")
    print("""curl -X PUT http://127.0.0.1:8001/api/items/1/ \\
  -H "Authorization: Token TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Item Actualizado",
    "descripcion": "Descripción actualizada",
    "activo": true
  }'""")
    print()
    print("# Actualizar parcialmente (PATCH /api/items/{id}/)")
    print("""curl -X PATCH http://127.0.0.1:8001/api/items/1/ \\
  -H "Authorization: Token TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"descripcion": "Solo cambio la descripción"}'""")
    print()
    print("# Eliminar item (DELETE /api/items/{id}/)")
    print('curl -X DELETE -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/1/')
    
    print_section("4. ACTIONS PERSONALIZADAS")
    print("# Mis items activos")
    print('curl -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/mis_items/')
    print()
    print("# Cambiar estado activo/inactivo")
    print('curl -X POST -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/1/toggle_activo/')
    print()
    print("# Estadísticas de mis items")
    print('curl -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/estadisticas/')
    
    print_section("5. FILTROS Y BÚSQUEDA AUTOMÁTICA")
    print("# Buscar items por nombre o descripción")
    print('curl -H "Authorization: Token TOKEN" "http://127.0.0.1:8001/api/items/?search=mi_item"')
    print()
    print("# Ordenar por fecha de creación (más nuevos primero)")
    print('curl -H "Authorization: Token TOKEN" "http://127.0.0.1:8001/api/items/?ordering=-fecha_creacion"')
    print()
    print("# Ordenar por nombre alfabéticamente")
    print('curl -H "Authorization: Token TOKEN" "http://127.0.0.1:8001/api/items/?ordering=nombre"')
    print()
    print("# Combinar búsqueda y ordenamiento")
    print('curl -H "Authorization: Token TOKEN" "http://127.0.0.1:8001/api/items/?search=item&ordering=nombre"')
    
    print_section("6. PAGINACIÓN AUTOMÁTICA")
    print("# Primera página (por defecto)")
    print('curl -H "Authorization: Token TOKEN" http://127.0.0.1:8001/api/items/')
    print()
    print("# Página específica")
    print('curl -H "Authorization: Token TOKEN" "http://127.0.0.1:8001/api/items/?page=2"')
    
    print_section("7. NAVEGADOR WEB")
    print("🌐 También puedes probar desde el navegador (interfaz visual):")
    print("• http://127.0.0.1:8001/api/ (Root de la API)")
    print("• http://127.0.0.1:8001/api/auth/ (Autenticación)")
    print("• http://127.0.0.1:8001/api/items/ (Items)")
    print("• http://127.0.0.1:8001/admin/ (Panel de administración)")
    
    print_section("DIFERENCIAS: MANUAL vs VIEWSETS")
    print("""
📋 ANTES (Manual):
- path('register/', views.register_user, name='register')
- path('login/', views.login_user, name='login')  
- Cada URL escrita manualmente
- Cada vista programada individualmente

🚀 AHORA (ViewSets):
- router.register(r'auth', AuthViewSet)
- router.register(r'items', ItemViewSet)
- URLs automáticas para CRUD completo
- Funcionalidades estándar incluidas

⚡ VENTAJAS DE VIEWSETS:
✅ Menos código (90% menos)
✅ URLs automáticas
✅ CRUD completo automático
✅ Paginación incluida
✅ Filtros y búsqueda automática
✅ Permisos granulares
✅ Interface web navegable
✅ Documentación auto-generada
✅ Estándares REST automáticos
✅ Actions personalizadas fáciles
    """)
    
    print_section("FLUJO RECOMENDADO PARA PROBAR")
    print("""
1. 🔐 Registrarse: POST /api/auth/register/
2. 🔑 Hacer login: POST /api/auth/login/ (obtener token)
3. 📝 Crear items: POST /api/items/
4. 👀 Listar items: GET /api/items/
5. ✏️  Editar item: PATCH /api/items/{id}/
6. 🔍 Buscar items: GET /api/items/?search=texto
7. 📊 Ver estadísticas: GET /api/items/estadisticas/
8. 🚪 Logout: POST /api/auth/logout/
    """)

if __name__ == "__main__":
    main()