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

// ✅ ENHANCED User Profile Service
export const userService = {
  // Get user profile with caching
  getUserProfile: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/profile`);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get all user profiles (for multi-user support)
  getAllUserProfiles: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/profiles`);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get user profile by ID
  getUserProfileById: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/profile/${userId}`);
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete user profile
  deleteUserProfile: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
        method: 'DELETE',
      });
      
      // Clear user profile cache after successful delete
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile')
      );
      cacheKeys.forEach(key => requestCache.delete(key));
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Save/Create user profile
  saveUserProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      // Clear user profile cache after successful save
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile')
      );
      cacheKeys.forEach(key => requestCache.delete(key));
      
      return await response.json();
    } catch (error) {
      console.error('Error saving user profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      // Clear user profile cache after successful update
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile')
      );
      cacheKeys.forEach(key => requestCache.delete(key));
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Update user profile by ID
  updateUserProfileById: async (userId, profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      // Clear cache after update
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile')
      );
      cacheKeys.forEach(key => requestCache.delete(key));
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user profile exists
  checkProfileExists: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/profile/check`);
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return { success: false, exists: false };
    }
  },

  // ✅ NEW: Upload profile picture
  uploadProfilePicture: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}/picture`, {
        method: 'POST',
        body: formData,
      });

      // Clear cache after upload
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile')
      );
      cacheKeys.forEach(key => requestCache.delete(key));

      return await response.json();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get user activity/stats
  getUserActivity: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/activity/${userId}`);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return { success: false, error: error.message };
    }
  }
};

export const emailService = {
  // Send bulk emails with user profile data
  sendBulkEmails: async (contacts, resumeFile, userProfile = null) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('contacts', JSON.stringify(contacts));
      
      // Add user profile data if provided
      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }

      console.log('📤 Sending bulk emails with:', {
        contactsCount: contacts.length,
        resumeFile: resumeFile.name,
        hasUserProfile: !!userProfile,
        userProfile: userProfile
      });

      const response = await fetch(`${API_BASE_URL}/emails/bulk-send`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      return { success: false, error: error.message };
    }
  },

  // Send individual email
  sendIndividualEmail: async (contact, resumeFile, userProfile = null) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('contact', JSON.stringify(contact));
      
      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }

      const response = await fetch(`${API_BASE_URL}/emails/send-individual`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending individual email:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Send test email
  sendTestEmail: async (userProfile) => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/test-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message };
    }
  },

  // Get email logs with caching
  getLogs: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/logs`);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get email logs by user
  getLogsByUser: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/logs/user/${userId}`);
    } catch (error) {
      console.error('Error fetching email logs by user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get email stats with caching
  getStats: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/stats`);
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get email stats by user
  getStatsByUser: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/stats/user/${userId}`);
    } catch (error) {
      console.error('Error fetching email stats by user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get email delivery status
  getDeliveryStatus: async (emailId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/status/${emailId}`);
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get email batches
  getBatches: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/batches`);
    } catch (error) {
      console.error('Error fetching email batches:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get emails by batch ID
  getBatchEmails: async (batchId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/emails/batch/${batchId}`);
    } catch (error) {
      console.error('Error fetching batch emails:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Resend failed emails
  resendFailedEmails: async (batchId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/resend/${batchId}`, {
        method: 'POST',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error resending failed emails:', error);
      return { success: false, error: error.message };
    }
  }
};

// ✅ ENHANCED Analytics Service
export const analyticsService = {
  // Get dashboard analytics
  getDashboardStats: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/dashboard`);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get success rate
  getSuccessRate: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/success-rate`);
    } catch (error) {
      console.error('Error fetching success rate:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get user performance analytics
  getUserPerformance: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/user/${userId}`);
    } catch (error) {
      console.error('Error fetching user performance:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get time-based analytics
  getTimeBasedStats: async (period = '7d') => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/timeline?period=${period}`);
    } catch (error) {
      console.error('Error fetching time-based stats:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get top performing skills
  getTopSkills: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/skills/top`);
    } catch (error) {
      console.error('Error fetching top skills:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Get company response rates
  getCompanyStats: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/analytics/companies`);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      return { success: false, error: error.message };
    }
  }
};

// ✅ NEW: Resume Service
export const resumeService = {
  // Upload resume
  uploadResume: async (userId, resumeFile) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch(`${API_BASE_URL}/user/resume/${userId}`, {
        method: 'POST',
        body: formData,
      });

      // Clear cache after upload
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile') || key.includes('/user/resume')
      );
      cacheKeys.forEach(key => requestCache.delete(key));

      return await response.json();
    } catch (error) {
      console.error('Error uploading resume:', error);
      return { success: false, error: error.message };
    }
  },

  // Get resume info
  getResumeInfo: async (userId) => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/user/resume/${userId}`);
    } catch (error) {
      console.error('Error fetching resume info:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete resume
  deleteResume: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/resume/${userId}`, {
        method: 'DELETE',
      });

      // Clear cache after delete
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/user/profile') || key.includes('/user/resume')
      );
      cacheKeys.forEach(key => requestCache.delete(key));

      return await response.json();
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { success: false, error: error.message };
    }
  },

  // Download resume
  downloadResume: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/resume/${userId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        return { success: true, blob };
      } else {
        return { success: false, error: 'Failed to download resume' };
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      return { success: false, error: error.message };
    }
  }
};

// ✅ ENHANCED Utility functions
export const apiUtils = {
  // Clear all cache
  clearCache: () => {
    requestCache.clear();
    console.log('🧹 All API cache cleared');
  },

  // Clear specific cache
  clearCacheFor: (endpoint) => {
    const keysToDelete = Array.from(requestCache.keys()).filter(key => 
      key.includes(endpoint)
    );
    keysToDelete.forEach(key => requestCache.delete(key));
    console.log(`🧹 Cleared cache for: ${endpoint}`);
  },

  // Get cache status
  getCacheStatus: () => {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    };
  },

  // ✅ NEW: Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // ✅ NEW: Validate phone format
  validatePhone: (phone) => {
    const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  },

  // ✅ NEW: Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // ✅ NEW: Generate batch ID
  generateBatchId: () => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // ✅ NEW: Check API health
  checkApiHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      return { success: false, error: error.message };
    }
  }
};

// ✅ NEW: Settings Service
export const settingsService = {
  // Get app settings
  getSettings: async () => {
    try {
      return await getCachedRequest(`${API_BASE_URL}/settings`);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: error.message };
    }
  },

  // Update settings
  updateSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      // Clear settings cache
      const cacheKeys = Array.from(requestCache.keys()).filter(key => 
        key.includes('/settings')
      );
      cacheKeys.forEach(key => requestCache.delete(key));

      return await response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export all services
export default {
  contactService,
  userService,
  emailService,
  analyticsService,
  resumeService,
  settingsService,
  apiUtils
};
