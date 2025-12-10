import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import EmprendimientosPage from './pages/EmprendimientosPage';
import TesoreriaPage from './pages/TesoreriaPage';
import VentasPage from './pages/VentasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import UsuariosPage from './pages/UsuariosPage';
import RolesPage from './pages/RolesPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Clientes & Contratos */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute permiso="ver_clientes">
                  <ClientesPage />
                </ProtectedRoute>
              }
            />
            {/* Emprendimientos */}
            <Route
              path="/emprendimientos"
              element={
                <ProtectedRoute permiso="ver_emprendimientos">
                  <EmprendimientosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/emprendimientos/:id"
              element={
                <ProtectedRoute permiso="ver_emprendimientos">
                  <PlaceholderPage 
                    module="emprendimientos" 
                    title="Detalle de Emprendimiento" 
                    description="Vista detallada del emprendimiento"
                  />
                </ProtectedRoute>
              }
            />
            {/* Ventas */}
            <Route
              path="/ventas"
              element={
                <ProtectedRoute permiso="ver_ventas">
                  <VentasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas/*"
              element={
                <ProtectedRoute permiso="ver_ventas">
                  <PlaceholderPage 
                    module="ventas" 
                    title="Ventas" 
                    description="Gestión de ventas"
                  />
                </ProtectedRoute>
              }
            />
            {/* Tesorería */}
            <Route
              path="/tesoreria"
              element={
                <ProtectedRoute permiso="ver_tesoreria">
                  <TesoreriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/*"
              element={
                <ProtectedRoute permiso="ver_tesoreria">
                  <PlaceholderPage 
                    module="tesoreria" 
                    title="Tesorería" 
                    description="Gestión financiera"
                  />
                </ProtectedRoute>
              }
            />
            {/* Configuración */}
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute permiso="ver_configuracion">
                  <ConfiguracionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/*"
              element={
                <ProtectedRoute permiso="ver_configuracion">
                  <PlaceholderPage 
                    module="configuracion" 
                    title="Configuración" 
                    description="Ajustes del sistema"
                  />
                </ProtectedRoute>
              }
            />
            {/* Usuarios y Roles */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute permiso="ver_usuarios">
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute permiso="gestionar_usuarios">
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
