from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Item(models.Model):
    """
    Modelo para representar items/productos en el sistema.
    Cada item tiene un propietario (usuario) y timestamps automáticos.
    """
    
    # Campos principales
    nombre = models.CharField(
        max_length=200,
        help_text="Nombre del item (máximo 200 caracteres)"
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada del item (opcional)"
    )
    
    # Relación con usuario - cada item tiene un propietario
    propietario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Usuario propietario del item"
    )
    
    # Timestamps automáticos
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación del item"
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última actualización"
    )
    
    # Estado del item
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el item está activo o deshabilitado"
    )
    
    class Meta:
        # Configuración de la tabla en la base de datos
        verbose_name = "Item"
        verbose_name_plural = "Items"
        ordering = ['-fecha_creacion']  # Más nuevos primero
        
        # Índices para optimizar consultas
        indexes = [
            models.Index(fields=['propietario', '-fecha_creacion']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        """Representación en string del objeto."""
        return f"{self.nombre} (por {self.propietario.username})"
    
    def save(self, *args, **kwargs):
        """
        Método personalizado de guardado.
        Puedes agregar validaciones o lógica adicional aquí.
        """
        # Ejemplo: capitalizar el nombre automáticamente
        self.nombre = self.nombre.strip().title()
        
        super().save(*args, **kwargs)
    
    @property
    def dias_desde_creacion(self):
        """Propiedad que calcula los días transcurridos desde la creación."""
        return (timezone.now() - self.fecha_creacion).days
