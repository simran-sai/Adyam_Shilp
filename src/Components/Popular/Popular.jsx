import React from 'react'
import './Popular.css'
import data_products from '../Assets/data'
import Item from '../Item/Item'
const Popular = () => {
  return (
    <div className='Popular'>
        <h1>POPULAR IN PRODUCTS</h1>
        <hr/>
        <div className="popular-items">
            {data_products.map((item,i) => {
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
})}
        </div>
    </div>
  )
}

export default Popular