from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # URL principal que muestra información de la API
    path('', views.api_overview, name='api_overview'),
    
    # URLs de autenticación
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    
    # URL del perfil del usuario
    path('profile/', views.user_profile, name='profile'),
]