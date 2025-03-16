import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const WEATHER_API_KEY = '28f6f52872dbc0b3ce88987416bbf3f9';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WeatherInfo {
  main: {
    temp: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  name: string;
}

const weatherKeywords = [
  'weather', 'temperature', 'celsius', 'fahrenheit',
  'pressure', 'wind', 'speed', 'clouds', 'cloudy',
  'sunny', 'rain', 'rainfall', 'precipitation',
  'humidity', 'forecast', 'climate', 'atmospheric',
  'storm', 'thunderstorm', 'condition', 'hot', 'cold',
  'warm', 'chilly', 'breeze', 'gust', 'meteorological'
];

const extractLocation = (query: string): string | null => {
  const locationPatterns = [
    /(?:in|at|for|of)\s+([A-Za-z\s,]+)$/i,
    /([A-Za-z\s,]+?)(?:'s|\s+weather|\s+temperature|\s+forecast)/i,
    /^([A-Za-z\s,]+)$/i
  ];

  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const getWeatherData = async (location: string): Promise<WeatherInfo | null> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

const formatWeatherResponse = (weatherData: WeatherInfo, query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('temperature')) {
    return `The current temperature in ${weatherData.name} is ${Math.round(weatherData.main.temp)}°C with ${weatherData.weather[0].description}.`;
  }
  
  if (lowerQuery.includes('pressure')) {
    return `The atmospheric pressure in ${weatherData.name} is ${weatherData.main.pressure} hPa.`;
  }
  
  if (lowerQuery.includes('wind')) {
    return `The wind speed in ${weatherData.name} is ${weatherData.wind.speed} m/s.`;
  }
  
  if (lowerQuery.includes('cloud')) {
    return `The cloud coverage in ${weatherData.name} is ${weatherData.clouds.all}% with ${weatherData.weather[0].description}.`;
  }
  
  return `Current weather in ${weatherData.name}:
• Temperature: ${Math.round(weatherData.main.temp)}°C
• Conditions: ${weatherData.weather[0].description}
• Wind Speed: ${weatherData.wind.speed} m/s
• Pressure: ${weatherData.main.pressure} hPa
• Humidity: ${weatherData.main.humidity}%`;
};

const isWeatherRelatedQuery = (query: string): boolean => {
  return weatherKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
};

const getFallbackResponse = (query: string): string => {
  if (!isWeatherRelatedQuery(query)) {
    return "I can only help with weather-related questions. Please ask me about weather conditions, temperature, pressure, wind speed, or clouds in any location.";
  }
  
  return "I can help you check weather conditions for any location. Please specify a city or location in your question.";
};

export const generateChatResponse = async (messages: ChatMessage[]): Promise<string> => {
  const userMessage = messages[messages.length - 1].content;
  
  if (!isWeatherRelatedQuery(userMessage)) {
    return "I can only help with weather-related questions. Please ask me about weather conditions, temperature, pressure, wind speed, or clouds in any location.";
  }

  const location = extractLocation(userMessage);
  if (location) {
    const weatherData = await getWeatherData(location);
    if (weatherData) {
      return formatWeatherResponse(weatherData, userMessage);
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: `You are a weather expert assistant. Only provide information about weather conditions, 
          temperature, pressure, wind speed, and clouds. If a question is not related to these topics, 
          politely decline to answer and remind the user of your weather-specific focus. Keep responses 
          concise, accurate, and weather-focused. Current date: ${new Date().toLocaleDateString()}`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0]?.message?.content || getFallbackResponse(userMessage);
  } catch (error: any) {
    console.error('Error generating response:', error);
    
    if (error?.status === 429 || error?.error?.type === 'insufficient_quota') {
      return getFallbackResponse(userMessage);
    }
    
    throw new Error('Failed to generate response');
  }
};

export const getWeatherAssistantContext = (): ChatMessage => {
  return {
    role: 'system',
    content: `You are a specialized weather assistant focused solely on:
    - Current weather conditions
    - Temperature information
    - Atmospheric pressure
    - Wind speed and direction
    - Cloud coverage and conditions
    
    You will ONLY answer questions related to these topics. For any other questions,
    politely remind users that you can only discuss weather-related topics.
    
    Current date: ${new Date().toLocaleDateString()}`
  };
};