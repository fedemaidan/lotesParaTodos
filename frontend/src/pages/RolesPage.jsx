import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  Snackbar,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';
import { 
  getRoles, 
  crearRol, 
  eliminarRol, 
  crearRolesIniciales,
  getInfoRoles,
  actualizarPermisosRol
} from '../services/userService';

// Íconos por rol
const getIconForRol = (rolNombre) => {
  switch (rolNombre) {
    case 'Administrador':
      return <AdminIcon />;
    case 'Moderador':
      return <SupervisorIcon />;
    case 'Usuario':
      return <PersonIcon />;
    case 'Invitado':
      return <GroupIcon />;
    default:
      return <SecurityIcon />;
  }
};

// Colores por rol
const getColorForRol = (rolNombre) => {
  switch (rolNombre) {
    case 'Administrador':
      return 'error';
    case 'Moderador':
      return 'warning';
    case 'Usuario':
      return 'info';
    case 'Invitado':
      return 'default';
    default:
      return 'primary';
  }
};

// Roles protegidos del sistema
const ROLES_PROTEGIDOS = ['Administrador', 'Moderador', 'Usuario', 'Invitado'];

// Permisos del sistema para LoteParaTodos
const PERMISOS_SISTEMA = [
  { codename: 'ver_dashboard', nombre: 'Ver Dashboard', categoria: 'Dashboard' },
  { codename: 'ver_clientes', nombre: 'Ver Clientes', categoria: 'Clientes' },
  { codename: 'editar_clientes', nombre: 'Editar Clientes', categoria: 'Clientes' },
  { codename: 'ver_emprendimientos', nombre: 'Ver Emprendimientos', categoria: 'Emprendimientos' },
  { codename: 'editar_emprendimientos', nombre: 'Editar Emprendimientos', categoria: 'Emprendimientos' },
  { codename: 'ver_ventas', nombre: 'Ver Ventas', categoria: 'Ventas' },
  { codename: 'crear_ventas', nombre: 'Crear Ventas', categoria: 'Ventas' },
  { codename: 'ver_tesoreria', nombre: 'Ver Tesorería', categoria: 'Tesorería' },
  { codename: 'gestionar_tesoreria', nombre: 'Gestionar Tesorería', categoria: 'Tesorería' },
  { codename: 'ver_usuarios', nombre: 'Ver Usuarios', categoria: 'Usuarios' },
  { codename: 'gestionar_usuarios', nombre: 'Gestionar Usuarios', categoria: 'Usuarios' },
  { codename: 'ver_configuracion', nombre: 'Ver Configuración', categoria: 'Configuración' },
  { codename: 'editar_configuracion', nombre: 'Editar Configuración', categoria: 'Configuración' },
];

// Agrupar permisos por categoría
const agruparPermisos = (permisos) => {
  return permisos.reduce((acc, permiso) => {
    if (!acc[permiso.categoria]) {
      acc[permiso.categoria] = [];
    }
    acc[permiso.categoria].push(permiso);
    return acc;
  }, {});
};

