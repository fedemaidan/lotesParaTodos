import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .max(255)
        .required('El usuario es obligatorio'),
      password: Yup.string()
        .max(255)
        .required('La contraseña es obligatoria'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setIsLoading(true);
        await auth.signIn(values.username, values.password);
        navigate('/');
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <AuthLayout>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
        }}
      >
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Iniciar Sesión
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Ingresá tus credenciales para acceder al sistema
          </Typography>
        </Stack>

        <form noValidate onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <TextField
              error={!!(formik.touched.username && formik.errors.username)}
              fullWidth
              helperText={formik.touched.username && formik.errors.username}
              label="Usuario"
              name="username"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.username}
              autoComplete="username"
            />

            <TextField
              error={!!(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Contraseña"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              autoComplete="current-password"
            />
          </Stack>

          {formik.errors.submit && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {formik.errors.submit}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 3,
            }}
          >
            {!isLoading ? (
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                Ingresar
              </Button>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </form>
      </Paper>
    </AuthLayout>
  );
};

export default LoginPage;
