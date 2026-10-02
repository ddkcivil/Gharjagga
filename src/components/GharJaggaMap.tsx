import React, { useEffect, useRef, useState } from 'react';
import { Listing } from '../types';
import { Eye, MapPin, Compass, RotateCw } from 'lucide-react';

interface GharJaggaMapProps {
  listings: Listing[];
  onMarkerClick: (listing: Listing) => void;
  centerListing?: Listing | null;
  isMiniMap?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function GharJaggaMap({ listings, onMarkerClick, centerListing = null, isMiniMap = false }: GharJaggaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeLayerMode, setActiveLayerMode] = useState<'street' | 'satellite' | 'streetview'>('street');

  // Simulated 360 Street View Panorama State
  const [panoramaRotation, setPanoramaRotation] = useState(0);
  const [isRotating, setIsPaying] = useState(false);

  // Load Leaflet CSS and JS dynamically from CDN to ensure React 19 compatibility
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    jsScript.crossOrigin = '';
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    jsScript.onerror = () => {
      setLoadError(true);
    };
    document.head.appendChild(jsScript);
  }, []);

  // Handle switching map layers (Street vs Satellite vs StreetView)
  const toggleTileLayer = (mode: 'street' | 'satellite' | 'streetview') => {
    if (mode === 'streetview') {
      setActiveLayerMode('streetview');
      return;
    }

    if (!leafletLoaded || !mapInstanceRef.current || !window.L) return;
    
    const map = mapInstanceRef.current;
    
    // Remove current tile layer
    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const streetUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const attribution = mode === 'street' 
      ? '&copy; OSM contributors'
      : '&copy; Esri World Imagery';

    activeTileLayerRef.current = window.L.tileLayer(mode === 'street' ? streetUrl : satelliteUrl, {
      maxZoom: 19,
      attribution
    }).addTo(map);

    setActiveLayerMode(mode);
  };

  // Map Initialization & Marker Placement
  useEffect(() => {
    // If StreetView mode is selected, we don't render Leaflet markers on container
    if (activeLayerMode === 'streetview') return;
    if (!leafletLoaded || !mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      // Default center Nepal coordinates
      const centerCoord: [number, number] = centerListing?.coordinates 
        ? [centerListing.coordinates.lat, centerListing.coordinates.lng] 
        : [27.7000, 84.4000];

      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        center: centerCoord,
        zoom: isMiniMap ? 15 : 7,
        scrollWheelZoom: false,
        zoomControl: !isMiniMap,
        dragging: !isMiniMap
      });

      const initialMode = isMiniMap ? 'satellite' : 'street';
      const streetUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

      activeTileLayerRef.current = window.L.tileLayer(initialMode === 'street' ? streetUrl : satelliteUrl, {
        maxZoom: 19,
        attribution: '&copy; OSM'
      }).addTo(mapInstanceRef.current);

      setActiveLayerMode(initialMode);
      markersLayerRef.current = window.L.featureGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    markersLayer.clearLayers();

    const bounds: any[] = [];

    listings.forEach((plot) => {
      if (!plot.coordinates) return;

      const { lat, lng } = plot.coordinates;
      bounds.push([lat, lng]);

      // 1. Add Pulse Circle Boundary - precise center plot visual enhancement
      window.L.circle([lat, lng], {
        color: '#b45309', // Amber-700
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 1.5,
        radius: isMiniMap ? 35 : 120 // Radius of property boundaries
      }).addTo(markersLayer);

      // 2. Custom Marker Pin
      const statusColorClass = plot.status === 'Approved' ? 'border-emerald-500' : 'border-amber-500';
      const pinBgClass = plot.status === 'Approved' ? 'bg-amber-800' : 'bg-neutral-800';

      const customIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="flex items-center justify-center w-7 h-7 ${pinBgClass} text-white rounded-full border-2 ${statusColorClass} shadow-md hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      // 3. Popup Content with Google Navigation and verification status
      const popupContent = `
        <div class="p-2 min-w-[180px] font-sans">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[9px] text-amber-800 font-bold uppercase tracking-wider font-mono">${plot.landType} PLOT</span>
            <span class="text-[8px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded">VERIFIED</span>
          </div>
          <h4 class="font-bold text-xs text-neutral-900 m-0 leading-normal line-clamp-1">${plot.title}</h4>
          <p class="text-[10px] text-neutral-500 m-0 mt-0.5">${plot.municipality}, W-${plot.ward}</p>
          
          <div class="flex justify-between items-center mt-2.5 pt-1.5 border-t border-neutral-100">
            <div class="flex flex-col">
              <span class="text-[8px] text-neutral-400 font-mono block">Budget</span>
              <span class="font-mono font-bold text-neutral-900 text-[11px]">NPR ${(plot.guidePrice / 100000).toFixed(0)}L</span>
            </div>
            <button id="marker-btn-${plot.id}" class="bg-neutral-950 text-white font-semibold rounded text-[9px] px-2 py-1 hover:bg-amber-800 transition-colors">Inspect</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-btn-${plot.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onMarkerClick(plot);
          });
        }
      });

      // Auto open popup if specifically centering this single listing
      if (centerListing && centerListing.id === plot.id) {
        setTimeout(() => {
          marker.openPopup();
        }, 150);
      }
    });

    // Auto-centering viewport behavior
    if (centerListing && centerListing.coordinates) {
      map.setView([centerListing.coordinates.lat, centerListing.coordinates.lng], isMiniMap ? 15 : 12);
    } else if (bounds.length > 0 && map && !isMiniMap) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [listings, leafletLoaded, centerListing, isMiniMap, activeLayerMode]);

  // Handle panorama rotation simulation
  useEffect(() => {
    let interval: any;
    if (isRotating) {
      interval = setInterval(() => {
        setPanoramaRotation((prev) => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRotating]);

  // Determine coordinate metadata for active listing
  const targetPlot = centerListing || listings[0];
  const googleStreetViewUrl = targetPlot?.coordinates
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${targetPlot.coordinates.lat},${targetPlot.coordinates.lng}`
    : `https://www.google.com/maps`;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-neutral-150 shadow-xs">
      {/* Header controls with active layers including Street View */}
      <div className="bg-neutral-100 p-3 flex justify-between items-center border-b border-neutral-150">
        <span className="text-xs font-bold text-neutral-900 font-sans flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-700 animate-pulse"></span>
          {isMiniMap ? 'Survey Plot Location' : 'GharJagga Plot Locator Map'}
        </span>

        {/* Dynamic Layer Switchers - conforming to Zero-Pill button controls */}
        {leafletLoaded && !loadError && (
          <div className="flex bg-neutral-200/50 p-0.5 rounded border border-neutral-250 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => toggleTileLayer('street')}
              className={`px-2 py-0.5 rounded-sm transition-all ${activeLayerMode === 'street' ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => toggleTileLayer('satellite')}
              className={`px-2 py-0.5 rounded-sm transition-all ${activeLayerMode === 'satellite' ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => toggleTileLayer('streetview')}
              className={`px-2 py-0.5 rounded-sm transition-all flex items-center gap-0.5 ${activeLayerMode === 'streetview' ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <Eye size={10} />
              <span>360° StreetView</span>
            </button>
          </div>
        )}
      </div>

      {loadError ? (
        <div className="h-96 flex flex-col items-center justify-center bg-neutral-50 text-center p-6 text-neutral-500">
          <p className="text-xs font-semibold">Failed to fetch Leaflet tile servers.</p>
        </div>
      ) : !leafletLoaded ? (
        <div className="h-96 flex flex-col items-center justify-center bg-neutral-50 text-neutral-400">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-amber-850 rounded-full animate-spin"></div>
          <span className="text-[10px] font-mono mt-3">Calibrating geographical bounds...</span>
        </div>
      ) : activeLayerMode === 'streetview' ? (
        /* Dynamic 360° Street View Panorama Simulator */
        <div className="relative h-96 w-full bg-neutral-950 overflow-hidden flex flex-col justify-between p-4 text-white">
          
          {/* Panoramic background wrapper representing actual environment */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-75"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200')`,
              transform: `scale(1.2) rotateY(${panoramaRotation}deg)`,
              filter: 'brightness(0.65)'
            }}
          />

          {/* Compass overlay */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-xs text-xs space-y-0.5 font-mono">
              <span className="text-[9px] uppercase tracking-wider text-amber-500 block font-bold">Panorama Telemetry</span>
              <div>Heading: {panoramaRotation}° N</div>
              {targetPlot && <div className="text-[10px] text-neutral-300">{targetPlot.municipality}, Ward {targetPlot.ward}</div>}
            </div>

            {/* Navigation action block to open external Google Maps */}
            <a
              href={googleStreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-colors"
            >
              <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
              Open Real Google StreetView
            </a>
          </div>

          {/* Center pointer overlay */}
          <div className="relative z-10 flex items-center justify-center self-center my-auto">
            <div className="w-10 h-10 border border-white/40 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xs">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Look around control tray */}
          <div className="relative z-10 bg-black/60 p-4 rounded-xl border border-neutral-800 backdrop-blur-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <RotateCw size={13} className="text-amber-500" />
                Simulated 360° Field Look-Around
              </span>
              <button
                type="button"
                onClick={() => setIsPaying(!isRotating)}
                className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/20"
              >
                {isRotating ? 'Stop Auto-Rotate' : 'Auto Rotate'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-neutral-400 font-mono">0°</span>
              <input
                type="range"
                min="0"
                max="359"
                value={panoramaRotation}
                onChange={(e) => setPanoramaRotation(parseInt(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-[10px] text-neutral-400 font-mono">359°</span>
            </div>
          </div>
        </div>
      ) : (
        <div ref={mapContainerRef} className={`${isMiniMap ? 'h-52' : 'h-96'} w-full bg-neutral-50 z-10`} />
      )}

      {/* Map visual legend (Zero-Pill conform) */}
      {activeLayerMode !== 'streetview' && (
        <div className="bg-white px-4 py-2 border-t border-neutral-150 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-800 border-2 border-emerald-500 shadow-xs"></span>
              <span>Verified Listings</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-700/50"></span>
              <span>Survey Boundaries Circle</span>
            </div>
          </div>
          <span>UTM Center: Nepal</span>
        </div>
      )}
    </div>
  );
}
