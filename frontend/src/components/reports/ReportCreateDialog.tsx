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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { SustainabilityReport, ReportListItem, reportService } from '@/services/reportServices';
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
  const [observation, setObservation] = useState('');
  const [creationType, setCreationType] = useState<'new' | 'template' | 'previous'>('new');
  const [templates, setTemplates] = useState<ReportListItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportListItem | null>(null);
  const [previousReports, setPreviousReports] = useState<ReportListItem[]>([]);
  const [selectedPreviousReport, setSelectedPreviousReport] = useState<ReportListItem | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingPreviousReports, setLoadingPreviousReports] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (open) {
        setLoadingResources(true);
        try {
          const response = await resourceService.getAllResources(token);
          setResources(response);
        } catch (err) {
          setError('Error al cargar los recursos patrimoniales');
        } finally {
          setLoadingResources(false);
        }
      }
    };

    fetchResources();
  }, [open, token]);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (open && creationType === 'template') {
        setLoadingTemplates(true);
        try {
          const response = await reportService.getAllReportTemplates(token);
          setTemplates(response.items);
        } catch (err) {
          setError('Error al cargar las plantillas');
        } finally {
          setLoadingTemplates(false);
        }
      }
    };

    fetchTemplates();
  }, [open, token, creationType]);

  useEffect(() => {
    const fetchPreviousReports = async () => {
      if (open && creationType === 'previous' && selectedResource) {
        setLoadingPreviousReports(true);
        try {
          const reports = await resourceService.getAllReportsByResource(selectedResource.id.toString(), token);
          setPreviousReports(reports.map(report => ({
            resource_id: report.heritage_resource_id,
            resource_name: selectedResource.name,
            report_id: report.id,
            year: report.year
          })));
        } catch (err) {
          setError('Error al cargar las memorias anteriores');
        } finally {
          setLoadingPreviousReports(false);
        }
      }
    };

    fetchPreviousReports();
  }, [open, token, creationType, selectedResource]);

  useEffect(() => {
    if (!open) {
      setFormData({
        heritage_resource_id: null,
        year: new Date().getFullYear(),
      });
      setSelectedResource(null);
      setObservation('');
      setError(null);
      setCreationType('new');
      setSelectedTemplate(null);
      setSelectedPreviousReport(null);
    }
  }, [open]);

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
      let reportData: any = {
        heritage_resource_id: formData.heritage_resource_id,
        year: formData.year,
        state: 'Draft',
        observation: observation
      };

      if (creationType === 'template' && selectedTemplate) {
        reportData.template_report_id = selectedTemplate.report_id;
      } else if (creationType === 'previous' && selectedPreviousReport) {
        reportData.template_report_id = selectedPreviousReport.report_id;
      }

      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la memoria');
      }

      const newReport = await response.json();
      onReportCreated(newReport);
      setFormData({
        heritage_resource_id: null,
        year: new Date().getFullYear(),
      });
      setSelectedResource(null);
      setObservation('');
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
            />
            <FormControl component="fieldset">
              <Typography variant="subtitle1" gutterBottom>
                ¿Cómo quieres crear la memoria?
              </Typography>
              <RadioGroup
                value={creationType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreationType(e.target.value as 'new' | 'template' | 'previous')}
              >
                <FormControlLabel value="new" control={<Radio />} label="Empezar de cero" />
                <FormControlLabel value="template" control={<Radio />} label="Usar una plantilla" />
                <FormControlLabel value="previous" control={<Radio />} label="Basarse en una memoria anterior" />
              </RadioGroup>
            </FormControl>

            {creationType === 'template' && (
              <Autocomplete
                options={templates}
                getOptionLabel={(option: ReportListItem) => `${option.resource_name} (${option.year})`}
                loading={loadingTemplates}
                value={selectedTemplate}
                onChange={(_: React.SyntheticEvent, newValue: ReportListItem | null) => {
                  setSelectedTemplate(newValue);
                }}
                noOptionsText="Sin plantillas disponibles"
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    {...params}
                    label="Seleccionar plantilla"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTemplates ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}

            {creationType === 'previous' && selectedResource && (
              <Autocomplete
                options={previousReports}
                getOptionLabel={(option: ReportListItem) => `Año ${option.year}`}
                loading={loadingPreviousReports}
                value={selectedPreviousReport}
                onChange={(_: React.SyntheticEvent, newValue: ReportListItem | null) => {
                  setSelectedPreviousReport(newValue);
                }}
                noOptionsText="Sin memorias anteriores disponibles"
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    {...params}
                    label="Seleccionar memoria anterior"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingPreviousReports ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}

            <TextField
              label="Observación"
              multiline
              minRows={3}
              value={observation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setObservation(e.target.value)}
              fullWidth
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