"""
URL configuration for lotesParaTodos project.

Ahora usando routers automáticos de Django REST Framework.
Los routers crean automáticamente todas las URLs necesarias.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.viewsets import AuthViewSet
from items.viewsets import ItemViewSet

# Crear router principal
router = DefaultRouter()

# Registrar ViewSets - esto crea automáticamente todas las URLs
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API con router automático - esto incluye todas las URLs de los ViewSets
    path('api/', include(router.urls)),
    
    # URLs adicionales si necesitas
    # path('api-auth/', include('rest_framework.urls')),  # Login/logout de DRF
]

# El router automáticamente crea estas URLs:
# GET    /api/                     - Lista de APIs disponibles
# 
# AUTH ENDPOINTS:
# GET    /api/auth/                - Información de autenticación  
# POST   /api/auth/register/       - Registrar usuario
# POST   /api/auth/login/          - Iniciar sesión
# POST   /api/auth/logout/         - Cerrar sesión
# GET    /api/auth/profile/        - Perfil de usuario
#
# ITEM ENDPOINTS:
# GET    /api/items/               - Listar items
# POST   /api/items/               - Crear item
# GET    /api/items/{id}/          - Ver item específico
# PUT    /api/items/{id}/          - Actualizar item (completo)
# PATCH  /api/items/{id}/          - Actualizar item (parcial)
# DELETE /api/items/{id}/          - Eliminar item
# GET    /api/items/mis_items/     - Items del usuario
# POST   /api/items/{id}/toggle_activo/ - Cambiar estado
# GET    /api/items/estadisticas/  - Estadísticas