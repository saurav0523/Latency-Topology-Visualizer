import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';


export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  selectedCloudProvider: string | null;
  selectedRegion: string | null;
  showTooltips: boolean;
  showLegend: boolean;
  mapView: '3d' | '2d';
  chartType: 'line' | 'bar' | 'area';
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: Notification[];
  lastUpdated: string | null; 
  isClient: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string; 
  read: boolean;
}


const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  selectedCloudProvider: null,
  selectedRegion: null,
  showTooltips: true,
  showLegend: true,
  mapView: '3d',
  chartType: 'line',
  autoRefresh: true,
  refreshInterval: 30000,
  notifications: [],
  lastUpdated: null,
  isClient: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSelectedCloudProvider: (state, action: PayloadAction<string | null>) => {
      state.selectedCloudProvider = action.payload;
    },
    setSelectedRegion: (state, action: PayloadAction<string | null>) => {
      state.selectedRegion = action.payload;
    },
    toggleTooltips: (state) => {
      state.showTooltips = !state.showTooltips;
    },
    setShowTooltips: (state, action: PayloadAction<boolean>) => {
      state.showTooltips = action.payload;
    },
    toggleLegend: (state) => {
      state.showLegend = !state.showLegend;
    },
    setShowLegend: (state, action: PayloadAction<boolean>) => {
      state.showLegend = action.payload;
    },
    setMapView: (state, action: PayloadAction<'3d' | '2d'>) => {
      state.mapView = action.payload;
    },
    setChartType: (state, action: PayloadAction<'line' | 'bar' | 'area'>) => {
      state.chartType = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.push(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLastUpdated: (state, action: PayloadAction<string>) => {
      state.lastUpdated = action.payload;
    },
    setIsClient: (state, action: PayloadAction<boolean>) => {
      state.isClient = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCloudProvider = null;
      state.selectedRegion = null;
    },
  },
});


export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setSelectedCloudProvider,
  setSelectedRegion,
  toggleTooltips,
  setShowTooltips,
  toggleLegend,
  setShowLegend,
  setMapView,
  setChartType,
  setAutoRefresh,
  setRefreshInterval,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  setLastUpdated,
  setIsClient,
  resetFilters,
} = uiSlice.actions;

export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectSelectedCloudProvider = (state: { ui: UIState }) => state.ui.selectedCloudProvider;
export const selectSelectedRegion = (state: { ui: UIState }) => state.ui.selectedRegion;
export const selectShowTooltips = (state: { ui: UIState }) => state.ui.showTooltips;
export const selectShowLegend = (state: { ui: UIState }) => state.ui.showLegend;
export const selectMapView = (state: { ui: UIState }) => state.ui.mapView;
export const selectChartType = (state: { ui: UIState }) => state.ui.chartType;
export const selectAutoRefresh = (state: { ui: UIState }) => state.ui.autoRefresh;
export const selectRefreshInterval = (state: { ui: UIState }) => state.ui.refreshInterval;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectLastUpdated = (state: { ui: UIState }) => state.ui.lastUpdated;
export const selectIsClient = (state: { ui: UIState }) => state.ui.isClient;


export const selectUnreadNotifications = createSelector(
  [(state: { ui: UIState }) => state.ui.notifications],
  (notifications) => notifications.filter(n => !n.read)
);

export const selectNotificationCount = createSelector(
  [(state: { ui: UIState }) => state.ui.notifications],
  (notifications) => notifications.length
);

export const selectUnreadNotificationCount = createSelector(
  [(state: { ui: UIState }) => state.ui.notifications],
  (notifications) => notifications.filter(n => !n.read).length
);

export default uiSlice.reducer; 