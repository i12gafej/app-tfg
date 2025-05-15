import { Typography } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'
import { Container } from '@mui/material'

const Home = () => {
  return (
    <PageContainer>
      <Container maxWidth="xl" sx={{py:6}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido
      </Typography>
      <Typography variant="body1">
        Esta es la página principal de la aplicación.
      </Typography>
      </Container>
      
    </PageContainer>
  )
}

export default Home 