import React from 'react'
import './AddProduct.css'

const AddProduct = () => {
  return (
    <div className='add-product'>
        <div className="addproduct-itemfields">
            <p>Product title</p>
            <input type="text" name='name' placeholder='Enter product name' />

        </div>
        <div className="addproduct-price">
           <div className="addproduct-itemfields">
            <p>Product price</p>
            <input type="text" name='old_price' placeholder='Enter product price' />
            
            </div> 
            <div className="addproduct-itemfields">
            <p>Product discount</p>
            <input type="text" name='new_price' placeholder='Enter product discount' />
            
            </div>
        </div>
        <div className="addproduct-itemfield">
            <p>Product Category</p>
            <select name='category' id='category'>
                <option value="Home Decor">Home Decor</option>  
                <option value="Home Decor">Home Decor</option>  
                <option value="Home Decor">Home Decor</option>  
                <option value="Home Decor">Home Decor</option>  
                <option value="Home Decor">Home Decor</option>  
            </select>
        </div>
    </div>
  )
}

export default AddProduct