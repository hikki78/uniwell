import { cache } from 'react';

const WEATHER_API_KEY = '07aef2aeb5msh7fe88d267172891p16d646jsn687c6dca108c';

export type WeatherData = {
  location: string;
  temperature: string;
  condition: string;
  icon: string;
  feelsLike: string;
  humidity: number;
  windSpeed: string;
};

export const getWeather = cache(async (lat: number, lon: number): Promise<WeatherData | null> => {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': WEATHER_API_KEY,
      'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat},${lon}`,
      options
    );
    
    const data = await response.json();
    
    return {
      location: data.location.name,
      temperature: `${data.current.temp_c}°C`,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      feelsLike: `${data.current.feelslike_c}°C`,
      humidity: data.current.humidity,
      windSpeed: `${data.current.wind_kph} km/h`,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
});

export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};
