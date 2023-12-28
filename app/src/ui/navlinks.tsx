// NavLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';

// ... (Icons and other imports)

type NavLinksProps = {
  isAuthenticated: boolean
}

const NavLinks: React.FC<NavLinksProps> = ({ isAuthenticated = true }) => {
  
  const pathname = useLocation().pathname;
  const handleSignOut = () => {
    // logout();
    document.location = "/";
  }
  
  

  return (
    <div className="flex flex-col justify-start items-start">
      <div className="flex items-center mb-4">
        <Link to="/" >
          <HomeOutlinedIcon fontSize="large" className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Home</span>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        <Link to="/challenges" >
          <EmojiEventsOutlinedIcon fontSize="large" className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Challenges</span>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        <Link to="/community" >
          <PeopleOutlineOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Community</span>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        <Link to="/groups" >
          <ForumOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Groups</span>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        <Link to="/messages" >
          <MailOutlineOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Messages</span>
        </Link>
      </div>
      <div className="flex items-center">
        <Link to="/profile" >
          <PortraitOutlinedIcon fontSize='large' className='cursor-pointer mr-2' />
          <span className="cursor-pointer">Profile</span>
        </Link>
      </div>
      
      {isAuthenticated &&
        <div className="flex items-center mt-4 bottom-0">
          <Link to="/signout" >
            <PowerSettingsNewIcon fontSize="large" className='cursor-pointer mr-2' />
            <span className="cursor-pointer">Sign Out</span>
          </Link>
        </div>
      }
  </div>

  );
};

export default NavLinks;
