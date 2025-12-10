from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    API para registrar un nuevo usuario.
    
    POST /api/auth/register/
    {
        "username": "mi_usuario",
        "email": "usuario@example.com",
        "password": "mi_contraseña_segura",
        "password_confirm": "mi_contraseña_segura",
        "first_name": "Nombre",
        "last_name": "Apellido"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        # Crear el usuario
        user = serializer.save()
        
        # Crear token de autenticación
        token, created = Token.objects.get_or_create(user=user)
        
        # Serializar datos del usuario para la respuesta
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Usuario registrado exitosamente',
            'user': user_data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    API para login de usuarios.
    
    POST /api/auth/login/
    {
        "username": "mi_usuario",
        "password": "mi_contraseña"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Hacer login del usuario
        login(request, user)
        
        # Obtener o crear token
        token, created = Token.objects.get_or_create(user=user)
        
        # Serializar datos del usuario
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Login exitoso',
            'user': user_data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response({
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    API para logout de usuarios.
    
    POST /api/auth/logout/
    Headers: Authorization: Token <tu_token_aqui>
    """
    try:
        # Eliminar el token del usuario
        request.user.auth_token.delete()
        
        # Hacer logout del usuario
        logout(request)
        
        return Response({
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Error durante el logout'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    API para obtener el perfil del usuario autenticado.
    
    GET /api/auth/profile/
    Headers: Authorization: Token <tu_token_aqui>
    """
    user_data = UserSerializer(request.user).data
    
    return Response({
        'user': user_data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_overview(request):
    """
    API para mostrar un resumen de todas las APIs disponibles.
    
    GET /api/auth/
    """
    api_urls = {
        'Registro': '/api/auth/register/',
        'Login': '/api/auth/login/',
        'Logout': '/api/auth/logout/',
        'Perfil': '/api/auth/profile/',
        'Resumen': '/api/auth/',
    }
    
    return Response({
        'message': 'API de Autenticación para lotesParaTodos',
        'endpoints': api_urls,
        'nota': 'Para endpoints protegidos, incluye el header: Authorization: Token <tu_token>'
    }, status=status.HTTP_200_OK)
