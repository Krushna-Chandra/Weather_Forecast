import React from 'react';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
          <p className="text-gray-600">{data.sys.country}</p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
          alt={data.weather[0].description}
          className="w-20 h-20"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-5xl font-bold text-gray-800">
            {Math.round(data.main.temp)}°C
          </span>
          <span className="text-gray-600 capitalize">
            {data.weather[0].description}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Thermometer className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Feels Like</p>
            <p className="font-semibold">{Math.round(data.main.feels_like)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Humidity</p>
            <p className="font-semibold">{data.main.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Wind Speed</p>
            <p className="font-semibold">{data.wind.speed} m/s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Pressure</p>
            <p className="font-semibold">{data.main.pressure} hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
};