"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client"; // Import tRPC client

const searchSuggestions = [
  "Search for... Shirts",
  "Search for... Dresses",
  "Search for... Jeans",
  "Search for... Necklaces",
  "Search for... Earrings",
  "Search for... Watches",
  "Search for... Sneakers",
  "Search for... Bags",
  "Search for... Sunglasses",
  "Search for... Hats",
];

interface SearchResult {
  imageUrl: string; // Adjust to map the correct image URL
  id: string;
  name: string; // Assume name exists; otherwise, adjust accordingly
  category: string; // Assume category exists; otherwise, adjust accordingly
}

interface SearchBarProps {
  isTransparent: boolean;
  isHovered: boolean;
  isMobile: boolean;
}

export default function SearchBar({
  isTransparent,
  isHovered,
  isMobile,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const suggestionIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const animationSpeed = useRef(80);
  const animationTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const animatePlaceholder = useCallback(() => {
    const currentSuggestion = searchSuggestions[suggestionIndex.current];

    if (isDeleting.current) {
      charIndex.current -= 1;
      animationSpeed.current = 40;
    } else {
      charIndex.current += 1;
      animationSpeed.current = 80;
    }

    setPlaceholder(currentSuggestion.slice(0, charIndex.current));

    if (!isDeleting.current && charIndex.current === currentSuggestion.length) {
      isDeleting.current = true;
      animationSpeed.current = 2000; // Pause before deleting
    } else if (isDeleting.current && charIndex.current === 0) {
      isDeleting.current = false;
      suggestionIndex.current =
        (suggestionIndex.current + 1) % searchSuggestions.length;
      animationSpeed.current = 500; // Pause before typing next suggestion
    }

    if (!isTyping) {
      animationTimeoutId.current = setTimeout(
        animatePlaceholder,
        animationSpeed.current
      );
    }
  }, [isTyping]);

  const { data, error, isLoading } = trpc.searchProducts.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: !!searchQuery } // Only run query if searchQuery is not empty
  );

  useEffect(() => {
    if (!isTyping) {
      animatePlaceholder();
    }
    return () => {
      if (animationTimeoutId.current) {
        clearTimeout(animationTimeoutId.current);
      }
    };
  }, [isTyping, animatePlaceholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (data) {
      if (data.items.length > 0) {
        // Map the API data to the SearchResult format
        const mappedResults = data.items.map((item: any) => ({
          id: item.id,
          name: item.name || "Unnamed Product", // Fallback in case name is missing
          category: item.category || "Uncategorized", // Adjust as necessary
          imageUrl: item.images[0]?.image?.url || item.image?.url || "", // Fallback to a generic image URL if none exist
        }));

        setSearchResults(mappedResults);
        setShowResults(true); // Show results once the search completes
        setErrorMessage(null);
      } else {
        setSearchResults([]);
        setErrorMessage("No products found.");
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      setErrorMessage("An error occurred while searching.");
    }
  }, [error]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTyping(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsTyping(true);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsTyping(false);
    setShowResults(false);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
      if (!isExpanded) {
        setIsTyping(true);
      }
    }
  };

  const handleFocus = () => {
    setIsTyping(true);
    if (animationTimeoutId.current) {
      clearTimeout(animationTimeoutId.current);
    }
  };

  const handleBlur = () => {
    setIsTyping(searchQuery.length > 0);
    if (isMobile && searchQuery.length === 0) {
      setIsExpanded(false);
    }
    if (!isTyping && !animationTimeoutId.current) {
      suggestionIndex.current = 0;
      charIndex.current = 0;
      isDeleting.current = false;
      animatePlaceholder();
    }
  };

  const bgColor = isTransparent && !isHovered ? "bg-transparent" : "bg-white";
  const textColor = isTransparent && !isHovered ? "text-white" : "text-gray-900";
  const borderColor = isTransparent && !isHovered ? "border-white" : "border-gray-300";
  const iconColor = isTransparent && !isHovered ? "text-white" : "text-gray-400";

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out ${bgColor} ${
        isMobile ? "w-auto" : "w-full max-w-3xl"
      } mx-auto px-2`}
      ref={searchBarRef}
    >
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`relative flex items-center ${
            isMobile && !isExpanded ? "w-10 h-10" : "w-full"
          }`}
        >
          {(!isMobile || isExpanded) && (
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`w-full py-2 pl-10 pr-4 ${textColor} ${bgColor} bg-opacity-80 backdrop-blur-sm border ${borderColor} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out`}
              aria-label="Search products"
            />
          )}
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
              isMobile && !isExpanded
                ? "pointer-events-auto cursor-pointer"
                : "pointer-events-none"
            }`}
            onClick={toggleExpand}
          >
            <Search className={`w-5 h-5 ${iconColor}`} />
          </div>
          {searchQuery && !isMobile && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity duration-300 ease-in-out"
            >
              <X className={`w-5 h-5 ${iconColor} hover:text-gray-600`} />
              <span className="sr-only">Clear search</span>
            </button>
          )}
          {!isTyping && !isMobile && (
            <div
              className="absolute inset-y-0 left-12 flex items-center pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <span className={`${textColor} whitespace-nowrap`}>
                {placeholder}
                <span className="animate-blink">|</span>
              </span>
            </div>
          )}
        </div>
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>
      {showResults && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg">
          <div className="p-4">
            {isLoading && <p className="text-gray-500">Loading...</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {searchResults.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2">Search Results</h3>
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/product/${result.id}`}
                    className="flex items-center mb-2 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-12 h-12 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-gray-500">{result.category}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="block mt-4 text-center text-gray-800 hover:font-bold"
                >
                  VIEW ALL
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
