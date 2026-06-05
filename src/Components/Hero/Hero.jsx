import React from 'react'
import './Hero.css'
import hand_icon from '../Assets/hand_icon.png'
import arrow_icon from '../Assets/arrow.png'
import hero_img from '../Assets/hero.jpg'

const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          New Arrivals — Handcrafted with Love
        </div>
        <h2>
          Discover <span>Authentic</span><br />Indian Artisan Craft
        </h2>
        <p>Every piece in our collection is handmade by skilled artisans — bringing centuries of Indian tradition into your home.</p>
        <div>
          <div className='hero-hand-icon'>
            <p>New</p>
            <img src={hand_icon} alt="" />
          </div>
          <p>collections</p>
          <p>for everyone</p>
        </div>
        <div className="hero-latest-btn">
          <div>Explore Collection</div>
          <img src={arrow_icon} alt="" />
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>500+</strong>
            <span>Handcrafted Items</span>
          </div>
          <div className="hero-stat">
            <strong>100%</strong>
            <span>Artisan Made</span>
          </div>
          <div className="hero-stat">
            <strong>5★</strong>
            <span>Rated</span>
          </div>
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_img} alt="Adyam Shilp Artisan Collection" />
      </div>
    </div>
  )
}

export default Hero