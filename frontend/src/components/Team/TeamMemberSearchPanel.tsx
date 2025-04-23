import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect } from 'react';
import { getResources, getReports, getTeamMembers, TeamMember, Resource, Report } from '@/services/teamService';
import TeamMemberList from '@/components/Team/TeamMemberList';
import TeamMemberCreateDialog from '@/components/Team/TeamMemberCreateDialog';

interface TeamMemberSearchPanelProps {
  resourceId: string | null;
  reportId: string | null;
  onResourceChange: (resourceId: string | null) => void;
  onReportChange: (reportId: string | null) => void;
}

interface Filters {
  name?: string;
  surname?: string;
  email?: string;
  role?: string;
  organization?: string;
}

const ROLES = [
  'Asesor Externo',
  'Consultor',
  'Gestor de Sostenibilidad'
];

const TeamMemberSearchPanel = ({ 
  resourceId, 
  reportId,
  onResourceChange,
  onReportChange 
}: TeamMemberSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingResources(true);
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.error('Error al cargar recursos:', error);
      } finally {
        setIsLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!resourceId) {
        setReports([]);
        return;
      }

      setIsLoadingReports(true);
      try {
        const data = await getReports(resourceId);
        setReports(data);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [resourceId]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!reportId) {
        setTeamMembers([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getTeamMembers(reportId);
        setTeamMembers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [reportId]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      member.name.toLowerCase().includes(searchLower) ||
      member.surname.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      member.organization.toLowerCase().includes(searchLower);

    const matchesFilters = 
      (!filters.name || member.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.surname || member.surname.toLowerCase().includes(filters.surname.toLowerCase())) &&
      (!filters.email || member.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.role || member.role === filters.role) &&
      (!filters.organization || member.organization.toLowerCase().includes(filters.organization.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Recurso Patrimonial</InputLabel>
          <Select
            value={resourceId || ''}
            label="Recurso Patrimonial"
            onChange={(e: SelectChangeEvent<string>) => onResourceChange(e.target.value || null)}
            disabled={isLoadingResources}
          >
            {isLoadingResources ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              resources.map((resource) => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Memoria de Sostenibilidad</InputLabel>
          <Select
            value={reportId || ''}
            label="Memoria de Sostenibilidad"
            onChange={(e: SelectChangeEvent<string>) => onReportChange(e.target.value || null)}
            disabled={!resourceId || isLoadingReports}
          >
            {isLoadingReports ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              reports.map((report) => (
                <MenuItem key={report.id} value={report.id}>
                  {report.year}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      <form onSubmit={handleSearch}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Buscar miembros del equipo"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            size="small"
          />
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </Box>
      </form>

      {showFilters && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Nombre"
                value={filters.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Apellidos"
                value={filters.surname || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('surname', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Correo"
                value={filters.email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('email', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={filters.role || ''}
                  label="Rol"
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => 
                    handleFilterChange('role', e.target.value as string)
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Organismo"
                value={filters.organization || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('organization', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      <TeamMemberList 
        teamMembers={filteredTeamMembers} 
        isLoading={isLoading}
        resourceId={resourceId}
        reportId={reportId}
      />

      {resourceId && reportId && (
        <TeamMemberCreateDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          resourceId={resourceId}
          reportId={reportId}
        />
      )}
    </Box>
  );
};

export default TeamMemberSearchPanel; 