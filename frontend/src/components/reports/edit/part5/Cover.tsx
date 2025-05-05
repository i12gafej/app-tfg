import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton, Grid } from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/hooks/useAuth';
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
      const url = await reportService.getCoverPhoto(report.id, token);
      setCoverPhotoUrl(url);
    } catch (error) {
      console.error('Error al cargar la foto de portada:', error);
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
      const url = await reportService.updateCoverPhoto(report.id, file, token);
      await updateFullReport({ cover_photo: url });
      await loadCoverPhoto(); // Recargar la imagen después de subirla
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

  const handlePreview = () => {
    if (!coverPhotoUrl || !report) return;

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Portada - ${report.heritage_resource_name}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
              position: relative;
              overflow: hidden;
              background-color: #f0f0f0;
            }
            .page-container {
              width: 210mm;
              height: 297mm;
              position: relative;
              margin: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
              background-color: white;
            }
            .cover-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
            }
            .content {
              position: relative;
              z-index: 2;
              text-align: center;
              color: white;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
              padding: 20px;
              background-color: rgba(0, 0, 0, 0.3);
              border-radius: 10px;
              max-width: 80%;
              margin: 0 auto;
              top: 50%;
              transform: translateY(-50%);
            }
            .content h1 {
              font-size: 2.5em;
              margin-bottom: 0.5em;
            }
            .content h2 {
              font-size: 1.8em;
              margin-top: 0;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              opacity: 0.2;
              color: white;
              z-index: 3;
              pointer-events: none;
              user-select: none;
            }
            @media print {
              body {
                background-color: white;
              }
              .page-container {
                margin: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <img src="${coverPhotoUrl}" class="cover-image" alt="Portada">
            <div class="content">
              <h1>${report.heritage_resource_name}</h1>
              <h2>Memoria de Sostenibilidad ${report.year}</h2>
            </div>
            <div class="watermark">PORTADA</div>
          </div>
        </body>
      </html>
    `;

    previewWindow.document.write(html);
    previewWindow.document.close();
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
        {coverPhotoUrl && (
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Previsualizar portada
          </Button>
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