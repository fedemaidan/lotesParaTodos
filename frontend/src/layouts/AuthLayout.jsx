import { Box, Container, Typography } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Lotes Para Todos
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout;
