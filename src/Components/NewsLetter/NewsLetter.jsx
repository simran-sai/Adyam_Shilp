import React from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  return (
    <div className='news-letter'>
      <h1>Get <span>Exclusive Offers</span><br />Delivered to You</h1>
      <p>Subscribe to our newsletter and be the first to know about new arrivals, artisan stories, and special deals.</p>
      <div>
        <input type="email" placeholder='Enter your email address' />
        <button>Subscribe →</button>
      </div>
    </div>
  )
}

export default NewsLetter