import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/insurance/weather';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/weather/current
 *
 * Weather proxy for Open-Meteo. Caches results in weather_data table.
 *
 * Params:
 *   ?lat=X&lng=Y             → current weather
 *   ?lat=X&lng=Y&start=...&end=... → historical data
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    const admin = await createAdminClient();
    const weather = new WeatherService(admin);

    if (start && end) {
      // Historical data
      const data = await weather.getHistoricalWeather(lat, lng, start, end);

      // Cache each day
      for (const day of data) {
        await weather.cacheWeatherData(lat, lng, day.date, day);
      }

      return NextResponse.json({ historical: data });
    } else {
      // Current weather
      const data = await weather.getCurrentWeather(lat, lng);

      // Cache today's data
      const today = new Date().toISOString().split('T')[0];
      await weather.cacheWeatherData(lat, lng, today, {
        temperature_max: data.temperature,
        precipitation_sum: data.precipitation,
        humidity_mean: data.humidity,
        wind_speed_max: data.wind_speed,
        soil_moisture: data.soil_moisture,
      });

      return NextResponse.json({ current: data });
    }
  } catch (err) {
    console.error('Weather API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
