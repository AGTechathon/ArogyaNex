import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chatbot from './components/Chatbot';
import EmergencyAlert from './components/EmergencyAlert';
import BloodReportAnalyzer from './components/BloodReportAnalyzer';

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
      <div className="app-container">
        <BloodReportAnalyzer />
        {/* <Chatbot /> */}
        {/* <EmergencyAlert /> */}
      </div>
    </ThemeProvider>
  );
}
  
export default App;
