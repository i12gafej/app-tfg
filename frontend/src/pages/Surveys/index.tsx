import { useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, CardActions, Button, Dialog } from '@mui/material';
import PageContainer from '../../components/layout/PageContainer';
import SurveySearch from '@/components/surveys/SurveySearch';
import SurveyComplete from '@/components/surveys/SurveyComplete';
import { Container } from '@mui/material';
import { PrivateSurveyResponse } from '@/services/surveyService';

const Surveys = () => {
  const [searchResults, setSearchResults] = useState<PrivateSurveyResponse>({
    items: [],
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0
  });
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSearch = (results: PrivateSurveyResponse) => {
    setSearchResults(results);
  };

  const handleParticipate = (surveyId: number) => {
    setSelectedSurvey(surveyId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSurvey(null);
  };

  const handleSurveyComplete = () => {
    handleCloseDialog();
    // Aquí podrías actualizar la lista de encuestas si es necesario
  };

  return (
    <PageContainer whiteBackground>
      <Container maxWidth="xl">
        <Box sx={{ py: 4}}>
          <Typography variant="h4" component="h1" gutterBottom>
            Encuestas de Materialidad
          </Typography>
          <SurveySearch onSearch={handleSearch} />
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {searchResults.items.map((survey) => (
              <Grid item xs={12} sm={6} md={4} key={survey.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {survey.heritage_resource_name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Año: {survey.year}
                    </Typography>
                    <Typography color="textSecondary">
                      Estado: {survey.survey_state}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleParticipate(survey.id)}
                    >
                      Participar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {searchResults.items.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography color="textSecondary">
                No se encontraron encuestas. Intenta con otros criterios de búsqueda.
              </Typography>
            </Box>
          )}

          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                p: { xs: 1, sm: 3, md: 4 },
                borderRadius: 3,
                m: { xs: 1, sm: 3 },
                boxShadow: 8,
                minHeight: '60vh',
                maxHeight: '90vh',
                overflowY: 'auto',
              }
            }}
          >
            {selectedSurvey && (
              <Box sx={{ p: { xs: 0, sm: 1, md: 2 } }}>
                <SurveyComplete
                  reportId={selectedSurvey}
                  scale={5}
                  onComplete={handleSurveyComplete}
                />
              </Box>
            )}
          </Dialog>
        </Box>
      </Container> 
    </PageContainer>
  );
};

export default Surveys; 