import { Box, Typography, Button } from '@mui/material';
import { useState } from 'react';
import TeamSearch from '@/components/Team/TeamSearch';
import TeamMemberCreateDialog from '@/components/Team/TeamMemberCreateDialog';

const Team = () => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateClick = () => {
    if (selectedResource && selectedReport) {
      setIsCreateDialogOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión del Equipo de Sostenibilidad
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          disabled={!selectedResource || !selectedReport}
        >
          Crear Nuevo Miembro
        </Button>
      </Box>

      <TeamSearch
        selectedResource={selectedResource}
        selectedReport={selectedReport}
        onResourceChange={setSelectedResource}
        onReportChange={setSelectedReport}
      />

      {selectedResource && selectedReport && (
        <TeamMemberCreateDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          resourceId={selectedResource}
          reportId={selectedReport}
        />
      )}
    </Box>
  );
};

export default Team; 