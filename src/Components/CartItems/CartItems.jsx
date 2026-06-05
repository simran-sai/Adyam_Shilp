import React, { useContext } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'
import { Link } from 'react-router-dom'

const CartItems = () => {
    const { getTotalCartAmount, all_products, CartItems, removeFromCart } = useContext(ShopContext);
    const totalAmount = getTotalCartAmount();
    const hasItems = totalAmount > 0;

    return (
        <div className='cartitems'>
            {/* Header row */}
            <div className="cartitems-format-main">
                <p>Image</p>
                <p>Product</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>

            {/* Product rows */}
            {all_products.map((product) => {
                if (CartItems[product.id] > 0) {
                    return (
                        <div key={product.id} className="cartitems-format cartitems-format-main">
                            <img src={product.img} alt={product.name} className='carticon-product-icon' />
                            <p>{product.name}</p>
                            <p>₹{product.new_price?.toLocaleString()}</p>
                            <button className='cartitems-quantity'>{CartItems[product.id]}</button>
                            <p>₹{(product.new_price * CartItems[product.id]).toLocaleString()}</p>
                            <img
                                src={remove_icon}
                                onClick={() => removeFromCart(product.id)}
                                alt="remove"
                                className="cartitems-remove-icon"
                            />
                        </div>
                    );
                }
                return null;
            })}

            {!hasItems && (
                <div className="cartitems-empty">
                    <span>🛒 Your cart is empty</span>
                    <Link to="/">Start shopping →</Link>
                </div>
            )}

            <div className="cartitems-down">
                {/* Totals */}
                <div className="cartitems-total">
                    <h1>Cart Summary</h1>
                    <div>
                        <div className='cartitems-total-item'>
                            <p>Subtotal</p>
                            <p>₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <div className='cartitems-total-item'>
                            <p>Shipping</p>
                            <p>Free</p>
                        </div>
                        <div className='cartitems-total-item'>
                            <p>Total</p>
                            <p>₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <button disabled={!hasItems}>Proceed to Checkout →</button>
                </div>

                {/* Promo */}
                <div className="cartitems-promocode">
                    <p>Have a promo code? Enter it here:</p>
                    <div className="cartitems-promobox">
                        <input type='text' placeholder='Promo code' />
                        <button>Apply</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;