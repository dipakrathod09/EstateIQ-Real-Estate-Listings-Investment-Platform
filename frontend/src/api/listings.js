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

export const requestEmailOTP = async (email) => {
  const response = await client.post('/api/auth/email/request/', { email });
  return response.data;
};

export const verifyEmailOTP = async (email, otp, role = 'buyer', name = '', consent = true) => {
  const response = await client.post('/api/auth/email/verify/', { email, otp, role, name, consent });
  return response.data;
};

export const googleSignIn = async (email, name = '', role = 'buyer', consent = true) => {
  const response = await client.post('/api/auth/google/', { email, name, role, consent });
  return response.data;
};

export const registerWithPassword = async (email, password, name = '', role = 'buyer', consent = true) => {
  const response = await client.post('/api/auth/password/register/', { email, password, name, role, consent });
  return response.data;
};

export const loginWithPassword = async (email, password) => {
  const response = await client.post('/api/auth/password/login/', { email, password });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await client.post('/api/auth/password/reset-request/', { email });
  return response.data;
};

export const confirmPasswordReset = async (email, code, new_password) => {
  const response = await client.post('/api/auth/password/reset-confirm/', { email, code, new_password });
  return response.data;
};

export const verifyPhoneNumber = async (phone_number, otp) => {
  const response = await client.post('/api/users/verify-phone/', { phone_number, otp });
  return response.data;
};

export const addUserRole = async (role, set_active = true) => {
  const response = await client.post('/api/users/add-role/', { role, set_active });
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await client.patch('/api/users/preferences/', { preferences });
  return response.data;
};

export const requestDataDeletion = async (request_type = 'deletion', notes = '') => {
  const response = await client.post('/api/users/data-deletion-request/', { request_type, notes });
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

export const fetchInquiries = async () => {
  const response = await client.get('/api/inquiries/');
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

export const fetchSavedSearches = async () => {
  const response = await client.get('/api/saved-searches/');
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

export const logEvent = async (event_type, payload = {}) => {
  const response = await client.post('/api/events/log/', { event_type, payload });
  return response.data;
};

export const fetchSimilarListings = async (id) => {
  const response = await client.get(`/api/listings/${id}/similar/`);
  return response.data;
};

export const fetchMLValuation = async (id) => {
  const response = await client.get(`/api/listings/${id}/valuation/`);
  return response.data;
};

export const fetchReviews = async (target_type = 'property', target_id = null) => {
  const response = await client.get('/api/reviews/', { params: { target_type, target_id } });
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await client.post('/api/reviews/', reviewData);
  return response.data;
};

export const fetchLocalityHeatmap = async () => {
  const response = await client.get('/api/localities/heatmap/');
  return response.data;
};

export const predictPropertyPrice = async (data) => {
  const response = await client.post('/api/predict-price/', data);
  return response.data;
};


