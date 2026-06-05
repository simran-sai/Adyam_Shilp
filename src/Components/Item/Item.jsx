import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)}>
        <div className="item-img-wrap">
          <img src={props.image} alt={props.name} />
          <div className="item-img-overlay">
            <span>View Product →</span>
          </div>
        </div>
      </Link>
      <div className="item-body">
        <p>{props.name}</p>
        <div className="item-prices">
          <div className="item-price-new">₹{props.new_price?.toLocaleString()}</div>
          {props.old_price > props.new_price && (
            <div className="item-price-old">₹{props.old_price?.toLocaleString()}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Item