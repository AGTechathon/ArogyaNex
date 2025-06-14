const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbot.service');


router.get('/languages', (req, res) => {
  try {
    const languages = chatbotService.getSupportedLanguages();
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new chat session with language preference
router.post('/session', async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const { sessionId, language: selectedLanguage } = await chatbotService.createSession(language);
    res.status(201).json({ sessionId, language: selectedLanguage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { messages, language } = await chatbotService.getChatHistory(req.params.sessionId);
    res.json({ messages, language });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Send a message and get response
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ 
        error: 'Both sessionId and message are required' 
      });
    }

    const response = await chatbotService.processMessage(sessionId, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 