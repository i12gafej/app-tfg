import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import { useReport } from '@/context/ReportContext';
import { reportService } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';

type TextField = {
  id: string;
  label: string;
  field: keyof typeof TEXT_FIELDS;
};

const TEXT_FIELDS = {
  stakeholders_text: 'Grupos de interés',
  materiality_text: 'Asuntos de materialidad',
  main_secondary_impacts_text: 'Impactos principales y secundarios',
  materiality_matrix_text: 'Matriz de materialidad',
  action_plan_text: 'Plan de acción',
  internal_coherence_text: 'Coherencia con la visión, misión y valores'
} as const;

const TEXT_OPTIONS: TextField[] = Object.entries(TEXT_FIELDS).map(([id, label]) => ({
  id,
  label,
  field: id as keyof typeof TEXT_FIELDS
}));

const ReportTexts = () => {
  const { report, updateReport, loading: reportLoading, readOnly } = useReport();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<TextField>(TEXT_OPTIONS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: report?.[selectedField.field] || `<p>Escribe aquí el texto de ${selectedField.label.toLowerCase()}...</p>`,
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && report?.[selectedField.field]) {
      editor.commands.setContent(report[selectedField.field] || '');
    }
  }, [report, selectedField, editor]);

  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        setSuccessMessage(null);
        setError(null);
      });
    }
  }, [editor]);

  const handleFieldChange = (event: any) => {
    const newField = TEXT_OPTIONS.find(option => option.id === event.target.value);
    if (newField) {
      setSelectedField(newField);
      setSuccessMessage(null);
      setError(null);
      if (editor) {
        const newContent = report?.[newField.field] || `<p>Escribe aquí el texto de ${newField.label.toLowerCase()}...</p>`;
        editor.commands.setContent(newContent);
      }
    }
  };

  const handleSubmit = async () => {
    if (!editor || !report || !token) {
      return;
    }
    
    try {
      setError(null);
      setSuccessMessage(null);
      setIsSaving(true);

      const content = editor.getHTML();
      
      await updateReport(selectedField.field, content);
      
      setSuccessMessage('Texto guardado correctamente');
    } catch (err) {
      console.error('Error al guardar el texto:', err);
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6">
          Textos de la Memoria
        </Typography>
        {!readOnly && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log('Botón de guardar clickeado');
            handleSubmit();
          }}
          disabled={reportLoading || isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
        )}
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="text-field-select-label">Seleccionar texto</InputLabel>
        <Select
          labelId="text-field-select-label"
          id="text-field-select"
          value={selectedField.id}
          label="Seleccionar texto"
          onChange={handleFieldChange}
        >
          {TEXT_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {readOnly ? (
        <Box 
          sx={{ 
            p: 3,
            border: '1px solid #ccc',
            borderRadius: '4px',
            minHeight: '200px',
            '& p': { m: 0 },
            '& ul, & ol': { pl: 3 },
            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 }
          }}
          dangerouslySetInnerHTML={{ __html: report?.[selectedField.field] || '' }}
        />
      ) : (
      <Box sx={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <EditorMenuBar editor={editor} />
        <Box sx={{ 
          padding: '1rem',
          minHeight: '200px',
          '& .ProseMirror': {
            outline: 'none',
            height: '100%'
          }
        }}>
          <EditorContent editor={editor} />
        </Box>
      </Box>
      )}
    </Box>
  );
};

export default ReportTexts; 