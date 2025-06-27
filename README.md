# 🌤️ WeatherVibe — Your AI-Powered Weather Activity Companion

Welcome to **WeatherVibe**, an intelligent web app that doesn’t just show weather — it **tells you what to do** with it! Powered by **Groq's blazing-fast Gemma model** and **OpenWeatherMap API**, this app suggests the best activities based on live weather conditions 🌍.

---

## 🚀 Features

🔍 **Real-time City Weather**  
Search for any city and get instant, detailed weather data (temperature, humidity, wind, visibility, etc.).

🧠 **AI-Powered Activity Suggestions**  
Using the **Groq Gemma model**, we interpret weather data and recommend activities like outdoor hiking, museum visits, photography walks, and more — personalized to the moment.

🎨 **Beautiful Responsive UI**  
Crafted with sleek modern design, animations, and a calming color palette — mobile & desktop ready.

🌙 **Dark Mode Support**  
Switch themes effortlessly based on your system or preference.

---

## 🔧 Tech Stack

| Layer         | Technology |
|--------------|------------|
| 💬 AI Model   | Groq Gemma (via GroqCloud) |
| 🌦️ Weather API | OpenWeatherMap |
| 🌐 Frontend   | React.js + Tailwind CSS |
| ⚙️ Backend    | FastAPI (optional for agent orchestration) |
| 🎯 Hosting    | Netlify / Vercel (Recommended) |

---

## 📸 Preview

> “Perfect weather for outdoor activities in Bangalore!”  
> Here’s a glimpse of the app in action:

![image](https://github.com/user-attachments/assets/e71e0b36-30ad-4a4f-81bc-7ae9d599432a)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/weathervibe.git
cd weathervibe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add API Keys (OpenWeather & Groq)
Create a `.env` file in the root folder with the following content:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

If you're also using FastAPI as a backend, create a separate `.env` in the backend directory:

```env
GROQ_API_KEY=your_groq_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

> 💡 You can get your Groq API key from https://console.groq.com/keys

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Optional: Start Backend (FastAPI)
If you are using the backend agent orchestration:
```bash
cd backend
uvicorn main:app --reload
```

### 6. Build for Production
```bash
npm run build
```

---

## 🤖 How It Works

1. Weather data is fetched in real-time from **OpenWeatherMap**.
2. This data is passed to an **AI Agent** running on the **Groq Gemma model**.
3. The agent returns relevant activities and best times to go out.
4. The UI presents a personalized, easy-to-understand experience.

---

## 🎯 Future Enhancements

- 🗣️ Voice-based interaction (via Whisper API)
- 📍 GPS-based auto-location + suggestions
- 📆 Event & festival recommendations
- 🌤️ Multi-day activity planner

---

## 🤝 Contributing

We welcome your ideas, feedback, and pull requests!  
Feel free to open an [issue](https://github.com/your-username/weathervibe/issues) or submit a feature request 🚀

---

## 📄 License

MIT License © 2025 Keshav

---

## 💌 Connect

Made with 💜 by Keshav  
Let the weather decide your vibe ✨
