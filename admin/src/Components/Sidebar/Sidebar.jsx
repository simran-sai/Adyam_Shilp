import React from 'react';
import { NavLink } from 'react-router-dom';
import add_product_icon from '../../assets/add_product_icon.png';
import list_product_icon from '../../assets/list_product_icon.png';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <NavLink to='/addproduct' activeClassName='active-link' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </NavLink>
      <NavLink to='/listproduct' activeClassName='active-link' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="Product List" />
          <p>Product List</p>
        </div>
      </NavLink>
    </div>
  );
};

export default Sidebar;
