import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Container, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const ProtectedRoute = ({ children, permiso, permisos, requiereTodos = false }) => {
  const { isAuthenticated, isLoading, tienePermiso, tieneAlgunPermiso, tieneTodosLosPermisos } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos si se especificaron
  let tieneAcceso = true;
  
  if (permiso) {
    // Un solo permiso requerido
    tieneAcceso = tienePermiso(permiso);
  } else if (permisos && permisos.length > 0) {
    // Múltiples permisos
    if (requiereTodos) {
      tieneAcceso = tieneTodosLosPermisos(permisos);
    } else {
      tieneAcceso = tieneAlgunPermiso(permisos);
    }
  }

  if (!tieneAcceso) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="sm">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2 
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold" color="error">
              Acceso Denegado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No tienes permisos para acceder a esta sección.
              Contacta al administrador si crees que deberías tener acceso.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.history.back()}
              sx={{ mr: 2 }}
            >
              Volver
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/'}
            >
              Ir al Dashboard
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
