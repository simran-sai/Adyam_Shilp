import React from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo.png'
import insta_icon from '../Assets/instagram_icon.png'
import pinterest_icon from '../Assets/pintester_icon.png'
import watsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-top">
        <div>
          <div className="footer-logo">
            <img src={footer_logo} alt="Adyam Shilp" />
            <p>Adyam Shilp</p>
          </div>
          <p className="footer-tagline">Handcrafted with love by Indian artisans. Every piece tells a story.</p>
          <div className="footer-social-icon" style={{ marginTop: '20px' }}>
            <div className="footer-icons-container"><img src={insta_icon} alt="Instagram" /></div>
            <div className="footer-icons-container"><img src={pinterest_icon} alt="Pinterest" /></div>
            <div className="footer-icons-container"><img src={watsapp_icon} alt="WhatsApp" /></div>
          </div>
        </div>

        <nav className="footer-nav">
          <div className="footer-col">
            <h4>Shop</h4>
            <ul className="footer-links">
              <li>God Idols</li>
              <li>Home Decor</li>
              <li>Accessories</li>
              <li>Rakhi Collection</li>
              <li>New Arrivals</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              <li>About Us</li>
              <li>Our Artisans</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li>Shipping Policy</li>
              <li>Returns</li>
              <li>Privacy Policy</li>
              <li>Terms of Use</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer-copyright">
        <p>© 2024 Adyam Shilp — All Rights Reserved. Made with ❤️ in India.</p>
      </div>
    </div>
  )
}

export default Footer