import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import axios from 'axios';
import { CitySearchResult } from '../types/weather';

interface SearchBarProps {
  onCitySelect: (lat: number, lon: number, cityName: string) => void;
  loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect, loading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const API_KEY = '28f6f52872dbc0b3ce88987416bbf3f9';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCity = async () => {
    if (query.length < 2) return;

    setSearchLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=5&appid=${API_KEY}`
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const city = response.data[0];
        handleCitySelect(city);
      }
    } catch (error) {
      console.error('Error fetching city:', error);
    } finally {
      setSearchLoading(false);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const encodedQuery = encodeURIComponent(query.trim());
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=5&appid=${API_KEY}`
        );

        if (response.data && Array.isArray(response.data)) {
          setSuggestions(response.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleCitySelect = (city: CitySearchResult) => {
    setQuery(`${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`);
    setShowSuggestions(false);
    onCitySelect(city.lat, city.lon, city.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchCity();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 pl-12 pr-4 bg-white/90 backdrop-blur-sm rounded-l-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
        <button
          type="submit"
          disabled={loading || searchLoading || query.length < 2}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-r-lg shadow-lg transition-colors flex items-center gap-2"
        >
          {(loading || searchLoading) ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            'Search'
          )}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}-${index}`}
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
            >
              <MapPin size={18} className="text-gray-400" />
              <div>
                <div className="font-medium text-gray-800">{city.name}</div>
                <div className="text-sm text-gray-500">
                  {city.state ? `${city.state}, ` : ''}{city.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};