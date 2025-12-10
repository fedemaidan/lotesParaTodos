// src/data/mockRoles.js

// Catálogo de permisos disponibles
export const PERMISOS_DISPONIBLES = [
  { id: 'ver-clientes', label: 'Ver Clientes', modulo: 'clientes' },
  { id: 'editar-clientes', label: 'Editar Clientes', modulo: 'clientes' },
  { id: 'ver-contratos', label: 'Ver Contratos', modulo: 'contratos' },
  { id: 'editar-contratos', label: 'Editar Contratos', modulo: 'contratos' },
  { id: 'registrar-pagos', label: 'Registrar Pagos', modulo: 'pagos' },
  { id: 'ver-cajas-bancos', label: 'Ver Cajas y Bancos', modulo: 'tesoreria' },
  { id: 'conciliar', label: 'Conciliar Movimientos', modulo: 'tesoreria' },
  { id: 'iniciar-venta', label: 'Iniciar Venta', modulo: 'ventas' },
  { id: 'ver-emprendimientos', label: 'Ver Emprendimientos', modulo: 'emprendimientos' },
  { id: 'editar-emprendimientos', label: 'Editar Emprendimientos', modulo: 'emprendimientos' },
  { id: 'ver-lotes', label: 'Ver Lotes', modulo: 'lotes' },
  { id: 'editar-lotes', label: 'Editar Lotes', modulo: 'lotes' },
  { id: 'generar-documentos', label: 'Generar Documentos', modulo: 'documentos' },
  { id: 'ver-reportes', label: 'Ver Reportes', modulo: 'reportes' },
  { id: 'configurar-sistema', label: 'Configurar Sistema', modulo: 'configuracion' },
  { id: 'gestionar-usuarios', label: 'Gestionar Usuarios', modulo: 'usuarios' },
  { id: 'gestionar-roles', label: 'Gestionar Roles', modulo: 'roles' }
];

// Colores disponibles para roles
export const COLORES_ROL = [
  { id: 'primary', label: 'Azul', color: '#1976d2' },
  { id: 'secondary', label: 'Púrpura', color: '#9c27b0' },
  { id: 'success', label: 'Verde', color: '#2e7d32' },
  { id: 'warning', label: 'Naranja', color: '#ed6c02' },
  { id: 'error', label: 'Rojo', color: '#d32f2f' },
  { id: 'info', label: 'Cian', color: '#0288d1' }
];

// Roles del sistema
export const mockRoles = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    color: 'error',
    activo: true,
    es_sistema: true, // No se puede eliminar
    permisos: PERMISOS_DISPONIBLES.map(p => p.id),
    fecha_creacion: '2024-01-01'
  },
  {
    id: 2,
    nombre: 'Supervisor',
    descripcion: 'Supervisión y dirección general de ventas',
    color: 'warning',
    activo: true,
    es_sistema: false,
    permisos: [
      'ver-clientes', 'editar-clientes',
      'ver-contratos', 'editar-contratos',
      'registrar-pagos',
      'ver-cajas-bancos',
      'iniciar-venta',
      'ver-emprendimientos',
      'ver-lotes',
      'generar-documentos',
      'ver-reportes'
    ],
    fecha_creacion: '2024-01-15'
  },
  {
    id: 3,
    nombre: 'Vendedor',
    descripcion: 'Personal de ventas y atención comercial',
    color: 'info',
    activo: true,
    es_sistema: false,
    permisos: [
      'ver-clientes',
      'ver-contratos',
      'registrar-pagos',
      'iniciar-venta',
      'ver-emprendimientos',
      'ver-lotes',
      'generar-documentos'
    ],
    fecha_creacion: '2024-01-15'
  },
  {
    id: 4,
    nombre: 'Tesorería',
    descripcion: 'Manejo de fondos y conciliaciones bancarias',
    color: 'success',
    activo: true,
    es_sistema: false,
    permisos: [
      'ver-clientes',
      'ver-contratos',
      'registrar-pagos',
      'ver-cajas-bancos',
      'conciliar',
      'ver-reportes'
    ],
    fecha_creacion: '2024-02-01'
  },
  {
    id: 5,
    nombre: 'Atención al Cliente',
    descripcion: 'Soporte y atención post-venta',
    color: 'primary',
    activo: true,
    es_sistema: false,
    permisos: [
      'ver-clientes',
      'ver-contratos',
      'generar-documentos'
    ],
    fecha_creacion: '2024-02-15'
  }
];

// Funciones auxiliares
export const getRolById = (id) => mockRoles.find(r => r.id === id);

export const getRolByNombre = (nombre) => mockRoles.find(r => r.nombre === nombre);

export const getPermisosDeRol = (rolId) => {
  const rol = getRolById(rolId);
  if (!rol) return [];
  return PERMISOS_DISPONIBLES.filter(p => rol.permisos.includes(p.id));
};

export const tienePermiso = (rolId, permisoId) => {
  const rol = getRolById(rolId);
  if (!rol) return false;
  return rol.permisos.includes(permisoId);
};
