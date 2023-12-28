// NavLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';

// ... (Icons and other imports)



const NavLinks: React.FC = (isAuthenticated = true) => {
  
  const pathname = useLocation().pathname;
  
  

  return (
    <div className="flex flex-col justify-start items-start">
      <div className="flex items-center mb-4">
          <HomeOutlinedIcon fontSize="large" className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Home</span>
      </div>
      <div className="flex items-center mb-4">
          <EmojiEventsOutlinedIcon fontSize="large" className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Challenges</span>
      </div>
      <div className="flex items-center mb-4">
          <PeopleOutlineOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Community</span>
      </div>
      <div className="flex items-center mb-4">
          <ForumOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Forums</span>
      </div>
      <div className="flex items-center">
          <PortraitOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Profile</span>
      </div>
      <div className="flex items-center mt-4">
          <NotificationsNoneIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Notifications</span>
      </div>
      {isAuthenticated &&
        <div className="flex items-center mt-4 bottom-0">
          <PowerSettingsNewIcon fontSize="large" className='cursor-pointer mr-2' />
            <span className="cursor-pointer">Sign Out</span>
        </div>
      }
  </div>

  );
};

export default NavLinks;
