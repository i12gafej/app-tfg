import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import { useReport } from '@/context/ReportContext';
import Link from '@tiptap/extension-link'

const RoadmapDescription = () => {
  const { report, updateReport, loading: reportLoading, readOnly } = useReport();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link
    ],
    content: report?.roadmap_description || '<p>Escribe aquí la descripción de la hoja de ruta y sus objetivos principales...</p>',
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && report?.roadmap_description) {
      editor.commands.setContent(report.roadmap_description);
    }
  }, [report?.roadmap_description, editor]);

  const handleSubmit = async () => {
    if (!editor) return;
    
    try {
      setError(null);
      setSuccessMessage(null);

      const content = editor.getHTML();
      await updateReport('roadmap_description', content);
      setSuccessMessage('Descripción de la hoja de ruta guardada correctamente');
    } catch (err) {
      console.error('Error al guardar la descripción de la hoja de ruta:', err);
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
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
          Descripción de la Hoja de Ruta
        </Typography>
        {!readOnly && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={reportLoading}
          >
            {reportLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </Box>

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

      <Box sx={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {!readOnly && <EditorMenuBar editor={editor} />}
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
    </Box>
  );
};

export default RoadmapDescription; 