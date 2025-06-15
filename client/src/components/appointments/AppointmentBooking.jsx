import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, isAfter, isBefore, addMinutes, parseISO } from 'date-fns';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const steps = ['Select Date & Time', 'Enter Details', 'Confirmation'];

const AppointmentBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    consultationType: 'online',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3020/api/appointments/doctors/${doctorId}`);
      setDoctor(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch doctor details. Please try again later.');
      console.error('Error fetching doctor details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(
        `http://localhost:3020/api/appointments/doctors/${doctorId}/slots?date=${formattedDate}`
      );
      setAvailableSlots(response.data.availableSlots);
      setBookedSlots(response.data.bookedSlots);
    } catch (err) {
      setError('Failed to fetch available slots. Please try again later.');
      console.error('Error fetching available slots:', err);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isSlotAvailable = (time) => {
    if (!time) return false;
    
    const slotStart = parse(time, 'HH:mm', new Date());
    const slotEnd = addMinutes(slotStart, 30); // Assuming 30-minute slots

    // Check if the slot overlaps with any booked slots
    return !bookedSlots.some(bookedSlot => {
      const bookedStart = parse(bookedSlot.startTime, 'HH:mm', new Date());
      const bookedEnd = parse(bookedSlot.endTime, 'HH:mm', new Date());
      return (
        (isAfter(slotStart, bookedStart) && isBefore(slotStart, bookedEnd)) ||
        (isAfter(slotEnd, bookedStart) && isBefore(slotEnd, bookedEnd))
      );
    });
  };

  const handleNext = () => {
    if (activeStep === 0 && (!selectedDate || !selectedTime)) {
      setError('Please select both date and time');
      return;
    }
    if (activeStep === 1 && !formData.symptoms) {
      setError('Please enter your symptoms');
      return;
    }
    if (activeStep === 2) {
      handleSubmit();
      return;
    }
    setActiveStep(prev => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const appointmentData = {
        doctorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: format(selectedTime, 'HH:mm'),
        endTime: format(addMinutes(selectedTime, 30), 'HH:mm'),
        ...formData
      };

      await axios.post('http://localhost:3020/api/appointments', appointmentData);
      navigate('/appointments', { state: { message: 'Appointment booked successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !doctor) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Appointment
        </Typography>

        {doctor && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">
              Dr. {doctor.name} - {doctor.specialty}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doctor.qualification}
            </Typography>
          </Box>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Date and Time Selection */}
        {activeStep === 0 && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Select Time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  slotProps={{ textField: { fullWidth: true } }}
                  disabled={!selectedDate}
                  shouldDisableTime={(timeValue, clockType) => {
                    if (!selectedDate || clockType !== 'minutes') return false;
                    const time = format(timeValue, 'HH:mm');
                    return !isSlotAvailable(time);
                  }}
                />
                {selectedDate && (
                  <FormHelperText>
                    Available slots are shown. Booked slots are disabled.
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </LocalizationProvider>
        )}

        {/* Step 2: Appointment Details */}
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Consultation Type</InputLabel>
                <Select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleInputChange}
                  label="Consultation Type"
                >
                  <MenuItem value="online">Online Consultation</MenuItem>
                  <MenuItem value="in-person">In-Person Consultation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                helperText="Please describe your symptoms in detail"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                helperText="Any additional information you'd like to share"
              />
            </Grid>
          </Grid>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Appointment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  <strong>Date:</strong> {format(selectedDate, 'MMMM dd, yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Time:</strong> {format(selectedTime, 'hh:mm a')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Consultation Type:</strong> {formData.consultationType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <strong>Symptoms:</strong> {formData.symptoms}
                </Typography>
              </Grid>
              {formData.notes && (
                <Grid item xs={12}>
                  <Typography>
                    <strong>Additional Notes:</strong> {formData.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Book Appointment' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppointmentBooking; 