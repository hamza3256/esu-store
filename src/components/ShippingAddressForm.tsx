import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Select from "react-select"; // Import the correct Select component

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string; // Optional
  postalCode?: string; // Optional
  country: string;
}

type HandleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
type HandleCityChange = (selectedOption: { label: string; value: string } | null) => void;

const ShippingAddressForm: React.FC<{
  shippingAddress: ShippingAddress;
  handleInputChange: HandleInputChange;
  handleCityChange: HandleCityChange;
  loading: boolean;
  cities: { label: string; value: string }[]; // Cities are expected in {label, value} format
}> = ({ shippingAddress, handleInputChange, handleCityChange, cities, loading }) => {
  return (
    <div className="space-y-6">
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
          {loading ? (<Loader2 className="h-4 w-4 animate-spin text-muted-foreground w-full" >Fetching available cities</Loader2>) : (
            <Select
             value={cities.find((city) => city.value === shippingAddress.city) || null}
             onChange={handleCityChange} // Use handleCityChange for updating the selected city
             options={cities}
             placeholder="Select or search for a city"
             isSearchable
           />
          )}
        </div>

        {/* State */}
        <div className="sm:col-span-1">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province (optional)
          </label>
          <div className="mt-1">
            <Input
              id="state"
              name="state"
              placeholder="State"
              value={shippingAddress.state || ""}
              onChange={handleInputChange}
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div className="sm:col-span-1">
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code (optional)
          </label>
          <div className="mt-1">
            <Input
              id="postalCode"
              name="postalCode"
              placeholder="Postal Code"
              value={shippingAddress.postalCode || ""}
              onChange={handleInputChange}
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

export default ShippingAddressForm;
