// src/pages/DashboardPage.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, Button, Alert, Drawer
} from '@mui/material';
import {
  Warning as WarningIcon,
  MonetizationOn as MoneyIcon,
  Landscape as LandscapeIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';

// Importar datos mock
import { mockContratos } from '../data/mockContratos';
import { mockClientes } from '../data/mockClientes';
import { mockLotes } from '../data/mockLotes';
import { mockEmprendimientos } from '../data/mockEmprendimientos';
import { mockMovimientosCaja } from '../data/mockMovimientosCaja';

// Componente de tarjeta de métrica
const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', onClick = null }) => (
  <Card 
    sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { boxShadow: 4 } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color: `${color}.main`, fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            {subtitle}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, height: 56, width: 56 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [openVentaDrawer, setOpenVentaDrawer] = useState(false);

  // Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  // Calcular métricas principales
  const metricas = useMemo(() => {
    // Contratos en mora
    const contratosEnMora = mockContratos.filter(c => c.estado === 'MORA' || c.saldo_pendiente > 0).length;
    
    // Saldo general
    const saldoGeneral = mockClientes.reduce((sum, cliente) => {
      return sum + (cliente.saldo_cuenta_corriente || 0);
    }, 0);
    
    // Saldo de mora
    const saldoDeMora = mockClientes
      .filter(cliente => cliente.estado_cuenta === 'MORA')
      .reduce((sum, cliente) => sum + (cliente.saldo_cuenta_corriente || 0), 0);

    return {
      contratosEnMora,
      saldoGeneral,
      saldoDeMora
    };
  }, []);

  // Estadísticas por emprendimiento
  const estadisticasPorEmprendimiento = useMemo(() => {
    return mockEmprendimientos.map(emprendimiento => {
      const lotesDelEmprendimiento = mockLotes.filter(lote => lote.emprendimiento_id === emprendimiento.id);
      const contratosDelEmprendimiento = mockContratos.filter(contrato => {
        const lote = mockLotes.find(l => l.id === contrato.lote_id);
        return lote && lote.emprendimiento_id === emprendimiento.id;
      });

      const estadosContratos = contratosDelEmprendimiento.reduce((acc, contrato) => {
        acc[contrato.estado] = (acc[contrato.estado] || 0) + 1;
        return acc;
      }, {});

      const contratosEnMora = contratosDelEmprendimiento.filter(c => c.estado === 'MORA' || c.saldo_pendiente > 0).length;
      const totalContratos = contratosDelEmprendimiento.length;
      const porcentajeMora = totalContratos > 0 ? ((contratosEnMora / totalContratos) * 100).toFixed(1) : 0;

      return {
        ...emprendimiento,
        totalLotes: lotesDelEmprendimiento.length,
        totalContratos,
        activos: estadosContratos.ACTIVO || 0,
        completados: estadosContratos.COMPLETADO || 0,
        caidos: estadosContratos.CAIDO || 0,
        mora: estadosContratos.MORA || 0,
        contratosEnMora,
        porcentajeMora
      };
    });
  }, []);

  // Últimos movimientos de caja
  const ultimosMovimientosCaja = useMemo(() => {
    const movimientos = mockMovimientosCaja || [];
    return movimientos
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 10);
  }, []);

  // Últimas ventas
  const ultimasVentas = useMemo(() => {
    return mockContratos
      .filter(c => c.estado === 'ACTIVO' || c.estado === 'COMPLETADO')
      .sort((a, b) => new Date(b.fecha_contrato) - new Date(a.fecha_contrato))
      .slice(0, 10)
      .map(contrato => {
        const cliente = mockClientes.find(c => c.id === contrato.cliente_id);
        const lote = mockLotes.find(l => l.id === contrato.lote_id);
        const emprendimiento = mockEmprendimientos.find(e => e.id === lote?.emprendimiento_id);
        return {
          ...contrato,
          cliente_nombre: cliente ? `${cliente.nombre} ${cliente.apellido || ''}` : 'N/A',
          lote_info: lote ? `Lote ${lote.numero} - Mza. ${lote.manzana}` : 'N/A',
          emprendimiento_nombre: emprendimiento?.nombre || 'N/A'
        };
      });
  }, []);

  return (
    <LoteParaTodosLayout 
      currentModule="dashboard" 
      pageTitle="Dashboard Principal"
      pageDescription="Resumen general y métricas principales"
    >
      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Contratos en Mora"
            value={metricas.contratosEnMora}
            subtitle="Contratos con pagos vencidos"
            icon={WarningIcon}
            color="error"
            onClick={() => navigate('/clientes?estado=mora')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Saldo General"
            value={formatearMoneda(metricas.saldoGeneral)}
            subtitle="Total cuentas corrientes"
            icon={WalletIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Saldo de Mora"
            value={formatearMoneda(metricas.saldoDeMora)}
            subtitle="Solo clientes en mora"
            icon={MoneyIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpenVentaDrawer(true)}
              sx={{ 
                width: '100%', 
                height: '100%', 
                minHeight: 120,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Nueva Venta
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Tabla resumen por emprendimiento */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LandscapeIcon sx={{ mr: 1 }} />
            Resumen por Emprendimiento
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Emprendimiento</strong></TableCell>
                  <TableCell align="center"><strong>Total Lotes</strong></TableCell>
                  <TableCell align="center"><strong>Contratos Activos</strong></TableCell>
                  <TableCell align="center"><strong>Completados</strong></TableCell>
                  <TableCell align="center"><strong>En Mora</strong></TableCell>
                  <TableCell align="center"><strong>Caídos</strong></TableCell>
                  <TableCell align="center"><strong>% Mora</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estadisticasPorEmprendimiento.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {emp.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {emp.ciudad}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{emp.totalLotes}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={emp.activos} color="success" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={emp.completados} color="info" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={emp.mora} color="error" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={emp.caidos} color="default" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        color={parseFloat(emp.porcentajeMora) > 20 ? 'error' : 'success'}
                        fontWeight="bold"
                      >
                        {emp.porcentajeMora}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Últimos movimientos y ventas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon sx={{ mr: 1 }} />
                Últimos Movimientos de Caja
              </Typography>
              <Box sx={{ height: '320px', overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Tipo</strong></TableCell>
                      <TableCell><strong>Concepto</strong></TableCell>
                      <TableCell align="right"><strong>Monto</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ultimosMovimientosCaja.length > 0 ? ultimosMovimientosCaja.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {formatearFecha(mov.fecha)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={mov.tipo} 
                            color={mov.tipo === 'INGRESO' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {mov.concepto}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2"
                            color={mov.tipo === 'INGRESO' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {mov.tipo === 'INGRESO' ? '+' : '-'}{formatearMoneda(Math.abs(mov.monto))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No hay movimientos recientes
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Últimas Ventas (Nuevos Contratos)
              </Typography>
              <Box sx={{ height: '320px', overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell><strong>Lote</strong></TableCell>
                      <TableCell align="right"><strong>Precio</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ultimasVentas.map((venta) => (
                      <TableRow 
                        key={venta.id} 
                        hover
                        onClick={() => navigate(`/contratos/${venta.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatearFecha(venta.fecha_contrato)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {venta.cliente_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {venta.emprendimiento_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {venta.lote_info}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatearMoneda(venta.precio_acordado)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drawer de Nueva Venta */}
      <Drawer 
        anchor="right" 
        open={openVentaDrawer} 
        onClose={() => setOpenVentaDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}
      >
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: 'primary.main' }}>
            🛒 Nueva Venta de Lote
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Funcionalidad en Desarrollo
              </Typography>
              <Typography variant="body2">
                Esta funcionalidad se implementará próximamente. Por ahora puedes crear nuevas ventas desde la sección de Clientes.
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setOpenVentaDrawer(false);
                  navigate('/clientes');
                }}
              >
                Ir a Clientes
              </Button>
            </Alert>
          </Box>
        </Box>
      </Drawer>
    </LoteParaTodosLayout>
  );
};

export default DashboardPage;
