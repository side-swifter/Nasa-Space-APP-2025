# 🐙 Kraken - Air Quality Forecasting App

A modern TypeScript React application that forecasts air quality by integrating real-time NASA TEMPO satellite data with ground-based air quality measurements and weather data.

## 🚀 Features

- **Real-time Air Quality Monitoring**: Display current AQI and pollutant levels
- **NASA TEMPO Integration**: Satellite-based atmospheric measurements
- **Interactive Map**: Click to change locations and view air quality data
- **24-Hour Forecasting**: Predict air quality trends for the next day
- **Health Alerts**: Proactive notifications about air quality risks
- **Historical Trends**: 7-day historical air quality data visualization
- **Responsive Design**: Works on desktop and mobile devices
- **Kraken Branding**: Custom design with JetBrains Mono font

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## 🎨 Design System

### Colors
- **Kraken Beige**: `#e5bf99`
- **Kraken Red**: `#cd4634`
- **Kraken Dark**: `#211f20`
- **Kraken Light**: `#e5e7eb`

### Typography
- **Font**: JetBrains Mono (monospace)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kraken-air-quality
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Data Sources

- **NASA TEMPO**: Satellite-based atmospheric measurements
- **Ground Stations**: Real-time air quality monitoring networks
- **Weather Data**: Meteorological conditions affecting air quality

## 🔧 API Integration

The app is designed to integrate with:

1. **NASA Earthdata API**: TEMPO satellite data
2. **OpenAQ API**: Ground-based air quality measurements
3. **Weather APIs**: Meteorological data

Currently running with mock data for development. To integrate real APIs:

1. Update the `nasaApiService.ts` file
2. Add your API keys to environment variables
3. Configure API endpoints in the service

## 🌍 Air Quality Index (AQI) Scale

- **Good (0-50)**: Green - Air quality is satisfactory
- **Moderate (51-100)**: Yellow - Acceptable for most people
- **Unhealthy for Sensitive Groups (101-150)**: Orange - Sensitive individuals may experience health effects
- **Unhealthy (151-200)**: Red - Everyone may begin to experience health effects
- **Very Unhealthy (201-300)**: Purple - Health alert for everyone
- **Hazardous (301+)**: Maroon - Emergency conditions

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # App header with branding
│   ├── AirQualityMap.tsx    # Interactive map component
│   ├── AirQualityChart.tsx  # Historical data charts
│   ├── MetricCard.tsx       # Pollutant metric cards
│   ├── AlertPanel.tsx       # Health alerts and notifications
│   └── ForecastPanel.tsx    # 24-hour forecast display
├── pages/              # Page components
│   └── Dashboard.tsx   # Main dashboard page
├── services/           # API and data services
│   └── nasaApiService.ts    # NASA API integration
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## 🎯 NASA Space Apps Challenge

This app was built for the NASA Space Apps Challenge 2025, addressing the challenge:

> "Build an app that forecasts air quality by integrating real-time TEMPO data with ground-based air quality measurements and weather data, and that helps people limit their exposure to unhealthy levels of air pollution."

### Key Features for the Challenge:

1. **TEMPO Integration**: Uses NASA's latest TEMPO satellite data
2. **Multi-source Data**: Combines satellite, ground, and weather data
3. **Public Health Focus**: Provides clear health recommendations
4. **User-centric Design**: Easy to understand visualizations
5. **Proactive Alerts**: Timely notifications about air quality risks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing TEMPO satellite data
- OpenAQ for ground-based air quality data
- The open-source community for the amazing tools and libraries

---

Built with ❤️ for NASA Space Apps Challenge 2025
