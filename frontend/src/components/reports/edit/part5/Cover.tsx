import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton, Grid } from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/context/auth.context';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';
import { reportService, ReportLogo } from '@/services/reportServices';

const Cover = () => {
  const { report, updateFullReport, readOnly } = useReport();
  const { token } = useAuth();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logos, setLogos] = useState<ReportLogo[]>([]);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (report?.id && token) {
      loadLogos();
      loadCoverPhoto();
    }
  }, [report?.id, token]);

  const loadCoverPhoto = async () => {
    if (!report?.id || !token) return;
    try {
      const url = await reportService.getCoverPhoto(report.id, token, Date.now());
      if (coverPhotoUrl) {
        URL.revokeObjectURL(coverPhotoUrl);
      }
      setCoverPhotoUrl(url);
    } catch (error) {
      setCoverPhotoUrl(null);
    }
  };

  const loadLogos = async () => {
    if (!report?.id || !token) return;
    
    try {
      const reportLogos = await reportService.getReportLogos(report.id, token);
      setLogos(reportLogos);
    } catch (error) {
      console.error('Error al cargar los logos:', error);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !report?.id || !token) return;

    try {
      await reportService.updateCoverPhoto(report.id, file, token);
      await loadCoverPhoto();
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !report?.id || !token) return;

    try {
      await reportService.uploadLogo(report.id, file, token);
      await loadLogos();
    } catch (error) {
      console.error('Error al subir el logo:', error);
    }
  };

  const handleDeleteLogo = async (logoId: number) => {
    if (!token) return;
    
    try {
      await reportService.deleteLogo(logoId, token);
      setLogos(logos.filter(logo => logo.id !== logoId));
    } catch (error) {
      console.error('Error al eliminar el logo:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Sección de Portada */}
      <Typography variant="h5" gutterBottom>
        Portada de la Memoria
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        {!readOnly && (
          <>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => coverInputRef.current?.click()}
            >
              Subir fotografía
            </Button>
          </>
        )}
      </Box>

      {coverPhotoUrl && (
        <Box sx={{ mt: 3, maxWidth: '500px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Vista previa de la portada:
          </Typography>
          <img 
            src={coverPhotoUrl}
            alt="Vista previa de la portada" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}

      {/* Sección de Logos */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Logos de la Memoria
        </Typography>

        {!readOnly && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => logoInputRef.current?.click()}
            >
              Añadir logo
            </Button>
          </Box>
        )}

        <Grid container spacing={2}>
          {logos.map((logo) => (
            <Grid item xs={12} sm={6} md={4} key={logo.id}>
              <Box
                sx={{
                  position: 'relative',
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  '&:hover': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <img
                  src={logo.logo}
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '150px',
                    objectFit: 'contain'
                  }}
                />
                {!readOnly && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white'
                      }
                    }}
                    onClick={() => handleDeleteLogo(logo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
 
export default Cover; 