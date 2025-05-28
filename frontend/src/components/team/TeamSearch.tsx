import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import UserSearchPanel from '@/components/team/UserSearchPanel';
import TeamMemberSearchPanel from '@/components/team/TeamMemberSearchPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TeamMember } from '@/services/teamService';

interface TeamSearchProps {
  selectedResource: string | null;
  selectedReport: string | null;
  onResourceChange: (resourceId: string | null) => void;
  onReportChange: (reportId: string | null) => void;
}

const TeamSearch = ({
  selectedResource,
  selectedReport,
  onResourceChange,
  onReportChange
}: TeamSearchProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const handleTeamMembersUpdate = (members: TeamMember[]) => {
    setTeamMembers(members);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Panel de búsqueda de usuarios */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Buscar Usuarios Disponibles
          </Typography>
          <UserSearchPanel 
            resourceId={selectedResource}
            reportId={selectedReport}
            teamMembers={teamMembers}
          />
        </Paper>

        {/* Panel de búsqueda de miembros del equipo */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Miembros del Equipo
          </Typography>
          <TeamMemberSearchPanel 
            resourceId={selectedResource}
            reportId={selectedReport}
            onResourceChange={onResourceChange}
            onReportChange={onReportChange}
            onTeamMembersUpdate={handleTeamMembersUpdate}
          />
        </Paper>
      </Box>
    </DndProvider>
  );
};

export default TeamSearch;

