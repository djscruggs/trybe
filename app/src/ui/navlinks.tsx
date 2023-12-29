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
import {theme} from './theme';

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
  const location = useLocation()
  
  return (
    <div className="flex flex-col justify-start items-center">
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/" className='flex items-center flex-col' >
          <HomeOutlinedIcon fontSize="large" className='cursor-pointer mb-1' />
          <span className="cursor-pointer ">Home</span>
        </Link>
      </div>
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/challenges' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/challenges" className='flex items-center flex-col'>
          <EmojiEventsOutlinedIcon fontSize="large" className='cursor-pointer mb-1' />
          <span className="cursor-pointer">Challenges</span>
        </Link>
      </div>
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/community' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/community" className='flex items-center flex-col'>
          <PeopleOutlineOutlinedIcon fontSize='large' className='cursor-pointer mb-1' />
          <span className="cursor-pointer">Community</span>
        </Link>
      </div>
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/groups' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/groups" className='flex items-center flex-col'>
          <ForumOutlinedIcon fontSize='large' className='cursor-pointer mb-1' />
          <span className="cursor-pointer">Groups</span>
        </Link>
      </div>
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/messages' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/messages" className='flex items-center flex-col'>
          <MailOutlineOutlinedIcon fontSize='large' className='cursor-pointer mb-1' />
          <span className="cursor-pointer">Messages</span>
        </Link>
      </div>
      <div className={`w-24 flex items-center flex-col text-center mb-4 p-2 rounded-lg ${location.pathname === '/profile' ? 'bg-slate-100' : 'hover:bg-slate-300'}`}>
        <Link to="/profile" className='flex items-center flex-col'>
          <PortraitOutlinedIcon fontSize='large' className='cursor-pointer mb-1' />
          <span className="cursor-pointer">Profile</span>
        </Link>
      </div>
      
      {isAuthenticated &&
        <div className="w-24 flex items-center flex-col text-center mb-4 hover:bg-slate-300 p-2 rounded-lg">
          <Link to="/signout" className='flex items-center flex-col'>
            <PowerSettingsNewIcon fontSize="large" className='cursor-pointer' />
            <span className="cursor-pointer">Sign Out</span>
          </Link>
        </div>
      }
  </div>

  );
};

export default NavLinks;
