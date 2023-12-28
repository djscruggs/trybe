import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import {theme} from './theme';


import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  
  return (
    <>
      <CssBaseline enableColorScheme />
      <ThemeProvider theme={theme}>
        <Container maxWidth={isMobile ? "sm" : "xl"}>
          <Box sx={{ my: 4}}>
            <div className=' border-1 border-solid border-2 min-h- border-indigo-600 px-2 pt-2'>
              {isMobile &&
                <div className="flex justify-end items-center w-full">
                  <div className="flex-grow"></div>
                  <SearchIcon fontSize="medium" className='mr-4'/>
                  <NotificationsNoneIcon fontSize="medium" className='mr-4'/>
                  <ForumOutlinedIcon fontSize="medium" className='mr-1'/>
                </div>
              }
              
              {children}
              {isMobile &&
                <div className="flex justify-between w-full relative bottom-0 left-0 max-w-lg">
                  <HomeOutlinedIcon fontSize="large" className='cursor-pointer'/>
                  <EmojiEventsOutlinedIcon fontSize="large"className='cursor-pointer'/>
                  <AddCircleOutlinedIcon fontSize="large"className='cursor-pointer'/>
                  <PeopleOutlineOutlinedIcon fontSize='large' className='cursor-pointer'/>
                  <PortraitOutlinedIcon fontSize='large' className='cursor-pointer'/>
                </div>
              }
            </div>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}
