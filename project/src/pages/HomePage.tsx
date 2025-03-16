import React from 'react';
import { Cloud, SunMedium } from 'lucide-react';
import { WeatherCard } from '../components/WeatherCard';
import { ForecastCard } from '../components/ForecastCard';
import { SearchBar } from '../components/SearchBar';
import { ChatSupport } from '../components/ChatSupport';
import { useWeather } from '../hooks/useWeather';

export default function HomePage() {
  const { weather, forecast, loading, error, fetchWeatherByCoords } = useWeather();

  const handleCitySelect = (lat: number, lon: number, cityName: string) => {
    fetchWeatherByCoords(lat, lon);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated clouds background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="cloud-1"></div>
          <div className="cloud-2"></div>
          <div className="cloud-3"></div>
        </div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              {weather?.weather[0].main.toLowerCase().includes('cloud') ? (
                <Cloud className="text-white" size={40} />
              ) : (
                <SunMedium className="text-white" size={40} />
              )}
              <h1 className="text-4xl font-bold text-white">Weather Forecast</h1>
            </div>
            <p className="text-white/90">Get real-time weather updates for any location</p>
          </div>

          <div className="mb-12">
            <SearchBar onCitySelect={handleCitySelect} loading={loading} />
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto mb-6">
              {error}
            </div>
          )}

          {weather && (
            <div className="flex flex-col items-center gap-6">
              <WeatherCard data={weather} />
              {forecast && <ForecastCard data={forecast} />}
            </div>
          )}
        </div>

        <ChatSupport />
      </div>
    </div>
  );
}