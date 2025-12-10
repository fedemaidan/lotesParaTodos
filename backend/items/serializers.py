"""
Serializers modernos para Items usando todas las características de DRF.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    """
    Serializer completo para Items con validaciones avanzadas.
    Incluye campos de solo lectura y validaciones personalizadas.
    """
    
    # Campos de solo lectura (automáticos)
    propietario = serializers.StringRelatedField(read_only=True)
    propietario_id = serializers.IntegerField(read_only=True)
    fecha_creacion = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    fecha_actualizacion = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    dias_desde_creacion = serializers.ReadOnlyField()
    
    # URL del objeto (automática con ViewSets)
    url = serializers.HyperlinkedIdentityField(view_name='item-detail')
    
    class Meta:
        model = Item
        fields = [
            'id',
            'url',
            'nombre',
            'descripcion',
            'propietario',
            'propietario_id',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion',
            'dias_desde_creacion',
        ]
        
        # Campos adicionales de solo lectura
        read_only_fields = [
            'id',
            'propietario',
            'propietario_id', 
            'fecha_creacion',
            'fecha_actualizacion',
            'dias_desde_creacion',
        ]
    
    def validate_nombre(self, value):
        """
        Validación personalizada para el nombre.
        """
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 3 caracteres."
            )
        
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        
        return value.strip().title()  # Capitalizar automáticamente
    
    def validate_descripcion(self, value):
        """
        Validación para descripción.
        """
        if value and len(value.strip()) > 1000:
            raise serializers.ValidationError(
                "La descripción no puede exceder 1000 caracteres."
            )
        
        return value.strip() if value else value
    
    def create(self, validated_data):
        """
        Crear item asignando automáticamente el propietario.
        """
        # El propietario se asigna automáticamente en el ViewSet
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """
        Personalizar la representación del objeto en JSON.
        """
        data = super().to_representation(instance)
        
        # Agregar información adicional
        data['resumen'] = f"{instance.nombre[:50]}..." if len(instance.nombre) > 50 else instance.nombre
        data['tiene_descripcion'] = bool(instance.descripcion)
        
        return data


class ItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para creación de Items.
    Solo incluye los campos que el usuario puede proporcionar.
    """
    
    class Meta:
        model = Item
        fields = ['nombre', 'descripcion', 'activo']
        
        extra_kwargs = {
            'nombre': {
                'help_text': 'Nombre del item (3-200 caracteres)',
                'min_length': 3,
                'max_length': 200,
            },
            'descripcion': {
                'help_text': 'Descripción del item (opcional, máx 1000 caracteres)',
                'max_length': 1000,
                'required': False,
                'allow_blank': True,
            },
            'activo': {
                'help_text': 'Estado del item (activo/inactivo)',
                'default': True,
            }
        }


class ItemListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listar items (menos campos).
    Usado en las vistas de lista para mejorar performance.
    """
    
    propietario = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id',
            'nombre', 
            'propietario',
            'activo',
            'fecha_creacion'
        ]
        read_only_fields = ['id', 'propietario', 'fecha_creacion']