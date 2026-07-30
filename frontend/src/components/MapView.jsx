import React, { useEffect, useRef } from 'react';

export const MapView = ({ properties = [], onSelectProperty, selectedPropertyId }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window.L === 'undefined') return;

    // Default center: India center (or first property)
    const defaultLat = properties[0]?.property?.latitude || properties[0]?.latitude || 22.9676;
    const defaultLng = properties[0]?.property?.longitude || properties[0]?.longitude || 72.5970;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 12);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else if (properties.length > 0) {
      const firstLat = properties[0]?.property?.latitude || properties[0]?.latitude || defaultLat;
      const firstLng = properties[0]?.property?.longitude || properties[0]?.longitude || defaultLng;
      mapInstanceRef.current.setView([firstLat, firstLng], 12);
    }

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add property markers
    properties.forEach((item) => {
      const prop = item.property || item;
      const lat = prop.latitude || (22.95 + Math.random() * 0.15);
      const lng = prop.longitude || (72.50 + Math.random() * 0.15);
      const priceLakhs = prop.price ? (prop.price / 100000).toFixed(1) : '50';

      const isSelected = prop.id === selectedPropertyId;

      const customIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${isSelected ? '#B98B4E' : '#12283C'}; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; font-family: monospace; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
                 ₹${priceLakhs}L
               </div>`,
        iconSize: [50, 24],
        iconAnchor: [25, 12],
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);

      const popupHtml = `
        <div style="font-family: sans-serif; width: 180px; text-align: left;">
          <img src="${prop.primary_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80'}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;" />
          <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #12283C; line-height: 1.2;">${prop.title}</h4>
          <p style="margin: 0; font-size: 11px; color: #B98B4E; font-weight: bold;">₹${priceLakhs} Lakhs (${prop.bhk} BHK)</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748B;">${prop.locality}, ${prop.city}</p>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectProperty) onSelectProperty(prop);
      });

      markersRef.current.push(marker);
    });
  }, [properties, selectedPropertyId]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-outline/40 shadow-sm relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
};
