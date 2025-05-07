import { Typography } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'
import { Container } from '@mui/material'

const Home = () => {
  return (
    <PageContainer>
      <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido a Mi Aplicación
      </Typography>
      <Typography variant="body1">
        Esta es la página principal de la aplicación.
      </Typography>
      </Container>
      
    </PageContainer>
  )
}

export default Home 