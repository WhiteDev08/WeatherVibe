"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Sun,
  Moon,
  ActivityIcon,
  Calendar,
  Clock,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  description: string
}

interface Activity {
  name: string
  description: string
  category: string
  rating: number
  duration: string
  bestTime: string
}

export default function WeatherApp() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add this function to handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const fetchWeatherAndActivities = async () => {
  if (!city.trim()) return

  setLoading(true)
  try {
    // Call your FastAPI backend
    const response = await fetch('http://localhost:8000/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ city: city.trim() }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        alert('City not found. Please check the city name and try again.')
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Set the weather and activities data from your backend
    setWeather(data.weather)
    setActivities(data.activities)
    
  } catch (error) {
    console.error("Error fetching data:", error)
    alert('Failed to fetch weather data. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeatherAndActivities()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Adventure: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      Creative: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      "Food & Drink": "bg-green-500/20 text-green-700 dark:text-green-300",
      Culture: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      Leisure: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-700 dark:text-gray-300"
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "☀️"
      case "cloudy":
        return "☁️"
      case "rainy":
        return "🌧️"
      case "snowy":
        return "❄️"
      default:
        return "🌤️"
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%239C92AC%22 fillOpacity%3D%220.05%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.03%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <ActivityIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WeatherVibe
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discover activities for any weather</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-2 hover:scale-105 transition-transform bg-transparent"
          >
            {mounted && (resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </Button>
        </div>

        {/* Search Section */}
        <Card className="mb-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {weather && (
          <>
            {/* Weather Display */}
            <Card className="mb-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <MapPin className="w-6 h-6" />
                      <span>{weather.city}</span>
                    </h2>
                    <p className="text-blue-100 mt-1">{weather.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold flex items-center space-x-2">
                      <span>{getWeatherIcon(weather.condition)}</span>
                      <span>{weather.temperature}°C</span>
                    </div>
                    <p className="text-blue-100 text-lg">{weather.condition}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                      <p className="font-semibold">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Wind className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Wind</p>
                      <p className="font-semibold">{weather.windSpeed} km/h</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
                      <p className="font-semibold">{weather.visibility} km</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Feels like</p>
                      <p className="font-semibold">{weather.temperature + 2}°C</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <ActivityIcon className="w-6 h-6 text-blue-500" />
                <span>Recommended Activities</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity, index) => (
                  <Card
                    key={index}
                    className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {activity.name}
                        </CardTitle>
                        <Badge className={getCategoryColor(activity.category)}>{activity.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{activity.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{activity.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Best time: {activity.bestTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {!weather && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">Discover Your Perfect Day</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter a city name to get weather information and personalized activity recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
