// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Prevent double API calls with request tracking
let requestTracker = {
  isAddingContact: false,
  isDeletingContact: false,
  isLoadingContacts: false,
  isSendingBulkEmails: false
};

// Contact Service Functions
export const contactService = {
  // Get all contacts from database (PREVENT DOUBLE CALLS)
  getAllContacts: async () => {
    if (requestTracker.isLoadingContacts) {
      return { success: false, message: 'Already loading' };
    }
    
    requestTracker.isLoadingContacts = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/getAllContacts`);
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      throw error;
    } finally {
      requestTracker.isLoadingContacts = false;
    }
  },

  // Add new contact to database (PREVENT DOUBLE CALLS)
  addContact: async (contactData) => {
    if (requestTracker.isAddingContact) {
      return { success: false, message: 'Already adding' };
    }
    
    requestTracker.isAddingContact = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/addContact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });
      
      const data = await response.json();
      console.log('✅ ADD CONTACT RESPONSE:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      throw error;
    } finally {
      requestTracker.isAddingContact = false;
    }
  },

  deleteContact: async (contactId) => {
    if (requestTracker.isDeletingContact) {
      console.log('⚠️ Contact already being deleted, skipping...');
      return { success: false, message: 'Already deleting' };
    }
    
    requestTracker.isDeletingContact = true;
    
    try {
      console.log('🗑️ DELETING CONTACT:', contactId);
      
      const response = await fetch(`${API_BASE_URL}/deleteContact/${contactId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      console.log('✅ DELETE RESPONSE:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    } finally {
      requestTracker.isDeletingContact = false;
    }
  }
};

// ✅ FIXED EMAIL SERVICE
export const emailService = {
  // Send bulk emails with same resume to all HR contacts
  sendBulkEmails: async (contactsData, resumeFile) => {
    if (requestTracker.isSendingBulkEmails) {
      return { success: false, message: 'Already sending bulk emails' };
    }
    
    requestTracker.isSendingBulkEmails = true;
    
    try {
      console.log('📤 BULK EMAIL SERVICE CALLED:', {
        contactsCount: contactsData?.length || 0,
        resumeFile: resumeFile?.name || 'No file',
        resumeSize: resumeFile ? (resumeFile.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'
      });

      // ✅ Validation checks
      if (!resumeFile) {
        throw new Error('Resume file is required for bulk email sending');
      }

      if (!contactsData || contactsData.length === 0) {
        throw new Error('No contacts provided for bulk email sending');
      }

      // ✅ Clean and validate contacts data
      const cleanContactsData = contactsData.map(contact => ({
        id: contact.id || null,
        hrName: contact.hrName || 'HR',
        email: contact.email || '',
        companyName: contact.companyName || 'Company',
        jobPosition: contact.jobPosition || 'Position',
        requiredSkills: Array.isArray(contact.requiredSkills) ? contact.requiredSkills : []
      }));

      console.log('📋 CLEANED CONTACTS DATA:', cleanContactsData);
      
      // ✅ Prepare FormData properly
      const formData = new FormData();
      
      // Add resume file
      formData.append('resume', resumeFile);
      
      // ✅ Add contacts as properly stringified JSON
      formData.append('contacts', JSON.stringify(cleanContactsData));
      
      // ✅ Debug FormData contents
      console.log('📤 FORM DATA CONTENTS:');
      console.log('- Resume file:', resumeFile.name, `(${resumeFile.size} bytes)`);
      console.log('- Contacts JSON:', JSON.stringify(cleanContactsData));
      
      const response = await fetch(`${API_BASE_URL}/emails/bulk-send`, {
        method: 'POST',
        body: formData
        // ❌ Don't set Content-Type header when using FormData
        // FormData automatically sets multipart/form-data
      });
      
      console.log('📥 RESPONSE STATUS:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERROR RESPONSE:', errorText);
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ BULK EMAIL API RESPONSE:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error sending bulk emails:', error);
      return {
        success: false,
        message: error.message || 'Failed to send bulk emails',
        error: error.toString()
      };
    } finally {
      requestTracker.isSendingBulkEmails = false;
    }
  }
};
