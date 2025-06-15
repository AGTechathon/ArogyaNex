import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Chatbot from './components/Chatbot';
import EmergencyAlert from './components/EmergencyAlert';
import BloodReportAnalyzer from './components/BloodReportAnalyzer';
import DoctorList from './components/appointments/DoctorList';
import AppointmentBooking from './components/appointments/AppointmentBooking';
import AppointmentList from './components/appointments/AppointmentList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ArogyaNex
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/doctors">
              Find Doctors
            </Button>
            <Button color="inherit" component={Link} to="/appointments">
              My Appointments
            </Button>
            <Button color="inherit" component={Link} to="/blood-reports">
              Blood Reports
            </Button>
            <Button color="inherit" component={Link} to="/emergency">
              Emergency
            </Button>
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route path="/" element={<DoctorList />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/appointments/book/:doctorId" element={<AppointmentBooking />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/blood-reports" element={<BloodReportAnalyzer />} />
            <Route path="/emergency" element={<EmergencyAlert />} />
          </Routes>
        </Container>

        
      </Router>
    </ThemeProvider>
  );
}

export default App;
