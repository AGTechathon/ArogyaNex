import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chatbot from './components/Chatbot';
import EmergencyAlert from './components/EmergencyAlert';

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
      {/* <Chatbot /> */}
      <EmergencyAlert />
    </ThemeProvider>
  );
}
  
export default App;
