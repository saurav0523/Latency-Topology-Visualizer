# Latency Topology Visualizer

A real-time exchange performance monitoring dashboard built with Next.js, React, TypeScript, and Three.js for visualizing global latency data across cryptocurrency exchanges.

##  Features

### Core Functionality
- **Real-time Latency Monitoring**: Live tracking of exchange response times
- **Global 3D/2D Map Visualization**: Interactive globe showing exchange locations with latency indicators
- **Performance Analytics**: Historical trends and statistical analysis
- **Multi-Cloud Support**: AWS, GCP, Azure, and Alibaba Cloud integration
- **Auto-refresh System**: Configurable data refresh intervals
- **Caching Mechanism**: Intelligent API response caching for performance
- **Export Capabilities**: CSV, JSON, and PDF data export

### Enhanced Controls for GoQuant Requirements
- **Advanced Filtering**: Search by exchange name, cloud provider, and latency range
- **Real-time/Historical Toggle**: Switch between live and historical data views
- **Region Visualization**: Show/hide cloud regions and exchange clusters
- **Performance Monitoring**: Built-in performance metrics and monitoring
- **Responsive Design**: Mobile-optimized interface
- **Theme Support**: Light/dark mode toggle

### Technical Features
- **Skeleton Loading**: Smooth loading states with skeleton components
- **Error Handling**: Comprehensive error states and recovery
- **Type Safety**: Full TypeScript implementation
- **State Management**: Redux Toolkit with optimized selectors
- **API Integration**: Cloudflare Radar API with fallback simulation
- **3D Graphics**: React Three Fiber for immersive visualizations

##  Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **3D Graphics**: React Three Fiber, Three.js
- **Charts**: Recharts
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Build Tool**: Next.js (Webpack)
- **Linting**: ESLint
- **Package Manager**: npm

##  Requirements

### System Requirements
- Node.js 18+ 
- npm 9+ or yarn
- Modern browser with WebGL support
- Minimum 4GB RAM
- Stable internet connection


### API Requirements
- Cloudflare Radar API access (optional - falls back to simulation)
- API token for real data (optional)

##  Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd latency-visualizer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Optional: Cloudflare API Configuration
NEXT_PUBLIC_CLOUDFLARE_API_TOKEN=your_api_token_here
NEXT_PUBLIC_CLOUDFLARE_ZONE_ID=your_zone_id_here

# Development Settings
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

##  Project Structure

```
latency-visualizer/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── Map.tsx           # 3D/2D map visualization
│   │   ├── LatencyChart.tsx  # Chart components
│   │   ├── ControlsPanel.tsx # Control interface
│   │   ├── ExportPanel.tsx   # Data export
│   │   ├── SkeletonLoader.tsx # Loading states
│   │   └── ThemeToggle.tsx   # Theme switcher
│   ├── hooks/                # Custom React hooks
│   │   ├── useReduxLatency.ts # Redux integration
│   │   └── useLatencyHistory.ts # Historical data
│   ├── lib/                  # Utility libraries
│   │   ├── api/             # API services
│   │   ├── constants.ts     # App constants
│   │   └── types/           # TypeScript types
│   ├── store/               # Redux store
│   │   ├── slices/          # Redux slices
│   │   ├── hooks.ts         # Redux hooks
│   │   └── index.ts         # Store configuration
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

##  Configuration

### Performance Settings
The application automatically detects device capabilities and adjusts performance:
- **Low-end devices**: Reduced 3D complexity, fewer animations
- **High-end devices**: Full 3D features, smooth animations
- **Mobile devices**: Optimized touch controls, simplified UI

### Caching Configuration
- **Default TTL**: 30 seconds for API responses
- **Cache Size**: Unlimited (in-memory)
- **Auto-refresh**: Configurable intervals (5s - 60s)

### API Configuration
- **Real API**: Cloudflare Radar endpoints
- **Simulation**: Fallback data generation
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Graceful degradation

##  Data Sources

### Primary Sources
1. **Cloudflare Radar API**: Real latency data from global network
2. **Simulated Data**: Generated test data for development
3. **Historical Data**: Time-series data for trend analysis

### Supported Exchanges
- Binance, Coinbase, Kraken, Bitfinex
- OKX, KuCoin, Bybit, Gate.io
- And more via API integration

### Cloud Providers
- Amazon Web Services (AWS)
- Google Cloud Platform (GCP)
- Microsoft Azure
- Alibaba Cloud

##  Key Features Explained

### Global Latency Map
- **3D Globe**: Interactive Earth visualization with exchange markers
- **2D View**: Traditional map view for performance
- **Latency Colors**: Visual indicators based on response times
- **Exchange Clustering**: Grouped by cloud regions

### Latency Trends Chart
- **Multiple Chart Types**: Line, bar, and area charts
- **Real-time Updates**: Live data streaming
- **Historical Analysis**: Time-range selection
- **Statistical Summary**: Min, max, average calculations

### Controls Panel
- **Data Source Toggle**: Real vs simulated data
- **Filter Controls**: Search and range filtering
- **View Options**: 2D/3D map switching
- **Export Settings**: Data export configuration

### Performance Monitor
- **FPS Tracking**: Real-time frame rate monitoring
- **Memory Usage**: RAM consumption tracking
- **Render Times**: Component rendering performance
- **Network Stats**: API response times



##  Troubleshooting


#### Build Issues
- **TypeScript errors**: Run `npm run type-check`
- **Linting errors**: Run `npm run lint`
- **Missing dependencies**: Run `npm install`


##  Acknowledgments

- **Cloudflare Radar**: For providing global network data
- **React Three Fiber**: For 3D visualization capabilities
- **Recharts**: For chart components
- **Tailwind CSS**: For utility-first styling

## 📞 Support

For support and questions:
- Email: gsaurav641@gmail.com

---