const PERMISOS_AGRUPADOS = agruparPermisos(PERMISOS_SISTEMA);

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [rolesInfo, setRolesInfo] = useState({});
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal nuevo rol
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // Permisos del rol seleccionado
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);
  const [permisosModificados, setPermisosModificados] = useState(false);

  // Snackbar para mensajes
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar permisos cuando cambia el rol seleccionado
  useEffect(() => {
    if (rolSeleccionado) {
      // Cargar los permisos del rol
      setPermisosSeleccionados(rolSeleccionado.permisos || []);
      setPermisosModificados(false);
    }
  }, [rolSeleccionado]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, infoData] = await Promise.all([
        getRoles(),
        getInfoRoles()
      ]);
      
      const rolesConInfo = rolesData.roles || [];
      setRoles(rolesConInfo);
      setRolesInfo(infoData.roles_del_sistema || {});
      
      if (rolesConInfo.length > 0 && !rolSeleccionado) {
        setRolSeleccionado(rolesConInfo[0]);
      }
    } catch (err) {
      console.error('Error cargando roles:', err);
      setError('Error al cargar los roles. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Crear roles iniciales del sistema
  const handleCrearRolesIniciales = async () => {
    try {
      await crearRolesIniciales();
      setSnackbar({ open: true, message: 'Roles del sistema creados correctamente', severity: 'success' });
      cargarDatos();
    } catch (err) {
      console.error('Error creando roles:', err);
      setSnackbar({ open: true, message: 'Error al crear los roles del sistema', severity: 'error' });
    }
  };

  // Seleccionar un rol
  const handleSeleccionarRol = (rol) => {
    setRolSeleccionado(rol);
  };

  // Abrir modal nuevo rol
  const handleNuevoRol = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setModalAbierto(true);
  };

  // Guardar nuevo rol
  const handleGuardarRol = async () => {
    if (!formData.nombre.trim()) {
      setSnackbar({ open: true, message: 'El nombre del rol es requerido', severity: 'error' });
      return;
    }

    setGuardando(true);
    try {
      await crearRol({
        nombre: formData.nombre,
        descripcion: formData.descripcion
      });
      
      setSnackbar({ open: true, message: 'Rol creado correctamente', severity: 'success' });
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      console.error('Error creando rol:', err);
      const errorMsg = err.response?.data?.nombre?.[0] || err.response?.data?.error || 'Error al crear el rol';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar rol
  const handleEliminarRol = async (rol) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombre)) {
      setSnackbar({ open: true, message: 'No se pueden eliminar los roles del sistema', severity: 'warning' });
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) {
      try {
        await eliminarRol(rol.id);
        setSnackbar({ open: true, message: 'Rol eliminado correctamente', severity: 'success' });
        
        if (rolSeleccionado?.id === rol.id) {
          setRolSeleccionado(null);
        }
        cargarDatos();
      } catch (err) {
        console.error('Error eliminando rol:', err);
        const errorMsg = err.response?.data?.error || 'Error al eliminar el rol';
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      }
    }
  };

  // Manejar cambio de permiso
  const handleTogglePermiso = (codename) => {
    setPermisosSeleccionados(prev => {
      if (prev.includes(codename)) {
        return prev.filter(p => p !== codename);
      } else {
        return [...prev, codename];
      }
    });
    setPermisosModificados(true);
  };

  // Guardar permisos del rol
  const handleGuardarPermisos = async () => {
    if (!rolSeleccionado) return;
    
    setGuardandoPermisos(true);
    try {
      await actualizarPermisosRol(rolSeleccionado.id, permisosSeleccionados);
      setSnackbar({ open: true, message: 'Permisos actualizados correctamente', severity: 'success' });
      setPermisosModificados(false);
      cargarDatos();
    } catch (err) {
      console.error('Error guardando permisos:', err);
      const errorMsg = err.response?.data?.error || 'Error al guardar los permisos';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setGuardandoPermisos(false);
    }
  };

  // Verificar si es rol de Administrador (no editable)
  const esRolAdministrador = rolSeleccionado?.nombre === 'Administrador';

  if (loading) {
    return (
      <LoteParaTodosLayout currentModule="roles" pageTitle="Gestión de Roles">
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        </Container>
      </LoteParaTodosLayout>
    );
  }

  return (
    <LoteParaTodosLayout currentModule="roles" pageTitle="Gestión de Roles">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Roles y Permisos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona los roles del sistema y sus permisos asociados
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarDatos}
              >
                Actualizar
              </Button>
              {roles.length === 0 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCrearRolesIniciales}
                >
                  Crear Roles Iniciales
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNuevoRol}
              >
                Nuevo Rol
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            Los roles del sistema (Administrador, Moderador, Usuario, Invitado) no pueden ser eliminados. 
            Puedes crear roles personalizados adicionales.
          </Alert>
        </Box>

        <Grid container spacing={3}>
          {/* Lista de roles */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Roles Disponibles
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {roles.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary" gutterBottom>
                      No hay roles configurados
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCrearRolesIniciales}
                    >
                      Crear Roles del Sistema
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {roles.map((rol) => (
                      <ListItem
                        key={rol.id}
                        disablePadding
                        secondaryAction={
                          !ROLES_PROTEGIDOS.includes(rol.nombre) && (
                            <Tooltip title="Eliminar rol">
                              <IconButton 
                                edge="end" 
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEliminarRol(rol);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                      >
                        <ListItemButton
                          selected={rolSeleccionado?.id === rol.id}
                          onClick={() => handleSeleccionarRol(rol)}
                        >
                          <ListItemIcon>
                            {getIconForRol(rol.nombre)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={rol.nombre}
                            secondary={`${rol.usuarios_count} usuario(s)`}
                          />
                          {ROLES_PROTEGIDOS.includes(rol.nombre) && (
                            <Chip 
                              label="Sistema" 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Detalles del rol seleccionado */}
          <Grid item xs={12} md={8}>
            {rolSeleccionado ? (
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: `${getColorForRol(rolSeleccionado.nombre)}.light`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getIconForRol(rolSeleccionado.nombre)}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {rolSeleccionado.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rolesInfo[rolSeleccionado.nombre]?.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip 
                        label={`${rolSeleccionado.usuarios_count} usuarios`}
                        color={getColorForRol(rolSeleccionado.nombre)}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 3 }} />

                  {/* Información del rol */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Información del Rol
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            ID del Rol
                          </Typography>
                          <Typography variant="body1">
                            {rolSeleccionado.id}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">
                            Tipo
                          </Typography>
                          <Typography variant="body1">
                            {ROLES_PROTEGIDOS.includes(rolSeleccionado.nombre) ? 'Rol del Sistema' : 'Rol Personalizado'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Descripción de Permisos
                          </Typography>
                          <Typography variant="body1">
                            {rolesInfo[rolSeleccionado.nombre]?.permisos || 'Sin descripción de permisos'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>

                  {/* Gestión de Permisos */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Permisos del Rol
                      </Typography>
                      {!esRolAdministrador && permisosModificados && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={guardandoPermisos ? <CircularProgress size={16} /> : <SaveIcon />}
                          onClick={handleGuardarPermisos}
                          disabled={guardandoPermisos}
                        >
                          Guardar Cambios
                        </Button>
                      )}
                    </Stack>

                    {esRolAdministrador ? (
                      <Alert severity="info" icon={<LockIcon />}>
                        El rol Administrador tiene acceso completo al sistema y sus permisos no pueden ser modificados.
                      </Alert>
                    ) : (
                      <Box>
                        {Object.entries(PERMISOS_AGRUPADOS).map(([categoria, permisos]) => (
                          <Accordion key={categoria} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography fontWeight="medium">{categoria}</Typography>
                              <Chip 
                                label={`${permisos.filter(p => permisosSeleccionados.includes(p.codename)).length}/${permisos.length}`}
                                size="small"
                                sx={{ ml: 2 }}
                                color={permisos.some(p => permisosSeleccionados.includes(p.codename)) ? 'primary' : 'default'}
                              />
                            </AccordionSummary>
                            <AccordionDetails>
                              <FormGroup>
                                <Grid container spacing={1}>
                                  {permisos.map((permiso) => (
                                    <Grid item xs={12} sm={6} key={permiso.codename}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={permisosSeleccionados.includes(permiso.codename)}
                                            onChange={() => handleTogglePermiso(permiso.codename)}
                                            size="small"
                                          />
                                        }
                                        label={
                                          <Typography variant="body2">
                                            {permiso.nombre}
                                          </Typography>
                                        }
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </FormGroup>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                        
                        {permisosModificados && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <SecurityIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Selecciona un rol para ver sus detalles
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Modal Nuevo Rol */}
        <Dialog 
          open={modalAbierto} 
          onClose={() => !guardando && setModalAbierto(false)}
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Nuevo Rol</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Nombre del Rol *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Contador, Supervisor de Ventas..."
              />
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                multiline
                rows={3}
                placeholder="Descripción del rol y sus responsabilidades..."
              />
              <Alert severity="info">
                Los permisos específicos del rol se pueden configurar posteriormente en el panel de administración de Django.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGuardarRol}
              disabled={guardando}
              startIcon={guardando ? <CircularProgress size={20} /> : null}
            >
              {guardando ? 'Creando...' : 'Crear Rol'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para mensajes */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LoteParaTodosLayout>
  );
};

export default RolesPage;
