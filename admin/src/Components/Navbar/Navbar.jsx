import React from 'react'
import './Navbar.css'
import navprofile from '../../assets/navbar-profile.png'

const Navbar = () => {
  return (
    <div className='navbar'>
        <p>Admin Panel</p>
        <img src={navprofile} alt="" className='nav-profile'/>
        
    </div>
  )
}

export default Navbar