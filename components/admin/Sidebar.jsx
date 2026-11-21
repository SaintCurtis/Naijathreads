import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, PlusIcon, ProductsIcon, InventoryIcon, OrdersIcon } from './Icons';

const menuItems = [
    { name: 'Dashboard', path: '/admin', Icon: DashboardIcon },
    { name: 'Add Product', path: '/admin/add-product', Icon: PlusIcon },
    { name: 'Products', path: '/admin/product-list', Icon: ProductsIcon, match: '/admin/product-' },
    { name: 'Inventory', path: '/admin/inventory', Icon: InventoryIcon },
    { name: 'Orders', path: '/admin/orders', Icon: OrdersIcon },
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
