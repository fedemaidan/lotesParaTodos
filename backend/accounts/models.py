"""
Sistema de roles usando Groups y Permissions nativas de Django.
Esto es más eficiente que crear modelos personalizados.
"""

from django.db import models
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extensión del modelo User usando el sistema nativo de Django.
    Los roles se manejan con Groups y los permisos con Permissions.
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Campos adicionales del perfil
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    
    # Campos de control
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"
        
    def __str__(self):
        return f"Perfil de {self.user.username}"
    
    @property
    def roles(self):
        """Obtener todos los grupos (roles) del usuario."""
        return self.user.groups.all()
    
    @property
    def permisos(self):
        """Obtener todos los permisos del usuario (directos + de grupos)."""
        return self.user.get_all_permissions()
    
    def tiene_rol(self, nombre_rol):
        """Verificar si el usuario tiene un rol específico."""
        return self.user.groups.filter(name=nombre_rol).exists()
    
    def agregar_rol(self, nombre_rol):
        """Agregar un rol al usuario."""
        grupo, created = Group.objects.get_or_create(name=nombre_rol)
        self.user.groups.add(grupo)
    
    def quitar_rol(self, nombre_rol):
        """Quitar un rol del usuario."""
        try:
            grupo = Group.objects.get(name=nombre_rol)
            self.user.groups.remove(grupo)
        except Group.DoesNotExist:
            pass
    
    def tiene_permiso(self, permiso):
        """Verificar si el usuario tiene un permiso específico."""
        return self.user.has_perm(permiso)


@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    """
    Signal que crea automáticamente un perfil cuando se crea un usuario.
    """
    if created:
        UserProfile.objects.create(user=instance)
        
        # Asignar rol por defecto
        grupo_usuario, created = Group.objects.get_or_create(name='Usuario')
        instance.groups.add(grupo_usuario)


@receiver(post_save, sender=User) 
def guardar_perfil_usuario(sender, instance, **kwargs):
    """
    Signal que guarda el perfil cuando se guarda el usuario.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()


# Funciones utilitarias para gestión de roles
def crear_grupos_iniciales():
    """
    Crear los grupos (roles) iniciales del sistema.
    """
    roles = [
        {
            'nombre': 'Administrador',
            'permisos': [
                'add_user', 'change_user', 'delete_user', 'view_user',
                'add_item', 'change_item', 'delete_item', 'view_item',
                'add_group', 'change_group', 'delete_group', 'view_group'
            ]
        },
        {
            'nombre': 'Moderador', 
            'permisos': [
                'view_user',
                'add_item', 'change_item', 'view_item',
                'view_group'
            ]
        },
        {
            'nombre': 'Usuario',
            'permisos': [
                'add_item', 'change_item', 'view_item'  # Solo sus propios items
            ]
        },
        {
            'nombre': 'Invitado',
            'permisos': [
                'view_item'  # Solo lectura
            ]
        }
    ]
    
    for rol_data in roles:
        grupo, created = Group.objects.get_or_create(name=rol_data['nombre'])
        
        if created:
            print(f"✅ Grupo '{rol_data['nombre']}' creado")
            
            # Agregar permisos al grupo
            for permiso_codename in rol_data['permisos']:
                try:
                    # Los permisos se crean automáticamente para cada modelo
                    permiso = Permission.objects.get(codename=permiso_codename)
                    grupo.permissions.add(permiso)
                except Permission.DoesNotExist:
                    print(f"⚠️ Permiso '{permiso_codename}' no encontrado")
        else:
            print(f"ℹ️ Grupo '{rol_data['nombre']}' ya existe")


def asignar_rol_usuario(username, nombre_rol):
    """
    Asignar un rol a un usuario específico.
    """
    try:
        user = User.objects.get(username=username)
        grupo = Group.objects.get(name=nombre_rol)
        user.groups.add(grupo)
        print(f"✅ Rol '{nombre_rol}' asignado a '{username}'")
    except User.DoesNotExist:
        print(f"❌ Usuario '{username}' no encontrado")
    except Group.DoesNotExist:
        print(f"❌ Rol '{nombre_rol}' no encontrado")
