import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
  },
  palette: {
    primary: {
      main: '#1a237e',
      dark: '#0d1442',
      light: '#3949ab',
    },
    secondary: {
      main: '#0d1442',
      dark: '#000000',
      light: '#3949ab',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Times New Roman", Times, serif',
        },
      },
    },
  },
});

export default theme;