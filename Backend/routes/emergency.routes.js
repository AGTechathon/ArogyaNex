const express = require('express');
const router = express.Router();
const emergencyService = require('../services/emergency.service');

router.get('/test-connection', async (req, res) => {
  try {
    const results = await emergencyService.testServiceConnection();
    const status = results.sendgrid.status === 'connected' || results.twilio.status === 'connected' ? 200 : 503;
    
    res.status(status).json({
      message: 'Service connection test completed',
      results,
      timestamp: new Date().toISOString(),
      alertServicesAvailable: results.sendgrid.status === 'connected' || results.twilio.status === 'connected'
    });
  } catch (error) {
    console.error('Error testing service connections:', error);
    res.status(500).json({
      error: 'Failed to test service connections',
      details: error.message
    });
  }
});

router.post('/alert', async (req, res) => {
  try {
    const { latitude, longitude, emergencyContacts } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required.',
        details: 'Please provide valid coordinates for the emergency location.'
      });
    }

    if (!emergencyContacts || !Array.isArray(emergencyContacts) || emergencyContacts.length === 0) {
      return res.status(400).json({ 
        error: 'At least one emergency contact is required.',
        details: 'Please provide an array of emergency contacts with at least one contact.'
      });
    }

    const invalidContacts = emergencyContacts.filter(contact => 
      !contact.email && !contact.phone
    );
    if (invalidContacts.length > 0) {
      return res.status(400).json({
        error: 'Invalid emergency contacts.',
        details: 'Each contact must have at least one contact method (email or phone).',
        invalidContacts: invalidContacts.map(c => c.name)
      });
    }

    const result = await emergencyService.handleEmergencyAlert(latitude, longitude, emergencyContacts);

    if (result.alerts.mode === 'simulation') {
      return res.status(200).json({
        ...result,
        warning: 'Running in simulation mode - no real alerts were sent. Configure SendGrid or Twilio to send real alerts.'
      });
    }

    const anyAlertsSent = result.alerts.results.some(alert => alert.success);
    if (!anyAlertsSent) {
      return res.status(503).json({
        ...result,
        error: 'No alerts could be sent through any available method',
        details: 'Please check your SendGrid and Twilio configurations.',
        services: result.alerts.services
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error handling emergency alert:', error);
    

    if (error.message.includes('Failed to find nearby hospitals')) {
      return res.status(404).json({
        error: 'No hospitals found in the area',
        details: error.message,
        coordinates: { latitude: req.body.latitude, longitude: req.body.longitude }
      });
    }

    res.status(500).json({ 
      error: 'Failed to process emergency alert',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 