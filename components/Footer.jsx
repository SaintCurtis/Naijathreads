import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo} alt="Naija Threads logo" />
          <p className="mt-6 text-sm font-medium text-gray-700">
            Rooted in culture. Worn with pride.
          </p>
          <p className="mt-3 text-sm">
            Naija Threads brings authentic Nigerian traditional wear to
            Zimbabwe: agbada, senator, kaftan, Ankara, lace and aso oke for
            Nigerians living here, for Zimbabweans, and for every African who
            dares to rock it. We share more than a continent. We share rhythm,
            colour and pride. Every piece we sell celebrates that.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link className="hover:underline transition" href="/">Home</Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/all-products">Shop</Link>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+263 00 000 0000</p>
              <p>hello@naijathreads.com</p>
              <p>Harare, Zimbabwe</p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright {new Date().getFullYear()} © Naija Threads. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
