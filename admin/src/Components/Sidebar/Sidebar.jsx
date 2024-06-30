import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import add_product_icon from '../../assets/add_product_icon.png';
import list_product_icon from '../../assets/list_product_icon.png';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration: "none"}}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration: "none"}}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>List Product</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
