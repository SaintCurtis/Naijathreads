import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, PlusIcon, ProductsIcon, InventoryIcon, OrdersIcon } from './Icons';

const menuItems = [
    { name: 'Dashboard', path: '/seller', Icon: DashboardIcon },
    { name: 'Add Product', path: '/seller/add-product', Icon: PlusIcon },
    { name: 'Products', path: '/seller/product-list', Icon: ProductsIcon, match: '/seller/product-' },
    { name: 'Inventory', path: '/seller/inventory', Icon: InventoryIcon },
    { name: 'Orders', path: '/seller/orders', Icon: OrdersIcon },
];

const SideBar = () => {
    const pathname = usePathname()

    return (
        <nav className='md:w-60 w-16 shrink-0 border-r min-h-screen text-[15px] border-gray-200 py-3 flex flex-col bg-white'>
            {menuItems.map(({ name, path, Icon, match }) => {
                const isActive = pathname === path || (match && pathname.startsWith(match));
                return (
                    <Link href={path} key={name} title={name}>
                        <div
                            className={`flex items-center py-3 px-4 md:px-5 gap-3 border-r-4 transition ${isActive
                                ? "bg-forest-600/10 border-forest-600 text-forest-700 font-medium"
                                : "border-transparent text-gray-600 hover:bg-gray-100/80"
                                }`}
                        >
                            <Icon />
                            <p className='md:block hidden'>{name}</p>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
};

export default SideBar;
