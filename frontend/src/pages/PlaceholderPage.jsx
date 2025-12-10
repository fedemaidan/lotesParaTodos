import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';
import LoteParaTodosLayout from '../layouts/LoteParaTodosLayout';

const PlaceholderPage = ({ 
  module = 'dashboard',
  title = 'Página en Desarrollo',
  description = ''
}) => {
  return (
    <LoteParaTodosLayout 
      currentModule={module} 
      pageTitle={title}
      pageDescription={description}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body1">
                Esta sección está en desarrollo y estará disponible próximamente.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </LoteParaTodosLayout>
  );
};

export default PlaceholderPage;
