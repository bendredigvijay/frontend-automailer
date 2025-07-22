// apiService.js
const API_BASE_URL = 'http://localhost:5000/api';

// Request cache to prevent duplicate calls
const requestCache = new Map();
const CACHE_DURATION = 1000; // 1 second

const getCachedRequest = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Check if we have a recent cached request
  if (requestCache.has(cacheKey)) {
    const { promise, timestamp } = requestCache.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      console.log(`🔄 Using cached request for: ${url}`);
      return promise;
    }
  }
  
  // Make new request
  console.log(`📡 Making fresh API call: ${url}`);
  const promise = fetch(url, options).then(res => res.json());
  requestCache.set(cacheKey, { promise, timestamp: now });
  
  // Clear cache after duration
  setTimeout(() => requestCache.delete(cacheKey), CACHE_DURATION);
  
  return promise;
};

export const contactService = {
  // Get all contacts with caching
  getAllContacts: async () => {
    return await getCachedRequest(`${API_BASE_URL}/getAllContacts`);
  },

  // Add new contact
  addContact: async (contactData) => {
    const response = await fetch(`${API_BASE_URL}/addContact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    // Clear getAllContacts cache after successful add
    requestCache.clear();
    return await response.json();
  },

  // Update contact
  updateContact: async (id, contactData) => {
    const response = await fetch(`${API_BASE_URL}/updateContact/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    // Clear cache after successful update
    requestCache.clear();
    return await response.json();
  },

  // Delete contact (soft delete)
  deleteContact: async (id) => {
    const response = await fetch(`${API_BASE_URL}/deleteContact/${id}`, {
      method: 'DELETE',
    });
    
    // Clear cache after successful delete
    requestCache.clear();
    return await response.json();
  },

  // Get single contact
  getContact: async (id) => {
    return await getCachedRequest(`${API_BASE_URL}/getContact/${id}`);
  }
};

export const emailService = {
  // Send bulk emails
  sendBulkEmails: async (contacts, resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('contacts', JSON.stringify(contacts));

    const response = await fetch(`${API_BASE_URL}/emails/bulk-send`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  // Get email logs
  getLogs: async () => {
    return await getCachedRequest(`${API_BASE_URL}/emails/logs`);
  },

  // Get email stats
  getStats: async () => {
    return await getCachedRequest(`${API_BASE_URL}/emails/stats`);
  }
};
