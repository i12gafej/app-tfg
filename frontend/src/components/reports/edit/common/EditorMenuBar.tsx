import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';


interface MenuBarProps {
  editor: any;
}

const EditorMenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const detectUrlInText = (text: string): string | null => {
    const urlPattern = /https?:\/\/[^\s]+/;
    const match = text.match(urlPattern);
    return match ? match[0] : null;
  };

  const handleLinkClick = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (selectedText) {
      
      const detectedUrl = detectUrlInText(selectedText);
      if (detectedUrl) {
        
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: detectedUrl })
          .run();
        return;
      }
    }

    
    setLinkUrl('');
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      try {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl })
          .run();
      } catch (e) {
        console.error('Error al establecer el enlace:', e);
      }
    }
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        p: 1, 
        backgroundColor: '#f5f5f5',
        borderRadius: '4px 4px 0 0',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Título (H1)">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
            >
              <TitleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Subtítulo (H2)">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
            >
              <SubtitlesIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Párrafo">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setParagraph().run()}
              color={editor.isActive('paragraph') ? 'primary' : 'default'}
            >
              <TextFieldsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Negrita">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cursiva">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Subrayado">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              color={editor.isActive('underline') ? 'primary' : 'default'}
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Lista con viñetas">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista numerada">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cita">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuoteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Añadir enlace">
            <IconButton
              size="small"
              onClick={handleLinkClick}
              color={editor.isActive('link') ? 'primary' : 'default'}
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar enlace">
            <IconButton
              size="small"
              onClick={removeLink}
              disabled={!editor.isActive('link')}
              color="error"
            >
              <LinkOffIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Dialog open={isLinkDialogOpen} onClose={() => setIsLinkDialogOpen(false)}>
        <DialogTitle>Añadir enlace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL del enlace"
            type="url"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
        </DialogContent>
        <DialogActions>
          {editor.isActive('link') && (
            <Button onClick={removeLink} color="error">
              Eliminar enlace
            </Button>
          )}
          <Button onClick={() => setIsLinkDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleLinkSubmit} color="primary">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        .ProseMirror a {
          color: #1976d2;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1565c0;
        }
      `}</style>
    </>
  );
};

export default EditorMenuBar; 