import React, { useContext } from 'react'
import './RelatedProducts.css'
import { ShopContext } from '../../Context/ShopContext'
import Item from '../Item/Item'

const RelatedProducts = ({ product }) => {
  const { all_products } = useContext(ShopContext);
  
  // Filter products by same category, exclude the current product, limit to 4
  const relatedItems = all_products
    .filter((item) => item.category === product?.category && item.id !== product?.id)
    .slice(0, 4);

  return (
    <div className='related-products'>
        <h1>Related Products</h1>
        <hr/>
        <div className='relatedproducts-item'>
            {relatedItems.length > 0 ? relatedItems.map((item, i) => (
                <Item 
                    key={i} 
                    id={item.id} 
                    name={item.name} 
                    image={item.img} 
                    new_price={item.new_price} 
                    old_price={item.old_price}
                />
            )) : (
              <p style={{color:'#888'}}>No related products found.</p>
            )}
        </div>
    </div>
  )
}

export default RelatedProducts