"""
ViewSets modernos para autenticación con sistema de roles integrado.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import login, logout
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    AsignarRolSerializer, UsuarioConRolesSerializer, GroupSerializer,
    UserUpdateSerializer, CrearRolSerializer, QuitarRolSerializer
)
from .permissions import CanManageUsers, IsAdminOrModerator
from .models import crear_grupos_iniciales, asignar_rol_usuario

# Permisos del sistema LoteParaTodos (excluir permisos de Django internos)
PERMISOS_SISTEMA = [
    'ver_dashboard', 'ver_clientes', 'editar_clientes',
    'ver_emprendimientos', 'editar_emprendimientos',
    'ver_ventas', 'crear_ventas',
    'ver_tesoreria', 'gestionar_tesoreria',
    'ver_usuarios', 'gestionar_usuarios',
    'ver_configuracion', 'editar_configuracion',
]

def obtener_permisos_usuario(user):
    """
    Obtiene los permisos del sistema para un usuario.
    El administrador tiene todos los permisos.
    """
    # Si es superusuario o tiene rol Administrador, tiene todos los permisos
    if user.is_superuser or user.groups.filter(name='Administrador').exists():
        return PERMISOS_SISTEMA.copy()
    
    # Obtener permisos del usuario (directos y por grupos)
    all_perms = user.get_all_permissions()
    
    # Filtrar solo los permisos del sistema
    permisos_usuario = []
    for perm in all_perms:
        # Los permisos vienen como 'app_label.codename'
        codename = perm.split('.')[-1] if '.' in perm else perm
        if codename in PERMISOS_SISTEMA:
            permisos_usuario.append(codename)
    
    return permisos_usuario


class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet para autenticación con gestión de roles integrada.
    """
    
    queryset = User.objects.none()
    
    def get_permissions(self):
        """
        Configurar permisos dinámicamente según la action.
        """
        if self.action in ['register', 'login', 'list', 'info_roles']:
            return [AllowAny()]
        elif self.action in ['listar_usuarios', 'listar_roles', 'listar_permisos', 'permisos_rol']:
            # Solo requiere estar autenticado para ver usuarios, roles y permisos
            return [IsAuthenticated()]
        elif self.action in ['asignar_rol', 'crear_roles', 
                             'actualizar_usuario', 'eliminar_usuario',
                             'crear_rol', 'eliminar_rol', 'quitar_rol', 'crear_usuario',
                             'asignar_permiso_rol', 'quitar_permiso_rol', 'actualizar_permisos_rol']:
            # Requiere permisos de administración
            return [CanManageUsers()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """
        Elegir serializer según la action.
        """
        if self.action == 'register':
            return UserRegistrationSerializer
        elif self.action == 'login':
            return UserLoginSerializer
        elif self.action == 'asignar_rol':
            return AsignarRolSerializer
        elif self.action == 'listar_usuarios':
            return UsuarioConRolesSerializer
        return UserSerializer
    
    def list(self, request):
        """
        Información general con roles disponibles.
        """
        roles_disponibles = list(Group.objects.values_list('name', flat=True))
        
        return Response({
            'message': 'API de Autenticación con Sistema de Roles',
            'endpoints': {
                'Registro': '/api/auth/register/',
                'Login': '/api/auth/login/',
                'Logout': '/api/auth/logout/',
                'Perfil': '/api/auth/profile/',
                'Asignar Rol': '/api/auth/asignar_rol/ (admin)',
                'Listar Usuarios': '/api/auth/listar_usuarios/ (admin)',
                'Crear Roles': '/api/auth/crear_roles/ (admin)',
                'Info Roles': '/api/auth/info_roles/',
            },
            'roles_disponibles': roles_disponibles,
            'nota': 'Sistema basado en Groups y Permissions nativas de Django'
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Registro con perfil automático y rol por defecto.
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Crear token
            token, created = Token.objects.get_or_create(user=user)
            
            # Respuesta con información de roles
            user_data = UserSerializer(user).data
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': user_data,
                'token': token.key,
                'rol_asignado': 'Usuario (por defecto)'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Login con información de roles y permisos del sistema.
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            token, created = Token.objects.get_or_create(user=user)
            
            # Obtener permisos del sistema
            permisos = obtener_permisos_usuario(user)
            
            return Response({
                'message': 'Login exitoso',
                'user': UserSerializer(user).data,
                'token': token.key,
                'roles': list(user.groups.values_list('name', flat=True)),
                'permisos': permisos
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Logout estándar.
        """
        try:
            request.user.auth_token.delete()
            logout(request)
            
            return Response({
                'message': 'Logout exitoso'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Error durante el logout',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """
        Perfil con información de roles y permisos del sistema.
        """
        user = request.user
        user_data = UserSerializer(user).data
        permisos = obtener_permisos_usuario(user)
        
        return Response({
            'user': user_data,
            'roles': list(user.groups.values_list('name', flat=True)),
            'permisos': permisos,
            'rol_principal': user_data['roles'][0]['name'] if user_data['roles'] else 'Sin rol',
            'total_permisos': len(permisos)
        })
    
    @action(detail=False, methods=['post'])
    def asignar_rol(self, request):
        """
        Asignar rol a un usuario (solo administradores).
        """
        serializer = AsignarRolSerializer(data=request.data)
        
        if serializer.is_valid():
            usuario_id = serializer.validated_data['usuario_id']
            rol_nombre = serializer.validated_data['rol_nombre']
            
            try:
                user = User.objects.get(id=usuario_id)
                grupo = Group.objects.get(name=rol_nombre)
                
                # Asignar rol
                user.groups.add(grupo)
                
                return Response({
                    'message': f'Rol "{rol_nombre}" asignado a "{user.username}"',
                    'usuario': user.username,
                    'nuevo_rol': rol_nombre,
                    'roles_actuales': list(user.groups.values_list('name', flat=True))
                })
                
            except Exception as e:
                return Response({
                    'error': f'Error al asignar rol: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def listar_usuarios(self, request):
        """
        Listar todos los usuarios con sus roles (solo admin).
        """
        usuarios = User.objects.all()
        serializer = UsuarioConRolesSerializer(usuarios, many=True)
        
        return Response({
            'usuarios': serializer.data,
            'total': usuarios.count()
        })
    
    @action(detail=False, methods=['post'])
    def crear_roles(self, request):
        """
        Crear los roles iniciales del sistema (solo admin).
        """
        try:
            crear_grupos_iniciales()
            
            roles = Group.objects.all()
            roles_data = GroupSerializer(roles, many=True).data
            
            return Response({
                'message': 'Roles del sistema creados/verificados',
                'roles': roles_data
            })
            
        except Exception as e:
            return Response({
                'error': f'Error al crear roles: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def info_roles(self, request):
        """
        Información sobre los roles del sistema (público).
        """
        roles_info = {
            'Administrador': {
                'descripcion': 'Acceso completo al sistema',
                'permisos': 'Gestionar usuarios, items, roles y configuraciones'
            },
            'Moderador': {
                'descripcion': 'Gestión de contenido',
                'permisos': 'Ver usuarios, gestionar items de todos los usuarios'
            },
            'Usuario': {
                'descripcion': 'Usuario estándar',
                'permisos': 'Gestionar solo sus propios items'
            },
            'Invitado': {
                'descripcion': 'Solo lectura',
                'permisos': 'Ver items públicos únicamente'
            }
        }
        
        return Response({
            'roles_del_sistema': roles_info,
            'nota': 'Sistema basado en Django Groups y Permissions'
        })

    # ========== NUEVOS ENDPOINTS PARA GESTIÓN COMPLETA ==========
    
    @action(detail=False, methods=['put', 'patch'], url_path='actualizar_usuario/(?P<usuario_id>[^/.]+)')
    def actualizar_usuario(self, request, usuario_id=None):
        """
        Actualizar datos de un usuario existente.
        """
        try:
            user = User.objects.get(id=usuario_id)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': f'Usuario "{user.username}" actualizado correctamente',
                    'usuario': UsuarioConRolesSerializer(user).data
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['delete'], url_path='eliminar_usuario/(?P<usuario_id>[^/.]+)')
    def eliminar_usuario(self, request, usuario_id=None):
        """
        Eliminar un usuario del sistema.
        """
        try:
            user = User.objects.get(id=usuario_id)
            username = user.username
            
            # No permitir eliminar superusuarios ni al usuario actual
            if user.is_superuser:
                return Response({
                    'error': 'No se puede eliminar un superusuario'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if user == request.user:
                return Response({
                    'error': 'No puedes eliminarte a ti mismo'
                }, status=status.HTTP_403_FORBIDDEN)
            
            user.delete()
            
            return Response({
                'message': f'Usuario "{username}" eliminado correctamente'
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def listar_roles(self, request):
        """
        Listar todos los roles (Groups) del sistema.
        """
        roles = Group.objects.all()
        
        roles_data = []
        for rol in roles:
            usuarios_count = rol.user_set.count()
            permisos = list(rol.permissions.values_list('codename', flat=True))
            
            roles_data.append({
                'id': rol.id,
                'nombre': rol.name,
                'usuarios_count': usuarios_count,
                'permisos': permisos
            })
        
        return Response({
            'roles': roles_data,
            'total': roles.count()
        })
    
    @action(detail=False, methods=['post'])
    def crear_rol(self, request):
        """
        Crear un nuevo rol (Group) en el sistema.
        """
        serializer = CrearRolSerializer(data=request.data)
        
        if serializer.is_valid():
            nombre = serializer.validated_data['nombre']
            
            grupo = Group.objects.create(name=nombre)
            
            return Response({
                'message': f'Rol "{nombre}" creado correctamente',
                'rol': {
                    'id': grupo.id,
                    'nombre': grupo.name,
                    'usuarios_count': 0,
                    'permisos': []
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'], url_path='eliminar_rol/(?P<rol_id>[^/.]+)')
    def eliminar_rol(self, request, rol_id=None):
        """
        Eliminar un rol del sistema.
        """
        try:
            rol = Group.objects.get(id=rol_id)
            nombre = rol.name
            
            # No eliminar roles del sistema
            roles_protegidos = ['Administrador', 'Moderador', 'Usuario', 'Invitado']
            if nombre in roles_protegidos:
                return Response({
                    'error': f'El rol "{nombre}" es un rol del sistema y no puede ser eliminado'
                }, status=status.HTTP_403_FORBIDDEN)
            
            rol.delete()
            
            return Response({
                'message': f'Rol "{nombre}" eliminado correctamente'
            })
            
        except Group.DoesNotExist:
            return Response({
                'error': 'Rol no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def quitar_rol(self, request):
        """
        Quitar un rol de un usuario.
        """
        serializer = QuitarRolSerializer(data=request.data)
        
        if serializer.is_valid():
            usuario_id = serializer.validated_data['usuario_id']
            rol_nombre = serializer.validated_data['rol_nombre']
            
            try:
                user = User.objects.get(id=usuario_id)
                grupo = Group.objects.get(name=rol_nombre)
                
                user.groups.remove(grupo)
                
                return Response({
                    'message': f'Rol "{rol_nombre}" quitado del usuario "{user.username}"',
                    'usuario': user.username,
                    'rol_quitado': rol_nombre,
                    'roles_actuales': list(user.groups.values_list('name', flat=True))
                })
                
            except User.DoesNotExist:
                return Response({
                    'error': 'Usuario no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            except Group.DoesNotExist:
                return Response({
                    'error': 'Rol no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def crear_usuario(self, request):
        """
        Crear un nuevo usuario (endpoint para admin).
        """
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Asignar rol si se especifica
            rol_nombre = request.data.get('rol')
            if rol_nombre:
                try:
                    grupo = Group.objects.get(name=rol_nombre)
                    user.groups.add(grupo)
                except Group.DoesNotExist:
                    pass
            
            return Response({
                'message': f'Usuario "{user.username}" creado correctamente',
                'usuario': UsuarioConRolesSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ========== ENDPOINTS PARA GESTIÓN DE PERMISOS ==========

    @action(detail=False, methods=['get'])
    def listar_permisos(self, request):
        """
        Listar todos los permisos disponibles del sistema.
        Excluye permisos de admin y de modelos internos de Django.
        """
        # Modelos a excluir (internos de Django)
        modelos_excluidos = [
            'logentry', 'permission', 'group', 'contenttype', 
            'session', 'token'
        ]
        
        permisos = Permission.objects.exclude(
            content_type__model__in=modelos_excluidos
        ).select_related('content_type')
        
        # Agrupar permisos por modelo/categoría
        permisos_agrupados = {}
        for permiso in permisos:
            modelo = permiso.content_type.model
            app = permiso.content_type.app_label
            
            # Nombre más legible
            categoria = f"{app}.{modelo}"
            
            if categoria not in permisos_agrupados:
                permisos_agrupados[categoria] = {
                    'app': app,
                    'modelo': modelo,
                    'permisos': []
                }
            
            permisos_agrupados[categoria]['permisos'].append({
                'id': permiso.id,
                'codename': permiso.codename,
                'nombre': permiso.name,
                'completo': f"{app}.{permiso.codename}"
            })
        
        # También incluir permisos personalizados para el sistema
        permisos_sistema = [
            {'codename': 'ver_dashboard', 'nombre': 'Ver Dashboard', 'categoria': 'sistema'},
            {'codename': 'ver_clientes', 'nombre': 'Ver Clientes', 'categoria': 'sistema'},
            {'codename': 'editar_clientes', 'nombre': 'Editar Clientes', 'categoria': 'sistema'},
            {'codename': 'ver_emprendimientos', 'nombre': 'Ver Emprendimientos', 'categoria': 'sistema'},
            {'codename': 'editar_emprendimientos', 'nombre': 'Editar Emprendimientos', 'categoria': 'sistema'},
            {'codename': 'ver_ventas', 'nombre': 'Ver Ventas', 'categoria': 'sistema'},
            {'codename': 'crear_ventas', 'nombre': 'Crear Ventas', 'categoria': 'sistema'},
            {'codename': 'ver_tesoreria', 'nombre': 'Ver Tesorería', 'categoria': 'sistema'},
            {'codename': 'gestionar_tesoreria', 'nombre': 'Gestionar Tesorería', 'categoria': 'sistema'},
            {'codename': 'ver_usuarios', 'nombre': 'Ver Usuarios', 'categoria': 'sistema'},
            {'codename': 'gestionar_usuarios', 'nombre': 'Gestionar Usuarios', 'categoria': 'sistema'},
            {'codename': 'ver_configuracion', 'nombre': 'Ver Configuración', 'categoria': 'sistema'},
            {'codename': 'editar_configuracion', 'nombre': 'Editar Configuración', 'categoria': 'sistema'},
        ]
        
        return Response({
            'permisos_django': permisos_agrupados,
            'permisos_sistema': permisos_sistema,
            'total': permisos.count()
        })
    
    @action(detail=False, methods=['get'], url_path='permisos_rol/(?P<rol_id>[^/.]+)')
    def permisos_rol(self, request, rol_id=None):
        """
        Obtener los permisos asignados a un rol específico.
        """
        try:
            rol = Group.objects.get(id=rol_id)
            permisos = rol.permissions.all()
            
            return Response({
                'rol': {
                    'id': rol.id,
                    'nombre': rol.name
                },
                'permisos': [
                    {
                        'id': p.id,
                        'codename': p.codename,
                        'nombre': p.name
                    } for p in permisos
                ],
                'permisos_codenames': list(permisos.values_list('codename', flat=True))
            })
            
        except Group.DoesNotExist:
            return Response({
                'error': 'Rol no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def asignar_permiso_rol(self, request):
        """
        Asignar un permiso a un rol.
        """
        rol_id = request.data.get('rol_id')
        permiso_codename = request.data.get('permiso_codename')
        
        if not rol_id or not permiso_codename:
            return Response({
                'error': 'Se requiere rol_id y permiso_codename'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rol = Group.objects.get(id=rol_id)
            
            # No permitir modificar Administrador
            if rol.name == 'Administrador':
                return Response({
                    'error': 'No se pueden modificar los permisos del rol Administrador'
                }, status=status.HTTP_403_FORBIDDEN)
            
            permiso = Permission.objects.get(codename=permiso_codename)
            rol.permissions.add(permiso)
            
            return Response({
                'message': f'Permiso "{permiso.name}" asignado al rol "{rol.name}"',
                'rol': rol.name,
                'permiso': permiso.codename
            })
            
        except Group.DoesNotExist:
            return Response({
                'error': 'Rol no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Permission.DoesNotExist:
            return Response({
                'error': 'Permiso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def quitar_permiso_rol(self, request):
        """
        Quitar un permiso de un rol.
        """
        rol_id = request.data.get('rol_id')
        permiso_codename = request.data.get('permiso_codename')
        
        if not rol_id or not permiso_codename:
            return Response({
                'error': 'Se requiere rol_id y permiso_codename'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rol = Group.objects.get(id=rol_id)
            
            # No permitir modificar Administrador
            if rol.name == 'Administrador':
                return Response({
                    'error': 'No se pueden modificar los permisos del rol Administrador'
                }, status=status.HTTP_403_FORBIDDEN)
            
            permiso = Permission.objects.get(codename=permiso_codename)
            rol.permissions.remove(permiso)
            
            return Response({
                'message': f'Permiso "{permiso.name}" quitado del rol "{rol.name}"',
                'rol': rol.name,
                'permiso': permiso.codename
            })
            
        except Group.DoesNotExist:
            return Response({
                'error': 'Rol no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Permission.DoesNotExist:
            return Response({
                'error': 'Permiso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def actualizar_permisos_rol(self, request):
        """
        Actualizar todos los permisos de un rol de una vez.
        Recibe la lista completa de permisos que debe tener el rol.
        """
        rol_id = request.data.get('rol_id')
        permisos_codenames = request.data.get('permisos', [])
        
        if not rol_id:
            return Response({
                'error': 'Se requiere rol_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rol = Group.objects.get(id=rol_id)
            
            # No permitir modificar Administrador
            if rol.name == 'Administrador':
                return Response({
                    'error': 'No se pueden modificar los permisos del rol Administrador'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Obtener los permisos por codename
            permisos = Permission.objects.filter(codename__in=permisos_codenames)
            
            # Limpiar y asignar los nuevos permisos
            rol.permissions.clear()
            rol.permissions.add(*permisos)
            
            return Response({
                'message': f'Permisos del rol "{rol.name}" actualizados correctamente',
                'rol': rol.name,
                'permisos_asignados': list(rol.permissions.values_list('codename', flat=True)),
                'total_permisos': rol.permissions.count()
            })
            
        except Group.DoesNotExist:
            return Response({
                'error': 'Rol no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)