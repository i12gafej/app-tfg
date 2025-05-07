import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip
} from '@mui/material';
import { MaterialTopic } from '@/services/materialTopicService';

interface MaterialTopicDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  materialTopic: MaterialTopic;
  onEdit?: () => void;
}

export const MaterialTopicDetailsDialog: React.FC<MaterialTopicDetailsDialogProps> = ({
  open,
  onClose,
  materialTopic,
  onEdit
}) => {
  const handleEdit = () => {
    if (onEdit) {
    onClose();
    onEdit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Detalles del Asunto de Materialidad
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {materialTopic.name}
            </Typography>
          </Grid>

          {materialTopic.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1">
                {materialTopic.description}
              </Typography>
            </Grid>
          )}

          {materialTopic.priority && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Prioridad
              </Typography>
              <Chip 
                label={materialTopic.priority === 'high' ? 'Alta' : 
                       materialTopic.priority === 'medium' ? 'Media' : 'Baja'}
                color={materialTopic.priority === 'high' ? 'error' : 
                       materialTopic.priority === 'medium' ? 'warning' : 'success'}
              />
            </Grid>
          )}

          {materialTopic.main_objective && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Objetivo Principal
              </Typography>
              <Typography variant="body1">
                {materialTopic.main_objective}
              </Typography>
            </Grid>
          )}

          {(materialTopic.goal_ods_id || materialTopic.goal_number) && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                ODS
              </Typography>
              <Typography variant="body1">
                {materialTopic.goal_ods_id && materialTopic.goal_number 
                  ? `${materialTopic.goal_ods_id}.${materialTopic.goal_number}`
                  : '-'}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {onEdit && (
        <Button 
          onClick={handleEdit}
          variant="contained"
          color="primary"
        >
          Editar
        </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};


