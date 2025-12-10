"""
Comando para inicializar el sistema de roles y permisos.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from accounts.models import UserProfile, crear_grupos_iniciales


class Command(BaseCommand):
    help = 'Inicializa el sistema de roles y permisos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--crear-admin',
            action='store_true',
            help='Crear usuario administrador por defecto',
        )
        
        parser.add_argument(
            '--admin-username',
            type=str,
            default='admin',
            help='Username del administrador (por defecto: admin)',
        )
        
        parser.add_argument(
            '--admin-password',
            type=str,
            default='admin123',
            help='Password del administrador (por defecto: admin123)',
        )
    
    def handle(self, *args, **options):
        self.stdout.write('🚀 Inicializando sistema de roles y permisos...\n')
        
        # 1. Crear grupos y permisos
        self.stdout.write('📋 Creando grupos iniciales...')
        crear_grupos_iniciales()
        
        # 2. Mostrar grupos creados
        grupos = Group.objects.all()
        self.stdout.write(f'✅ Grupos disponibles: {", ".join(g.name for g in grupos)}\n')
        
        # 3. Crear administrador si se solicita
        if options['crear_admin']:
            username = options['admin_username']
            password = options['admin_password']
            
            if User.objects.filter(username=username).exists():
                self.stdout.write(f'⚠️  Usuario "{username}" ya existe\n')
            else:
                admin = User.objects.create_superuser(
                    username=username,
                    email=f'{username}@admin.com',
                    password=password,
                    first_name='Administrador',
                    last_name='Sistema'
                )
                
                # Asignar rol de administrador
                grupo_admin = Group.objects.get(name='Administrador')
                admin.groups.add(grupo_admin)
                
                self.stdout.write(f'✅ Administrador "{username}" creado con contraseña "{password}"\n')
        
        # 4. Mostrar estadísticas
        self.mostrar_estadisticas()
        
        # 5. Mostrar comandos útiles
        self.mostrar_comandos_utiles()
    
    def mostrar_estadisticas(self):
        """Mostrar estadísticas del sistema."""
        total_usuarios = User.objects.count()
        total_grupos = Group.objects.count()
        total_permisos = Permission.objects.count()
        
        self.stdout.write('📊 ESTADÍSTICAS DEL SISTEMA:')
        self.stdout.write(f'   👥 Usuarios: {total_usuarios}')
        self.stdout.write(f'   🔰 Grupos (Roles): {total_grupos}')
        self.stdout.write(f'   🔐 Permisos: {total_permisos}')
        
        # Mostrar distribución por roles
        self.stdout.write('\n👥 USUARIOS POR ROL:')
        for grupo in Group.objects.all():
            count = grupo.user_set.count()
            self.stdout.write(f'   {grupo.name}: {count} usuarios')
        
        self.stdout.write('')
    
    def mostrar_comandos_utiles(self):
        """Mostrar comandos útiles para gestión."""
        self.stdout.write('🔧 COMANDOS ÚTILES:')
        self.stdout.write('   • Crear superusuario adicional:')
        self.stdout.write('     python manage.py createsuperuser\n')
        
        self.stdout.write('   • Inicializar con admin:')
        self.stdout.write('     python manage.py init_roles --crear-admin\n')
        
        self.stdout.write('   • Inicializar con admin personalizado:')
        self.stdout.write('     python manage.py init_roles --crear-admin --admin-username=miadmin --admin-password=mipass\n')
        
        self.stdout.write('   • Ver usuarios en shell:')
        self.stdout.write('     python manage.py shell')
        self.stdout.write('     >>> from django.contrib.auth.models import User, Group')
        self.stdout.write('     >>> User.objects.all()\n')
        
        self.stdout.write('🌐 PROBAR EN NAVEGADOR:')
        self.stdout.write('   • Panel admin: http://127.0.0.1:8001/admin/')
        self.stdout.write('   • API principal: http://127.0.0.1:8001/api/')
        self.stdout.write('   • API roles: http://127.0.0.1:8001/api/auth/info_roles/')
        
        self.stdout.write('\n✅ Sistema de roles inicializado correctamente!')