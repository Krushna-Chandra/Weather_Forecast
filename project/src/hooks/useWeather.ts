import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WeatherData, ForecastData } from '../types/weather';

const API_KEY = '28f6f52872dbc0b3ce88987416bbf3f9';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const LAST_LOCATION_KEY = 'lastSearchedLocation';
const DEFAULT_LOCATION = 'Odisha';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLocationAttempted, setGeoLocationAttempted] = useState(false);

  const fetchWeatherData = async (city: string) => {
    try {
      setLoading(true);
      setError(null);

      const weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
      const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);

      if (weatherResponse.data && forecastResponse.data) {
        setWeather(weatherResponse.data);
        setForecast(forecastResponse.data);
        // Save the successfully searched location
        localStorage.setItem(LAST_LOCATION_KEY, city);
      } else {
        throw new Error('Invalid response from weather API');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      if (err.response?.status === 404) {
        setError('City not found. Please check the spelling and try again.');
      } else if (err.response?.status === 401) {
        setError('API key validation failed. Please try again later.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Unable to fetch weather data. Please try again later.');
      }
      console.error('Weather API Error:', {
        status: err.response?.status,
        message: errorMessage,
        code: err.code
      });
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const weatherUrl = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
      const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);
      
      if (weatherResponse.data && forecastResponse.data) {
        setWeather(weatherResponse.data);
        setForecast(forecastResponse.data);
        // Save the city name for future use
        if (weatherResponse.data.name) {
          localStorage.setItem(LAST_LOCATION_KEY, weatherResponse.data.name);
        }
      } else {
        throw new Error('Invalid response from weather API');
      }
    } catch (err: any) {
      console.error('Geolocation Weather Error:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        code: err.code
      });
      const lastLocation = localStorage.getItem(LAST_LOCATION_KEY);
      if (lastLocation) {
        setError('Unable to fetch weather data for your location. Showing last searched location instead.');
        fetchWeatherData(lastLocation);
      } else {
        setError(`Unable to fetch weather data for your location. Showing ${DEFAULT_LOCATION} weather instead.`);
        fetchWeatherData(DEFAULT_LOCATION);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultWeather = () => {
    const lastLocation = localStorage.getItem(LAST_LOCATION_KEY);
    if (lastLocation) {
      setError('Location access unavailable. Showing last searched location instead.');
      fetchWeatherData(lastLocation);
    } else {
      setError(`Location access unavailable. Showing ${DEFAULT_LOCATION} weather instead.`);
      fetchWeatherData(DEFAULT_LOCATION);
    }
  };

  useEffect(() => {
    // Only attempt geolocation once
    if (geoLocationAttempted) return;
    
    setGeoLocationAttempted(true);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      loadDefaultWeather();
      return;
    }

    // Set up a timeout to handle geolocation failures
    const timeoutId = setTimeout(() => {
      loadDefaultWeather();
    }, 10000); // 10 seconds timeout

    // Success handler - called when geolocation succeeds
    const successHandler = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    };

    // Error handler - called when geolocation fails
    const errorHandler = (error: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      console.error('Geolocation Error:', {
        code: error.code,
        message: error.message
      });
      loadDefaultWeather();
    };

    // Request geolocation with improved options
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { 
        enableHighAccuracy: false, // Lower accuracy is fine for weather
        timeout: 10000,           // 10 seconds timeout
        maximumAge: 600000        // Accept positions up to 10 minutes old
      }
    );

    // Clean up timeout if component unmounts
    return () => clearTimeout(timeoutId);
  }, [geoLocationAttempted]);

  return {
    weather,
    forecast,
    loading,
    error,
    fetchWeatherData,
    fetchWeatherByCoords
  };
}