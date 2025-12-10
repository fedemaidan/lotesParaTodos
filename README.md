# Lotes Para Todos

Sistema de gestión de lotes y emprendimientos inmobiliarios.

## 📁 Estructura del Proyecto

```
lotesParaTodos/
├── frontend/          # React + Vite (UI)
├── backend/           # Django + DRF (API)
├── .gitignore
└── README.md
```

## 🚀 Inicio Rápido

### Backend (Django)

```bash
cd backend

# Crear entorno virtual (primera vez)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Migraciones
python manage.py migrate

# Crear roles iniciales
python manage.py init_roles

# Iniciar servidor
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🔑 Credenciales de Prueba

- **Usuario Admin**: `alexisadmin` / `admin123`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/register/` - Registrar usuario
- `GET /api/auth/profile/` - Perfil del usuario
- `POST /api/auth/logout/` - Cerrar sesión

### Gestión de Usuarios
- `GET /api/auth/listar_usuarios/` - Listar usuarios
- `POST /api/auth/crear_usuario/` - Crear usuario
- `PUT /api/auth/actualizar_usuario/{id}/` - Actualizar usuario
- `DELETE /api/auth/eliminar_usuario/{id}/` - Eliminar usuario

### Gestión de Roles
- `GET /api/auth/listar_roles/` - Listar roles
- `POST /api/auth/crear_rol/` - Crear rol
- `DELETE /api/auth/eliminar_rol/{id}/` - Eliminar rol
- `POST /api/auth/asignar_rol/` - Asignar rol a usuario
- `POST /api/auth/quitar_rol/` - Quitar rol de usuario

### Gestión de Permisos
- `GET /api/auth/listar_permisos/` - Listar permisos
- `POST /api/auth/actualizar_permisos_rol/` - Actualizar permisos de un rol

## 🛡️ Sistema de Permisos

El sistema utiliza permisos granulares que controlan el acceso a cada sección:

| Permiso | Descripción |
|---------|-------------|
| `ver_clientes` | Ver Clientes |
| `editar_clientes` | Editar Clientes |
| `ver_emprendimientos` | Ver Emprendimientos |
| `editar_emprendimientos` | Editar Emprendimientos |
| `ver_ventas` | Ver Ventas |
| `crear_ventas` | Crear Ventas |
| `ver_tesoreria` | Ver Tesorería |
| `gestionar_tesoreria` | Gestionar Tesorería |
| `ver_usuarios` | Ver Usuarios |
| `gestionar_usuarios` | Gestionar Usuarios |
| `ver_configuracion` | Ver Configuración |
| `editar_configuracion` | Editar Configuración |

## 🛠️ Tecnologías

### Frontend
- React 18
- Vite
- Material UI
- React Router DOM
- Axios
- Formik + Yup

### Backend
- Django 5
- Django REST Framework
- Token Authentication
- SQLite (desarrollo)

## 📝 Licencia

MIT
