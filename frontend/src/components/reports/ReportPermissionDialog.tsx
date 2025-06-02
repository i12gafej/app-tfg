import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
  FormControlLabel
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { reportService, SustainabilityReport } from '@/services/reportServices';

// Estructura de partes y apartados con rangos de bits
const PARTS = [
  {
    name: 'Paso 1',
    start: 0,
    end: 4,
    sections: [
      'Misión',
      'Visión',
      'Valores',
      'Normativa',
      'Equipo de sostenibilidad'
    ]
  },
  {
    name: 'Paso 2',
    start: 5,
    end: 12,
    sections: [
      'Grupos de Interés',
      'Asuntos de Materialidad',
      'Encuestas',
      'Impactos principales y Secundarios ODS',
      'Gráficos Impactos ODS',
      'Matriz de materialidad',
      'Validación de Asuntos de Materialidad',
      'Indicadores'
    ]
  },
  {
    name: 'Paso 3',
    start: 13,
    end: 18,
    sections: [
      'Texto de introducción del Plan de acción',
      'Objetivos de los Asuntos de Materialidad',
      'Objetivos de la Acción',
      'Impactos de las acciones',
      'Coherencia Interna',
      'Gráfico Coherencia Interna'
    ]
  },
  {
    name: 'Paso 4',
    start: 19,
    end: 20,
    sections: [
      'Responsables de las acciones',
      'Plantilla de seguimiento'
    ]
  },
  {
    name: 'Paso 5',
    start: 21,
    end: 30,
    sections: [
      'Portada',
      'Carta de compromiso',
      'Organigrama',
      'Descripción de Diagnóstico',
      'Descripción de la Hoja de Ruta',
      'Colaboraciones',
      'Bibliografía',
      'Galería',
      'Difusión',
      'Textos de la Memoria',
    ]
  }
];

function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

function boolArrayToDecimal(arr: boolean[]): number {
  return parseInt(arr.map(x => (x ? '1' : '0')).join(''), 2);
}

interface ReportPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  report: SustainabilityReport;
  token: string;
  onPermissionsUpdated?: (newPermissions: number) => void;
}

export const ReportPermissionDialog: React.FC<ReportPermissionDialogProps> = ({ open, onClose, report, token, onPermissionsUpdated }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<boolean[]>(Array(31).fill(false));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report && typeof report.permissions === 'number') {
      setPermissions(decimalToBoolArray(report.permissions, 31));
    } else {
      setPermissions(Array(31).fill(false));
    }
  }, [report]);

  const handleExpand = (idx: number) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handlePartCheck = (partIdx: number) => {
    const part = PARTS[partIdx];
    const checked = isPartChecked(partIdx);
    const newPermissions = [...permissions];
    for (let i = part.start; i <= part.end; i++) {
      newPermissions[i] = !checked;
    }
    setPermissions(newPermissions);
  };

  const handleSectionCheck = (partIdx: number, sectionIdx: number) => {
    const part = PARTS[partIdx];
    const idx = part.start + sectionIdx;
    const newPermissions = [...permissions];
    newPermissions[idx] = !newPermissions[idx];
    setPermissions(newPermissions);
  };

  const isPartChecked = (partIdx: number) => {
    const part = PARTS[partIdx];
    return permissions.slice(part.start, part.end + 1).every(Boolean);
  };

  const isPartIndeterminate = (partIdx: number) => {
    const part = PARTS[partIdx];
    const slice = permissions.slice(part.start, part.end + 1);
    return slice.some(Boolean) && !slice.every(Boolean);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newDecimal = boolArrayToDecimal(permissions);
      await reportService.updateReport(report.id, { permissions: newDecimal }, token);
      if (report && typeof report === 'object') {
        report.permissions = newDecimal;
      }
      if (onPermissionsUpdated) onPermissionsUpdated(newDecimal);
      onClose();
    } catch (e) {
      alert('Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Visibilidad a asesor externo</DialogTitle>
      <DialogContent>
        <List>
          {PARTS.map((part, partIdx) => (
            <React.Fragment key={part.name}>
              <ListItem button onClick={() => handleExpand(partIdx)}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPartChecked(partIdx)}
                      indeterminate={isPartIndeterminate(partIdx)}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handlePartCheck(partIdx); }}
                    />
                  }
                  label={part.name}
                />
                {expanded === partIdx ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={expanded === partIdx} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {part.sections.map((section, sectionIdx) => (
                    <ListItem key={section} sx={{ pl: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permissions[part.start + sectionIdx]}
                            onChange={() => handleSectionCheck(partIdx, sectionIdx)}
                          />
                        }
                        label={section}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};
