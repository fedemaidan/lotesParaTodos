import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/api';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  roles: [],
  permisos: [],
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const { user, roles, permisos } = action.payload || {};
    return {
      ...state,
      ...(user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user,
            roles: roles || [],
            permisos: permisos || [],
          }
        : {
            isLoading: false,
            roles: [],
            permisos: [],
          }),
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const { user, roles, permisos } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
      roles: roles || [],
      permisos: permisos || [],
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      roles: [],
      permisos: [],
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({ undefined });

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Verificar que el token sigue siendo válido obteniendo el perfil
        try {
          const response = await authService.getProfile();
          
          // Guardar permisos en localStorage para acceso rápido
          localStorage.setItem('permisos', JSON.stringify(response.permisos || []));
          localStorage.setItem('roles', JSON.stringify(response.roles || []));
          
          dispatch({
            type: HANDLERS.INITIALIZE,
            payload: {
              user: response.user,
              roles: response.roles || [],
              permisos: response.permisos || [],
            },
          });
        } catch (error) {
          // Token inválido, limpiar storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('permisos');
          localStorage.removeItem('roles');
          dispatch({
            type: HANDLERS.INITIALIZE,
            payload: null,
          });
        }
      } else {
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: null,
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: null,
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const signIn = useCallback(async (username, password) => {
    try {
      const data = await authService.login(username, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('permisos', JSON.stringify(data.permisos || []));
      localStorage.setItem('roles', JSON.stringify(data.roles || []));

      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: {
          user: data.user,
          roles: data.roles || [],
          permisos: data.permisos || [],
        },
      });

      return data;
    } catch (error) {
      // Extraer mensaje de error de diferentes formatos de respuesta de DRF
      const responseData = error.response?.data;
      let message = 'Error al iniciar sesión';
      
      if (responseData) {
        if (responseData.error) {
          message = responseData.error;
        } else if (responseData.non_field_errors) {
          message = Array.isArray(responseData.non_field_errors) 
            ? responseData.non_field_errors[0] 
            : responseData.non_field_errors;
        } else if (responseData.detail) {
          message = responseData.detail;
        } else if (responseData.username) {
          message = `Usuario: ${Array.isArray(responseData.username) ? responseData.username[0] : responseData.username}`;
        } else if (responseData.password) {
          message = `Contraseña: ${Array.isArray(responseData.password) ? responseData.password[0] : responseData.password}`;
        } else if (typeof responseData === 'string') {
          message = responseData;
        }
      }
      
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permisos');
      localStorage.removeItem('roles');
      dispatch({
        type: HANDLERS.SIGN_OUT,
      });
    }
  }, []);

  // Verificar si el usuario tiene un permiso específico
  const tienePermiso = useCallback((permiso) => {
    // Administrador tiene todos los permisos
    if (state.roles.includes('Administrador')) {
      return true;
    }
    return state.permisos.includes(permiso);
  }, [state.roles, state.permisos]);

  // Verificar si el usuario tiene ALGUNO de los permisos
  const tieneAlgunPermiso = useCallback((permisosList) => {
    if (state.roles.includes('Administrador')) {
      return true;
    }
    return permisosList.some(permiso => state.permisos.includes(permiso));
  }, [state.roles, state.permisos]);

  // Verificar si el usuario tiene TODOS los permisos
  const tieneTodosLosPermisos = useCallback((permisosList) => {
    if (state.roles.includes('Administrador')) {
      return true;
    }
    return permisosList.every(permiso => state.permisos.includes(permiso));
  }, [state.roles, state.permisos]);

  // Verificar si el usuario tiene un rol específico
  const tieneRol = useCallback((rol) => {
    return state.roles.includes(rol);
  }, [state.roles]);

  // Verificar si es administrador
  const esAdministrador = useMemo(() => {
    return state.roles.includes('Administrador');
  }, [state.roles]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        tienePermiso,
        tieneAlgunPermiso,
        tieneTodosLosPermisos,
        tieneRol,
        esAdministrador,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthConsumer = AuthContext.Consumer;
