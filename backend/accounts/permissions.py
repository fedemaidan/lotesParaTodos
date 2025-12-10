"""
Permisos personalizados para el sistema de roles.
Usando el sistema nativo de Django + permisos personalizados.
"""

from rest_framework import permissions
from django.contrib.auth.models import Group


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que solo permite a los propietarios editar sus objetos.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario
        return obj.propietario == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Solo los administradores pueden crear/editar/eliminar.
    Todos pueden leer.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.groups.filter(name='Administrador').exists()


class IsAdminOrModerator(permissions.BasePermission):
    """
    Solo administradores y moderadores tienen acceso.
    """
    
    def has_permission(self, request, view):
        return request.user.groups.filter(
            name__in=['Administrador', 'Moderador']
        ).exists()


class CanManageUsers(permissions.BasePermission):
    """
    Permiso para gestionar usuarios (solo administradores).
    """
    
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Administrador').exists()


class CanViewAllItems(permissions.BasePermission):
    """
    Permiso para ver todos los items (moderadores y administradores).
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.groups.filter(
                name__in=['Administrador', 'Moderador']
            ).exists()
        
        return True


class RoleBasedPermission(permissions.BasePermission):
    """
    Permiso dinámico basado en roles para diferentes acciones.
    """
    
    # Mapeo de acciones a roles permitidos
    ROLE_PERMISSIONS = {
        'list': ['Administrador', 'Moderador', 'Usuario'],
        'retrieve': ['Administrador', 'Moderador', 'Usuario'],
        'create': ['Administrador', 'Moderador', 'Usuario'],
        'update': ['Administrador', 'Moderador'],
        'partial_update': ['Administrador', 'Moderador'],
        'destroy': ['Administrador'],
        'mis_items': ['Administrador', 'Moderador', 'Usuario'],
        'estadisticas': ['Administrador', 'Moderador'],
        'toggle_activo': ['Administrador', 'Moderador'],
    }
    
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado
        if not request.user.is_authenticated:
            return False
        
        # Obtener la acción actual
        action = view.action
        
        # Verificar si la acción está definida en el mapeo
        if action not in self.ROLE_PERMISSIONS:
            return False
        
        # Obtener roles permitidos para esta acción
        roles_permitidos = self.ROLE_PERMISSIONS[action]
        
        # Verificar si el usuario tiene alguno de los roles permitidos
        return request.user.groups.filter(name__in=roles_permitidos).exists()
    
    def has_object_permission(self, request, view, obj):
        # Para acciones específicas de objeto
        if hasattr(obj, 'propietario'):
            # Los usuarios solo pueden editar sus propios items
            if request.user.groups.filter(name='Usuario').exists():
                return obj.propietario == request.user
            
            # Moderadores y administradores pueden editar cualquier item
            return request.user.groups.filter(
                name__in=['Administrador', 'Moderador']
            ).exists()
        
        return True


def get_user_role_display(user):
    """
    Obtener el rol principal del usuario para mostrar.
    """
    if user.groups.filter(name='Administrador').exists():
        return 'Administrador'
    elif user.groups.filter(name='Moderador').exists():
        return 'Moderador'
    elif user.groups.filter(name='Usuario').exists():
        return 'Usuario'
    elif user.groups.filter(name='Invitado').exists():
        return 'Invitado'
    else:
        return 'Sin rol'


def user_has_role(user, role_name):
    """
    Verificar si un usuario tiene un rol específico.
    """
    return user.groups.filter(name=role_name).exists()


def get_permissions_for_role(role_name):
    """
    Obtener todos los permisos asociados a un rol.
    """
    try:
        group = Group.objects.get(name=role_name)
        return list(group.permissions.values_list('codename', flat=True))
    except Group.DoesNotExist:
        return []