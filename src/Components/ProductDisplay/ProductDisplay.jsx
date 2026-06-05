import React, { useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext';
import { useContext } from 'react';


const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart, recordView } = useContext(ShopContext);

    // Record that this product was viewed (for recommendation engine)
    useEffect(() => {
        if (product?.id) {
            recordView(product.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.id]);

  return (
    <div className='productdisplay'>
        <div className="productdisplay-left">
            <div className="productdisplay-img-list">
                <img src={product.img} alt="" />
                <img src={product.img} alt="" />
                <img src={product.img} alt="" />
                <img src={product.img} alt="" />
            </div>
            <div className="productdisplay-img">
                <img className="productdisplay-main-img" src={product.img} alt="" />
            </div>
        </div>
        <div className="productdisplay-right">
            <h1>{product.name}</h1>
            <div className="productdisplay-right-star">
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_dull_icon} alt="" />
                <p>(122)</p>
            </div>
            <div className="productdisplay-right-prices">
                <div className="productdisplay-right-price-old">
                    ₹{product.old_price}
                </div>
                <div className="productdisplay-right-prices-new">
                    ₹{product.new_price}
                </div>
            </div>
            <div className="productdisplay-right-description">
               Hand crafted items to decor home — made with love in India
            </div>
            <div className="productdisplay-right-size">
                <h1>Category</h1>
                <div className="productdisplay-right-sizes">
                    <div>{product.category || 'Handcraft'}</div>
                </div>
            </div>
            <button onClick={() => { addToCart(product.id) }}>Add To Cart</button>
            <p className='productdisplay-right-category'><span>Category: </span>{product.category || 'Handcraft'}</p>
            <p className='productdisplay-right-category'><span>Tags: </span>Handmade, Artisan, Indian Craft</p>
        </div>
    </div>
  )
}

export default ProductDisplay