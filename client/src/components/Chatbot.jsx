import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { format } from 'date-fns';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      try {
        const response = await axios.get('/api/chatbot/languages');
        const fetchedLanguages = Object.entries(response.data.languages).map(([code, name]) => ({
          code,
          name
        }));
        setSupportedLanguages(fetchedLanguages);
      } catch (error) {
        console.error('Error fetching supported languages:', error);
      }
    };

    fetchSupportedLanguages();
  }, []);

  useEffect(() => {
    if (supportedLanguages.length > 0) {
      createNewSession();
    }
  }, [language, supportedLanguages]);

  const createNewSession = async () => {
    try {
      const response = await axios.post('/api/chatbot/session', { language });
      setSessionId(response.data.sessionId);
      setMessages([{
        type: 'bot',
        content: response.data.greeting,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error creating session:', error);
      setMessages([{
        type: 'error',
        content: 'Failed to start chat session. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await axios.post('/api/chatbot/message', {
        sessionId,
        message: userMessage
      });

      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div>
      <Box sx={{ 
      maxWidth: 800, 
      width: '100%',
      height: '100vh',
      mx: 'auto',
      p: 2, 
      display: 'flex', 
      flexDirection: 'column',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TranslateIcon color="primary" />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={handleLanguageChange}
            >
              {supportedLanguages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            mb: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{
            p: 2,
            overflowY: 'auto',
            flex: 1,
            bgcolor: '#f5f5f5'
          }}>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                      gap: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main' }}>
                        {message.type === 'user' ? <UserIcon /> : <BotIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: message.type === 'user' ? 'primary.light' : 'white',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                        {format(message.timestamp, 'HH:mm')}
                      </Typography>
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              size="small"
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={isLoading || !input.trim()}
              sx={{ minWidth: 48 }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default Chatbot; 