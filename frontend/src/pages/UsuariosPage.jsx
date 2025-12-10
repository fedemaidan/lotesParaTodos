import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  AccountCircle as UserIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';
import { 
  getUsuarios, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario,
  asignarRol,
  quitarRol,
  getRoles 
} from '../services/userService';
import { mockEmprendimientos } from '../data/mockEmprendimientos';
import { mockLotes } from '../data/mockLotes';

// Función para obtener iniciales
const getInitials = (nombre, apellido) => {
  const n = nombre?.charAt(0)?.toUpperCase() || '';
  const a = apellido?.charAt(0)?.toUpperCase() || '';
  return n + a || '?';
};

// Función para obtener el color del chip según el rol
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
      return 'default';
  }
};

// Función para obtener el ícono según el rol
const getIconForRol = (rolNombre) => {
  switch (rolNombre) {
    case 'Administrador':
      return <AdminIcon fontSize="small" />;
    case 'Moderador':
      return <SupervisorIcon fontSize="small" />;
    default:
      return <UserIcon fontSize="small" />;
  }
};

const UsuariosPage = () => {
  // Estado de datos
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado de paginación y filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Modal de usuario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    rol: '',
    is_active: true,
    emprendimientos_asignados: [],
    lotes_asignados: []
  });

  // Snackbar para mensajes
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usuariosData, rolesData] = await Promise.all([
        getUsuarios(),
        getRoles()
      ]);
      setUsuarios(usuariosData.usuarios || []);
      setRoles(rolesData.roles || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const nombreCompleto = `${usuario.first_name || ''} ${usuario.last_name || ''}`.toLowerCase();
      const matchSearchTerm = !searchTerm || 
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRol = !filtroRol || usuario.roles?.includes(filtroRol);
      const matchEstado = !filtroEstado || 
        (filtroEstado === 'activo' && usuario.is_active) ||
        (filtroEstado === 'inactivo' && !usuario.is_active);

      return matchSearchTerm && matchRol && matchEstado;
    });
  }, [usuarios, searchTerm, filtroRol, filtroEstado]);

  // Obtener lotes por emprendimiento
  const getLotesByEmprendimiento = (emprendimientoId) => {
    return mockLotes.filter(l => l.emprendimiento_id === emprendimientoId);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroRol('');
    setFiltroEstado('');
    setPage(0);
  };

  // Abrir modal nuevo usuario
  const handleNuevoUsuario = () => {
    setUsuarioEditando(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      rol: '',
      is_active: true,
      emprendimientos_asignados: [],
      lotes_asignados: []
    });
    setModalAbierto(true);
  };

  // Abrir modal editar usuario
  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      username: usuario.username || '',
      email: usuario.email || '',
      password: '',
      password_confirm: '',
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      rol: usuario.roles?.[0] || '',
      is_active: usuario.is_active,
      emprendimientos_asignados: usuario.emprendimientos_asignados || [],
      lotes_asignados: usuario.lotes_asignados || []
    });
    setModalAbierto(true);
  };

  // Guardar usuario
  const handleGuardarUsuario = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      setSnackbar({ open: true, message: 'Username y email son requeridos', severity: 'error' });
      return;
    }

    if (!usuarioEditando && (!formData.password || formData.password !== formData.password_confirm)) {
      setSnackbar({ open: true, message: 'Las contraseñas no coinciden o están vacías', severity: 'error' });
      return;
    }

    setGuardando(true);
    try {
      if (usuarioEditando) {
        // Editar existente
        const updateData = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_active: formData.is_active
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await actualizarUsuario(usuarioEditando.id, updateData);
        
        // Manejar cambio de rol
        const rolActual = usuarioEditando.roles?.[0];
        if (formData.rol !== rolActual) {
          if (rolActual) {
            await quitarRol(usuarioEditando.id, rolActual);
          }
          if (formData.rol) {
            await asignarRol(usuarioEditando.id, formData.rol);
          }
        }
        
        setSnackbar({ open: true, message: 'Usuario actualizado correctamente', severity: 'success' });
      } else {
        // Nuevo usuario
        await crearUsuario({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          first_name: formData.first_name,
          last_name: formData.last_name,
          rol: formData.rol
        });
        
        setSnackbar({ open: true, message: 'Usuario creado correctamente', severity: 'success' });
      }
      
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      console.error('Error guardando usuario:', err);
      let errorMsg = 'Error al guardar el usuario';
      if (err.response?.status === 403) {
        errorMsg = 'No tienes permisos para gestionar usuarios. Necesitas el rol Administrador.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${usuario.username}"?`)) {
      try {
        await eliminarUsuario(usuario.id);
        setSnackbar({ open: true, message: 'Usuario eliminado correctamente', severity: 'success' });
        cargarDatos();
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        let errorMsg = 'Error al eliminar el usuario';
        if (err.response?.status === 403) {
          errorMsg = 'No tienes permisos para eliminar usuarios. Necesitas el rol Administrador.';
        } else if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        }
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      }
    }
  };

  // Toggle emprendimiento
  const handleToggleEmprendimiento = (empId) => {
    let nuevosEmprendimientos;
    if (formData.emprendimientos_asignados.includes(empId)) {
      nuevosEmprendimientos = formData.emprendimientos_asignados.filter(e => e !== empId);
      const lotesDelEmprendimiento = getLotesByEmprendimiento(empId).map(l => l.id);
      const nuevosLotes = formData.lotes_asignados.filter(l => !lotesDelEmprendimiento.includes(l));
      setFormData({ 
        ...formData, 
        emprendimientos_asignados: nuevosEmprendimientos,
        lotes_asignados: nuevosLotes
      });
    } else {
      nuevosEmprendimientos = [...formData.emprendimientos_asignados, empId];
      setFormData({ ...formData, emprendimientos_asignados: nuevosEmprendimientos });
    }
  };

  // Toggle lote
  const handleToggleLote = (loteId) => {
    let nuevosLotes;
    if (formData.lotes_asignados.includes(loteId)) {
      nuevosLotes = formData.lotes_asignados.filter(l => l !== loteId);
    } else {
      nuevosLotes = [...formData.lotes_asignados, loteId];
    }
    setFormData({ ...formData, lotes_asignados: nuevosLotes });
  };

  // Seleccionar todos los lotes de un emprendimiento
  const handleSeleccionarTodosLotes = (empId) => {
    const lotesDelEmprendimiento = getLotesByEmprendimiento(empId).map(l => l.id);
    const lotesActuales = formData.lotes_asignados.filter(l => !lotesDelEmprendimiento.includes(l));
    const todosSeleccionados = lotesDelEmprendimiento.every(l => formData.lotes_asignados.includes(l));
    
    if (todosSeleccionados) {
      setFormData({ ...formData, lotes_asignados: lotesActuales });
    } else {
      setFormData({ ...formData, lotes_asignados: [...lotesActuales, ...lotesDelEmprendimiento] });
    }
  };

  if (loading) {
    return (
      <LoteParaTodosLayout currentModule="usuarios" pageTitle="Gestión de Usuarios">
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        </Container>
      </LoteParaTodosLayout>
    );
  }

  return (
    <LoteParaTodosLayout currentModule="usuarios" pageTitle="Gestión de Usuarios">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Usuarios
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona los usuarios del sistema y sus permisos de acceso
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                onClick={handleNuevoUsuario}
              >
                Crear Usuario
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filtros */}
          <Card>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Buscar por nombre, username o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={filtroRol}
                      label="Rol"
                      onChange={(e) => setFiltroRol(e.target.value)}
                    >
                      <MenuItem value="">Todos los roles</MenuItem>
                      {roles.map((rol) => (
                        <MenuItem key={rol.id} value={rol.nombre}>
                          {rol.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filtroEstado}
                      label="Estado"
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    onClick={limpiarFiltros}
                    startIcon={<FilterIcon />}
                    fullWidth
                  >
                    Limpiar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Tabla de usuarios */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Roles</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosFiltrados
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((usuario) => (
                    <TableRow key={usuario.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getInitials(usuario.first_name, usuario.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {usuario.first_name} {usuario.last_name}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{usuario.username}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {usuario.roles?.length > 0 ? (
                            usuario.roles.map((rol, index) => (
                              <Chip
                                key={index}
                                label={rol}
                                size="small"
                                color={getColorForRol(rol)}
                                icon={getIconForRol(rol)}
                              />
                            ))
                          ) : (
                            <Chip label="Sin rol" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.is_active ? 'Activo' : 'Inactivo'}
                          color={usuario.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleEliminarUsuario(usuario)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {usuariosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No se encontraron usuarios
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={usuariosFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
          />
        </Paper>

        {/* Modal Crear/Editar Usuario */}
        <Dialog 
          open={modalAbierto} 
          onClose={() => !guardando && setModalAbierto(false)}
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Datos básicos */}
              <Typography variant="subtitle1" fontWeight="bold">
                Datos del Usuario
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username *"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={usuarioEditando !== null}
                    helperText={usuarioEditando ? "El username no se puede cambiar" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={usuarioEditando ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type="password"
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                    error={formData.password !== formData.password_confirm && formData.password_confirm !== ''}
                    helperText={formData.password !== formData.password_confirm && formData.password_confirm !== '' ? 'Las contraseñas no coinciden' : ''}
                  />
                </Grid>
              </Grid>

              <Divider />

              {/* Rol y Estado */}
              <Typography variant="subtitle1" fontWeight="bold">
                Rol y Estado
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={formData.rol}
                      label="Rol"
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    >
                      <MenuItem value="">Sin rol asignado</MenuItem>
                      {roles.map((rol) => (
                        <MenuItem key={rol.id} value={rol.nombre}>
                          {rol.nombre} ({rol.usuarios_count} usuarios)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                    }
                    label="Usuario activo"
                  />
                </Grid>
              </Grid>

              <Divider />

              {/* Emprendimientos y Lotes (mockeado por ahora) */}
              <Typography variant="subtitle1" fontWeight="bold">
                Acceso a Emprendimientos y Lotes
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta sección está mockeada por ahora. Los cambios se guardarán localmente pero no se sincronizarán con el servidor.
              </Alert>
              
              {mockEmprendimientos.slice(0, 5).map((emp) => {
                const lotesEmp = getLotesByEmprendimiento(emp.id);
                const lotesSeleccionados = lotesEmp.filter(l => formData.lotes_asignados.includes(l.id)).length;
                
                return (
                  <Accordion key={emp.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <FormControlLabel
                          onClick={(e) => e.stopPropagation()}
                          control={
                            <Checkbox
                              checked={formData.emprendimientos_asignados.includes(emp.id)}
                              onChange={() => handleToggleEmprendimiento(emp.id)}
                            />
                          }
                          label=""
                        />
                        <HomeIcon color="action" />
                        <Typography fontWeight="bold">{emp.nombre}</Typography>
                        <Chip 
                          size="small" 
                          label={`${lotesSeleccionados}/${lotesEmp.length} lotes`}
                          color={lotesSeleccionados > 0 ? 'primary' : 'default'}
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      {formData.emprendimientos_asignados.includes(emp.id) ? (
                        <Box>
                          <Button
                            size="small"
                            onClick={() => handleSeleccionarTodosLotes(emp.id)}
                            sx={{ mb: 1 }}
                          >
                            {lotesEmp.every(l => formData.lotes_asignados.includes(l.id))
                              ? 'Deseleccionar todos'
                              : 'Seleccionar todos'}
                          </Button>
                          <FormGroup row>
                            {lotesEmp.slice(0, 20).map((lote) => (
                              <FormControlLabel
                                key={lote.id}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={formData.lotes_asignados.includes(lote.id)}
                                    onChange={() => handleToggleLote(lote.id)}
                                  />
                                }
                                label={`Lote ${lote.numero}`}
                                sx={{ width: '150px' }}
                              />
                            ))}
                          </FormGroup>
                          {lotesEmp.length > 20 && (
                            <Typography variant="caption" color="text.secondary">
                              Mostrando 20 de {lotesEmp.length} lotes
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">
                          Activa el emprendimiento para ver los lotes disponibles
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGuardarUsuario}
              disabled={guardando}
              startIcon={guardando ? <CircularProgress size={20} /> : null}
            >
              {guardando ? 'Guardando...' : (usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario')}
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

export default UsuariosPage;
