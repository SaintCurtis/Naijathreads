"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { hasSizes, sortSizes, stockFor } from "@/lib/sizes";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart, user, currency } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [size, setSize] = useState(null);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
    }, [id, products])

    // new product: forget the previous size choice
    useEffect(() => { setSize(null) }, [id])

    const sized = hasSizes(productData)
    const total = stockFor(productData)
    const left = sized ? (size ? stockFor(productData, size) : null) : total

    const add = async (goToCart) => {
        const ok = await addToCart(productData._id, size)
        if (ok && goToCart) router.push('/cart')
    }

    return productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt="alt"
                            className="w-full h-auto object-cover mix-blend-multiply"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                            >
                                <Image
                                    src={image}
                                    alt="alt"
                                    className="w-full h-auto object-cover mix-blend-multiply"
                                    width={1280}
                                    height={720}
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image
                                className="h-4 w-4"
                                src={assets.star_dull_icon}
                                alt="star_dull_icon"
                            />
                        </div>
                        <p>(4.5)</p>
                    </div>
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6">
                        {currency}{productData.offerPrice}
                        {productData.price > productData.offerPrice && (
                            <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                                {currency}{productData.price}
                            </span>
                        )}
                    </p>
                    {total === 0 ? (
                        <p className="mt-2 text-sm font-medium text-red-700">Out of stock</p>
                    ) : left === null ? null : (
                        <p className={`mt-2 text-sm font-medium ${left === 0 ? 'text-red-700' : left <= 5 ? 'text-amber-700' : 'text-forest-700'}`}>
                            {left === 0 ? `Size ${size} is out of stock` : left <= 5 ? `Only ${left} left${size ? ` in size ${size}` : ''}` : 'In stock'}
                        </p>
                    )}

                    {sized && total > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between max-w-md">
                                <p className="font-medium text-gray-800">Size{size ? `: ${size}` : ''}</p>
                                {!size && <p className="text-sm text-gray-500">Choose a size</p>}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="Size">
                                {sortSizes(productData.sizes).map((s) => {
                                    const out = (s.stock || 0) === 0
                                    const active = size === s.size
                                    return (
                                        <button
                                            key={s.size}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            disabled={out}
                                            title={out ? `${s.size} is sold out` : s.size}
                                            onClick={() => setSize(s.size)}
                                            className={`min-w-12 px-3 h-11 rounded-md border text-sm transition ${active
                                                ? 'border-forest-700 bg-forest-700 text-white'
                                                : out
                                                    ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed'
                                                    : 'border-gray-300 text-gray-800 hover:border-forest-600'
                                                }`}
                                        >
                                            {s.size}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium">Brand</td>
                                    <td className="text-gray-800/50 ">Naija Threads</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Color</td>
                                    <td className="text-gray-800/50 ">Multi</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Category</td>
                                    <td className="text-gray-800/50">
                                        {productData.category}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {total === 0 ? (
                        <div className="mt-10">
                            <button disabled className="w-full py-3.5 bg-gray-100 text-gray-500 cursor-not-allowed">
                                Out of stock
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center mt-10 gap-4">
                            <button onClick={() => add(false)} className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition">
                                Add to Cart
                            </button>
                            <button onClick={() => add(true)} className="w-full py-3.5 bg-forest-600 text-white hover:bg-forest-700 transition">
                                Buy now
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">You May Also <span className="font-medium text-forest-600">Love</span></p>
                    <div className="w-28 h-0.5 bg-gold-500 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
                <button className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;