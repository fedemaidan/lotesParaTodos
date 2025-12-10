# Django REST Framework - Sistema Completo con ViewSets y Routers

Un sistema completo de autenticación y gestión de items usando **todas las herramientas modernas** de Django REST Framework. Este proyecto demuestra las diferencias entre el enfoque manual y el uso de ViewSets con routers automáticos.

## 🚀 Características Principales

### Autenticación Moderna
- **ViewSets** en lugar de vistas manuales
- **Routers automáticos** para URLs
- **Actions personalizadas** para funcionalidades específicas
- **Tokens de autenticación** con gestión automática

### Gestión de Items (CRUD Completo)
- **CRUD automático** con ModelViewSet
- **Filtros y búsqueda** integrados
- **Paginación** automática
- **Permisos granulares** por operación
- **Serializers múltiples** según el contexto

### Funcionalidades Avanzadas
- **Interface web navegable** incluida
- **Validaciones personalizadas** en serializers
- **Actions personalizadas** para operaciones específicas
- **Panel de administración** configurado
- **Documentación automática** explorable

## 📊 Comparación: Manual vs ViewSets

| Aspecto | Enfoque Manual | ViewSets + Routers |
|---------|---------------|-------------------|
| **Líneas de código** | ~200 líneas | ~80 líneas |
| **URLs** | Escritas manualmente | Automáticas |
| **CRUD** | Programado individualmente | Incluido automáticamente |
| **Paginación** | Manual | Automática |
| **Filtros** | Programados desde cero | Configuración simple |
| **Documentación** | Manual | Auto-generada |
| **Interfaz web** | Sin interfaz | Incluida automáticamente |

## 🔧 Instalación Rápida

```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Iniciar servidor
python manage.py runserver 8001
```

## 🌐 URLs Automáticas Generadas

El sistema automáticamente crea estas URLs:

### **Navegación General**
- `GET /api/` - Vista general de todas las APIs

### **Autenticación (AuthViewSet)**
- `GET /api/auth/` - Información de autenticación
- `POST /api/auth/register/` - Registrar usuario
- `POST /api/auth/login/` - Iniciar sesión  
- `POST /api/auth/logout/` - Cerrar sesión
- `GET /api/auth/profile/` - Perfil del usuario

### **Items (ItemViewSet) - CRUD Completo**
- `GET /api/items/` - Listar items (con paginación)
- `POST /api/items/` - Crear nuevo item
- `GET /api/items/{id}/` - Ver item específico
- `PUT /api/items/{id}/` - Actualizar item completo
- `PATCH /api/items/{id}/` - Actualizar parcialmente
- `DELETE /api/items/{id}/` - Eliminar item

### **Actions Personalizadas**
- `GET /api/items/mis_items/` - Solo items activos del usuario
- `POST /api/items/{id}/toggle_activo/` - Cambiar estado
- `GET /api/items/estadisticas/` - Estadísticas de items

### **Filtros Automáticos**
- `GET /api/items/?search=texto` - Búsqueda en nombre y descripción
- `GET /api/items/?ordering=nombre` - Ordenamiento
- `GET /api/items/?page=2` - Paginación

## 💻 Ejemplos de Uso

### 1. Registro y Login
```bash
# Registrarse
curl -X POST http://127.0.0.1:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mi_usuario",
    "email": "usuario@example.com",
    "password": "password123seguro", 
    "password_confirm": "password123seguro"
  }'

# Login (guarda el token recibido)
curl -X POST http://127.0.0.1:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mi_usuario",
    "password": "password123seguro"
  }'
```

### 2. Gestión de Items
```bash
# Crear item
curl -X POST http://127.0.0.1:8001/api/items/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Primer Item",
    "descripcion": "Descripción del item"
  }'

# Listar mis items
curl -H "Authorization: Token TU_TOKEN" \
  http://127.0.0.1:8001/api/items/

# Buscar items
curl -H "Authorization: Token TU_TOKEN" \
  "http://127.0.0.1:8001/api/items/?search=primer"

# Estadísticas
curl -H "Authorization: Token TU_TOKEN" \
  http://127.0.0.1:8001/api/items/estadisticas/
```

