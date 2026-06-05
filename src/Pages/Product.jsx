import React,{useContext} from 'react'
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const {all_products} = useContext(ShopContext);
  const {productId} = useParams();
  const product = all_products.find((e) => e.id === Number(productId));

  if (!product) {
    return (
      <div style={{padding:'4rem', textAlign:'center', minHeight:'60vh'}}>
        <h2>Product not found</h2>
        <p>The product you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrums product={product}/>
      <ProductDisplay product={product}/>
      <DescriptionBox/>
      <RelatedProducts product={product}/>
    </div>
  )
}

export default Product