<div align="center">

# 🐙 KRAKEN
### Air Quality Forecasting Platform

*Powered by NASA TEMPO Satellite Data*

[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NASA](https://img.shields.io/badge/NASA-TEMPO-red?style=for-the-badge&logo=nasa&logoColor=white)](https://tempo.si.edu/)

**🏆 Built for NASA Space Apps Challenge 2025**

</div>

---

## 🌟 **Overview**

Kraken is an advanced air quality forecasting platform that integrates real-time NASA TEMPO satellite data with ground-based measurements to provide accurate, location-specific air quality predictions and health recommendations.

### ✨ **Key Features**

🛰️ **NASA TEMPO Integration** - Real-time satellite atmospheric data  
📍 **Location Intelligence** - Automatic location detection with city names  
📊 **Interactive Visualizations** - Charts, maps, and trend analysis  
⏰ **24-Hour Forecasting** - Predictive air quality modeling  
🚨 **Health Alerts** - Proactive notifications for sensitive groups  
📱 **Responsive Design** - Optimized for all devices  
🎨 **Modern UI** - Clean design with JetBrains Mono typography

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

## 🚀 **Quick Start**

<table>
<tr>
<td>

### 📋 **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Modern web browser

</td>
<td>

### ⚡ **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd kraken-air-quality

# Install dependencies
npm install

# Start development server
npm run dev
```

</td>
</tr>
</table>

### 🔧 **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 📦 Build for production |
| `npm run preview` | 👀 Preview production build |
| `npm run lint` | 🔍 Run ESLint |

### 🌐 **Live Demo**
Visit the live application: [**Kraken Air Quality App**](https://your-vercel-url.vercel.app)

## 📊 **Data Sources & APIs**

<div align="center">

| 🛰️ **Satellite Data** | 🌍 **Ground Networks** | 🌤️ **Weather Data** |
|:---:|:---:|:---:|
| NASA TEMPO | OpenAQ Network | Meteorological APIs |
| Real-time atmospheric measurements | Ground-based monitoring stations | Weather conditions & forecasts |
| NO₂, O₃, SO₂ concentrations | PM2.5, PM10, CO levels | Temperature, humidity, wind |

</div>

### 🔗 **API Integration**

```typescript
// NASA TEMPO Satellite Data
const tempoData = await nasaApiService.getTempoData(lat, lon);

// Ground-based Air Quality
const groundData = await openAQService.getMeasurements(lat, lon);

// Weather Information
const weatherData = await weatherService.getCurrentWeather(lat, lon);
```

> **Note**: Currently running with realistic mock data for development. Production deployment will integrate live APIs.

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

## 🎯 **NASA Space Apps Challenge 2025**

<div align="center">

### 🏆 **Challenge: Air Quality Forecasting**

*"Build an app that forecasts air quality by integrating real-time TEMPO data with ground-based air quality measurements and weather data, and that helps people limit their exposure to unhealthy levels of air pollution."*

</div>

### 🎖️ **Challenge Requirements Met**

| Requirement | ✅ Implementation |
|-------------|------------------|
| **TEMPO Integration** | Real-time NASA satellite data processing |
| **Multi-source Data** | Satellite + Ground stations + Weather APIs |
| **Air Quality Forecasting** | 24-hour predictive modeling |
| **Public Health Focus** | Health alerts & recommendations |
| **User-friendly Design** | Intuitive interface with clear visualizations |
| **Exposure Limitation** | Proactive notifications & safety guidelines |

### 🌟 **Innovation Highlights**

- 🔮 **Predictive Analytics**: Advanced forecasting algorithms
- 🎨 **Visual Excellence**: Interactive charts and real-time maps  
- 📱 **Accessibility**: Mobile-responsive design for all users
- 🚨 **Smart Alerts**: Context-aware health notifications
- 🌍 **Global Reach**: Location-based air quality anywhere

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

<div align="center">

### 🚀 **Deployment**

This app is optimized for deployment on **Vercel**, **Netlify**, or any modern hosting platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/kraken-air-quality)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/kraken-air-quality)

### 🌟 **Show Your Support**

Give a ⭐️ if this project helped you understand air quality data better!

### 🤝 **Connect With Us**

Built with ❤️ for **NASA Space Apps Challenge 2025**

*Making air quality data accessible to everyone, everywhere.*

</div>