## 🌐 Interfaz Web

Abre estas URLs en tu navegador para una interfaz visual:

- **http://127.0.0.1:8001/api/** - Navegador de APIs
- **http://127.0.0.1:8001/api/auth/** - Interfaz de autenticación
- **http://127.0.0.1:8001/api/items/** - Gestión de items
- **http://127.0.0.1:8001/admin/** - Panel de administración

## 🏗️ Arquitectura del Proyecto

```
django-proyectos/
├── manage.py
├── lotesParaTodos/           # Configuración principal
│   ├── settings.py           # Configuración con DRF avanzado
│   └── urls.py               # Router automático principal
├── accounts/                 # Autenticación moderna
│   ├── viewsets.py           # AuthViewSet con @actions
│   ├── serializers.py        # Serializers de autenticación
│   └── urls.py               # URLs manuales (comparación)
├── items/                    # Gestión de items
│   ├── models.py             # Modelo Item con mejores prácticas
│   ├── viewsets.py           # ItemViewSet con CRUD automático
│   ├── serializers.py        # Múltiples serializers
│   └── admin.py              # Panel de admin configurado
├── guia_viewsets.py          # Guía de comandos
└── demo_viewsets.py          # Demo automático
```

## 🎓 Conceptos de Django REST Framework

### **ViewSets vs Views**
```python
# Antes (Manual)
@api_view(['GET', 'POST'])
def items_list(request):
    # Lógica manual para GET y POST
    pass

@api_view(['GET', 'PUT', 'DELETE'])  
def item_detail(request, pk):
    # Lógica manual para cada método
    pass

# Ahora (ViewSet)
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    # ¡CRUD automático completo!
```

### **Routers Automáticos**
```python
# Antes (Manual)
urlpatterns = [
    path('items/', views.items_list),
    path('items/<int:pk>/', views.item_detail),
    # ... más URLs manuales
]

# Ahora (Router)
router = DefaultRouter()
router.register(r'items', ItemViewSet)
urlpatterns = router.urls
# ¡Todas las URLs automáticas!
```

### **Actions Personalizadas**
```python
class ItemViewSet(viewsets.ModelViewSet):
    # CRUD automático incluido
    
    @action(detail=False, methods=['get'])
    def mis_items(self, request):
        # URL automática: /api/items/mis_items/
        pass
    
    @action(detail=True, methods=['post'])
    def toggle_activo(self, request, pk=None):
        # URL automática: /api/items/{id}/toggle_activo/
        pass
```

## ⚡ Ventajas de ViewSets

1. **Menos Código**: 90% menos líneas de código
2. **URLs Automáticas**: No escribir URLs manualmente  
3. **CRUD Incluido**: Operaciones estándar automáticas
4. **Funcionalidades Integradas**: Paginación, filtros, búsqueda
5. **Documentación Automática**: Interfaz web explorable
6. **Estándares REST**: Cumple automáticamente con REST
7. **Extensibilidad**: Fácil agregar funcionalidades personalizadas
8. **Mantenimiento**: Menos código = menos bugs

## 🚀 Siguientes Pasos

1. **Explora la interfaz web**: Ve a http://127.0.0.1:8001/api/
2. **Prueba los comandos**: Usa `python guia_viewsets.py`
3. **Examina el código**: Compara viewsets.py vs views.py
4. **Agrega funcionalidades**: Crea tus propias @actions
5. **Experimenta con filtros**: Prueba diferentes búsquedas

## 🔧 Scripts de Ayuda

- `python guia_viewsets.py` - Comandos curl completos
- `python demo_viewsets.py` - Demo automático (requiere server)
- `python manage.py runserver 8001` - Iniciar servidor

## 📚 Recursos para Aprender Más

- **Documentación DRF**: https://www.django-rest-framework.org/
- **Tutorial ViewSets**: https://www.django-rest-framework.org/tutorial/6-viewsets-and-routers/
- **Guía de Routers**: https://www.django-rest-framework.org/api-guide/routers/

---

**¡Feliz coding con Django REST Framework!** 🐍✨

*Este proyecto demuestra por qué ViewSets y routers son la forma moderna y eficiente de crear APIs con Django.*