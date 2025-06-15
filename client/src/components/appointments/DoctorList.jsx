import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardActions,
  Button,
  Rating,
  Chip
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const specialties = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'General Medicine',
  'Psychiatry'
];

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialty: '',
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`http://localhost:3020/api/appointments/doctors?${queryParams}`);
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again later.');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/appointments/book/${doctorId}`);
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
        Find a Doctor
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Doctors"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or qualification"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Specialty</InputLabel>
            <Select
              name="specialty"
              value={filters.specialty}
              onChange={handleFilterChange}
              label="Specialty"
            >
              <MenuItem value="">All Specialties</MenuItem>
              {specialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              label="Sort By"
            >
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="experience">Experience</MenuItem>
              <MenuItem value="consultationFee">Consultation Fee</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort Order</InputLabel>
            <Select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              label="Sort Order"
            >
              <MenuItem value="desc">High to Low</MenuItem>
              <MenuItem value="asc">Low to High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Doctor List */}
      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid item key={doctor._id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Dr. {doctor.name}
                </Typography>
                <Chip
                  label={doctor.specialty}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {doctor.qualification}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={doctor.rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({doctor.totalRatings} reviews)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Experience: {doctor.experience} years
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consultation Fee: ₹{doctor.consultationFee}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleBookAppointment(doctor._id)}
                  disabled={!doctor.isAvailable}
                >
                  {doctor.isAvailable ? 'Book Appointment' : 'Not Available'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {doctors.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No doctors found matching your criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DoctorList; 