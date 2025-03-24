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
  

  // export const fetchOperationalCities = async () => {
  //   try {
  //     const response = await fetch("/api/postex/cities");
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch operational cities: ${response.statusText}`);
  //     }
  //     const data = await response.json(); 
  //     return data;
  //   } catch (error) {
  //     console.error("Error fetching operational cities:", error);
  //     return [];
  //   }
  // };

 // src/lib/getOperationalCities.ts (Server-side fetching function)

const fetchOperationalCities = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/postex/cities`, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!res.ok) {
    throw new Error('Failed to fetch operational cities');
  }

  const data = await res.json();
  return data?.dist.map((city: any) => ({
    label: city.operationalCityName,
    value: city.operationalCityName,
  })) ?? [];
};

// Export this function without `cache()`
export const getOperationalCities = fetchOperationalCities;
