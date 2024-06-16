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
        <li onClick={() => setMenu("Shop")}><Link style={{textDecoration:'none'}} to='/'>Shop</Link>{menu==="Shop" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("God idols")}><Link style={{textDecoration:'none'}} to='/God idols'>God Idols</Link>{menu==="God idols" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("Accessories and Rakhi")}><Link style={{textDecoration:'none'}} to='/Accessories and Rakhi'>Accessories and Rakhi</Link>{menu==="Accessories and Rakhi" ? <hr/> : <></>}</li>
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
