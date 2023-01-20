import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import React from 'react';
import {
    Link, useLocation
} from "react-router-dom";
import './Menu.css';

export default function Menu() {
    const location = useLocation()
    const pathName = location.pathname

    return (
        <div>
            <div className='logo-container'>
                <img src='logo.svg' className='logo' alt='logo getaround' />
            </div>
            <div className='profile'>
                <img src='profil.png' alt='anonymous profile' />
                <div className='profile_title'>Anonymous User</div>
                <div className='profile_subtitle'>Manager</div>
            </div>
            <nav>
                <ul>
                    <li>
                        <Link to="/" className={pathName === '/' ? 'active' : null}><AccessTimeIcon style={{ fontSize: 18 }} /> <span>Delay optimization</span></Link>
                    </li>
                    <li>
                        <Link to="/prices" className={pathName === '/prices' ? 'active' : null}> <EuroOutlinedIcon style={{ fontSize: 18 }} /> <span>Prices prediction</span></Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
