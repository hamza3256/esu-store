"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'

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
  "Search for... Hats"
]

interface SearchBarProps {
  isTransparent: boolean;
  isHovered: boolean;
  isMobile: boolean;
}

export default function SearchBar({ isTransparent, isHovered, isMobile }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const suggestionIndex = useRef(0)
  const charIndex = useRef(0)
  const isDeleting = useRef(false)
  const animationSpeed = useRef(80)
  const animationTimeoutId = useRef<NodeJS.Timeout | null>(null)

  const animatePlaceholder = useCallback(() => {
    const currentSuggestion = searchSuggestions[suggestionIndex.current]

    if (isDeleting.current) {
      charIndex.current -= 1
      animationSpeed.current = 40
    } else {
      charIndex.current += 1
      animationSpeed.current = 80
    }

    setPlaceholder(currentSuggestion.slice(0, charIndex.current))

    if (!isDeleting.current && charIndex.current === currentSuggestion.length) {
      isDeleting.current = true
      animationSpeed.current = 2000 // Pause before deleting
    } else if (isDeleting.current && charIndex.current === 0) {
      isDeleting.current = false
      suggestionIndex.current = (suggestionIndex.current + 1) % searchSuggestions.length
      animationSpeed.current = 500 // Pause before typing next suggestion
    }

    if (!isTyping) {
      animationTimeoutId.current = setTimeout(animatePlaceholder, animationSpeed.current)
    }
  }, [isTyping])

  useEffect(() => {
    if (!isTyping) {
      animatePlaceholder()
    }
    return () => {
      if (animationTimeoutId.current) {
        clearTimeout(animationTimeoutId.current)
      }
    }
  }, [isTyping, animatePlaceholder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsTyping(true)
    // Implement your search logic here
    console.log('Searching for:', searchQuery)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsTyping(true)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsTyping(false)
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const toggleExpand = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded)
      if (!isExpanded) {
        setIsTyping(true)
      }
    }
  }

  const handleFocus = () => {
    setIsTyping(true)
    if (animationTimeoutId.current) {
      clearTimeout(animationTimeoutId.current)
    }
  }

  const handleBlur = () => {
    setIsTyping(searchQuery.length > 0)
    if (isMobile && searchQuery.length === 0) {
      setIsExpanded(false)
    }
    if (!isTyping && !animationTimeoutId.current) {
      suggestionIndex.current = 0
      charIndex.current = 0
      isDeleting.current = false
      animatePlaceholder()
    }
  }

  const bgColor = isTransparent && !isHovered ? 'bg-transparent' : 'bg-white'
  const textColor = isTransparent && !isHovered ? 'text-white' : 'text-gray-900'
  const borderColor = isTransparent && !isHovered ? 'border-white' : 'border-gray-300'
  const iconColor = isTransparent && !isHovered ? 'text-white' : 'text-gray-400'

  return (
    <div className={`transition-all duration-300 ease-in-out ${bgColor} ${isMobile ? 'w-auto' : 'w-full max-w-3xl'} mx-auto px-2`}>
      <form onSubmit={handleSearch} className="relative">
        <div className={`relative flex items-center ${isMobile && !isExpanded ? 'w-10 h-10' : 'w-full'}`}>
          {(!isMobile || isExpanded) && (
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`w-full py-2 pl-10 pr-4 ${textColor} ${bgColor} bg-opacity-80 backdrop-blur-sm border ${borderColor} left-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-300 ease-in-out`}
              aria-label="Search products"
            />
          )}
          <div 
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isMobile && !isExpanded ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
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
    </div>
  )
}