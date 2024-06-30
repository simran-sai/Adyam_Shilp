import React,{createContext} from 'react';
import all_products from '../Components/Assets/all_products';
import { useState } from 'react';

export const ShopContext = createContext(null);
const getDefaultCart= ()=>{
    let cart = {};
    for(let idx=0;idx<all_products.length+1;idx++){
        cart[idx]=0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [CartItems,setcartItems] = useState(getDefaultCart());
    
    const addToCart = (itemId) => {
        setcartItems((prev) => ({...prev,[itemId]:prev[itemId]+1}));
    }

    const removeFromCart = (itemId) => {
        setcartItems((prev) => ({...prev,[itemId]:prev[itemId]-1}));
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in CartItems){
            if(CartItems[item]>0){
                let itemInfo = all_products.find((product) => product.id === Number(item));
                totalAmount += CartItems[item] * itemInfo.new_price;
            }
        }
        return totalAmount;
    }
    const getTotalCartItems = () => {
        let totalItems = 0;
        for(const item in CartItems){
            if(CartItems[item]>0){
                totalItems += CartItems[item];
            }
        }
        return totalItems;
    }

    const contextValue={getTotalCartItems,getTotalCartAmount,all_products,CartItems,addToCart,removeFromCart};

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}
 export default ShopContextProvider;