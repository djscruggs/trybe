import { createTheme } from '@mui/material/styles';


// Create a theme instance.
export const theme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#ec5f5d',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});