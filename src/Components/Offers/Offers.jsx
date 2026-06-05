import React from 'react'
import './Offers.css'
import product_24 from '../Assets/product_24.jpg'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
        <div className="offers-badge">🔥 Limited Time</div>
        <h1>Exclusive<br /><span>Offers For You</span></h1>
        <p>Only on best sellers &amp; handpicked products</p>
        <button>Check Now →</button>
      </div>
      <div className="offers-right">
        <img src={product_24} alt="Exclusive offer product" />
      </div>
    </div>
  )
}

export default Offers