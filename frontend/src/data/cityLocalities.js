/**
 * City → Locality mapping for EstateIQ
 * Keeps city and area filters in sync across Search and List Property pages.
 */
export const CITY_LOCALITIES = {
  Ahmedabad: [
    'Bodakdev', 'Satellite', 'Prahlad Nagar', 'Thaltej', 'Vastrapur',
    'SG Highway', 'GIFT City', 'Navrangpura', 'Maninagar', 'Bopal',
    'South Bopal', 'Gota', 'Chandkheda', 'Motera', 'Ambawadi',
    'Paldi', 'Ellis Bridge', 'Shilaj', 'Ghuma', 'Science City',
  ],
  Mumbai: [
    'Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Worli',
    'Lower Parel', 'Goregaon East', 'Malad West', 'Thane West',
    'Navi Mumbai', 'Panvel', 'Kharghar', 'Airoli', 'Vashi',
    'Mulund West', 'Vikhroli', 'Chembur', 'Dadar',
  ],
  'Delhi NCR': [
    'Gurgaon Sector 49', 'Dwarka', 'Noida Sector 150', 'Greater Noida',
    'Ghaziabad', 'Faridabad', 'Vasant Kunj', 'Saket', 'Hauz Khas',
    'Defence Colony', 'Golf Course Road', 'Sohna Road', 'DLF Phase 5',
    'Noida Expressway', 'Indirapuram',
  ],
  Bengaluru: [
    'Whitefield', 'Sarjapur Road', 'Electronic City', 'Koramangala',
    'HSR Layout', 'Indiranagar', 'Jayanagar', 'Hebbal', 'Marathahalli',
    'Yelahanka', 'Devanahalli', 'Bannerghatta Road', 'JP Nagar',
    'Rajajinagar', 'Basavanagudi',
  ],
  Pune: [
    'Baner', 'Hinjewadi', 'Kharadi', 'Wakad', 'Aundh',
    'Koregaon Park', 'Viman Nagar', 'Hadapsar', 'Magarpatta',
    'Bavdhan', 'Pimple Saudagar', 'Undri', 'NIBM Road',
    'Kothrud', 'Deccan',
  ],
};

export const ALL_CITIES = Object.keys(CITY_LOCALITIES);

/**
 * Returns the locality list for a given city.
 * If no city is selected (empty string), returns all localities.
 */
export const getLocalitiesForCity = (city) => {
  if (!city) {
    return Object.values(CITY_LOCALITIES).flat();
  }
  return CITY_LOCALITIES[city] || [];
};
