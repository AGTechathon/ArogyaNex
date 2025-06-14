import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  Divider,
  Alert as MuiAlert,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';

const EmergencyAlert = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const res = await axios.get('/api/emergency/test-connection');
      setServiceStatus(res.data);
    } catch (err) {
      console.error('Error checking service status:', err);
      setServiceStatus({
        message: 'Failed to connect to emergency services'
      });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError(null);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Failed to retrieve location. Please enable location services.');
          setSnackbarOpen(true);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setSnackbarOpen(true);
    }
  };

  const addContact = () => {
    if (newContactName && (newContactPhone || newContactEmail)) {
      setEmergencyContacts([
        ...emergencyContacts,
        { 
          name: newContactName, 
          phone: newContactPhone, 
          email: newContactEmail,
          preferredMethod: newContactPhone ? 'sms' : 'email'
        },
      ]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactEmail('');
    } else {
      setError('Please enter at least a name and phone/email for the contact.');
      setSnackbarOpen(true);
    }
  };

  const removeContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const sendAlert = async () => {
    if (!latitude || !longitude) {
      setError('Please get your current location first.');
      setSnackbarOpen(true);
      return;
    }
    if (emergencyContacts.length === 0) {
      setError('Please add at least one emergency contact.');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post('/api/emergency/alert', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        emergencyContacts,
      });
      setResponse(res.data);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error sending emergency alert:', err);
      const errorMessage = err.response?.data?.error || 'Failed to send emergency alert.';
      const errorDetails = err.response?.data?.details || err.message;
      setError(`${errorMessage} ${errorDetails}`);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const renderServiceStatus = () => {
    if (!serviceStatus) return null;

    if (serviceStatus.error) {
      return (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {serviceStatus.message}
        </MuiAlert>
      );
    }

    const { results } = serviceStatus;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Service Status:</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={results.sendgrid.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
            label={`SendGrid: ${results.sendgrid.status}`}
            color={results.sendgrid.status === 'connected' ? 'success' : 'error'}
            size="small"
          />
          <Chip
            icon={results.twilio.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
            label={`Twilio: ${results.twilio.status}`}
            color={results.twilio.status === 'connected' ? 'success' : 'error'}
            size="small"
          />
          <Chip
            icon={results.openstreetmap.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
            label={`OpenStreetMap: ${results.openstreetmap.status}`}
            color={results.openstreetmap.status === 'connected' ? 'success' : 'error'}
            size="small"
          />
        </Box>
      </Box>
    );
  };

  const renderAlertResponse = () => {
    if (!response) return null;

    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2, bgcolor: response.alerts.mode === 'simulation' ? '#fff3e0' : '#e8f5e9' }}>
        <Typography variant="h6" gutterBottom>
          Alert Response
          {response.alerts.mode === 'simulation' && (
            <Chip
              icon={<WarningIcon />}
              label="Simulation Mode"
              color="warning"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        <Typography variant="body1" gutterBottom>
          Status: {response.message}
        </Typography>

        <Typography variant="body1" gutterBottom>
          Ambulance: {response.ambulance}
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Hospitals Nearby:
        </Typography>
        <List dense>
          {response.hospitalsNearBy.map((hospital, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={hospital.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {hospital.distance}
                    </Typography>
                    {` — ${hospital.address}`}
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      {hospital.emergency}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Alert Status:
        </Typography>
        <List dense>
          {response.alerts.results.map((alert, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={alert.contact}
                secondary={
                  <>
                    {alert.email && (
                      <Chip
                        size="small"
                        label={`Email: ${alert.email.success ? 'Sent' : 'Failed'}`}
                        color={alert.email.success ? 'success' : 'error'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    {alert.sms && (
                      <Chip
                        size="small"
                        label={`SMS: ${alert.sms.success ? 'Sent' : 'Failed'}`}
                        color={alert.sms.success ? 'success' : 'error'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    {alert.simulated && (
                      <Chip
                        size="small"
                        label="Simulated"
                        color="warning"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        {response.alerts.mode === 'simulation' && (
          <MuiAlert severity="warning" sx={{ mt: 2 }}>
            This is a simulation. No real alerts were sent. Configure SendGrid or Twilio to send real alerts.
          </MuiAlert>
        )}
      </Paper>
    );
  };

  return (
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
      transform: 'translate(-50%, -50%)',
      overflowY: 'auto'
    }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Emergency Alert System
      </Typography>

      {renderServiceStatus()}

      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Your Location</Typography>
        <TextField
          label="Latitude"
          value={latitude}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={getLocation} disabled={isLoading}>
                  <LocationOnIcon color="primary" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Longitude"
          value={longitude}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Emergency Contacts</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Phone (optional)"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Email (optional)"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            type="email"
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={addContact}
            startIcon={<AddIcon />}
            sx={{ flexShrink: 0 }}
          >
            Add
          </Button>
        </Box>
        {emergencyContacts.length > 0 && (
          <List dense>
            {emergencyContacts.map((contact, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => removeContact(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={contact.name}
                  secondary={
                    <>
                      {contact.phone && (
                        <Chip
                          size="small"
                          label={`Phone: ${contact.phone}`}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {contact.email && (
                        <Chip
                          size="small"
                          label={`Email: ${contact.email}`}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Button
        variant="contained"
        color="error"
        onClick={sendAlert}
        disabled={isLoading || !latitude || !longitude || emergencyContacts.length === 0}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        sx={{ py: 1.5, fontSize: '1.1rem' }}
      >
        {isLoading ? 'Sending Alert...' : 'Send Emergency Alert'}
      </Button>

      {renderAlertResponse()}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || response?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmergencyAlert; 