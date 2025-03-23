import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Layers, ZoomIn, ZoomOut, RefreshCw, Play, Pause, Search, Menu, X } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_KEY = '28f6f52872dbc0b3ce88987416bbf3f9';

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export default function RadarPage() {
  const { theme } = useTheme();
  const [layer, setLayer] = useState('precipitation_new');
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState({ lat: 20.2961, lon: 85.8245 }); // Center of Odisha
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [mapType, setMapType] = useState('standard');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const layers = [
    { id: 'precipitation_new', name: 'Precipitation', color: 'bg-blue-500' },
    { id: 'clouds_new', name: 'Clouds', color: 'bg-gray-500' },
    { id: 'temp_new', name: 'Temperature', color: 'bg-red-500' },
    { id: 'wind_new', name: 'Wind Speed', color: 'bg-green-500' },
    { id: 'pressure_new', name: 'Pressure', color: 'bg-purple-500' }
  ];

  const mapTypes = [
    { id: 'standard', name: 'Map' },
    { id: 'satellite', name: 'Satellite' },
    { id: 'terrain', name: 'Terrain' }
  ];

  useEffect(() => {
    const updateMapSize = () => {
      if (mapRef.current) {
        setMapSize({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight
        });
      }
    };

    updateMapSize();
    window.addEventListener('resize', updateMapSize);
    return () => window.removeEventListener('resize', updateMapSize);
  }, []);

  // Debounced search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${API_KEY}`
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching location:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setCenter({ lat: location.lat, lon: location.lon });
    setZoom(10);
    setSearchQuery('');
    setSearchResults([]);
    setSidebarOpen(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 2));

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimestamp(Date.now());
    setLastUpdate(new Date());
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  // Animation control with smoother transitions
  useEffect(() => {
    let animationFrame: number;
    if (isPlaying) {
      const animate = () => {
        setTimeOffset(prev => {
          const next = (prev + 0.02) % 6; // Even smoother animation
          return Number(next.toFixed(2));
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  // Map interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mapRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      mapRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && mapRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const scale = Math.pow(2, zoom);

      setCenter(prev => ({
        lon: prev.lon - (dx * 360) / (256 * scale),
        lat: prev.lat + (dy * 170) / (256 * scale)
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (mapRef.current) {
      mapRef.current.style.cursor = 'grab';
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mapRef.current && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && mapRef.current && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      const scale = Math.pow(2, zoom);

      setCenter(prev => ({
        lon: prev.lon - (dx * 360) / (256 * scale),
        lat: prev.lat + (dy * 170) / (256 * scale)
      }));

      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Map tile calculations
  const latLonToTile = (lat: number, lon: number, z: number) => {
    const n = Math.pow(2, z);
    const x = Math.floor((lon + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x, y };
  };

  const generateTiles = () => {
    const tiles = [];
    const n = Math.pow(2, zoom);
    const centerTile = latLonToTile(center.lat, center.lon, zoom);
    const tileSize = 256;
    const tilesX = Math.ceil(mapSize.width / tileSize) + 2;
    const tilesY = Math.ceil(mapSize.height / tileSize) + 2;
    const halfTilesX = Math.floor(tilesX / 2);
    const halfTilesY = Math.floor(tilesY / 2);
    
    for (let i = -halfTilesX; i <= halfTilesX; i++) {
      for (let j = -halfTilesY; j <= halfTilesY; j++) {
        const x = (centerTile.x + i + n) % n;
        const y = Math.min(Math.max(centerTile.y + j, 0), n - 1);
        const uniqueId = `${x}-${y}-${i}-${j}-${zoom}-${Math.random().toString(36).substring(2, 11)}`;
        
        tiles.push({
          x,
          y,
          key: uniqueId,
          offsetX: i,
          offsetY: j
        });
      }
    }
    return tiles;
  };

  const getTilePosition = (offsetX: number, offsetY: number) => {
    const tileSize = 256;
    const centerTile = latLonToTile(center.lat, center.lon, zoom);
    const centerPixelX = mapSize.width / 2;
    const centerPixelY = mapSize.height / 2;
    const centerX = (center.lon + 180) / 360 * Math.pow(2, zoom);
    const centerY = (1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
    const fracX = centerX - Math.floor(centerX);
    const fracY = centerY - Math.floor(centerY);
    const left = centerPixelX + (offsetX - fracX) * tileSize;
    const top = centerPixelY + (offsetY - fracY) * tileSize;
    
    return { left, top };
  };

  const getMapTileUrl = (x: number, y: number, z: number) => {
    switch (mapType) {
      case 'satellite':
        return `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
      case 'terrain':
        return `https://mt1.google.com/vt/lyrs=p&x=${x}&y=${y}&z=${z}`;
      default:
        return theme === 'dark'
          ? `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}.png`
          : `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    }
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden relative">
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex-1 max-w-md relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-900 dark:text-white focus:outline-none"
          />
          <Search 
            className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" 
            size={18} 
          />
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <MapPin size={16} className="text-gray-500" />
                  <div>
                    <div className="text-gray-900 dark:text-white">{result.name}</div>
                    <div className="text-sm text-gray-500">
                      {result.state && `${result.state}, `}{result.country}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`absolute top-0 left-0 h-full z-30 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out w-80 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Radar</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weather Layers</h3>
          <div className="space-y-2">
            {layers.map(l => (
              <button
                key={l.id}
                onClick={() => setLayer(l.id)}
                className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                  layer === l.id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${l.color} mr-2`}></div>
                {l.name}
              </button>
            ))}
          </div>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6 mb-2">Map Type</h3>
          <div className="space-y-2">
            {mapTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setMapType(type.id)}
                className={`w-full px-3 py-2 rounded-md transition-colors ${
                  mapType === type.id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Animation</h3>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play Animation</>}
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedLocation ? (
                <>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedLocation.name}</p>
                  <p>{selectedLocation.state && `${selectedLocation.state}, `}{selectedLocation.country}</p>
                  <p>Lat: {selectedLocation.lat.toFixed(4)}°</p>
                  <p>Lon: {selectedLocation.lon.toFixed(4)}°</p>
                </>
              ) : (
                <>
                  <p>Lat: {center.lat.toFixed(4)}°</p>
                  <p>Lon: {center.lon.toFixed(4)}°</p>
                </>
              )}
              <p className="mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 ${
                refreshing ? 'bg-gray-400' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              } text-gray-800 dark:text-white transition-colors`}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
              Refresh Data
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© OpenStreetMap contributors</p>
          <p>Weather data: OpenWeatherMap</p>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="flex-1 relative w-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Base Map Layer */}
          <div className="absolute top-0 left-0 w-full h-full">
            {generateTiles().map(tile => {
              const position = getTilePosition(tile.offsetX, tile.offsetY);
              return (
                <img
                  key={tile.key}
                  src={getMapTileUrl(tile.x, tile.y, zoom)}
                  alt=""
                  className="absolute transition-opacity duration-300"
                  style={{
                    width: '256px',
                    height: '256px',
                    left: `${position.left}px`,
                    top: `${position.top}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
          </div>

          {/* Weather Layer with smooth animation */}
          <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
            {generateTiles().map(tile => {
              const position = getTilePosition(tile.offsetX, tile.offsetY);
              return (
                <img
                  key={`weather-${tile.key}`}
                  src={`https://tile.openweathermap.org/map/${layer}/${zoom}/${tile.x}/${tile.y}.png?appid=${API_KEY}&_=${timestamp - timeOffset * 600000}`}
                  alt=""
                  className="absolute transition-opacity duration-700 ease-in-out"
                  style={{
                    width: '256px',
                    height: '256px',
                    left: `${position.left}px`,
                    top: `${position.top}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isPlaying ? 0.9 : 0.8,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-1 z-20">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      {/* Map type selector */}
      <div className="absolute left-4 bottom-4 z-20">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden">
          {mapTypes.map((type, index) => (
            <button
              key={type.id}
              onClick={() => setMapType(type.id)}
              className={`px-3 py-1.5 text-sm ${
                mapType === type.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${index !== 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layer indicator */}
      <div className="absolute right-4 bottom-4 bg-white dark:bg-gray-800 rounded-md shadow-lg px-3 py-1.5 z-20">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${layers.find(l => l.id === layer)?.color}`}></div>
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {layers.find(l => l.id === layer)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}