import React from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.jpg';

const AddProduct = async () => {
  const [image, setImage] = React.useState(null);
  const [productDetails, setProductDetails] = React.useState({
    name: '',
    old_price: '',
    new_price: '',
    category: 'God Idols',
    img: ''
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
    setProductDetails({ ...productDetails, img: e.target.files[0] });
  }

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  }

  const addProduct = async () => {
    console.log(productDetails);
    let responseData;
    let product =productDetails;
    let formData = new FormData();
    formData.append('product',image);
    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers:{
        Accept:'application/json',
      },
      body:formData,
    }).then((resp)=>resp.json()).then((data)=>{
      responseData = data});
    if(responseData.success){
      product.img = responseData.image_url;
      console.log(product);
    }
    // Here you can add the functionality to submit the product details to the server
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input 
          value={productDetails.name} 
          onChange={changeHandler} 
          type="text" 
          name='name' 
          placeholder='Type here' 
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Product Price</p>
          <input 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            type="text" 
            name='old_price' 
            placeholder='Type here' 
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Product Discount</p>
          <input 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            type="text" 
            name='new_price' 
            placeholder='Enter product discount' 
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select 
          value={productDetails.category} 
          onChange={changeHandler} 
          name='category' 
          className='add-product-selector'
        >
          <option value="God Idols">God Idols</option>
          <option value="Home Decor">Home Decor</option>
          <option value="Accessories and Rakhi">Accessories and Rakhi</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor='file-input'>
          <img 
            src={image ? URL.createObjectURL(image) : upload_area} 
            className='addproduct-thumbnail-img' 
            alt="Upload Area" 
          />
        </label>
        <input 
          onChange={imageHandler} 
          type='file' 
          name='image' 
          id='file-input' 
          hidden 
        />
      </div>

      <button onClick={addProduct} className='addproduct-btn'>Add</button>
    </div>
  );
};

export default AddProduct;
