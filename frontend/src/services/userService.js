import api from './api';

// ==================== USUARIOS ====================

/**
 * Obtener lista de todos los usuarios
 */
export const getUsuarios = async () => {
  const response = await api.get('/auth/listar_usuarios/');
  return response.data;
};

/**
 * Crear un nuevo usuario
 * @param {Object} userData - { username, email, password, password_confirm, first_name, last_name, rol }
 */
export const crearUsuario = async (userData) => {
  const response = await api.post('/auth/crear_usuario/', userData);
  return response.data;
};

/**
 * Actualizar un usuario existente
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 */
export const actualizarUsuario = async (userId, userData) => {
  const response = await api.patch(`/auth/actualizar_usuario/${userId}/`, userData);
  return response.data;
};

/**
 * Eliminar un usuario
 * @param {number} userId - ID del usuario
 */
export const eliminarUsuario = async (userId) => {
  const response = await api.delete(`/auth/eliminar_usuario/${userId}/`);
  return response.data;
};

/**
 * Asignar un rol a un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {string} rolNombre - Nombre del rol
 */
export const asignarRol = async (usuarioId, rolNombre) => {
  const response = await api.post('/auth/asignar_rol/', {
    usuario_id: usuarioId,
    rol_nombre: rolNombre
  });
  return response.data;
};

/**
 * Quitar un rol de un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {string} rolNombre - Nombre del rol
 */
export const quitarRol = async (usuarioId, rolNombre) => {
  const response = await api.post('/auth/quitar_rol/', {
    usuario_id: usuarioId,
    rol_nombre: rolNombre
  });
  return response.data;
};

// ==================== ROLES ====================

/**
 * Obtener lista de todos los roles
 */
export const getRoles = async () => {
  const response = await api.get('/auth/listar_roles/');
  return response.data;
};

/**
 * Crear roles iniciales del sistema
 */
export const crearRolesIniciales = async () => {
  const response = await api.post('/auth/crear_roles/');
  return response.data;
};

/**
 * Crear un nuevo rol
 * @param {Object} rolData - { nombre, descripcion }
 */
export const crearRol = async (rolData) => {
  const response = await api.post('/auth/crear_rol/', rolData);
  return response.data;
};

/**
 * Eliminar un rol
 * @param {number} rolId - ID del rol
 */
export const eliminarRol = async (rolId) => {
  const response = await api.delete(`/auth/eliminar_rol/${rolId}/`);
  return response.data;
};

/**
 * Obtener información de roles disponibles
 */
export const getInfoRoles = async () => {
  const response = await api.get('/auth/info_roles/');
  return response.data;
};

// ==================== PERMISOS ====================

/**
 * Obtener lista de todos los permisos disponibles
 */
export const getPermisos = async () => {
  const response = await api.get('/auth/listar_permisos/');
  return response.data;
};

/**
 * Obtener los permisos de un rol específico
 * @param {number} rolId - ID del rol
 */
export const getPermisosRol = async (rolId) => {
  const response = await api.get(`/auth/permisos_rol/${rolId}/`);
  return response.data;
};

/**
 * Asignar un permiso a un rol
 * @param {number} rolId - ID del rol
 * @param {string} permisoCodename - Codename del permiso
 */
export const asignarPermisoRol = async (rolId, permisoCodename) => {
  const response = await api.post('/auth/asignar_permiso_rol/', {
    rol_id: rolId,
    permiso_codename: permisoCodename
  });
  return response.data;
};

/**
 * Quitar un permiso de un rol
 * @param {number} rolId - ID del rol
 * @param {string} permisoCodename - Codename del permiso
 */
export const quitarPermisoRol = async (rolId, permisoCodename) => {
  const response = await api.post('/auth/quitar_permiso_rol/', {
    rol_id: rolId,
    permiso_codename: permisoCodename
  });
  return response.data;
};

/**
 * Actualizar todos los permisos de un rol de una vez
 * @param {number} rolId - ID del rol
 * @param {string[]} permisosCodenames - Lista de codenames de permisos
 */
export const actualizarPermisosRol = async (rolId, permisosCodenames) => {
  const response = await api.post('/auth/actualizar_permisos_rol/', {
    rol_id: rolId,
    permisos: permisosCodenames
  });
  return response.data;
};

export default {
  // Usuarios
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  asignarRol,
  quitarRol,
  // Roles
  getRoles,
  crearRolesIniciales,
  crearRol,
  eliminarRol,
  getInfoRoles,
  // Permisos
  getPermisos,
  getPermisosRol,
  asignarPermisoRol,
  quitarPermisoRol,
  actualizarPermisosRol
};
