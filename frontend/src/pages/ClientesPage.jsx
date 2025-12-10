// src/pages/ClientesPage.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, 
  TableHead, TablePagination, TableRow, TextField, Typography, IconButton,
  InputAdornment, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip,
  Card, CardContent, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterAltOff as FilterAltOffIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';

// Importar datos mock
import { mockClientes } from '../data/mockClientes';
import { mockContratos } from '../data/mockContratos';
import { mockLotes } from '../data/mockLotes';
import { mockEmprendimientos } from '../data/mockEmprendimientos';

// Constantes de estado
const ESTADO_CONTRATO_COLORS = {
  'ACTIVO': 'success',
  'COMPLETADO': 'info',
  'FINALIZADO': 'info',
  'RESERVADO': 'warning',
  'RESERVA': 'warning',
  'MORA': 'error',
  'CAIDO': 'default',
  'CANCELADO': 'default',
  'PRE-RESERVA': 'secondary',
};

const ESTADO_LEGAL_COLORS = {
  'NORMAL': 'success',
  'EN_LEGALES': 'warning',
  'BLOQUEADO': 'error',
};

const ClientesPage = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [filters, setFilters] = useState({
    global: '',
    estado: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [menuCliente, setMenuCliente] = useState(null);

  // Cargar y procesar clientes
  useEffect(() => {
    const clientesProcesados = mockClientes.map(cliente => {
      // Buscar contratos del cliente
      const contratosCliente = mockContratos.filter(c => c.cliente_id === cliente.id);
      
      // Obtener lotes e información
      const lotesIds = contratosCliente.map(c => c.lote_id);
      const lotesInfo = lotesIds.map(id => {
        const lote = mockLotes.find(l => l.id === id);
        const emp = lote ? mockEmprendimientos.find(e => e.id === lote.emprendimiento_id) : null;
        return lote ? `${lote.manzana}-${lote.numero}` : null;
      }).filter(Boolean);

      // Emprendimientos
      const emprendimientosIds = [...new Set(contratosCliente.map(c => {
        const lote = mockLotes.find(l => l.id === c.lote_id);
        return lote?.emprendimiento_id;
      }).filter(Boolean))];
      
      const emprendimientoNombre = emprendimientosIds.length > 0 
        ? mockEmprendimientos.find(e => e.id === emprendimientosIds[0])?.nombre 
        : null;

      // Calcular saldo
      const saldoTotal = contratosCliente.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0);

      // Determinar estado principal
      let estadoPrincipal = 'POTENCIAL';
      const estados = contratosCliente.map(c => c.estado);
      if (estados.some(e => e === 'MORA')) estadoPrincipal = 'MORA';
      else if (estados.some(e => e === 'ACTIVO')) estadoPrincipal = 'ACTIVO';
      else if (estados.some(e => e === 'RESERVADO' || e === 'RESERVA')) estadoPrincipal = 'RESERVA';
      else if (estados.some(e => e === 'COMPLETADO' || e === 'FINALIZADO')) estadoPrincipal = 'FINALIZADO';
      else if (contratosCliente.length > 0) estadoPrincipal = contratosCliente[0].estado;

      return {
        ...cliente,
        contratos: contratosCliente,
        lotes_info: lotesInfo.join(', ') || '-',
        emprendimiento_nombre: emprendimientoNombre || '-',
        saldo_cc: saldoTotal,
        estado_principal: estadoPrincipal,
        legal_status: 'NORMAL',
      };
    });

    setClientes(clientesProcesados);
  }, []);

  // Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const globalMatch = !filters.global || 
        cliente.nombre?.toLowerCase().includes(filters.global.toLowerCase()) ||
        cliente.apellido?.toLowerCase().includes(filters.global.toLowerCase()) ||
        cliente.dni?.includes(filters.global) ||
        cliente.email?.toLowerCase().includes(filters.global.toLowerCase()) ||
        cliente.telefono?.includes(filters.global);
      
      const estadoMatch = !filters.estado || cliente.estado_principal === filters.estado;
      
      return globalMatch && estadoMatch;
    });
  }, [clientes, filters]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = clientes.length;
    const activos = clientes.filter(c => c.estado_principal === 'ACTIVO').length;
    const mora = clientes.filter(c => c.estado_principal === 'MORA').length;
    const reservados = clientes.filter(c => c.estado_principal === 'RESERVA' || c.estado_principal === 'RESERVADO').length;
    const potenciales = clientes.filter(c => c.estado_principal === 'POTENCIAL').length;
    
    return { total, activos, mora, reservados, potenciales };
  }, [clientes]);

  const handleMenuOpen = (event, cliente) => {
    setAnchorMenu(event.currentTarget);
    setMenuCliente(cliente);
  };

  const handleMenuClose = () => {
    setAnchorMenu(null);
    setMenuCliente(null);
  };

  const clearFilters = () => {
    setFilters({ global: '', estado: '' });
  };

  return (
    <LoteParaTodosLayout 
      currentModule="clientes" 
      pageTitle="Gestión de Clientes"
      pageDescription="Administra todos los clientes y sus contratos"
    >
      {/* Header con acciones */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Listado de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra todos los clientes y sus contratos
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Nuevo Cliente
          </Button>
          <Button variant="contained" color="success" startIcon={<AssignmentIcon />}>
            Venta de Lote
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            EXCEL
          </Button>
        </Stack>
      </Box>

      {/* Chips de estadísticas */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`Total: ${estadisticas.total}`} variant="outlined" />
        <Chip label={`Al día: ${estadisticas.activos}`} color="success" size="small" />
        <Chip label={`Mora: ${estadisticas.mora}`} color="error" size="small" />
        <Chip label={`Reservado: ${estadisticas.reservados}`} color="warning" size="small" />
        <Chip label={`Potencial: ${estadisticas.potenciales}`} color="default" size="small" />
      </Stack>

      {/* Barra de búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, contrato, lote o vendedor..."
              value={filters.global}
              onChange={(e) => setFilters(prev => ({ ...prev, global: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Estado Contrato"
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="MORA">En Mora</MenuItem>
              <MenuItem value="RESERVA">Reservado</MenuItem>
              <MenuItem value="FINALIZADO">Finalizado</MenuItem>
              <MenuItem value="POTENCIAL">Potencial</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<FilterAltOffIcon />}
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de clientes */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>CLIENTE</strong></TableCell>
              <TableCell><strong>CONTACTO</strong></TableCell>
              <TableCell><strong>EMPRENDIMIENTO</strong></TableCell>
              <TableCell><strong>LOTES</strong></TableCell>
              <TableCell align="right"><strong>SALDO CC</strong></TableCell>
              <TableCell align="center"><strong>ESTADO</strong></TableCell>
              <TableCell align="center"><strong>ACCIONES</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cliente) => (
                <TableRow key={cliente.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {cliente.nombre} {cliente.apellido || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cliente.dni}
                    </Typography>
                    {cliente.legal_status !== 'NORMAL' && (
                      <Chip 
                        size="small" 
                        label={`Legal: ${cliente.legal_status}`}
                        color={ESTADO_LEGAL_COLORS[cliente.legal_status] || 'default'}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{cliente.telefono}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cliente.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{cliente.emprendimiento_nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{cliente.lotes_info}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={cliente.saldo_cc > 0 ? 'success.main' : 'text.secondary'}
                    >
                      {formatearMoneda(cliente.saldo_cc)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">ARS</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      size="small"
                      label={cliente.estado_principal}
                      color={ESTADO_CONTRATO_COLORS[cliente.estado_principal] || 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Ir a Ficha
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, cliente)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={clientesFiltrados.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage="Filas por página:"
        />
      </TableContainer>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver Detalle</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar Cliente</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver Contratos</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><GavelIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Estado Legal</ListItemText>
        </MenuItem>
      </Menu>
    </LoteParaTodosLayout>
  );
};

export default ClientesPage;
