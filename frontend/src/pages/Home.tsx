import { Typography } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'

const Home = () => {
  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido a Mi Aplicación
      </Typography>
      <Typography variant="body1">
        Esta es la página principal de la aplicación.
      </Typography>
    </PageContainer>
  )
}

export default Home 