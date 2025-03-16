import React from 'react';
import { format } from 'date-fns';
import { ForecastData } from '../types/weather';

interface ForecastCardProps {
  data: ForecastData;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ data }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full max-w-4xl mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {data.list.filter((_, index) => index % 8 === 0).map((item) => (
          <div key={item.dt} className="p-4 rounded-lg bg-blue-50">
            <p className="font-semibold text-gray-800">
              {format(new Date(item.dt * 1000), 'EEE')}
            </p>
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt={item.weather[0].description}
              className="w-12 h-12 mx-auto"
            />
            <p className="text-lg font-bold text-gray-800">
              {Math.round(item.main.temp)}°C
            </p>
            <p className="text-sm text-gray-600 capitalize">
              {item.weather[0].description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};