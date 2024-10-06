"use client"

import { Parallax } from "react-parallax"

const ParallaxSection = () => {
    return (
        <Parallax bgImage="https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227919/order-confirmation.jpg" strength={500} lazy={true}>
          <div className="h-96 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-white mb-4">Crafted with Passion</h2>
              <p className="text-lg text-gray-200">
                Every piece tells a story of artisanal excellence and timeless beauty.
              </p>
            </div>
          </div>
        </Parallax>
    )
}

export default ParallaxSection