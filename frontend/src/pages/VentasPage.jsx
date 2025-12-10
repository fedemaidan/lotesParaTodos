import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, MenuItem, Stack, InputAdornment, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, 
  StepLabel, FormControl, InputLabel, Select, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';
import { 
  mockLotes, 
  mockEmprendimientos,
  getEmprendimientosActivos 
} from '../data/mockLotes';
import { mockClientes } from '../data/mockClientes';

// Componente VentaWizard integrado
const VentaWizard = ({ open, onClose, onSuccess, lotePreseleccionado }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    lote_id: lotePreseleccionado?.id || '',
    cliente_id: '',
    tipo_venta: 'CONTADO',
    precio_acordado: lotePreseleccionado?.precio_base || '',
    anticipo: '',
    cuotas: 12,
    observaciones: ''
  });

  const steps = ['Seleccionar Lote', 'Seleccionar Cliente', 'Condiciones de Venta', 'Confirmar'];

  const emprendimientos = useMemo(() => getEmprendimientosActivos(), []);
  const lotesDisponibles = mockLotes.filter(l => l.estado === 'DISPONIBLE');

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConfirm = () => {
    onSuccess(formData);
    onClose();
    setActiveStep(0);
    setFormData({
      lote_id: '',
      cliente_id: '',
      tipo_venta: 'CONTADO',
      precio_acordado: '',
      anticipo: '',
      cuotas: 12,
      observaciones: ''
    });
  };

  const getLoteSeleccionado = () => lotesDisponibles.find(l => l.id === formData.lote_id);
  const getClienteSeleccionado = () => mockClientes.find(c => c.id === formData.cliente_id);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ minHeight: 300 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Seleccionar Lote</InputLabel>
              <Select
                value={formData.lote_id}
                label="Seleccionar Lote"
                onChange={(e) => {
                  const lote = lotesDisponibles.find(l => l.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    lote_id: e.target.value,
                    precio_acordado: lote?.precio_base || ''
                  });
                }}
              >
                {lotesDisponibles.map((lote) => {
                  const emp = emprendimientos.find(e => e.id === lote.emprendimiento_id);
                  return (
                    <MenuItem key={lote.id} value={lote.id}>
                      Lote {lote.numero} - Mz {lote.manzana} | {emp?.nombre} | ${lote.precio_base?.toLocaleString()}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {formData.lote_id && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">Detalle del Lote</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1}>
                    <Typography>Superficie: {getLoteSeleccionado()?.superficie} m²</Typography>
                    <Typography>Precio Lista: ${getLoteSeleccionado()?.precio_base?.toLocaleString()}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ minHeight: 300 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Seleccionar Cliente</InputLabel>
              <Select
                value={formData.cliente_id}
                label="Seleccionar Cliente"
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              >
                {mockClientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido} - DNI: {cliente.dni}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.cliente_id && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">Datos del Cliente</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1}>
                    <Typography>Nombre: {getClienteSeleccionado()?.nombre} {getClienteSeleccionado()?.apellido}</Typography>
                    <Typography>DNI: {getClienteSeleccionado()?.dni}</Typography>
                    <Typography>Email: {getClienteSeleccionado()?.email}</Typography>
                    <Typography>Teléfono: {getClienteSeleccionado()?.telefono}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ minHeight: 300 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Venta</InputLabel>
                  <Select
                    value={formData.tipo_venta}
                    label="Tipo de Venta"
                    onChange={(e) => setFormData({ ...formData, tipo_venta: e.target.value })}
                  >
                    <MenuItem value="CONTADO">Contado</MenuItem>
                    <MenuItem value="FINANCIADO">Financiado</MenuItem>
                    <MenuItem value="RESERVA">Reserva</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precio Acordado"
                  type="number"
                  value={formData.precio_acordado}
                  onChange={(e) => setFormData({ ...formData, precio_acordado: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              {formData.tipo_venta === 'FINANCIADO' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Anticipo"
                      type="number"
                      value={formData.anticipo}
                      onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cantidad de Cuotas"
                      type="number"
                      value={formData.cuotas}
                      onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ minHeight: 300 }}>
            <Typography variant="h6" gutterBottom>Resumen de la Operación</Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Lote</Typography>
                    <Typography>Lote {getLoteSeleccionado()?.numero} - Mz {getLoteSeleccionado()?.manzana}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
                    <Typography>{getClienteSeleccionado()?.nombre} {getClienteSeleccionado()?.apellido}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tipo de Venta</Typography>
                    <Chip label={formData.tipo_venta} color="primary" size="small" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Precio Acordado</Typography>
                    <Typography variant="h6" color="success.main">${Number(formData.precio_acordado).toLocaleString()}</Typography>
                  </Grid>
                  {formData.tipo_venta === 'FINANCIADO' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Anticipo</Typography>
                        <Typography>${Number(formData.anticipo).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Cuotas</Typography>
                        <Typography>{formData.cuotas} cuotas de ${((formData.precio_acordado - formData.anticipo) / formData.cuotas).toLocaleString()}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6">Nueva Venta</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button onClick={handleBack}>Atrás</Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !formData.lote_id) ||
              (activeStep === 1 && !formData.cliente_id) ||
              (activeStep === 2 && !formData.precio_acordado)
            }
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="success"
            onClick={handleConfirm}
            startIcon={<CheckCircleIcon />}
          >
            Confirmar Venta
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const VentasPage = () => {
  const [openWizard, setOpenWizard] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({
    emprendimiento: '',
    precioMax: '',
    superficieMin: ''
  });

  const emprendimientos = useMemo(() => getEmprendimientosActivos(), []);

  // Filtrar solo lotes disponibles y aplicar filtros de usuario
  const lotesDisponibles = useMemo(() => {
    return mockLotes.filter(lote => {
      // Condición base: Disponible y sin bloqueos legales
      if (lote.estado !== 'DISPONIBLE') return false;
      if (lote.estado_legal === 'BLOQUEADO') return false;

      // Filtros de usuario
      if (filtros.emprendimiento && lote.emprendimiento_id !== parseInt(filtros.emprendimiento)) return false;
      if (filtros.precioMax && lote.precio_base > parseFloat(filtros.precioMax)) return false;
      if (filtros.superficieMin && lote.superficie < parseFloat(filtros.superficieMin)) return false;

      return true;
    });
  }, [filtros]);

  const handleIniciarVenta = (lote) => {
    setLoteSeleccionado(lote);
    setOpenWizard(true);
  };

  const handleVentaSuccess = (contrato) => {
    alert(`¡Venta iniciada con éxito! Contrato #${Math.floor(Math.random() * 1000)} creado.`);
    setLoteSeleccionado(null);
  };

  return (
    <LoteParaTodosLayout title="Catálogo de Ventas">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Catálogo de Lotes Vendibles
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Seleccione un lote disponible para iniciar el proceso de reserva o venta.
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <TextField
              select
              label="Emprendimiento"
              value={filtros.emprendimiento}
              onChange={(e) => setFiltros({ ...filtros, emprendimiento: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Todos los emprendimientos</MenuItem>
              {emprendimientos.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.nombre}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Precio Máximo"
              type="number"
              value={filtros.precioMax}
              onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Superficie Mínima (m²)"
              type="number"
              value={filtros.superficieMin}
              onChange={(e) => setFiltros({ ...filtros, superficieMin: e.target.value })}
              fullWidth
            />
            
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => setFiltros({ emprendimiento: '', precioMax: '', superficieMin: '' })}
            >
              Limpiar
            </Button>
          </Stack>
        </Paper>

        {/* Grilla de Lotes */}
        <Grid container spacing={3}>
          {lotesDisponibles.length > 0 ? (
            lotesDisponibles.map((lote) => {
              const emprendimiento = emprendimientos.find(e => e.id === lote.emprendimiento_id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={lote.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                    <Box sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h3" color="text.secondary" fontWeight="bold">
                        {lote.numero}
                      </Typography>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Chip 
                        label="DISPONIBLE" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                      <Typography variant="h6" gutterBottom>
                        Lote {lote.numero} - Mz {lote.manzana}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {emprendimiento?.nombre || 'Emprendimiento Desconocido'}
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Superficie:</Typography>
                          <Typography variant="body2" fontWeight="bold">{lote.superficie} m²</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Precio Lista:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            ${lote.precio_base?.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => handleIniciarVenta(lote)}
                      >
                        Iniciar Venta
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron lotes disponibles con los filtros seleccionados.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Wizard de Venta */}
      <VentaWizard 
        open={openWizard} 
        onClose={() => {
          setOpenWizard(false);
          setLoteSeleccionado(null);
        }}
        onSuccess={handleVentaSuccess}
        lotePreseleccionado={loteSeleccionado}
      />
    </LoteParaTodosLayout>
  );
};

export default VentasPage;
