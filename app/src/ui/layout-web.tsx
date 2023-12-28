import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import {theme} from './theme';
import SideNav from './sidenav';




export default function LayoutWeb({ children }: { children: React.ReactNode }) {
  
  
  return (
      <Container maxWidth="xl">
        <Box sx={{ m: 0}}>
          <div className='flex px-2 pt-2 min-h-screen'>
              <div className="flex flex-col justify-start items-start mr-8">
                  <div className="flex items-center mb-4">
                    <SideNav />
                  </div>
                  
                </div>
                <div className="flex-grow pt-4">
                {children}
                </div>
          </div>
        </Box>
      </Container>
);
}
