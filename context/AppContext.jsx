'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cartKey, parseCartKey, hasSizes, stockFor } from "@/lib/sizes";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY || '$'
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        try {
            
            const {data} = await axios.get('/api/product/list')

            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserData = async () => {
        try {

            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true)
            }

            const token = await getToken()

            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Cart keys are "productId" for one-size items and "productId::SIZE" for sized ones
    // (see lib/sizes.js). A sized product must be added with a size.
    const findProduct = (key) => products.find((p) => p._id === parseCartKey(key).productId)

    const saveCart = async (cartData, message) => {
        setCartItems(cartData)
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } })
                if (message) toast.success(message)
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    // Returns true if the item was added
    const addToCart = async (productId, size = null) => {

        if (!user) {
            toast('Please login', { icon: '⚠️' })
            return false
        }

        const product = products.find((p) => p._id === productId)
        if (hasSizes(product) && !size) {
            toast.error('Please choose a size')
            return false
        }

        const key = cartKey(productId, hasSizes(product) ? size : null)
        const inStock = stockFor(product, size)
        const inCart = cartItems[key] || 0
        if (inStock === 0) {
            toast.error(size ? `Size ${size} is out of stock` : 'Sorry, this item is out of stock')
            return false
        }
        if (inCart >= inStock) {
            toast.error(`Only ${inStock} left${size ? ` in size ${size}` : ''}`)
            return false
        }

        await saveCart({ ...cartItems, [key]: inCart + 1 }, 'Item added to cart')
        return true
    }

    const updateCartQuantity = async (key, quantity) => {

        const product = findProduct(key)
        const inStock = stockFor(product, parseCartKey(key).size)
        if (quantity > inStock) {
            toast.error(inStock > 0 ? `Only ${inStock} left in stock` : 'This item is out of stock')
            quantity = inStock
        }

        const cartData = { ...cartItems }
        if (!(quantity > 0)) {
            delete cartData[key]
        } else {
            cartData[key] = quantity
        }
        await saveCart(cartData, 'Cart Updated')
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                totalCount += cartItems[key];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const key in cartItems) {
            const itemInfo = findProduct(key);
            if (itemInfo && cartItems[key] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[key];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount, findProduct
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}