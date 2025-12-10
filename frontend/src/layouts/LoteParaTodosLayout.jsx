import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Configuración de módulos del menú con permisos requeridos
const menuModules = [
  {
    id: 'dashboard',
    label: 'DASHBOARD',
    icon: <DashboardIcon fontSize="small" />,
    path: '/',
    permiso: null, // Dashboard siempre visible
  },
  {
    id: 'clientes',
    label: 'CLIENTES',
    icon: <PeopleIcon fontSize="small" />,
    path: '/clientes',
    permiso: 'ver_clientes',
  },
  {
    id: 'emprendimientos',
    label: 'EMPRENDIMIENTOS',
    icon: <BusinessIcon fontSize="small" />,
    path: '/emprendimientos',
    permiso: 'ver_emprendimientos',
  },
  {
    id: 'ventas',
    label: 'VENTAS',
    icon: <AttachMoneyIcon fontSize="small" />,
    path: '/ventas',
    permiso: 'ver_ventas',
  },
  {
    id: 'tesoreria',
    label: 'TESORERÍA',
    icon: <AccountBalanceIcon fontSize="small" />,
    path: '/tesoreria',
    permiso: 'ver_tesoreria',
    hasSubmenu: true,
    submenu: [
      { label: 'Caja', path: '/tesoreria', permiso: 'ver_tesoreria' },
      { label: 'Cashflow', path: '/tesoreria/cashflow', permiso: 'ver_tesoreria' },
      { label: 'Conciliación', path: '/tesoreria/conciliacion', permiso: 'gestionar_tesoreria' },
    ],
  },
  {
    id: 'configuracion',
    label: 'CONFIGURACIÓN',
    icon: <SettingsIcon fontSize="small" />,
    path: '/configuracion',
    permiso: 'ver_configuracion',
    hasSubmenu: true,
    submenu: [
      { label: 'Usuarios', path: '/usuarios', permiso: 'ver_usuarios' },
      { label: 'Roles', path: '/roles', permiso: 'gestionar_usuarios' },
      { label: 'Plantillas', path: '/configuracion', permiso: 'ver_configuracion' },
    ],
  },
];

const LoteParaTodosLayout = ({ 
  children, 
  currentModule = 'dashboard', 
  pageTitle = 'Dashboard',
  pageDescription = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, tienePermiso } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [submenuAnchor, setSubmenuAnchor] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filtrar módulos según permisos del usuario
  const modulosVisibles = menuModules.filter(modulo => {
    // Si no tiene permiso definido, siempre visible
    if (!modulo.permiso) return true;
    return tienePermiso(modulo.permiso);
  });

  // Filtrar submenús según permisos
  const getSubmenuVisible = (submenu) => {
    if (!submenu) return [];
    return submenu.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSubmenuOpen = (event, moduleId) => {
    setSubmenuAnchor(event.currentTarget);
    setActiveSubmenu(moduleId);
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchor(null);
    setActiveSubmenu(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await signOut();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleSubmenuClose();
    setMobileOpen(false);
  };

  const currentModuleConfig = menuModules.find(m => m.id === currentModule) || menuModules[0];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header principal */}
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: '#1e3a5f',
          boxShadow: 2,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo y menú móvil */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <HomeIcon />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Lote Para Todos
              </Typography>
            </Box>

            {/* Menú de navegación - Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 2 }}>
              {modulosVisibles.map((module) => (
                <Box key={module.id}>
                  <Button
                    color="inherit"
                    startIcon={module.icon}
                    endIcon={module.hasSubmenu ? <ArrowDownIcon /> : null}
                    onClick={(e) => {
                      if (module.hasSubmenu) {
                        handleSubmenuOpen(e, module.id);
                      } else {
                        handleNavigation(module.path);
                      }
                    }}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: currentModule === module.id ? 'bold' : 'normal',
                      backgroundColor: currentModule === module.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {module.label}
                  </Button>
                  
                  {/* Submenu */}
                  {module.hasSubmenu && getSubmenuVisible(module.submenu).length > 0 && (
                    <Menu
                      anchorEl={submenuAnchor}
                      open={activeSubmenu === module.id}
                      onClose={handleSubmenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                      {getSubmenuVisible(module.submenu).map((item) => (
                        <MenuItem 
                          key={item.path} 
                          onClick={() => handleNavigation(item.path)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.username || 'Usuario'}
            </Typography>
            <IconButton onClick={handleUserMenuClick} size="small">
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: '#4CAF50',
                  fontSize: '0.875rem'
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 2, fontWeight: 'bold', color: '#1e3a5f' }}>
            Lote Para Todos
          </Typography>
          <List>
            {modulosVisibles.map((module) => (
              <ListItem key={module.id} disablePadding>
                <ListItemButton
                  selected={currentModule === module.id}
                  onClick={() => handleNavigation(module.path)}
                >
                  <ListItemIcon>{module.icon}</ListItemIcon>
                  <ListItemText primary={module.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Subheader con info del módulo */}
      <Box
        sx={{
          mt: 8,
          backgroundColor: '#f0f4f8',
          borderBottom: '1px solid #e0e0e0',
          py: 1.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={currentModuleConfig.icon}
            label={`Módulo: ${currentModuleConfig.label.split(' ')[0]}`}
            size="small"
            sx={{ 
              backgroundColor: '#1e3a5f', 
              color: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {pageDescription}
          </Typography>
        </Box>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {pageTitle}
        </Typography>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LoteParaTodosLayout;
