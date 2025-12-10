# Django REST Framework - Sistema de Login Simple

Este proyecto es una implementación básica de un sistema de autenticación usando Django REST Framework. Es ideal para entender los conceptos fundamentales de Django y las APIs REST.

## 🚀 Características

- **Registro de usuarios**: Crear nuevas cuentas con validación
- **Login/Logout**: Autenticación basada en tokens
- **Perfil de usuario**: Visualizar información del usuario autenticado
- **Seguridad**: Tokens de autenticación y validación de contraseñas

## 📋 Requisitos

- Python 3.8+
- Django 5.2.8
- Django REST Framework 3.16.1

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica):
   ```bash
   git clone <tu-repositorio>
   cd django-proyectos
   ```

2. **Activar el entorno virtual**:
   ```bash
   # En Windows
   .\venv\Scripts\Activate.ps1
   
   # En Linux/Mac
   source venv/bin/activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar migraciones**:
   ```bash
   python manage.py migrate
   ```

5. **Iniciar el servidor**:
   ```bash
   python manage.py runserver
   ```

El servidor estará disponible en: `http://127.0.0.1:8000/`

## 🔗 Endpoints de la API

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| `GET` | `/api/auth/` | Información general de la API | ❌ |
| `POST` | `/api/auth/register/` | Registrar nuevo usuario | ❌ |
| `POST` | `/api/auth/login/` | Iniciar sesión | ❌ |
| `POST` | `/api/auth/logout/` | Cerrar sesión | ✅ |
| `GET` | `/api/auth/profile/` | Perfil del usuario | ✅ |

## 📖 Ejemplos de Uso

### 1. Información de la API
```bash
curl -X GET http://127.0.0.1:8000/api/auth/
```

### 2. Registrar un nuevo usuario
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "email": "juan@example.com",
    "password": "mi_password_seguro",
    "password_confirm": "mi_password_seguro",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "username": "juan_perez",
    "email": "juan@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "date_joined": "2025-11-26T10:30:00Z"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

### 3. Iniciar sesión
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "password": "mi_password_seguro"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "username": "juan_perez",
    "email": "juan@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "date_joined": "2025-11-26T10:30:00Z"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

### 4. Ver perfil (requiere autenticación)
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

### 5. Cerrar sesión (requiere autenticación)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

## 🔍 Probando con el Navegador

También puedes probar las APIs directamente desde tu navegador:

1. **Información general**: Ve a `http://127.0.0.1:8000/api/auth/`
2. **Panel de Django REST Framework**: Ve a cualquier endpoint y verás la interfaz web interactiva

## 🏗️ Estructura del Proyecto

```
django-proyectos/
├── manage.py                 # Comando principal de Django
├── db.sqlite3               # Base de datos SQLite
├── requirements.txt         # Dependencias del proyecto
├── venv/                   # Entorno virtual
├── lotesParaTodos/         # Configuración principal del proyecto
│   ├── __init__.py
│   ├── settings.py         # Configuraciones de Django
│   ├── urls.py            # URLs principales
│   ├── wsgi.py            # Configuración WSGI
│   └── asgi.py            # Configuración ASGI
└── accounts/              # App de autenticación
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py          # Modelos (usamos User de Django)
    ├── views.py           # Vistas de la API
    ├── serializers.py     # Serializers para la API
    ├── urls.py            # URLs de la app
    └── migrations/        # Migraciones de la base de datos
```

## 🎓 Conceptos de Django que Aprenderás

### 1. **Django REST Framework**
- Serializers: Para convertir datos entre JSON y modelos de Django
- Views: Funciones que manejan las peticiones HTTP
- Permissions: Control de acceso a las APIs

### 2. **Autenticación con Tokens**
- Generación automática de tokens únicos por usuario
- Autenticación basada en headers HTTP
- Gestión de sesiones

### 3. **Validación de Datos**
- Validación automática con serializers
- Validaciones personalizadas
- Manejo de errores

### 4. **Modelos de Django**
- Uso del modelo User integrado
- Migraciones automáticas
- ORM de Django

## 🛠️ Próximos Pasos

Para expandir este proyecto, puedes:

1. **Agregar más funcionalidades**:
   - Recuperación de contraseña
   - Verificación de email
   - Roles y permisos

2. **Mejorar la seguridad**:
   - Throttling (limitación de requests)
   - JWT tokens en lugar de tokens simples
   - CORS para frontend

3. **Frontend**:
   - Crear una interfaz web con React, Vue o Angular
   - Formularios para registro y login

4. **Testing**:
   - Pruebas unitarias
   - Pruebas de integración

## 🐛 Troubleshooting

### Error: "No module named 'django'"
Asegúrate de activar el entorno virtual:
```bash
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Linux/Mac
```

### Error 401: "Authentication credentials were not provided"
Incluye el header de autorización en las peticiones protegidas:
```bash
-H "Authorization: Token tu_token_aqui"
```

### Error 400: "Las contraseñas no coinciden"
Verifica que `password` y `password_confirm` sean exactamente iguales.

## 📝 Notas

- Este proyecto usa SQLite como base de datos por simplicidad
- Los tokens no expiran automáticamente (considera JWT para producción)
- La configuración actual es solo para desarrollo

¡Feliz coding! 🚀