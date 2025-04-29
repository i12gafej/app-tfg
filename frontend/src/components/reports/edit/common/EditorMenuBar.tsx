import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import TextFieldsIcon from '@mui/icons-material/TextFields';

interface MenuBarProps {
  editor: any;
}

const EditorMenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
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
    </Box>
  );
};

export default EditorMenuBar; 