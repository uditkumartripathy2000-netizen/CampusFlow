import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  MapPin, 
  Navigation, 
  Layers, 
  Info, 
  X, 
  Building2, 
  Clock, 
  Phone, 
  User, 
  Wrench, 
  Check, 
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CAMPUS_LOCATIONS, CAMPUS_CATEGORIES, CampusLocation } from '../../data/campusLocations.ts';

interface CampusMapViewProps {
  initialLocationId?: string | null;
  onSelectLocationForRequest?: (location: CampusLocation) => void;
  onOpenWizardWithLocation?: (locationId: string, locationName: string) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  initialLocationId,
  onSelectLocationForRequest,
  onOpenWizardWithLocation
}) => {
  // Map viewport transform state
  const [scale, setScale] = useState<number>(0.9);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filtering and Selection
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(() => {
    if (initialLocationId) {
      return CAMPUS_LOCATIONS.find(l => l.id === initialLocationId || l.code === initialLocationId) || null;
    }
    return null;
  });

  // Locate Me State
  const [locateStatus, setLocateStatus] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [userSimulatedCoords, setUserSimulatedCoords] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // If initialLocationId provided, pan to it
  useEffect(() => {
    if (initialLocationId) {
      const loc = CAMPUS_LOCATIONS.find(l => l.id === initialLocationId || l.code === initialLocationId);
      if (loc) {
        setSelectedLocation(loc);
        panToLocation(loc);
      }
    }
  }, [initialLocationId]);

  const panToLocation = (loc: CampusLocation) => {
    // Focus in center of container
    const centerX = loc.x + loc.width / 2;
    const centerY = loc.y + loc.height / 2;
    
    setScale(1.25);
    setTranslate({
      x: 500 - centerX * 1.25,
      y: 350 - centerY * 1.25
    });
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(2.4, prev + 0.25));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.6, prev - 0.25));
  };

  const handleResetView = () => {
    setScale(0.9);
    setTranslate({ x: 0, y: 0 });
    setSelectedLocation(null);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Mouse drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag panning for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setTranslate({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setScale(prev => Math.max(0.6, Math.min(2.4, prev + zoomFactor)));
  };

  // Locate Me handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocateStatus({
        message: 'Geolocation is not supported by your current browser.',
        type: 'error'
      });
      return;
    }

    setLocateStatus({
      message: 'Requesting device location...',
      type: 'info'
    });

    navigator.geolocation.getCurrentPosition(
      () => {
        // Simulate pin near Academic Block A / Library on the demo campus layout
        setUserSimulatedCoords({ x: 380, y: 320 });
        setLocateStatus({
          message: 'Location acquired. Positioned at Central Campus Quad (Simulated on Demo Campus map).',
          type: 'success'
        });
        setTimeout(() => setLocateStatus(null), 5000);
      },
      (err) => {
        let msg = 'Location request was declined or is unavailable.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still explore the map manually.';
        }
        setLocateStatus({ message: msg, type: 'error' });
        setTimeout(() => setLocateStatus(null), 5000);
      },
      { timeout: 8000 }
    );
  };

  // Filtered locations
  const filteredLocations = CAMPUS_LOCATIONS.filter(loc => {
    if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchCode = loc.code.toLowerCase().includes(q);
      const matchDept = loc.departments.some(d => d.toLowerCase().includes(q));
      const matchFac = loc.facilities.some(f => f.toLowerCase().includes(q));
      return matchName || matchCode || matchDept || matchFac;
    }
    return true;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return { bg: '#1E3A2F', stroke: '#0D8B65', fill: '#E6F5EF' };
      case 'residential': return { bg: '#234E70', stroke: '#3A7CA5', fill: '#EEF4F9' };
      case 'laboratory': return { bg: '#8A5B15', stroke: '#B8860B', fill: '#FDF6EB' };
      case 'administrative': return { bg: '#4A3E3D', stroke: '#705E5D', fill: '#F5F0F0' };
      case 'amenities': return { bg: '#9A7B38', stroke: '#C29B38', fill: '#FAF3E0' };
      case 'sports_outdoor': return { bg: '#2E7D32', stroke: '#4CAF50', fill: '#E8F5E9' };
      case 'security_medical': return { bg: '#B71C1C', stroke: '#E53935', fill: '#FFEBEE' };
      default: return { bg: '#5E6D64', stroke: '#7B8F84', fill: '#F7F8F6' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
              Interactive Campus Map
            </h2>
            <span className="text-[11px] font-mono text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-0.5 rounded font-bold border border-[#F1DFC4]">
              DEMO CAMPUS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5 leading-relaxed">
            Continuous pannable & zoomable university map with building directories, departmental routing, and maintenance tagging
          </p>
        </div>

        {/* Locate Me Button & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E9E5] hover:border-[#1E3A2F] text-xs font-semibold text-[#202722] rounded-xl transition-colors shadow-2xs"
            title="Request device location"
          >
            <Compass className="w-4 h-4 text-[#0D8B65]" />
            <span>Locate Me</span>
          </button>

          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E9E5] hover:bg-[#F7F8F6] text-xs font-semibold text-[#5E6D64] rounded-xl transition-colors shadow-2xs"
            title="Reset map view to default"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Geolocation feedback banner */}
      {locateStatus && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          locateStatus.type === 'error'
            ? 'bg-[#FCEDEC] border-[#F5CBC8] text-[#992828]'
            : locateStatus.type === 'success'
              ? 'bg-[#E6F5EF] border-[#A2C4AF] text-[#0D8B65]'
              : 'bg-[#FDF6EB] border-[#F1DFC4] text-[#8A5B15]'
        }`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{locateStatus.message}</span>
          </div>
          <button onClick={() => setLocateStatus(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E6D64]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search buildings (e.g. Block A, Library, Canteen, Labs)..."
              className="w-full pl-10 pr-4 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E6D64] hover:text-[#202722]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-[#5E6D64] font-medium shrink-0">
            Showing <strong className="text-[#202722]">{filteredLocations.length}</strong> of {CAMPUS_LOCATIONS.length} facilities
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CAMPUS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#1E3A2F] text-white shadow-2xs font-semibold'
                  : 'bg-[#F7F8F6] text-[#5E6D64] hover:text-[#202722] hover:bg-neutral-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAP VIEWPORT & DETAILS DRAWER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continuous Vector SVG Map Canvas (Occupies 2 cols on desktop) */}
        <div className="lg:col-span-2 relative bg-[#F4F1EA] border border-[#E5E9E5] rounded-3xl overflow-hidden shadow-2xs h-[560px] sm:h-[620px] select-none">
          
          {/* Zoom & Navigation Floating Controls */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs border border-[#E5E9E5] rounded-xl p-1 shadow-sm">
            <button
              onClick={handleZoomIn}
              className="p-2 text-[#202722] hover:bg-[#F7F8F6] rounded-lg transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-[#202722] hover:bg-[#F7F8F6] rounded-lg transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-px bg-[#E5E9E5] my-0.5" />
            <button
              onClick={handleResetView}
              className="p-2 text-[#5E6D64] hover:text-[#202722] hover:bg-[#F7F8F6] rounded-lg transition-colors"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Zoom Level Indicator & Notice */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-xs border border-[#E5E9E5] rounded-lg text-[11px] font-mono font-semibold text-[#5E6D64] shadow-2xs">
              Zoom: {Math.round(scale * 100)}% {scale >= 1.1 ? '(Detailed View)' : '(Overview)'}
            </div>

            <div className="hidden sm:block px-2.5 py-1 bg-[#1E3A2F]/10 border border-[#1E3A2F]/20 rounded-lg text-[10px] font-semibold text-[#1E3A2F] uppercase">
              Drag to Pan · Wheel to Zoom
            </div>
          </div>

          {/* SVG Map Canvas Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden relative`}
          >
            <svg
              viewBox="0 0 1150 750"
              className="w-full h-full transition-transform duration-75 origin-center"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
              }}
            >
              {/* Defs for gradients, patterns and dropshadows */}
              <defs>
                <pattern id="lawnPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#E8EFEA" />
                  <circle cx="4" cy="4" r="0.75" fill="#D2E2D6" />
                  <circle cx="14" cy="14" r="0.75" fill="#D2E2D6" />
                </pattern>
                <linearGradient id="lakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9E2F2" />
                  <stop offset="100%" stopColor="#B3D4EC" />
                </linearGradient>
                <filter id="buildingShadow" x="-5%" y="-5%" width="110%" height="115%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* 1. Base Campus Ground & Lawns */}
              <rect x="0" y="0" width="1150" height="750" fill="url(#lawnPattern)" />

              {/* 2. Perimeter Boundary Wall */}
              <rect x="25" y="20" width="1100" height="710" fill="none" stroke="#C8D2CA" strokeWidth="2.5" strokeDasharray="8 6" />

              {/* 3. Landscaped Garden Beds & Green Spaces */}
              <rect x="180" y="150" width="600" height="470" rx="16" fill="#D9E7DD" opacity="0.6" />
              <rect x="800" y="340" width="290" height="280" rx="16" fill="#D2E4D6" opacity="0.5" />

              {/* 4. Campus Eco-Reservoir / Lotus Lake */}
              <path
                d="M 60 520 C 80 480, 150 490, 170 540 C 180 580, 140 640, 90 630 C 50 620, 40 550, 60 520 Z"
                fill="url(#lakeGradient)"
                stroke="#9FC3DE"
                strokeWidth="2"
              />
              <text x="110" y="565" fontSize="10" fill="#4B779A" fontStyle="italic" textAnchor="middle" fontWeight="bold">
                Campus Lake & Fountain
              </text>

              {/* 5. Main Ring Road & Internal Avenues */}
              {/* Main Avenue from Main Gate to Central Circle */}
              <path
                d="M 170 375 L 380 375 L 580 375 L 780 375 L 820 375"
                stroke="#FFFFFF"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 170 375 L 820 375"
                stroke="#C5CECA"
                strokeWidth="28"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 170 375 L 820 375"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="10 8"
                fill="none"
              />

              {/* North-South Boulevard connecting Admin to Hostels */}
              <path
                d="M 380 140 L 380 620"
                stroke="#C5CECA"
                strokeWidth="24"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 580 140 L 580 620"
                stroke="#C5CECA"
                strokeWidth="24"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 380 140 L 380 620"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="8 6"
                fill="none"
              />
              <path
                d="M 580 140 L 580 620"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="8 6"
                fill="none"
              />

              {/* North Ring Road */}
              <path
                d="M 170 150 L 800 150 L 1050 150"
                stroke="#C5CECA"
                strokeWidth="20"
                fill="none"
              />
              <path
                d="M 170 150 L 1050 150"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                fill="none"
              />

              {/* South Ring Road connecting hostels and sports ground */}
              <path
                d="M 170 610 L 800 610 L 1070 610"
                stroke="#C5CECA"
                strokeWidth="20"
                fill="none"
              />

              {/* Central Roundabout */}
              <circle cx="380" cy="375" r="28" fill="#D9E7DD" stroke="#C5CECA" strokeWidth="6" />
              <circle cx="380" cy="375" r="14" fill="#1E3A2F" />
              <circle cx="580" cy="375" r="28" fill="#D9E7DD" stroke="#C5CECA" strokeWidth="6" />
              <circle cx="580" cy="375" r="14" fill="#9A7B38" />

              {/* 6. Zone Area Labels (Visible at wide zoom) */}
              {scale < 1.15 && (
                <g opacity="0.65" pointerEvents="none">
                  <text x="350" y="85" fontSize="13" fontWeight="bold" fill="#5E6D64" letterSpacing="2">
                    NORTH ACADEMIC & ADMIN CORE
                  </text>
                  <text x="320" y="650" fontSize="13" fontWeight="bold" fill="#5E6D64" letterSpacing="2">
                    SOUTH RESIDENTIAL HALLS COMPLEX
                  </text>
                  <text x="890" y="340" fontSize="13" fontWeight="bold" fill="#5E6D64" letterSpacing="2">
                    EAST ATHLETIC PAVILION
                  </text>
                </g>
              )}

              {/* 7. Pedestrian Footpaths (Dotted Lines) */}
              <g stroke="#9CB0A2" strokeWidth="2.5" strokeDasharray="4 3" fill="none">
                <path d="M 280 290 L 280 340 L 280 470" />
                <path d="M 480 290 L 480 340 L 480 470" />
                <path d="M 670 290 L 670 340 L 670 470" />
                <path d="M 730 380 L 820 380" />
                <path d="M 120 330 L 230 340" />
              </g>

              {/* 8. Render All Campus Buildings */}
              {CAMPUS_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const isFilteredOut = selectedCategory !== 'all' && loc.category !== selectedCategory;
                const colors = getCategoryColor(loc.category);

                return (
                  <g
                    key={loc.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(loc);
                      if (onSelectLocationForRequest) {
                        onSelectLocationForRequest(loc);
                      }
                    }}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isFilteredOut ? 0.25 : 1}
                  >
                    {/* Highlight Ring if Selected */}
                    {isSelected && (
                      <rect
                        x={loc.x - 6}
                        y={loc.y - 6}
                        width={loc.width + 12}
                        height={loc.height + 12}
                        rx={14}
                        fill="none"
                        stroke="#9A7B38"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Building Body Card */}
                    <rect
                      x={loc.x}
                      y={loc.y}
                      width={loc.width}
                      height={loc.height}
                      rx={10}
                      fill={isSelected ? '#FFFFFF' : '#FCFDFD'}
                      stroke={isSelected ? '#1E3A2F' : colors.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter="url(#buildingShadow)"
                    />

                    {/* Top Roof Accent Strip */}
                    <rect
                      x={loc.x}
                      y={loc.y}
                      width={loc.width}
                      height={7}
                      rx={3}
                      fill={colors.bg}
                    />

                    {/* Building Code Badge */}
                    <rect
                      x={loc.x + 8}
                      y={loc.y + 12}
                      width={loc.code.length * 7 + 10}
                      height={16}
                      rx={4}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={0.75}
                    />
                    <text
                      x={loc.x + 13}
                      y={loc.y + 24}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={colors.bg}
                    >
                      {loc.code}
                    </text>

                    {/* Building Name */}
                    <text
                      x={loc.x + 10}
                      y={loc.y + 44}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#202722"
                    >
                      {loc.name.length > 20 ? loc.name.slice(0, 18) + '...' : loc.name}
                    </text>

                    {/* Floor Count / Category Subtitle */}
                    <text
                      x={loc.x + 10}
                      y={loc.y + 60}
                      fontSize="9.5"
                      fill="#5E6D64"
                    >
                      {loc.floorCount} {loc.floorCount === 1 ? 'Level' : 'Floors'} · {loc.category}
                    </text>

                    {/* High-Zoom Details (shown when zoomed in) */}
                    {scale >= 1.1 && (
                      <g opacity="0.85">
                        <text
                          x={loc.x + 10}
                          y={loc.y + 76}
                          fontSize="8.5"
                          fill="#1E3A2F"
                          fontStyle="italic"
                        >
                          {loc.openHours.split('(')[0]}
                        </text>
                      </g>
                    )}

                    {/* Interactive Click Pin */}
                    <circle
                      cx={loc.x + loc.width - 16}
                      cy={loc.y + 20}
                      r={7}
                      fill={isSelected ? '#1E3A2F' : '#E6F5EF'}
                      stroke={colors.stroke}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={loc.x + loc.width - 16}
                      cy={loc.y + 20}
                      r={2.5}
                      fill={isSelected ? '#9A7B38' : '#0D8B65'}
                    />
                  </g>
                );
              })}

              {/* 9. User Simulated Location Marker (if Locate Me clicked) */}
              {userSimulatedCoords && (
                <g className="animate-bounce">
                  <circle cx={userSimulatedCoords.x} cy={userSimulatedCoords.y} r="18" fill="#0D8B65" opacity="0.2" />
                  <circle cx={userSimulatedCoords.x} cy={userSimulatedCoords.y} r="8" fill="#0D8B65" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x={userSimulatedCoords.x} y={userSimulatedCoords.y - 14} fontSize="10" fontWeight="bold" fill="#0D8B65" textAnchor="middle">
                    You Are Here (Simulated)
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* DETAILS SIDE PANEL (Occupies 1 col on desktop) */}
        <div className="space-y-4 flex flex-col justify-between">
          {selectedLocation ? (
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-5 animate-in fade-in">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E9E5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1E3A2F] bg-[#E6F5EF] px-2 py-0.5 rounded border border-[#A2C4AF]">
                      {selectedLocation.code}
                    </span>
                    <span className="text-xs text-[#5E6D64] capitalize font-medium">
                      {selectedLocation.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#202722] mt-1 leading-snug">
                    {selectedLocation.name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1.5 text-[#5E6D64] hover:text-[#202722] rounded-lg transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-[#5E6D64] leading-relaxed">
                {selectedLocation.description}
              </p>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3.5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                <div>
                  <span className="text-[10px] text-[#5E6D64] uppercase font-bold block">Levels / Floors</span>
                  <span className="font-semibold text-[#202722]">{selectedLocation.floorCount} Story Building</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E6D64] uppercase font-bold block">Operating Hours</span>
                  <span className="font-semibold text-[#202722]">{selectedLocation.openHours.split('(')[0]}</span>
                </div>
              </div>

              {/* Housed Departments */}
              {selectedLocation.departments.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#202722] uppercase tracking-wider block mb-1.5">
                    Housed Departments
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.departments.map(dept => (
                      <span key={dept} className="px-2 py-1 bg-[#F7F8F6] border border-[#E5E9E5] rounded-md text-[11px] text-[#202722] font-medium">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Facilities List */}
              {selectedLocation.facilities.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#202722] uppercase tracking-wider block mb-1.5">
                    Key Facilities
                  </span>
                  <ul className="text-xs text-[#5E6D64] space-y-1">
                    {selectedLocation.facilities.map(fac => (
                      <li key={fac} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#0D8B65]" />
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Officer */}
              {selectedLocation.contactPerson && (
                <div className="p-3 bg-[#FDFBF7] border border-[#E4E2D9] rounded-xl text-xs space-y-0.5">
                  <div className="text-[10px] font-bold text-[#8A5B15] uppercase">Officer in Charge</div>
                  <div className="font-bold text-[#202722]">{selectedLocation.contactPerson}</div>
                  {selectedLocation.contactPhone && (
                    <div className="text-[11px] font-mono text-[#5E6D64] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#0D8B65]" />
                      <span>{selectedLocation.contactPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action: Report Issue at this Location */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onOpenWizardWithLocation) {
                      onOpenWizardWithLocation(selectedLocation.id, selectedLocation.name);
                    }
                  }}
                  className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-[#9A7B38]" />
                  <span>Report Maintenance Issue Here</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle Instruction Card */
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F5EF] text-[#0D8B65] flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202722]">Explore Campus Destinations</h3>
                <p className="text-xs text-[#5E6D64] mt-1.5 leading-relaxed">
                  Click any building on the map or select from the list below to inspect operating hours, department locations, and submit location-tagged requests.
                </p>
              </div>

              {/* Quick Jump List */}
              <div className="text-left space-y-1.5 pt-2 border-t border-[#E5E9E5] max-h-80 overflow-y-auto">
                <span className="text-[11px] font-bold text-[#5E6D64] uppercase block mb-1">
                  Directory ({filteredLocations.length})
                </span>
                {filteredLocations.slice(0, 6).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      panToLocation(loc);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E5E9E5] hover:border-[#1E3A2F] hover:bg-[#F7F8F6] flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-[#E6F5EF] text-[#0D8B65] px-1.5 py-0.5 rounded">
                        {loc.code}
                      </span>
                      <span className="font-semibold text-[#202722] truncate max-w-[150px]">
                        {loc.name.split('(')[0]}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5E6D64]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prototype Notice Box */}
          <div className="p-4 bg-[#FDFBF7] border border-[#E4E2D9] rounded-2xl text-[11px] text-[#5E6D64] leading-relaxed">
            <span className="font-bold text-[#1E3A2F] block mb-0.5">Campus GIS Mapping Engine</span>
            Deterministic vector coordinates on 1150x750 layout. Location-tagged tickets route directly to the designated facility supervisor.
          </div>
        </div>

      </div>
    </div>
  );
};
