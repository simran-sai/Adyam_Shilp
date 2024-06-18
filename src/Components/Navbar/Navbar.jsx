import{ useRef, useState } from 'react' 
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { useContext } from 'react';
import dropdown_icon from '../Assets/dropdown_icon.png';

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { getTotalCartAmount } = useContext(ShopContext);
    const menuRef = useRef();
    const dropdown_toggle = (e) => {
      menuRef.current.classList.toggle('nav-menu-visible');
      e.target.classList.toggle('open');
    }
return (
    <div className='navbar'>
      <div className="logo">
        <img src={logo} alt=""/>
        <p>Adyam Shilp</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={dropdown_icon} alt=""/>
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("Shop")}><Link style={{textDecoration:'none'}} to='/'>Shop</Link>{menu==="Shop" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("God idols")}><Link style={{textDecoration:'none'}} to='/God idols'>God Idols</Link>{menu==="God idols" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("Accessories and Rakhi")}><Link style={{textDecoration:'none'}} to='/Accessories and Rakhi'>Accessories and Rakhi</Link>{menu==="Accessories and Rakhi" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("Home decor")}><Link style={{textDecoration:'none'}} to='/Home Decor'>Home Decor</Link>{menu==="Home decor" ? <hr/> : <></>}</li>
      </ul>
      <div className="nav-login-cart">
         <Link to='/login'><button>Login</button></Link>
         <Link to='/cart'><img src={cart_icon} alt=""/></Link>
         <div className="nav-cart-count">{getTotalCartAmount()}</div>
      </div>
    </div>
    )
}

export default Navbar
