import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Alert,
  Button
} from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/context/auth.context';
import { teamService, TeamMember } from '@/services/teamService';
import UserSearchPanel from '@/components/team/UserSearchPanel';
import TeamMemberSearchPanel from '@/components/team/TeamMemberSearchPanel';
import TeamMemberCreateDialog from '@/components/team/TeamMemberCreateDialog';

const SustainabilityTeam = () => {
  const { report, readOnly } = useReport();
  const { token } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  
  const loadTeamMembers = useCallback(async () => {
    if (!report?.id || !token) return;
    
    try {
      const members = await teamService.getTeamMembers(report.id.toString(), token);
      setTeamMembers(members);
    } catch (err) {
      console.error('Error al cargar los miembros del equipo:', err);
      setError('Error al cargar los miembros del equipo. Por favor, recarga la página.');
    }
  }, [report?.id, token]);

  
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleTeamMembersUpdate = useCallback((members: TeamMember[]) => {
    setTeamMembers(members);
  }, []);

  const handleUpdate = useCallback(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  if (!report) {
    return (
      <Alert severity="warning">
        No hay una memoria seleccionada
      </Alert>
    );
  }

  
  if (readOnly) {
    return (
      <DndProvider backend={HTML5Backend}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Miembros del Equipo
          </Typography>
          <TeamMemberSearchPanel 
            resourceId={report.heritage_resource_id.toString()}
            reportId={report.id.toString()}
            onResourceChange={() => {}}
            onReportChange={() => {}}
            onTeamMembersUpdate={handleTeamMembersUpdate}
            fixedResource={{
              id: report.heritage_resource_id,
              name: report.heritage_resource_name || ''
            }}
            fixedReport={{
              id: report.id,
              year: report.year,
              heritage_resource_id: report.heritage_resource_id
            }}
            onUpdate={handleUpdate}
            readOnly={true}
          />
        </Paper>
      </DndProvider>
    );
  }

  
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Panel de búsqueda de usuarios */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Buscar Usuarios Disponibles
          </Typography>
          <UserSearchPanel 
            resourceId={report.heritage_resource_id.toString()}
            reportId={report.id.toString()}
            teamMembers={teamMembers}
          />
        </Paper>

        {/* Panel de miembros del equipo */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Miembros del Equipo
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Crear Miembro
            </Button>
          </Box>
          <TeamMemberSearchPanel 
            resourceId={report.heritage_resource_id.toString()}
            reportId={report.id.toString()}
            onResourceChange={() => {}}
            onReportChange={() => {}}
            onTeamMembersUpdate={handleTeamMembersUpdate}
            fixedResource={{
              id: report.heritage_resource_id,
              name: report.heritage_resource_name || ''
            }}
            fixedReport={{
              id: report.id,
              year: report.year,
              heritage_resource_id: report.heritage_resource_id
            }}
            onUpdate={handleUpdate}
            readOnly={false}
          />
        </Paper>
      </Box>

      {/* Diálogo de creación de miembro */}
      {report && (
        <TeamMemberCreateDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          resourceId={report.heritage_resource_id.toString()}
          reportId={report.id.toString()}
          onCreate={() => {
            setIsCreateDialogOpen(false);
            
            const event = new Event('teamMemberCreated');
            window.dispatchEvent(event);
          }}
        />
      )}
    </DndProvider>
  );
};

export default SustainabilityTeam; 