"""
ViewSets para Items con sistema de permisos basado en roles.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Item
from .serializers import ItemSerializer, ItemCreateSerializer, ItemListSerializer
from accounts.permissions import RoleBasedPermission, IsOwnerOrReadOnly


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Items con permisos basados en roles.
    
    Roles y permisos:
    - Administrador: CRUD completo en todos los items
    - Moderador: CRUD completo en todos los items
    - Usuario: CRUD solo en sus propios items
    - Invitado: Solo lectura
    """
    
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    
    # Configuración de filtros y búsqueda
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'fecha_creacion', 'fecha_actualizacion']
    ordering = ['-fecha_creacion']
    
    def get_queryset(self):
        """
        Filtrar items según el rol del usuario.
        """
        user = self.request.user
        
        # Administradores y moderadores ven todos los items
        if user.groups.filter(name__in=['Administrador', 'Moderador']).exists():
            return Item.objects.all()
        
        # Usuarios normales solo ven sus items
        return Item.objects.filter(propietario=user)
    
    def get_serializer_class(self):
        """
        Serializer según la acción.
        """
        if self.action == 'list':
            return ItemListSerializer
        elif self.action == 'create':
            return ItemCreateSerializer
        return ItemSerializer
    
    def get_permissions(self):
        """
        Permisos dinámicos según la acción.
        """
        if self.action in ['list', 'retrieve']:
            # Para lectura, usar permisos de propietario + rol
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        
        # Para el resto de acciones, usar permisos basados en roles
        return [IsAuthenticated(), RoleBasedPermission()]
    
    def perform_create(self, serializer):
        """
        Asignar propietario automáticamente.
        """
        serializer.save(propietario=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """
        Lista personalizada con información de rol.
        """
        response = super().list(request, *args, **kwargs)
        
        user_role = 'Sin rol'
        if request.user.groups.exists():
            user_role = request.user.groups.first().name
        
        response.data = {
            'message': f'Items visibles para {request.user.username} ({user_role})',
            'total': self.get_queryset().count(),
            'rol_usuario': user_role,
            'results': response.data
        }
        
        return response
    
    def create(self, request, *args, **kwargs):
        """
        Creación con validación de permisos.
        """
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            response.data = {
                'message': 'Item creado exitosamente',
                'item': response.data,
                'propietario': request.user.username
            }
        
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """
        Detalle con información de permisos.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Verificar permisos del usuario sobre este item
        puede_editar = (
            instance.propietario == request.user or
            request.user.groups.filter(name__in=['Administrador', 'Moderador']).exists()
        )
        
        return Response({
            'item': serializer.data,
            'permisos': {
                'puede_editar': puede_editar,
                'es_propietario': instance.propietario == request.user,
                'rol_usuario': request.user.groups.first().name if request.user.groups.exists() else 'Sin rol'
            }
        })
    
    def update(self, request, *args, **kwargs):
        """
        Actualización con log de cambios.
        """
        instance = self.get_object()
        old_name = instance.nombre
        
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            response.data = {
                'message': f'Item actualizado: "{old_name}" → "{instance.nombre}"',
                'item': response.data,
                'actualizado_por': request.user.username
            }
        
        return response
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminación con confirmación.
        """
        instance = self.get_object()
        item_name = instance.nombre
        propietario = instance.propietario.username
        
        super().destroy(request, *args, **kwargs)
        
        return Response({
            'message': f'Item "{item_name}" eliminado',
            'propietario_original': propietario,
            'eliminado_por': request.user.username
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def mis_items(self, request):
        """
        Items del usuario autenticado.
        """
        items_usuario = Item.objects.filter(propietario=request.user, activo=True)
        serializer = ItemListSerializer(items_usuario, many=True)
        
        return Response({
            'message': f'Items activos de {request.user.username}',
            'total': items_usuario.count(),
            'items': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def toggle_activo(self, request, pk=None):
        """
        Cambiar estado activo (moderadores y admin).
        """
        item = self.get_object()
        
        item.activo = not item.activo
        item.save()
        
        estado = "activado" if item.activo else "desactivado"
        
        return Response({
            'message': f'Item "{item.nombre}" {estado}',
            'item': ItemSerializer(item).data,
            'cambiado_por': request.user.username
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Estadísticas según el rol del usuario.
        """
        user = request.user
        
        if user.groups.filter(name__in=['Administrador', 'Moderador']).exists():
            # Estadísticas globales
            queryset = Item.objects.all()
            scope = "sistema completo"
        else:
            # Estadísticas personales
            queryset = Item.objects.filter(propietario=user)
            scope = f"usuario {user.username}"
        
        stats = {
            'total_items': queryset.count(),
            'items_activos': queryset.filter(activo=True).count(),
            'items_inactivos': queryset.filter(activo=False).count(),
            'items_con_descripcion': queryset.exclude(
                Q(descripcion__isnull=True) | Q(descripcion='')
            ).count(),
        }
        
        return Response({
            'estadisticas': stats,
            'alcance': scope,
            'rol_usuario': user.groups.first().name if user.groups.exists() else 'Sin rol'
        })
    
    @action(detail=False, methods=['get'])
    def todos_los_items(self, request):
        """
        Ver todos los items del sistema (solo admin/moderador).
        """
        if not request.user.groups.filter(name__in=['Administrador', 'Moderador']).exists():
            return Response({
                'error': 'No tienes permisos para ver todos los items'
            }, status=status.HTTP_403_FORBIDDEN)
        
        all_items = Item.objects.all()
        serializer = ItemListSerializer(all_items, many=True)
        
        return Response({
            'message': 'Todos los items del sistema',
            'total': all_items.count(),
            'items': serializer.data,
            'accedido_por': f"{request.user.username} ({request.user.groups.first().name})"
        })