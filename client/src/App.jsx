import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chatbot from './components/Chatbot';
import EmergencyAlert from './components/EmergencyAlert';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // indigo-600
    },
    secondary: {
      main: '#10B981', // emerald-500
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
      {/* <Chatbot /> */}
      <EmergencyAlert />
    </ThemeProvider>
  );
}

export default App;
