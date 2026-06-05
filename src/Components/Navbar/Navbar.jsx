import { useRef, useState } from 'react'
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { useContext } from 'react';
import dropdown_icon from '../Assets/dropdown_icon.png';

const Navbar = () => {
    const [menu, setMenu] = useState("Shop");
    const { getTotalCartItems } = useContext(ShopContext);
    const menuRef = useRef();

    const dropdown_toggle = (e) => {
        menuRef.current.classList.toggle('nav-menu-visible');
        e.target.classList.toggle('open');
    };

    const cartCount = getTotalCartItems();

    return (
        <div className='navbar'>
            <div className="logo">
                <img src={logo} alt="Adyam Shilp logo" />
                <p>Adyam Shilp</p>
            </div>

            <img className='nav-dropdown' onClick={dropdown_toggle} src={dropdown_icon} alt="menu" />

            <ul ref={menuRef} className="nav-menu">
                <li onClick={() => setMenu("Shop")}>
                    <Link to='/'>Shop</Link>
                    {menu === "Shop" && <hr />}
                </li>
                <li onClick={() => setMenu("God idols")}>
                    <Link to='/god-idols'>God Idols</Link>
                    {menu === "God idols" && <hr />}
                </li>
                <li onClick={() => setMenu("Accessories and Rakhi")}>
                    <Link to='/accessories-and-rakhi'>Accessories & Rakhi</Link>
                    {menu === "Accessories and Rakhi" && <hr />}
                </li>
                <li onClick={() => setMenu("Home decor")}>
                    <Link to='/home-decor'>Home Decor</Link>
                    {menu === "Home decor" && <hr />}
                </li>
                <li onClick={() => setMenu("Recommendations")}>
                    <Link to='/recommendations'>For You ✨</Link>
                    {menu === "Recommendations" && <hr />}
                </li>
            </ul>

            <div className="nav-login-cart">
                {localStorage.getItem("auth-token")
                    ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace("/"); }}>Logout</button>
                    : <Link to='/login'><button>Login</button></Link>
                }
                <div className="nav-cart-wrap">
                    <Link to='/cart'><img src={cart_icon} alt="cart" /></Link>
                    {cartCount > 0 && <div className="nav-cart-count">{cartCount}</div>}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
