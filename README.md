# Latency Topology Visualizer

A Next.js application that displays a 3D world map visualizing exchange server locations and real-time/historical latency data across AWS, GCP, and Azure co-location regions for cryptocurrency trading infrastructure.

## 🚀 Features

### 3D World Map Display
- Interactive 3D world map with smooth camera controls
- Real-time exchange server locations as 3D markers
- Rotate, zoom, and pan functionality
- Smooth camera transitions and animations

### Exchange Server Locations
- Major cryptocurrency exchange server locations (Binance, OKX, Coinbase, Kraken, Bybit, Deribit, etc.)
- Server information on hover/click (exchange name, location, cloud provider)
- Visual markers with different colors for AWS, GCP, and Azure hosted servers
- Interactive legend explaining marker types and colors

### Real-time Latency Visualization
- Animated latency connections between exchange servers and cloud regions
- Real-time latency values with animated data streams and pulse effects
- Color-coded connections (green for low, yellow for medium, red for high latency)
- Automatic data updates every 5-10 seconds

### Historical Latency Trends
- Time-series charts showing historical latency data for selected server pairs
- Multiple chart types: Line, Bar, and Area charts
- Latency statistics (min, max, average) for selected time periods
- Time range selectors (1 hour, 24 hours, 7 days, 30 days)

### Cloud Provider Regions
- AWS, GCP, and Azure co-location regions visualization
- Region boundaries and clusters with distinct visual styling
- Region information including provider name, region code, and server count
- Filtering options to show/hide specific cloud providers

### Interactive Controls
- Advanced control panel for filtering by exchange, cloud provider, or latency range
- Search functionality to quickly locate specific exchanges or regions
- Toggle switches for different visualization layers (real-time, historical, regions)
- Performance metrics dashboard showing current system status

### Responsive Design
- Fully responsive and user-friendly across various screen sizes
- Optimized 3D rendering performance for mobile devices
- Touch controls for mobile interaction with the 3D map

### Bonus Features
- Dark/light theme toggle for better user experience
- Export functionality for latency reports and visualizations (JSON, CSV, PDF)
- Performance monitoring and optimization
- Real-time API health monitoring
- Rate limiting and caching mechanisms

## 🛠️ Technology Stack

- **Framework**: Next.js 15.4.2 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd latency-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_CLOUDFLARE_API_URL=https://api.cloudflare.com/client/v4
   NEXT_PUBLIC_PINGDOM_API_URL=https://api.pingdom.com/api/3.1
   NEXT_PUBLIC_FREE_APIS_BASE_URL=https://api.publicapis.org

   # Development Configuration
   NEXT_PUBLIC_DEV_MODE=true
   NEXT_PUBLIC_ENABLE_MOCK_DATA=true

   # Performance Configuration
   NEXT_PUBLIC_REFRESH_INTERVAL=5000
   NEXT_PUBLIC_MAX_RETRIES=3
   NEXT_PUBLIC_TIMEOUT=10000

   # 3D Map Configuration
   NEXT_PUBLIC_MAP_QUALITY=high
   NEXT_PUBLIC_ENABLE_WEBGL=true
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
latency-visualizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── cloudflare/    # Cloudflare API proxy
│   │   │   └── pingdom/       # Pingdom API proxy
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   └── providers.tsx      # Redux provider
│   ├── components/            # React components
│   │   ├── ControlsPanel.tsx  # Control panel
│   │   ├── ExportPanel.tsx    # Export functionality
│   │   ├── LatencyChart.tsx   # Charts component
│   │   ├── Map.tsx            # 3D map component
│   │   ├── SkeletonLoader.tsx # Loading states
│   │   └── ThemeToggle.tsx    # Theme switcher
│   ├── hooks/                 # Custom hooks
│   │   ├── useLatencyHistory.ts
│   │   └── useReduxLatency.ts
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API services
│   │   │   ├── axios-instance.ts
│   │   │   ├── cloudflare-service.ts
│   │   │   ├── endpoints.ts
│   │   │   ├── free-apis-service.ts
│   │   │   ├── health-monitor.ts
│   │   │   ├── performance-monitor.ts
│   │   │   └── rate-limiter.ts
│   │   └── constants.ts       # Application constants
│   ├── store/                 # Redux store
│   │   ├── slices/           # Redux slices
│   │   │   ├── apiSlice.ts
│   │   │   ├── latencySlice.ts
│   │   │   └── uiSlice.ts
│   │   ├── hooks.ts          # Redux hooks
│   │   └── index.ts          # Store configuration
│   └── types/                 # TypeScript types
│       └── latency.ts
├── public/                    # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Key Components

### 3D Map Component (`src/components/Map.tsx`)
- Interactive 3D world visualization using Three.js
- Exchange markers with real-time latency data
- Animated connections between exchanges
- Cloud provider region visualization

### Latency Chart Component (`src/components/LatencyChart.tsx`)
- Time-series charts using Recharts
- Multiple chart types (Line, Bar, Area)
- Real-time data updates
- Interactive tooltips and legends

### Controls Panel (`src/components/ControlsPanel.tsx`)
- Advanced filtering and search functionality
- Cloud provider selection
- Latency range controls
- Visualization layer toggles

### Redux Store (`src/store/`)
- Centralized state management
- Real-time data synchronization
- API health monitoring
- Performance metrics tracking

## 🔧 Configuration

### API Configuration
The application supports multiple data sources:
- **Cloudflare Radar API**: Real-time network performance data
- **Free Public APIs**: Fallback data sources for latency measurement
- **Simulated Data**: Generated data for demonstration purposes

### Performance Settings
- **Refresh Interval**: Configurable data update frequency (default: 10 seconds)
- **Cache Duration**: API response caching (default: 30 seconds)
- **Rate Limiting**: Request throttling to prevent API abuse
- **WebGL Optimization**: 3D rendering performance settings

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

## 📊 Data Sources

### Real-time Latency Data
- Cloudflare Radar API for global network performance
- Exchange-specific API endpoints
- Public monitoring services

### Exchange Information
- Major cryptocurrency exchanges (Binance, OKX, Coinbase, etc.)
- Geographic locations and cloud provider information
- Historical performance data

### Cloud Provider Regions
- AWS Global Infrastructure
- Google Cloud Platform regions
- Microsoft Azure regions

## 🎨 Customization

### Styling
- Tailwind CSS for responsive design
- Dark/light theme support
- Custom animations and transitions

### 3D Visualization
- Customizable marker styles and colors
- Adjustable camera controls
- Performance optimization settings

### Charts
- Multiple chart types and configurations
- Custom color schemes
- Interactive features

## 🔍 Troubleshooting

### Common Issues

1. **3D Map Not Loading**
   - Check WebGL support in browser
   - Verify Three.js dependencies
   - Check console for errors

2. **API Data Not Loading**
   - Verify network connectivity
   - Check API rate limits
   - Review console for error messages

3. **Performance Issues**
   - Reduce refresh interval
   - Disable unnecessary features
   - Check device capabilities

### Debug Mode
Enable debug mode by setting `NEXT_PUBLIC_DEV_MODE=true` in environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for 3D graphics library
- Cloudflare for network performance data
- Recharts for charting library
- Next.js team for the framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**Note**: This application is designed for educational and demonstration purposes. Real-world deployment may require additional security measures, API keys, and production optimizations.
