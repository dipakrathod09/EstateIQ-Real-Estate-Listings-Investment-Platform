import client from './client';

export const fetchListings = async (params = {}) => {
  const response = await client.get('/api/listings/', { params });
  return response.data;
};

export const fetchListingDetail = async (id) => {
  const response = await client.get(`/api/listings/${id}/`);
  return response.data;
};

export const createPropertyListing = async (data) => {
  const response = await client.post('/api/listings/create/', data);
  return response.data;
};

export const requestOTP = async (phone_number) => {
  const response = await client.post('/api/auth/otp/request/', { phone_number });
  return response.data;
};

export const verifyOTP = async (phone_number, otp, role = 'buyer') => {
  const response = await client.post('/api/auth/otp/verify/', { phone_number, otp, role });
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await client.get('/api/auth/me/');
  return response.data;
};

export const submitInquiry = async (inquiryData) => {
  const response = await client.post('/api/inquiries/', inquiryData);
  return response.data;
};

export const scheduleSiteVisit = async (visitData) => {
  const response = await client.post('/api/site-visits/', visitData);
  return response.data;
};

export const fetchFavorites = async () => {
  const response = await client.get('/api/favorites/');
  return response.data;
};

export const toggleFavorite = async (property_id) => {
  const response = await client.post('/api/favorites/', { property_id });
  return response.data;
};

export const calculateEMI = async (data) => {
  const response = await client.post('/api/calculators/emi/', data);
  return response.data;
};

export const calculateStampDuty = async (data) => {
  const response = await client.post('/api/calculators/stamp-duty/', data);
  return response.data;
};

export const calculateLoanEligibility = async (data) => {
  const response = await client.post('/api/calculators/loan-eligibility/', data);
  return response.data;
};

export const fetchInvestments = async () => {
  const response = await client.get('/api/investments/');
  return response.data;
};
