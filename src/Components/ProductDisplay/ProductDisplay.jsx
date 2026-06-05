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
                <img className="productdisplay-main-img" src={product.img} alt={product.name} />
            </div>
        </div>
        <div className="productdisplay-right">
            <div className="pd-category-tag">{product.category || 'Handcraft'}</div>
            <h1>{product.name}</h1>
            <div className="productdisplay-right-star">
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_icon} alt="" />
                <img src={star_dull_icon} alt="" />
                <p>(122 reviews)</p>
            </div>
            <div className="productdisplay-right-prices">
                <div className="productdisplay-right-price-old">₹{product.old_price?.toLocaleString()}</div>
                <div className="productdisplay-right-prices-new">₹{product.new_price?.toLocaleString()}</div>
            </div>
            <div className="productdisplay-right-description">
                Each piece is hand-crafted by skilled Indian artisans using traditional techniques — bringing authentic artistry into your home.
            </div>
            <div className="productdisplay-right-size">
                <h1>Material &amp; Craft</h1>
                <div className="productdisplay-right-sizes">
                    <div>Handmade</div>
                    <div>Clay &amp; Resin</div>
                    <div>Artisan Made</div>
                </div>
            </div>
            <button onClick={() => { addToCart(product.id) }}>🛒 Add To Cart</button>
            <p className='productdisplay-right-category'><span>Category: </span>{product.category || 'Handcraft'}</p>
            <p className='productdisplay-right-category'><span>Tags: </span>Handmade, Artisan, Indian Craft</p>
        </div>
    </div>
  )
}

export default ProductDisplay