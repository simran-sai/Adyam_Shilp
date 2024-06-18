import React from 'react'
import './DescriptionBox.css'   

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews(122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>An e-commerce website is an online platform where users can buy and sell goods</p>
            <p>It has gained immense popularity in recent years.
                It faciliates buying and selling of products or services over the internet services serves as a virtual market.
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox