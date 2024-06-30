import React,{useContext} from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'

const CartItems = () => {
    const {getTotalCartAmount,all_products,CartItems,removeFromCart}=useContext(ShopContext);
  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr/>
    {all_products.map((e)=>{
        if(CartItems[e.id]>0){
            return <div>
            <div className="cartitems-format cartitems-format-main ">
                <img src={e.img} alt="" className='carticon-product-icon'/>
                <p>{e.name}</p>
                <p>${e.new_price}</p>
                <button className='cartitems-quantity'>{CartItems[e.id]}</button>
                <p>${e.new_price*CartItems[e.id]}</p>
                <img src={remove_icon} onClick={()=>{removeFromCart(e.id)}} alt=""/>
            </div>
            <hr/>
          </div>
        }
        return null;
    })}
    <div className="cartitems-down">
        <div className="cartitems-total">
             <h1>cart Totals</h1>
             <div>
             <div className='cartitems-total-item'>
                <p>SubTotal</p>
                <p>${getTotalCartAmount()}</p>
             </div>
             <hr/>
             <div className='cartitems-total-item'>
                <p>Shipping Fee</p>
                <p>Free</p>
             </div>
             <hr/>
             <div className='cartitems-total-item'>
                <p>Total</p>
                <p>${getTotalCartAmount()}</p>
             </div>
             </div>
             <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
            <p>If you have any promocode, enter it</p>
            <div className="cartitems-promobox">
                <input type='text' placeholder="Promocode"/>
                <button>Apply</button>
            </div>
        </div>
    </div>
    </div>
  )
}

export default CartItems