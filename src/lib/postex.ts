import useSWR from 'swr';

export const createPostexOrder = async (orderData: any) => {
    try {
      const response = await fetch("https://api.postex.pk/services/integration/api/order/v3/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": process.env.NEXT_PUBLIC_POSTEX_API_TOKEN!,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`PostEx API error: ${responseText}`);
        throw new Error(`PostEx API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data; // Return the parsed response
    } catch (error) {
      console.error("Error creating PostEx order:", error);
      throw new Error("Failed to create order in PostEx.");
    }
  };
  

  export const fetchOperationalCities = async () => {
    try {
      const response = await fetch("/api/postex/cities");
      if (!response.ok) {
        throw new Error(`Failed to fetch operational cities: ${response.statusText}`);
      }
      const data = await response.json(); 
      return data;
    } catch (error) {
      console.error("Error fetching operational cities:", error);
      return [];
    }
  };


const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useOperationalCities = () => {
  const { data, error } = useSWR('/api/postex/cities', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 86400 * 1000, // Revalidate only once a day (24 hours)
  });

  return {
    cities:  data?.dist.map((city: any) => ({
        label: city.operationalCityName,
        value: city.operationalCityName,
      })) ?? [],
    isLoading: !error && !data,
    isError: error,
  };
};