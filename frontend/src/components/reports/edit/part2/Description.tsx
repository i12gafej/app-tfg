import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import Link from '@tiptap/extension-link'
import { useReport } from '@/context/ReportContext';

const Description = () => {
  const { report, updateReport, loading: reportLoading } = useReport();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link
    ],
    content: report?.diagnosis_description || '<p>Escribe aquí la descripción del diagnóstico...</p>',
  });

  useEffect(() => {
    if (editor && report?.diagnosis_description) {
      editor.commands.setContent(report.diagnosis_description);
    }
  }, [report?.diagnosis_description, editor]);

  const handleSubmit = async () => {
    if (!editor) return;
    
    try {
      setError(null);
      setSuccessMessage(null);

      const content = editor.getHTML();
      await updateReport('diagnosis_description', content);
      setSuccessMessage('Descripción guardada correctamente');
    } catch (err) {
      console.error('Error al guardar la descripción:', err);
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
          Descripción del Diagnóstico
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={reportLoading}
        >
          {reportLoading ? 'Guardando...' : 'Guardar'}
        </Button>
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
    </Box>
  );
};

export default Description; 