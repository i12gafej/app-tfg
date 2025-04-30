import { useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import PageContainer from '../../components/layout/PageContainer';
import SurveySearch from '@/components/surveys/SurveySearch';
import { Container } from '@mui/material';


const Surveys = () => {
  return (
    <PageContainer whiteBackground>
      <Container maxWidth="xl">
        <Box sx={{ py: 4}}>
          <Typography variant="h4" component="h1" gutterBottom>
            Encuestas de Materialidad
          </Typography>
          <SurveySearch />
        </Box>
      </Container> 
    </PageContainer>
  );
};

export default Surveys; 