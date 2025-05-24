import { Box, Typography, Container } from '@mui/material';
import PageContainer from '@/components/layout/PageContainer';
import PublicReportSearch from '@/components/reports/PublicReportSearch';

const PublicReports = () => {
    return (
        <PageContainer>
            <Container  maxWidth={false}>
                <Box >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Memorias Públicas
                    </Typography>
                    <PublicReportSearch />
                </Box>
            </Container>
        </PageContainer>
    );
};

export default PublicReports;

