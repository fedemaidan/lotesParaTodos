from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from .models import UserProfile


class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información de grupos (roles).
    """
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil del usuario.
    """
    class Meta:
        model = UserProfile
        fields = ['telefono', 'direccion', 'fecha_nacimiento', 'activo']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de nuevos usuarios con perfil automático.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # Campos del perfil (opcionales)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    direccion = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'telefono', 'direccion')

    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs

    def create(self, validated_data):
        """
        Crear usuario con perfil automático.
        """
        # Separar datos del perfil
        profile_data = {
            'telefono': validated_data.pop('telefono', ''),
            'direccion': validated_data.pop('direccion', ''),
        }
        
        # Eliminar password_confirm
        validated_data.pop('password_confirm')
        
        # Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # El perfil se crea automáticamente por el signal
        # Solo actualizamos los campos adicionales
        if any(profile_data.values()):
            profile = user.profile
            for field, value in profile_data.items():
                setattr(profile, field, value)
            profile.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer para login de usuarios.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validar las credenciales del usuario.
        """
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Credenciales inválidas.')
            
            if not user.is_active:
                raise serializers.ValidationError('Esta cuenta está desactivada.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Debe proporcionar username y password.')


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer completo para mostrar información del usuario con roles y permisos.
    """
    # Información de roles y permisos
    roles = GroupSerializer(source='groups', many=True, read_only=True)
    permisos = serializers.SerializerMethodField()
    
    # Información del perfil
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'roles', 'permisos', 'profile'
        ]
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_superuser']
    
    def get_permisos(self, obj):
        """
        Obtener todos los permisos del usuario (directos + de grupos).
        """
        return list(obj.get_all_permissions())


class AsignarRolSerializer(serializers.Serializer):
    """
    Serializer para asignar roles a usuarios.
    """
    usuario_id = serializers.IntegerField()
    rol_nombre = serializers.CharField(max_length=150)
    
    def validate_usuario_id(self, value):
        """Validar que el usuario existe."""
        try:
            User.objects.get(id=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado.")
    
    def validate_rol_nombre(self, value):
        """Validar que el rol existe."""
        try:
            Group.objects.get(name=value)
            return value
        except Group.DoesNotExist:
            raise serializers.ValidationError("Rol no encontrado.")


class UsuarioConRolesSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listar usuarios con sus roles.
    """
    roles = serializers.StringRelatedField(source='groups', many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'roles', 'is_active']


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar usuarios existentes.
    """
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'password']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
        }
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class CrearRolSerializer(serializers.Serializer):
    """
    Serializer para crear nuevos roles.
    """
    nombre = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    
    def validate_nombre(self, value):
        if Group.objects.filter(name=value).exists():
            raise serializers.ValidationError("Ya existe un rol con ese nombre.")
        return value


class QuitarRolSerializer(serializers.Serializer):
    """
    Serializer para quitar roles a usuarios.
    """
    usuario_id = serializers.IntegerField()
    rol_nombre = serializers.CharField(max_length=150)