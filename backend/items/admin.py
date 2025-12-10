from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para Items.
    """
    
    # Campos a mostrar en la lista
    list_display = [
        'nombre', 
        'propietario', 
        'activo', 
        'fecha_creacion',
        'dias_desde_creacion'
    ]
    
    # Campos por los que se puede filtrar
    list_filter = [
        'activo', 
        'fecha_creacion',
        'propietario'
    ]
    
    # Campos de búsqueda
    search_fields = [
        'nombre', 
        'descripcion',
        'propietario__username'
    ]
    
    # Campos de solo lectura
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion', 
        'dias_desde_creacion'
    ]
    
    # Organización de campos en el formulario
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'activo')
        }),
        ('Propietario', {
            'fields': ('propietario',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion', 'dias_desde_creacion'),
            'classes': ('collapse',)  # Sección plegable
        })
    )
    
    # Acciones masivas personalizadas
    actions = ['marcar_como_activo', 'marcar_como_inactivo']
    
    def marcar_como_activo(self, request, queryset):
        """Acción para activar múltiples items."""
        updated = queryset.update(activo=True)
        self.message_user(request, f'{updated} items marcados como activos.')
    marcar_como_activo.short_description = "Marcar como activo"
    
    def marcar_como_inactivo(self, request, queryset):
        """Acción para desactivar múltiples items."""
        updated = queryset.update(activo=False)
        self.message_user(request, f'{updated} items marcados como inactivos.')
    marcar_como_inactivo.short_description = "Marcar como inactivo"
