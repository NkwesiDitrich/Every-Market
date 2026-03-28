import { useEffect } from 'react'
import { selectLoggedInUser } from '../../features/auth/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAddressByUserIdAsync } from '../../features/address/AddressSlice'
import { fetchWishlistByUserIdAsync } from '../../features/wishlist/WishlistSlice'
import { fetchCartByUserIdAsync, mergeCartAsync, selectCartItems } from '../../features/cart/CartSlice'
import { fetchAllCategoriesAsync } from '../../features/categories/CategoriesSlice'
import { fetchAllBrandsAsync } from '../../features/brands/BrandSlice'
import { fetchLoggedInUserByIdAsync } from '../../features/user/UserSlice'

export const useFetchLoggedInUserDetails = (deps) => {
    
    const loggedInUser=useSelector(selectLoggedInUser)
    const dispatch = useDispatch();

    useEffect(()=>{
        /* when a user is logged in then this dispatches an action to get all the details of loggedInUser, 
        as while login and signup only the bare-minimum information is sent by the server */
        if(deps && loggedInUser?.isVerified){
          dispatch(fetchLoggedInUserByIdAsync(loggedInUser?._id))
          dispatch(fetchAllBrandsAsync())
          dispatch(fetchAllCategoriesAsync())
    
          if(loggedInUser?.role !== 'admin'){
            // mergeCartAsync will automatically merge guest items AND fetch the final user cart
            dispatch(mergeCartAsync(loggedInUser?._id))
            
            dispatch(fetchAddressByUserIdAsync(loggedInUser?._id))
            dispatch(fetchWishlistByUserIdAsync(loggedInUser?._id))
          }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps + loggedInUser intentionally controlled
    },[deps, loggedInUser?._id, loggedInUser?.isVerified, loggedInUser?.role, dispatch])
}
