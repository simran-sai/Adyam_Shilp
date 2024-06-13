import{ useState } from 'react' 
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
const Navbar = () => {
    const [menu, setMenu] = useState("shop");
return (
    <div className='navbar'>
      <div className="logo">
        <img src={logo} alt=""/>
        <p>Adyam Shilp</p>
      </div>
      <ul className="nav-menu">
        <li onClick={() => setMenu("shop")}><Link style={{textDecoration:'none'}} to='/'>Shop</Link>{menu==="shop" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("god idol")}><Link style={{textDecoration:'none'}} to='/god idol'>God Idol</Link>{menu==="god idol" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("rakhi")}><Link style={{textDecoration:'none'}} to='/rakhi'>Rakhi</Link>{menu==="rakhi" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("Home decor")}><Link style={{textDecoration:'none'}} to='/Home Decor'>Home Decor</Link>{menu==="Home decor" ? <hr/> : <></>}</li>
      </ul>
      <div className="nav-login-cart">
         <Link to='/login'><button>Login</button></Link>
         <Link to='/cart'><img src={cart_icon} alt=""/></Link>
         <div className="nav-cart-count">0</div>
      </div>
    </div>
    )
}

export default Navbar
