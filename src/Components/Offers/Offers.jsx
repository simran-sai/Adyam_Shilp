import React from 'react'
import './Offers.css'
import product_10 from '../Assets/product_10.jpg'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
        <h1>Exclusive</h1>
        <h1>Offers For You</h1>
        <p>ONLY ON BEST SELLERS PRODUCTS</p>
        <button>Check Now</button>
      </div>
      <div className="offers-right">
        <img src={product_10} alt=""/>
      </div>
    </div>
  )
}

export default Offers