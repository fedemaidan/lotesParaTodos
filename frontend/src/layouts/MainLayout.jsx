import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  ArrowDropDown as ArrowDropDownIcon,
  MonetizationOn as SalesIcon,
  Assignment as AssignmentIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Logout as LogoutIcon,
  Landscape as LandscapeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const moduleConfig = {
  dashboard: {
    title: 'Dashboard',
    icon: BusinessIcon,
    path: '/',
    description: 'Resumen general y métricas principales'
  },
  clientes: {
    title: 'Clientes & Contratos',
    icon: PersonIcon,
    path: '/clientes',
    description: 'Gestión de clientes y prospectos'
  },
  ventas: {
    title: 'Ventas',
    icon: SalesIcon,
    path: '/ventas',
    description: 'Catálogo y gestión de reservas'
  },
  tesoreria: {
    title: 'Tesorería',
    icon: BankIcon,
    path: '/tesoreria',
    description: 'Cajas, bancos y movimientos'
  },
  configuracion: {
    title: 'Configuración',
    icon: SettingsIcon,
    path: '/configuracion',
    description: 'Configuración del sistema y administración'
  }
};

const MainLayout = ({ children, currentModule, pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const [configMenuAnchor, setConfigMenuAnchor] = useState(null);
  const [ventasMenuAnchor, setVentasMenuAnchor] = useState(null);
  const [tesoreriaMenuAnchor, setTesoreriaMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const getCurrentModule = () => {
    if (currentModule) return currentModule;
    
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/ventas')) return 'ventas';
    if (path.includes('/clientes') || path.includes('/contratos')) return 'clientes';
    if (path.includes('/tesoreria')) return 'tesoreria';
    if (path.includes('/emprendimientos')) return 'emprendimientos';
    if (path.includes('/usuarios') || path.includes('/configuracion')) return 'configuracion';
    return 'dashboard';
  };

  const handleConfigMenuOpen = (event) => setConfigMenuAnchor(event.currentTarget);
  const handleConfigMenuClose = () => setConfigMenuAnchor(null);
  const handleConfigMenuItemClick = (path) => { navigate(path); handleConfigMenuClose(); };

  const handleVentasMenuOpen = (event) => setVentasMenuAnchor(event.currentTarget);
  const handleVentasMenuClose = () => setVentasMenuAnchor(null);
  const handleVentasMenuItemClick = (path) => { navigate(path); handleVentasMenuClose(); };

  const handleTesoreriaMenuOpen = (event) => setTesoreriaMenuAnchor(event.currentTarget);
  const handleTesoreriaMenuClose = () => setTesoreriaMenuAnchor(null);
  const handleTesoreriaMenuItemClick = (path) => { navigate(path); handleTesoreriaMenuClose(); };

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogout = async () => { handleUserMenuClose(); await signOut(); navigate('/login'); };

  const activeModule = getCurrentModule();
  const ActiveIcon = moduleConfig[activeModule]?.icon || BusinessIcon;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header/Navigation */}
      <AppBar 
        position="static" 
        elevation={2}
        sx={{ 
          background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 50%, #1e88e5 100%)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <BusinessIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h6" sx={{ mr: 4, fontWeight: 600 }}>
              Lote Para Todos
            </Typography>
            
            {/* Module Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {/* Dashboard */}
              <Button
                component={Link}
                to="/"
                variant={activeModule === 'dashboard' ? "contained" : "text"}
                startIcon={<BusinessIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: activeModule === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Dashboard
              </Button>

              {/* Clientes */}
              <Button
                component={Link}
                to="/clientes"
                variant={activeModule === 'clientes' ? "contained" : "text"}
                startIcon={<PersonIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: activeModule === 'clientes' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Clientes & Contratos
              </Button>

              {/* Ventas Dropdown */}
              <Button
                onClick={handleVentasMenuOpen}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<SalesIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: activeModule === 'ventas' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Ventas
              </Button>

              {/* Tesorería Dropdown */}
              <Button
                onClick={handleTesoreriaMenuOpen}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<BankIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: activeModule === 'tesoreria' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Tesorería
              </Button>

              {/* Configuración Dropdown */}
              <Button
                onClick={handleConfigMenuOpen}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<SettingsIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: activeModule === 'configuracion' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Configuración
              </Button>
            </Box>
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', display: { xs: 'none', sm: 'block' } }}>
              {user?.username || 'Usuario'}
            </Typography>
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Module Info Bar */}
      <Box sx={{ backgroundColor: '#f5f5f5', py: 1, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<ActiveIcon />}
                label={`Módulo: ${moduleConfig[activeModule]?.title || 'Lote Para Todos'}`}
                variant="filled"
                color="primary"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {moduleConfig[activeModule]?.description || 'Sistema de gestión inmobiliaria'}
              </Typography>
            </Box>
            {pageTitle && (
              <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
                {pageTitle}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3, backgroundColor: '#fafafa' }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 2, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Lote Para Todos - Sistema de Gestión Inmobiliaria
          </Typography>
        </Container>
      </Box>

      {/* User Menu */}
      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu de Ventas */}
      <Menu
        anchorEl={ventasMenuAnchor}
        open={Boolean(ventasMenuAnchor)}
        onClose={handleVentasMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', mt: 1 } }}
      >
        <MenuItem onClick={() => handleVentasMenuItemClick('/ventas')} sx={{ py: 1.5 }}>
          <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Catálogo de Lotes</Typography>
            <Typography variant="caption" color="text.secondary">Ver disponibilidad y precios</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleVentasMenuItemClick('/ventas/contratos')} sx={{ py: 1.5 }}>
          <ListItemIcon><SalesIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Gestión de Reservas</Typography>
            <Typography variant="caption" color="text.secondary">Administrar señas y contratos</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu de Tesorería */}
      <Menu
        anchorEl={tesoreriaMenuAnchor}
        open={Boolean(tesoreriaMenuAnchor)}
        onClose={handleTesoreriaMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 240, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', mt: 1 } }}
      >
        <MenuItem onClick={() => handleTesoreriaMenuItemClick('/tesoreria')} sx={{ py: 1.5 }}>
          <ListItemIcon><BankIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Cajas y Bancos</Typography>
            <Typography variant="caption" color="text.secondary">Saldos y movimientos generales</Typography>
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleTesoreriaMenuItemClick('/tesoreria/conciliacion')} sx={{ py: 1.5 }}>
          <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Conciliación Bancaria</Typography>
            <Typography variant="caption" color="text.secondary">Control de extractos</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleTesoreriaMenuItemClick('/tesoreria/cashflow')} sx={{ py: 1.5 }}>
          <ListItemIcon><TrendingUpIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Proyecciones & Cash Flow</Typography>
            <Typography variant="caption" color="text.secondary">Flujo de fondos futuro</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu de Configuración */}
      <Menu
        anchorEl={configMenuAnchor}
        open={Boolean(configMenuAnchor)}
        onClose={handleConfigMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', mt: 1 } }}
      >
        <MenuItem onClick={() => handleConfigMenuItemClick('/usuarios')} sx={{ py: 1.5 }}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Usuarios</Typography>
            <Typography variant="caption" color="text.secondary">Gestión de usuarios del sistema</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleConfigMenuItemClick('/roles')} sx={{ py: 1.5 }}>
          <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Roles y Permisos</Typography>
            <Typography variant="caption" color="text.secondary">Configuración de accesos</Typography>
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleConfigMenuItemClick('/configuracion')} sx={{ py: 1.5 }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Configuración del Sistema</Typography>
            <Typography variant="caption" color="text.secondary">Plantillas y parámetros generales</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;
