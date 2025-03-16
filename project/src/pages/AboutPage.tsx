import React from 'react';
import { Cloud, Wind, Thermometer, Droplets } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Weather App</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your comprehensive weather forecasting solution
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Thermometer className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Accurate Forecasts
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Get precise weather forecasts powered by OpenWeatherMap API, providing real-time updates
              and accurate predictions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Wind className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detailed Metrics
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Access comprehensive weather metrics including temperature, humidity, wind speed, and
              atmospheric pressure.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Cloud className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                5-Day Forecast
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Plan ahead with our 5-day weather forecast, featuring detailed predictions for
              temperature and weather conditions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Droplets className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Location Based
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Get instant weather updates for your current location or search for any city worldwide.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Version 1.0.0 | Created with ❤️ using React and OpenWeatherMap API
          </p>
        </div>
      </div>
    </div>
  );
}