import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import Link from '@tiptap/extension-link'
import { useReport } from '@/context/ReportContext';

const CommitmentLetter = () => {
  const { report, updateReport, loading: reportLoading, readOnly } = useReport();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link
    ],
    content: report?.commitment_letter || '<p>Escribe aquí la carta de compromiso...</p>',
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && report?.commitment_letter) {
      editor.commands.setContent(report.commitment_letter);
    }
  }, [report?.commitment_letter, editor]);

  const handleSubmit = async () => {
    if (!editor) return;
    
    try {
      setError(null);
      setSuccessMessage(null);

      const content = editor.getHTML();
      await updateReport('commitment_letter', content);
      setSuccessMessage('Carta de compromiso guardada correctamente');
    } catch (err) {
      console.error('Error al guardar la carta de compromiso:', err);
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
          Carta de Compromiso
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
          dangerouslySetInnerHTML={{ __html: report?.commitment_letter || '' }}
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

export default CommitmentLetter; 