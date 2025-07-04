import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
import Link from '@tiptap/extension-link'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/context/auth.context';
import { reportService } from '@/services/reportServices';

const OrganizationChart = () => {
  const { report, readOnly, updateReport } = useReport();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orgChartUrl, setOrgChartUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link
    ],
    content: report?.org_chart_text || '',
    editable: !readOnly,
    onUpdate: () => {
      setIsEditing(true);
    },
  });

  useEffect(() => {
    if (report?.id && token) {
      loadOrganizationChart();
    }
  }, [report?.id, token]);

  useEffect(() => {
    if (editor && report?.org_chart_text) {
      editor.commands.setContent(report.org_chart_text);
    }
  }, [editor, report?.org_chart_text]);

  const loadOrganizationChart = async () => {
    if (!report?.id || !token) return;
    
    try {
      const url = await reportService.getOrganizationChart(report.id, token, Date.now());
      if (orgChartUrl) {
        URL.revokeObjectURL(orgChartUrl);
      }
      setOrgChartUrl(url);
    } catch (error: any) {
      
      if (error.response?.status !== 404) {
        console.error('Error al cargar el organigrama:', error);
      }
      setOrgChartUrl(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !report?.id || !token) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      await reportService.updateOrganizationChart(report.id, file, token);
      await loadOrganizationChart(); 
      setSuccessMessage('Organigrama subido correctamente');
    } catch (err: any) {
      console.error('Error al subir el organigrama:', err);
      if (err.response?.status === 413) {
        setError('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      } else {
        setError('Error al subir el organigrama. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveText = async () => {
    if (!report?.id || !token || !editor) return;

    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);
      const content = editor.getHTML();
      await updateReport('org_chart_text', content);
      setSuccessMessage('Texto del organigrama guardado correctamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar el texto del organigrama:', err);
      setError('Error al guardar el texto del organigrama');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Organigrama
      </Typography>

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

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          {!readOnly && <EditorMenuBar editor={editor} />}
          <Box sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            minHeight: '200px',
            '& .ProseMirror': {
              minHeight: '150px',
              outline: 'none',
            }
          }}>
            <EditorContent editor={editor} />
          </Box>
          {!readOnly && isEditing && (
            <Button
              variant="contained"
              onClick={handleSaveText}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? 'Guardando...' : 'Guardar Texto'}
            </Button>
          )}
        </Box>

        {!readOnly && (
          <Box sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              type="file"
              onChange={handleFileUpload}
            />
            <Button 
              variant="contained" 
              component="span"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? 'Subiendo...' : 'Subir Organigrama'}
            </Button>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {!loading && orgChartUrl ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }}>
            <img src={orgChartUrl} alt="Organigrama" />
          </Box>
        ) : !loading && (
          <Typography variant="body1" color="text.secondary" align="center">
            No hay organigrama subido
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default OrganizationChart; 