import './App.css';
import Navbar from './Components/Navbar/Navbar.jsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Shop from './Pages/Shop.jsx';
import ShopCategory from './Pages/ShopCategory.jsx';
import Product from './Pages/Product.jsx';
import Cart from './Pages/Cart.jsx';
import LoginSignup from './Pages/LoginSignup.jsx';
import Footer from './Components/Footer/Footer.jsx';
import banner_homedecor from './Components/Assets/banner_homedecor.png';
import banner_god from './Components/Assets/banner_god.png';  
import banner_rakhi from './Components/Assets/banner_rakhi.png';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Shop/>}/>
        <Route path='/God Idols' element={<ShopCategory banner={banner_god} category="God Idols"/>}/>
        <Route path='/Home Decor' element={<ShopCategory banner={banner_homedecor} category="Home Decor"/>}/>
        <Route path='/Accessories and Rakhi' element={<ShopCategory banner={banner_rakhi} category="Accessories and Rakhi"/>}/>
        <Route path='/product' element={<Product/>}>
        <Route path=':productId' element={<Product/>}/>
        </Route>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/login' element={<LoginSignup/>}/>
      </Routes>
      <Footer/>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
