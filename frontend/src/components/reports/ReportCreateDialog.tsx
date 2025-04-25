import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { SustainabilityReport } from '@/services/reportServices';
import { Resource, resourceService } from '@/services/resourceService';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

interface ReportCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onReportCreated: (report: SustainabilityReport) => void;
  token: string;
}

export const ReportCreateDialog: React.FC<ReportCreateDialogProps> = ({
  open,
  onClose,
  onReportCreated,
  token,
}) => {
  const [formData, setFormData] = useState({
    heritage_resource_id: null as number | null,
    year: new Date().getFullYear(),
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (open) {
        setLoadingResources(true);
        try {
          const response = await resourceService.searchResources({
            page: 1,
            per_page: 1000
          }, token);
          setResources(response.items);
        } catch (err) {
          setError('Error al cargar los recursos patrimoniales');
        } finally {
          setLoadingResources(false);
        }
      }
    };

    fetchResources();
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.heritage_resource_id) {
      setError('Debes seleccionar un recurso patrimonial');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          heritage_resource_id: formData.heritage_resource_id,
          year: formData.year,
          state: 'Draft'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la memoria');
      }

      const newReport = await response.json();
      onReportCreated(newReport);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al crear la memoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nueva Memoria de Sostenibilidad</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={resources}
              getOptionLabel={(option: Resource) => option.name}
              loading={loadingResources}
              value={selectedResource}
              onChange={(_: React.SyntheticEvent, newValue: Resource | null) => {
                setSelectedResource(newValue);
                setFormData(prev => ({
                  ...prev,
                  heritage_resource_id: newValue?.id || null
                }));
              }}
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                  {...params}
                  label="Recurso Patrimonial"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingResources ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Año"
              type="number"
              value={formData.year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                ...prev,
                year: parseInt(e.target.value)
              }))}
              required
              fullWidth
              inputProps={{
                min: 2000,
                max: new Date().getFullYear()
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Memoria'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 