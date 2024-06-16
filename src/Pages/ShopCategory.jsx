import React, { useContext } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ShopCategory = (props) => {
   const { all_products } = useContext(ShopContext);

  return (
    <div className='shop-category'>
      <div className="shopcategory-banner">
        <img src={props.banner} alt="" />
        </div> 
      <div className="shopcategory-indexsort">
        <p>
          <span>Showing 1-6</span> out of 20 products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className='shopcategory-products'>
        {all_products.map((item, i) => {
         if (props.category === item.category) {
           return (
              <Item 
                key={i} 
                id={item.id} 
                name={item.name} 
                image={item.img} 
                new_price={item.new_price} 
                old_price={item.old_price}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default ShopCategory;
