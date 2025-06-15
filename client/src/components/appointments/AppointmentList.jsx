import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
  }, [tabValue]);

  useEffect(() => {
    if (location.state?.message) {
      setError({ type: 'success', message: location.state.message });
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const status = tabValue === 0 ? 'upcoming' : 'past';
      const response = await axios.get(
        `http://localhost:3020/api/appointments?upcoming=${status === 'upcoming'}`
      );
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      setError({
        type: 'error',
        message: 'Failed to fetch appointments. Please try again later.'
      });
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await axios.patch(
        `http://localhost:3020/api/appointments/${selectedAppointment._id}/cancel`,
        { reason: cancelReason }
      );
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedAppointment(null);
      fetchAppointments();
      setError({
        type: 'success',
        message: 'Appointment cancelled successfully'
      });
    } catch (err) {
      setError({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel appointment'
      });
      console.error('Error cancelling appointment:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const isAppointmentUpcoming = (appointment) => {
    const appointmentDate = parseISO(appointment.date);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(
      parseInt(appointment.startTime.split(':')[0]),
      parseInt(appointment.startTime.split(':')[1])
    );
    return isAfter(appointmentDateTime, new Date());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>

      {error && (
        <Alert severity={error.type} sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Upcoming Appointments" />
          <Tab label="Past Appointments" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item key={appointment._id} xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Dr. {appointment.doctor.name}
                    </Typography>
                    <Chip
                      label={appointment.doctor.specialty}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {format(parseISO(appointment.date), 'MMMM dd, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Time:</strong> {appointment.startTime} - {appointment.endTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Consultation Type:</strong> {appointment.consultationType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Symptoms:</strong> {appointment.symptoms}
                    </Typography>
                  </Grid>
                  {appointment.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Notes:</strong> {appointment.notes}
                      </Typography>
                    </Grid>
                  )}
                  {appointment.consultationType === 'online' && appointment.meetingLink && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Meeting Link:</strong> {appointment.meetingLink}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>

              {tabValue === 0 && appointment.status === 'confirmed' && isAppointmentUpcoming(appointment) && (
                <CardActions>
                  <Button
                    color="error"
                    onClick={() => handleCancelClick(appointment)}
                  >
                    Cancel Appointment
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}

        {appointments.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No {tabValue === 0 ? 'upcoming' : 'past'} appointments found
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel your appointment with Dr. {selectedAppointment?.doctor.name}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            disabled={!cancelReason.trim()}
          >
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentList; 