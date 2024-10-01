import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { useState } from "react";

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type HandleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;


const ShippingAddressForm: React.FC<{
  shippingAddress: ShippingAddress;
  handleInputChange: HandleInputChange;
}> = ({ shippingAddress, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label htmlFor="line1" className="block text-sm font-medium text-gray-700">
            Address Line 1
          </label>
          <div className="mt-1">
            <Input
              id="line1"
              name="line1"
              placeholder="123 Main St"
              value={shippingAddress.line1}
              onChange={handleInputChange}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label htmlFor="line2" className="block text-sm font-medium text-gray-700">
            Address Line 2 (optional)
          </label>
          <div className="mt-1">
            <Input
              id="line2"
              name="line2"
              placeholder="Apartment, suite, etc."
              value={shippingAddress.line2}
              onChange={handleInputChange}
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* City */}
        <div className="sm:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <Input
              id="city"
              name="city"
              placeholder="City"
              value={shippingAddress.city}
              onChange={handleInputChange}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* State */}
        <div className="sm:col-span-1">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <div className="mt-1">
            <Input
              id="state"
              name="state"
              placeholder="State"
              value={shippingAddress.state}
              onChange={handleInputChange}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div className="sm:col-span-1">
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <div className="mt-1">
            <Input
              id="postalCode"
              name="postalCode"
              placeholder="Postal Code"
              value={shippingAddress.postalCode}
              onChange={handleInputChange}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Country */}
        <div className="sm:col-span-2">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <div className="mt-1">
            <select
              id="country"
              name="country"
              value={shippingAddress.country}
              onChange={handleInputChange}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a country</option>
              <option value="PK">Pakistan</option>
              {/* Add more countries as needed */}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressForm