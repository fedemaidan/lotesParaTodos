import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, signOut } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido!
        </Typography>
        
        {user && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Usuario:</strong> {user.username}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            {user.first_name && (
              <Typography variant="body1">
                <strong>Nombre:</strong> {user.first_name} {user.last_name}
              </Typography>
            )}
          </Box>
        )}

        <Button 
          variant="contained" 
          color="error" 
          onClick={signOut}
        >
          Cerrar Sesión
        </Button>
      </Paper>
    </Container>
  );
};

export default HomePage;
