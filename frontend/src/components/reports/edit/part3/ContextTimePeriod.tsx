import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import { useReport } from '@/context/ReportContext';

const ContextTimePeriod = () => {
  const { report, updateReport, loading: reportLoading } = useReport();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: report?.action_plan_description || '<p>Describe aquí el contexto y periodo temporal del plan de sostenibilidad...</p>',
  });

  useEffect(() => {
    if (editor && report?.action_plan_description) {
      editor.commands.setContent(report.action_plan_description);
    }
  }, [report?.action_plan_description, editor]);

  const handleSubmit = async () => {
    if (!editor) return;
    
    try {
      setError(null);
      setSuccessMessage(null);

      const content = editor.getHTML();
      await updateReport('action_plan_description', content);
      setSuccessMessage('Contexto y periodo temporal guardado correctamente');
    } catch (err) {
      console.error('Error al guardar el contexto y periodo temporal:', err);
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
        Contexto y periodo temporal
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

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Define el contexto y periodo temporal del plan de sostenibilidad. Incluye información relevante sobre el marco temporal
        y las circunstancias específicas que influyen en el plan.
      </Typography>
    </Box>
  );
};
 
export default ContextTimePeriod; 