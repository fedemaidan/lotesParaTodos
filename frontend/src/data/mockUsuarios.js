// src/data/mockUsuarios.js

// Mock de usuarios del sistema
export const mockUsuarios = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@loteparatodos.com',
    telefono: '11-4567-8901',
    rol_id: 1, // Administrador
    estado: 'activo',
    avatar: null,
    emprendimientos_asignados: [], // Administrador tiene acceso a todos
    lotes_asignados: [],
    fecha_creacion: '2024-01-01',
    ultimo_acceso: '2024-12-10T10:30:00Z'
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@loteparatodos.com',
    telefono: '11-2345-6789',
    rol_id: 2, // Supervisor
    estado: 'activo',
    avatar: null,
    emprendimientos_asignados: [1, 2, 3], // Cerro Verde I, II, Norte Premium
    lotes_asignados: [],
    fecha_creacion: '2024-01-15',
    ultimo_acceso: '2024-12-10T09:15:00Z'
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@loteparatodos.com',
    telefono: '11-3456-7890',
    rol_id: 3, // Vendedor
    estado: 'activo',
    avatar: null,
    emprendimientos_asignados: [1, 2], // Cerro Verde I, II
    lotes_asignados: [1, 2, 5, 8], // Lotes específicos
    fecha_creacion: '2024-02-01',
    ultimo_acceso: '2024-12-09T16:45:00Z'
  },
  {
    id: 4,
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana.lopez@loteparatodos.com',
    telefono: '11-4567-1234',
    rol_id: 3, // Vendedor
    estado: 'inactivo',
    avatar: null,
    emprendimientos_asignados: [3], // Norte Premium
    lotes_asignados: [],
    fecha_creacion: '2024-02-15',
    ultimo_acceso: '2024-11-10T14:20:00Z'
  },
  {
    id: 5,
    nombre: 'Diego',
    apellido: 'Martínez',
    email: 'diego.martinez@loteparatodos.com',
    telefono: '11-5678-9012',
    rol_id: 4, // Tesorería
    estado: 'activo',
    avatar: null,
    emprendimientos_asignados: [1, 2, 3, 4], // Acceso a varios
    lotes_asignados: [],
    fecha_creacion: '2024-03-01',
    ultimo_acceso: '2024-12-10T08:00:00Z'
  },
  {
    id: 6,
    nombre: 'Laura',
    apellido: 'Fernández',
    email: 'laura.fernandez@loteparatodos.com',
    telefono: '11-6789-0123',
    rol_id: 5, // Atención al Cliente
    estado: 'activo',
    avatar: null,
    emprendimientos_asignados: [1, 2],
    lotes_asignados: [],
    fecha_creacion: '2024-03-15',
    ultimo_acceso: '2024-12-09T17:30:00Z'
  }
];

// Funciones auxiliares
export const getUsuarioById = (id) => mockUsuarios.find(u => u.id === id);

export const getUsuariosByRol = (rolId) => mockUsuarios.filter(u => u.rol_id === rolId);

export const getUsuariosActivos = () => mockUsuarios.filter(u => u.estado === 'activo');

export const buscarUsuarios = (termino) => {
  const search = termino.toLowerCase();
  return mockUsuarios.filter(u => 
    u.nombre.toLowerCase().includes(search) ||
    u.apellido.toLowerCase().includes(search) ||
    u.email.toLowerCase().includes(search)
  );
};

export const getInitials = (nombre, apellido) => {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};
