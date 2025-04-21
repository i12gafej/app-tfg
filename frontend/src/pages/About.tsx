import { Typography } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'

const About = () => {
  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        Quiénes Somos
      </Typography>
      <Typography variant="body1">
        Información sobre nuestra organización.
      </Typography>
    </PageContainer>
  )
}

export default About 