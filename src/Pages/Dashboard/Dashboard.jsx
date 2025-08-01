import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Dropdown } from 'react-bootstrap';
import {
  IoSend,
  IoPersonAdd,
  IoDocumentAttach,
  IoCloudUpload,
  IoPencil,
  IoSave,
  IoClose,
  IoPersonCircle,
  IoLogOut,
  IoSettings,
  IoRefresh,
  IoCopy,
} from 'react-icons/io5';
import { IoIosContacts } from "react-icons/io";
import { MdEmail, MdDelete, MdPerson, MdBusiness, MdVerifiedUser, MdContentCopy } from 'react-icons/md';
import { contactService, emailService, userService } from '../../apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import { AppConfig } from '../../utils/dummy';

function Dashboard() {
  // Active tab state
  const [activeTab, setActiveTab] = useState('user');

  // HR Form Data
  const [formData, setFormData] = useState({
    hrName: '',
    email: '',
    companyName: '',
    jobPosition: '',
    requiredSkills: []
  });

  // ✅ FIXED: Proper user profile state management
  const [userProfile, setUserProfile] = useState({
    id: null,
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    availability: '',
    experienceYears: '',
    currentRole: '',
    skills: []
  });

  // ✅ ENHANCED: User Management States
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  const [hrContacts, setHrContacts] = useState([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [userSkillSearchTerm, setUserSkillSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);

  // Resume state
  const [resume, setResume] = useState(null);
  const [resumePreview, setResumePreview] = useState('');

  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isUserSkillsOpen, setIsUserSkillsOpen] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Edit functionality states
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSkillSearchTerm, setEditSkillSearchTerm] = useState('');
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);

  // Individual send states
  const [sendingContactId, setSendingContactId] = useState(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  // ✅ NEW: Clone functionality states
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [contactToClone, setContactToClone] = useState(null);
  const [cloneFormData, setCloneFormData] = useState({
    hrName: '',
    email: '',
    companyName: '',
    jobPosition: '',
    requiredSkills: []
  });
  const [cloneSkillSearchTerm, setCloneSkillSearchTerm] = useState('');
  const [isCloneSkillsOpen, setIsCloneSkillsOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // ✅ CONFIG-BASED: Use predefined skills from config
  const predefinedSkills = AppConfig.predefinedSkills;

  const filteredSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !formData.requiredSkills.includes(s)
  );

  const filteredUserSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(userSkillSearchTerm.toLowerCase()) &&
      !userProfile.skills.includes(s)
  );

  const filteredEditSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(editSkillSearchTerm.toLowerCase()) &&
      !editFormData.requiredSkills?.includes(s)
  );

  // ✅ NEW: Clone skills filter
  const filteredCloneSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(cloneSkillSearchTerm.toLowerCase()) &&
      !cloneFormData.requiredSkills?.includes(s)
  );

  // ✅ Enhanced Safe Avatar Component
  const SafeAvatar = ({ name, className = "contact-avatar", fallback = AppConfig.defaults.avatarFallback }) => {
    const displayName = name && typeof name === 'string' && name.trim()
      ? name.trim().charAt(0).toUpperCase()
      : fallback;

    return (
      <div className={className} title={name || 'No name'}>
        {displayName}
      </div>
    );
  };

  /* ------------  ✅ ENHANCED LOAD DATA FUNCTIONS  ------------ */
  useEffect(() => {
    loadContactsFromDatabase();
    loadUserProfile();
  }, []);

  // Load contacts from backend database
  const loadContactsFromDatabase = async () => {
    try {
      const response = await contactService.getAllContacts();
      if (response.success) {
        console.log('📥 LOADED CONTACTS:', response.data);
        setHrContacts(response.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts from database');
    }
  };

  // ✅ COMPLETELY FIXED: Load user profile with proper mapping
  const loadUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      console.log('🔄 Loading user profile...');

      const response = await userService.getUserProfile();
      console.log('📡 API Response:', response);

      if (response.success && response.data) {
        // ✅ PROPER MAPPING: Handle both database fields and frontend fields
        const userData = {
          id: response.data.id,
          fullName: response.data.full_name || response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          linkedin: response.data.linkedin || '',
          github: response.data.github || '',
          location: response.data.location || '',
          availability: response.data.availability || '',
          experienceYears: response.data.experience_years || response.data.experienceYears || '',
          currentRole: response.data.job_role || response.data.currentRole || '', // ✅ FIXED MAPPING
          skills: response.data.skills || []
        };

        console.log('✅ Mapped User Data:', userData);

        setUserProfile(userData);
        setCurrentUser(userData);
        setProfileExists(true);

        toast.success(`👋 Welcome back, ${userData.fullName}!`, {
          position: "top-right",
          autoClose: AppConfig.ui.successToastAutoCloseTime,
        });
      } else {
        console.log('⚠️ No user profile found');
        setProfileExists(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      setProfileExists(false);
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // ✅ NEW: Refresh user data function
  const refreshUserData = async () => {
    await loadUserProfile();
    toast.info('🔄 Profile refreshed!');
  };

  /* ------------  HR FORM HANDLERS  ------------ */
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ------------  ✅ ENHANCED USER PROFILE HANDLERS  ------------ */
  const handleUserInputChange = e => {
    const { name, value } = e.target;
    console.log(`📝 User input changed: ${name} = ${value}`);
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  /* ------------  RESUME UPLOAD  ------------ */
  const handleResumeUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!AppConfig.fileUpload.allowedTypes.includes(file.type)) {
      toast.error('Please upload PDF, DOC or DOCX only');
      return;
    }
    if (file.size > AppConfig.fileUpload.maxSizeInMB * 1024 * 1024) {
      toast.error(`File must be under ${AppConfig.fileUpload.maxSizeInMB} MB`);
      return;
    }
    setResume(file);
    setResumePreview(file.name);
    toast.success(`📎 Resume uploaded: ${file.name}`);
  };

  const removeResume = () => {
    setResume(null);
    setResumePreview('');
    const fileInput = document.getElementById('user-resume-upload');
    if (fileInput) fileInput.value = '';
    toast.info('📎 Resume removed');
  };

  /* ------------  HR SKILLS MULTISELECT  ------------ */
  const addSkill = skill => {
    if (!formData.requiredSkills.includes(skill)) {
      const updated = [...formData.requiredSkills, skill];
      setFormData(prev => ({ ...prev, requiredSkills: updated }));
    }
    setSkillSearchTerm('');
  };

  const removeSkill = skillToRemove => {
    const updated = formData.requiredSkills.filter(s => s !== skillToRemove);
    setFormData(prev => ({ ...prev, requiredSkills: updated }));
  };

  const handleSkillsInputKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillSearchTerm.trim()) addSkill(skillSearchTerm.trim());
    }
    if (e.key === 'Backspace' && !skillSearchTerm) {
      const prev = formData.requiredSkills;
      if (prev.length) removeSkill(prev[prev.length - 1]);
    }
  };

  /* ------------  USER SKILLS MULTISELECT  ------------ */
  const addUserSkill = skill => {
    if (!userProfile.skills.includes(skill)) {
      const updated = [...userProfile.skills, skill];
      setUserProfile(prev => ({ ...prev, skills: updated }));
      console.log('✅ Added skill:', skill, 'Updated skills:', updated);
    }
    setUserSkillSearchTerm('');
  };

  const removeUserSkill = skillToRemove => {
    const updated = userProfile.skills.filter(s => s !== skillToRemove);
    setUserProfile(prev => ({ ...prev, skills: updated }));
    console.log('❌ Removed skill:', skillToRemove, 'Updated skills:', updated);
  };

  const handleUserSkillsInputKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (userSkillSearchTerm.trim()) addUserSkill(userSkillSearchTerm.trim());
    }
    if (e.key === 'Backspace' && !userSkillSearchTerm) {
      const prev = userProfile.skills;
      if (prev.length) removeUserSkill(prev[prev.length - 1]);
    }
  };

  /* ------------  ✅ NEW: CLONE FUNCTIONALITY  ------------ */
  const startCloning = (contact) => {
    setContactToClone(contact);
    setCloneFormData({
      hrName: `${contact.hr_name} (Copy)`,
      email: '', // Don't duplicate email - user should enter new one
      companyName: contact.company_name,
      jobPosition: contact.job_position,
      requiredSkills: [...(contact.required_skills || [])]
    });
    setShowCloneModal(true);
    toast.info(`🔄 Cloning contact: ${contact.hr_name}`);
  };

  const handleCloneInputChange = (e) => {
    const { name, value } = e.target;
    setCloneFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCloneSkill = (skill) => {
    if (!cloneFormData.requiredSkills.includes(skill)) {
      setCloneFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
    setCloneSkillSearchTerm('');
  };

  const removeCloneSkill = (skillToRemove) => {
    setCloneFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleCloneSkillsKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cloneSkillSearchTerm.trim()) addCloneSkill(cloneSkillSearchTerm.trim());
    }
    if (e.key === 'Backspace' && !cloneSkillSearchTerm) {
      const prev = cloneFormData.requiredSkills;
      if (prev.length) removeCloneSkill(prev[prev.length - 1]);
    }
  };

  const handleCloneSubmit = async (e) => {
    e.preventDefault();

    if (!cloneFormData.hrName?.trim()) {
      toast.error('Please enter HR name');
      return;
    }
    if (!cloneFormData.email?.trim()) {
      toast.error('Please enter HR email');
      return;
    }
    if (!cloneFormData.companyName?.trim()) {
      toast.error('Please enter company name');
      return;
    }
    if (!cloneFormData.jobPosition?.trim()) {
      toast.error('Please select job position');
      return;
    }
    if (!cloneFormData.requiredSkills.length) {
      toast.error('Please add at least one skill');
      return;
    }

    setIsCloning(true);

    try {
      const response = await contactService.addContact(cloneFormData);

      if (response.success) {
        console.log('✅ CONTACT CLONED:', response.data);
        setHrContacts(prev => [response.data, ...prev]);

        // Reset clone modal
        setShowCloneModal(false);
        setContactToClone(null);
        setCloneFormData({
          hrName: '',
          email: '',
          companyName: '',
          jobPosition: '',
          requiredSkills: []
        });
        setCloneSkillSearchTerm('');
        setIsCloneSkillsOpen(false);

        toast.success(`🎉 Contact cloned successfully! "${response.data.hr_name}" added to your network.`);
      } else {
        toast.error(`Failed to clone contact: ${response.error}`);
      }
    } catch (error) {
      console.error('Error cloning contact:', error);
      toast.error('Failed to clone contact. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const cancelCloning = () => {
    setShowCloneModal(false);
    setContactToClone(null);
    setCloneFormData({
      hrName: '',
      email: '',
      companyName: '',
      jobPosition: '',
      requiredSkills: []
    });
    setCloneSkillSearchTerm('');
    setIsCloneSkillsOpen(false);
    toast.info('❌ Clone cancelled');
  };

  /* ------------  EDIT FUNCTIONALITY  ------------ */
  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditFormData({
      hrName: contact.hr_name,
      email: contact.email,
      companyName: contact.company_name,
      jobPosition: contact.job_position,
      requiredSkills: [...(contact.required_skills || [])]
    });
    toast.info(`✏️ Editing contact: ${contact.hr_name}`);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
    setEditSkillSearchTerm('');
    setIsEditSkillsOpen(false);
    toast.info('❌ Edit cancelled');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const addEditSkill = (skill) => {
    if (!editFormData.requiredSkills.includes(skill)) {
      setEditFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
    setEditSkillSearchTerm('');
  };

  const removeEditSkill = (skillToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleEditSkillsKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editSkillSearchTerm.trim()) addEditSkill(editSkillSearchTerm.trim());
    }
    if (e.key === 'Backspace' && !editSkillSearchTerm) {
      const prev = editFormData.requiredSkills;
      if (prev.length) removeEditSkill(prev[prev.length - 1]);
    }
  };

  const saveEdit = async () => {
    // Validation
    if (!editFormData.hrName?.trim()) {
      toast.error('Please enter HR name');
      return;
    }
    if (!editFormData.email?.trim()) {
      toast.error('Please enter HR email');
      return;
    }
    if (!editFormData.companyName?.trim()) {
      toast.error('Please enter company name');
      return;
    }
    if (!editFormData.jobPosition?.trim()) {
      toast.error('Please select job position');
      return;
    }
    if (!editFormData.requiredSkills.length) {
      toast.error('Please add at least one skill');
      return;
    }

    try {
      const response = await contactService.updateContact(editingId, editFormData);
      if (response.success) {
        setHrContacts(prev =>
          prev.map(contact =>
            contact.id === editingId ? response.data : contact
          )
        );
        cancelEditing();
        toast.success(`✅ Contact "${response.data.hr_name}" updated successfully!`);
      } else {
        toast.error(`Failed to update contact: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact. Please try again.');
    }
  };

  /* ------------  HR FORM SUBMIT  ------------ */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.requiredSkills.length) {
      toast.error('Please add at least one skill');
      return;
    }

    setIsLoading(true);

    try {
      const response = await contactService.addContact(formData);

      if (response.success) {
        console.log('✅ CONTACT SAVED:', response.data);
        setHrContacts(prev => [response.data, ...prev]);
        setFormData({
          hrName: '',
          email: '',
          companyName: '',
          jobPosition: '',
          requiredSkills: []
        });
        setSkillSearchTerm('');
        toast.success('🎉 Contact saved to database!');
      } else {
        toast.error(`Failed to save contact: ${response.error}`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------  ✅ COMPLETELY FIXED USER PROFILE SUBMIT  ------------ */
  const handleUserProfileSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!userProfile.fullName?.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!userProfile.email?.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!userProfile.phone?.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!userProfile.skills.length) {
      toast.error('Please add at least one skill');
      return;
    }

    setIsLoading(true);

    try {
      console.log('💾 Saving user profile:', userProfile);

      const response = await userService.saveUserProfile(userProfile);
      console.log('📡 Save response:', response);

      if (response.success) {
        // ✅ PROPER STATE UPDATE: Map response data correctly
        const updatedUserData = {
          id: response.data.id,
          fullName: response.data.full_name || response.data.fullName,
          email: response.data.email,
          phone: response.data.phone,
          linkedin: response.data.linkedin,
          github: response.data.github,
          location: response.data.location,
          availability: response.data.availability,
          experienceYears: response.data.experience_years || response.data.experienceYears,
          currentRole: response.data.job_role || response.data.currentRole, // ✅ FIXED
          skills: response.data.skills
        };

        console.log('✅ Updated user data:', updatedUserData);

        // ✅ UPDATE ALL STATES
        setCurrentUser(updatedUserData);
        setUserProfile(updatedUserData);
        setIsEditingProfile(false);
        setProfileExists(true);

        // ✅ SUCCESS MESSAGES
        const isUpdate = currentUser?.id;
        const message = isUpdate
          ? `✅ Profile updated successfully, ${updatedUserData.fullName}!`
          : `🎉 Welcome to ${AppConfig.app.title}, ${updatedUserData.fullName}!`;

        toast.success(message, {
          position: "top-right",
          autoClose: AppConfig.ui.toastAutoCloseTime,
        });

        // ✅ FORCE RE-RENDER
        setTimeout(() => {
          loadUserProfile();
        }, 500);

      } else {
        toast.error(`Failed to save profile: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------  ✅ ENHANCED USER MANAGEMENT FUNCTIONS  ------------ */
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setActiveTab('user');
    toast.info('📝 Edit mode enabled');
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    // Restore original data
    if (currentUser) {
      setUserProfile(currentUser);
      toast.info('❌ Edit cancelled');
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await userService.deleteUserProfile(currentUser.id);
      if (response.success) {
        setCurrentUser(null);
        setUserProfile({
          id: null,
          fullName: '',
          email: '',
          phone: '',
          linkedin: '',
          github: '',
          location: '',
          availability: '',
          experienceYears: '',
          currentRole: '',
          skills: []
        });
        setResume(null);
        setResumePreview('');
        setShowDeleteUserModal(false);
        setProfileExists(false);
        toast.success('🗑️ Profile deleted successfully!');
        setActiveTab('user');
      } else {
        toast.error('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const viewUserDetails = () => {
    setShowUserModal(true);
  };

  /* ------------  DELETE CONTACT  ------------ */
  const confirmDelete = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const deleteContact = async () => {
    try {
      const response = await contactService.deleteContact(contactToDelete.id);
      if (response.success) {
        console.log('🗑️ CONTACT DELETED:', contactToDelete.id);
        setHrContacts(prev =>
          prev.filter(contact => contact.id !== contactToDelete.id)
        );
        toast.success(`🗑️ Contact "${contactToDelete.hr_name}" deleted!`);
      } else {
        toast.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  /* ------------  EMAIL FUNCTIONALITY  ------------ */
  const sendToIndividual = async (contact) => {
    if (!resume) {
      toast.error('Please upload resume in My Profile first! 📎');
      return;
    }

    if (!currentUser) {
      toast.error('Please complete your profile first! 👤');
      return;
    }

    setSendingContactId(contact.id);

    try {
      const contactData = [{
        id: contact.id,
        hrName: contact.hr_name,
        email: contact.email,
        companyName: contact.company_name,
        jobPosition: contact.job_position,
        requiredSkills: contact.required_skills || []
      }];

      console.log('📤 INDIVIDUAL SEND BY:', currentUser.fullName);
      console.log('📤 CONTACT DATA:', contactData[0]);

      const response = await emailService.sendBulkEmails(contactData, resume, currentUser);

      if (response.success) {
        setSentCount(prev => prev + 1);
        toast.success(`✅ Resume sent by ${currentUser.fullName} to ${contact.hr_name} at ${contact.company_name}!`, {
          position: "top-right",
          autoClose: AppConfig.ui.toastAutoCloseTime,
        });
      } else {
        toast.error(`❌ Failed to send email: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Individual send failed:', error);
      toast.error('❌ Failed to send email. Please try again.');
    } finally {
      setSendingContactId(null);
    }
  };

  const handleBulkSend = async () => {
    if (!resume) {
      toast.error('Please upload resume in My Profile first! 📎');
      return;
    }

    if (!currentUser) {
      toast.error('Please complete your profile first! 👤');
      return;
    }

    if (hrContacts.length === 0) {
      toast.error('Add at least one HR contact first! 👥');
      return;
    }

    setIsBulkSending(true);

    try {
      const allContactsData = hrContacts.map(contact => ({
        id: contact.id,
        hrName: contact.hr_name,
        email: contact.email,
        companyName: contact.company_name,
        jobPosition: contact.job_position,
        requiredSkills: contact.required_skills || []
      }));

      console.log('📤 BULK SEND INITIATED BY:', currentUser.fullName);

      const response = await emailService.sendBulkEmails(allContactsData, resume, currentUser);

      if (response.success) {
        const successCount = response.data?.successCount || allContactsData.length;
        setSentCount(prev => prev + successCount);

        toast.success(
          `🎉 Resume sent successfully by ${currentUser.fullName} to ${successCount} HRs!`,
          {
            position: "top-right",
            autoClose: AppConfig.ui.longToastAutoCloseTime,
          }
        );
      } else {
        toast.error(`❌ Failed to send emails: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Bulk send failed:', error);
      toast.error('❌ Failed to send emails. Please try again.');
    } finally {
      setIsBulkSending(false);
    }
  };

  // ✅ Loading guard
  if (isLoadingUser) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-app">
      {/* ----------  ✅ ENHANCED HEADER WITH REAL USER INFO  ---------- */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <MdEmail />
          </div>
          <div className="brand-info">
            <h1 className="app-title">{AppConfig.app.title}</h1>
            <p className="app-subtitle">{AppConfig.app.subtitle}</p>
          </div>
        </div>

        {/* ✅ ENHANCED: Real-time User Info Section */}
        <div className="user-info-section">
          {currentUser && currentUser.fullName ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-light"
                className="user-dropdown-btn"
              >
                <SafeAvatar
                  name={currentUser.fullName}
                  className="user-avatar"
                  fallback={AppConfig.defaults.avatarFallback}
                />
                <div className="user-details">
                  <span className="user-name">{currentUser.fullName}</span>
                  <small className="user-email">{currentUser.email}</small>
                </div>
                <MdVerifiedUser className="verified-icon" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Header>
                  <strong>{currentUser.fullName}</strong>
                  <div className="user-meta">
                    <small>{currentUser.email}</small>
                    <small>{currentUser.experienceYears} Experience</small>
                    <small>{currentUser.currentRole || AppConfig.defaults.userRole}</small>
                  </div>
                </Dropdown.Header>

                <Dropdown.Divider />
                <Dropdown.Item onClick={viewUserDetails}>
                  <IoPersonCircle /> View Full Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={handleEditProfile}>
                  <IoPencil /> Edit Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={refreshUserData}>
                  <IoRefresh /> Refresh Data
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => setShowDeleteUserModal(true)}
                  className="text-danger"
                >
                  <MdDelete /> Delete Profile
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="no-user-info">
              <IoPersonCircle className="no-user-icon" />
              <div className="no-user-text">
                <span>No Profile Found</span>
                <small>Please create your profile</small>
              </div>
            </div>
          )}
        </div>

        <div className="header-stats">
          <div className="stat-badge primary">✨ {currentUser ? 'Active' : 'Inactive'}</div>
          <div className="stat-badge secondary">⚡ {resume ? 'Resume Ready' : 'No Resume'}</div>
          <div className="stat-badge success">📊 {sentCount} Sent</div>
        </div>
      </header>

      {/* ----------  MAIN CONTENT  ---------- */}
      <main className="app-main">
        <div className="main-container">
          {/* Form Section */}
          <section className="form-section">
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                <MdPerson /> My Profile
                {!currentUser && <span className="tab-badge">!</span>}
              </button>
              <button
                className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
                onClick={() => setActiveTab('hr')}
              >
                <MdBusiness /> HR Details
              </button>
            </div>

            {activeTab === 'user' ? (
              /* ===== ✅ ENHANCED USER PROFILE SECTION ===== */
              <>
                <div className="section-header">
                  <div className="header-icon">
                    <IoPersonCircle />
                  </div>
                  <div className="header-text">
                    <h3>
                      My Profile
                      {currentUser && (
                        <span className="profile-status-indicator">
                          {isEditingProfile ? '(Editing)' : '(Active)'}
                        </span>
                      )}
                    </h3>
                    <p>
                      {currentUser
                        ? `Logged in as: ${currentUser.fullName} • ${currentUser.email}`
                        : 'Create your professional profile'
                      }
                    </p>
                  </div>
                  {currentUser && !isEditingProfile && (
                    <div className="profile-actions">
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        <IoPencil /> Edit Profile
                      </button>
                      <button className="refresh-profile-btn" onClick={refreshUserData}>
                        <IoRefresh /> Refresh
                      </button>
                    </div>
                  )}
                </div>

                <div className="section-content">
                  {!currentUser || isEditingProfile ? (
                    <Form onSubmit={handleUserProfileSubmit} className="responsive-form">
                      {/* Resume Upload */}
                      <div className="resume-section user-resume-section">
                        <h4 className="resume-title">
                          <IoDocumentAttach /> My Resume
                          <span className="resume-subtitle">(Required for email sending)</span>
                        </h4>
                        <div className="resume-upload-container">
                          {!resumePreview ? (
                            <label htmlFor="user-resume-upload" className="resume-upload-area">
                              <div className="upload-content">
                                <IoCloudUpload className="upload-icon" />
                                <span className="upload-text">Click to upload your resume</span>
                                <small className="upload-hint">PDF, DOC, DOCX (max {AppConfig.fileUpload.maxSizeInMB} MB)</small>
                              </div>
                              <input
                                type="file"
                                id="user-resume-upload"
                                accept={AppConfig.fileUpload.acceptedExtensions}
                                hidden
                                onChange={handleResumeUpload}
                              />
                            </label>
                          ) : (
                            <div className="resume-preview">
                              <div className="resume-info">
                                <IoDocumentAttach className="resume-icon" />
                                <div className="resume-details">
                                  <span className="resume-name">{resumePreview}</span>
                                  <small className="resume-size">
                                    {resume && (resume.size / 1024 / 1024).toFixed(2)} MB
                                  </small>
                                </div>
                                <button
                                  type="button"
                                  className="remove-resume-btn"
                                  onClick={removeResume}
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ✅ ENHANCED Profile Form Fields */}
                      <div className="form-fields-container">
                        <div className="form-row-top">
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-person" /> Full Name *
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              name="fullName"
                              value={userProfile.fullName || ''}
                              onChange={handleUserInputChange}
                              required
                              placeholder="Enter your full name"
                              autoComplete="name"
                            />
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-envelope" /> Email *
                            </label>
                            <input
                              type="email"
                              className="form-input"
                              name="email"
                              value={userProfile.email || ''}
                              onChange={handleUserInputChange}
                              required
                              placeholder="your@email.com"
                              autoComplete="email"
                            />
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-phone" /> Phone *
                            </label>
                            <input
                              type="tel"
                              className="form-input"
                              name="phone"
                              value={userProfile.phone || ''}
                              onChange={handleUserInputChange}
                              required
                              placeholder="+91-1234567890"
                              autoComplete="tel"
                            />
                          </div>
                        </div>

                        <div className="form-row-top">
                          <div className="input-wrapper">
                            <label className="input-label">
                              <i className="bi bi-linkedin" /> LinkedIn Profile
                            </label>
                            <input
                              type="url"
                              className="form-input"
                              name="linkedin"
                              value={userProfile.linkedin || ''}
                              onChange={handleUserInputChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label">
                              <i className="bi bi-github" /> GitHub Profile
                            </label>
                            <input
                              type="url"
                              className="form-input"
                              name="github"
                              value={userProfile.github || ''}
                              onChange={handleUserInputChange}
                              placeholder="https://github.com/yourusername"
                            />
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-geo-alt" /> Location *
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              name="location"
                              value={userProfile.location || ''}
                              onChange={handleUserInputChange}
                              required
                              placeholder="City, State (Open to relocation)"
                            />
                          </div>
                        </div>

                        <div className="form-row-bottom">
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-calendar" /> Experience *
                            </label>
                            <select
                              className="form-input"
                              name="experienceYears"
                              value={userProfile.experienceYears || ''}
                              onChange={handleUserInputChange}
                              required
                            >
                              {AppConfig.experienceLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label">
                              <i className="bi bi-briefcase" /> Current Role
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              name="currentRole"
                              value={userProfile.currentRole || ''}
                              onChange={handleUserInputChange}
                              placeholder="e.g., Full Stack Developer, Software Engineer"
                            />
                          </div>
                          <div className="input-wrapper">
                            <label className="input-label required">
                              <i className="bi bi-clock" /> Availability *
                            </label>
                            <select
                              className="form-input"
                              name="availability"
                              value={userProfile.availability || ''}
                              onChange={handleUserInputChange}
                              required
                            >
                              {AppConfig.availabilityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* ✅ ENHANCED Skills Section */}
                        <div className="input-wrapper skills-field-full">
                          <label className="input-label required">
                            <i className="bi bi-gear" /> Your Technical Skills *
                            <small className="skill-count">({userProfile.skills?.length || 0} selected)</small>
                          </label>
                          <div
                            className="multiselect-container"
                            onBlur={() => setIsUserSkillsOpen(false)}
                          >
                            <div
                              className="multiselect-input-wrapper"
                              onClick={() => setIsUserSkillsOpen(true)}
                            >
                              {(userProfile.skills || []).map(skill => (
                                <span key={skill} className="skill-chip">
                                  {skill}
                                  <button
                                    type="button"
                                    className="remove-skill-btn"
                                    onClick={() => removeUserSkill(skill)}
                                    title={`Remove ${skill}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className="multiselect-input"
                                placeholder={
                                  (userProfile.skills || []).length
                                    ? 'Add more skills…'
                                    : 'Type to search skills (e.g., React, Python, Node.js)…'
                                }
                                value={userSkillSearchTerm}
                                onChange={e => {
                                  setUserSkillSearchTerm(e.target.value);
                                  setIsUserSkillsOpen(true);
                                }}
                                onKeyDown={handleUserSkillsInputKeyDown}
                                onFocus={() => setIsUserSkillsOpen(true)}
                              />
                            </div>
                            {isUserSkillsOpen && filteredUserSkills.length > 0 && (
                              <div className="skills-inline-options">
                                {filteredUserSkills.slice(0, AppConfig.ui.skillsDropdownLimit).map(skill => (
                                  <button
                                    key={skill}
                                    type="button"
                                    className="skill-option-btn"
                                    onMouseDown={() => addUserSkill(skill)}
                                    title={`Add ${skill}`}
                                  >
                                    + {skill}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <small className="field-help">
                            Select skills that best represent your expertise. Minimum 1 skill required.
                          </small>
                        </div>
                      </div>

                      {/* ✅ ENHANCED Action Buttons */}
                      <div className="profile-form-actions">
                        <button
                          className="btn btn-outline-primary"
                          disabled={isLoading || !userProfile.fullName?.trim()}
                          type="submit"
                        >
                          {isLoading ? (
                            <>
                              <div className="spinner" /> Saving Profile…
                            </>
                          ) : (
                            <>
                              <IoSave /> {currentUser ? 'Update My Profile' : 'Create My Profile'}
                            </>
                          )}
                        </button>
                        {isEditingProfile && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={cancelProfileEdit}
                          >
                            <IoClose /> Cancel Changes
                          </button>
                        )}
                      </div>
                    </Form>
                  ) : (
                    /* ===== ✅ ENHANCED PROFILE VIEW MODE ===== */
                    <div className="profile-view-mode">
                      <div className="profile-card">
                        <div className="profile-header">
                          <SafeAvatar
                            name={currentUser.fullName}
                            className="profile-avatar"
                            fallback={AppConfig.defaults.profileAvatarFallback}
                          />
                          <div className="profile-info">
                            <h2>{currentUser.fullName}</h2>
                            <p className="profile-role">{currentUser.currentRole || AppConfig.defaults.userRole}</p>
                            <p className="profile-experience">{currentUser.experienceYears} Experience</p>
                            <p className="profile-location">📍 {currentUser.location}</p>
                          </div>
                          <div className="profile-status-badge">
                            <MdVerifiedUser /> Profile Active
                          </div>
                        </div>

                        <div className="profile-details">
                          <div className="detail-row">
                            <strong>📧 Email:</strong>
                            <span style={{ marginLeft: '-30px' }}>{currentUser.email}</span>
                          </div>
                          <div className="detail-row">
                            <strong>📱 Phone:</strong>
                            <span className="row-phone">{currentUser.phone}</span>
                          </div>
                          <div className="detail-row">
                            <strong>🏢 Available:</strong>
                            <span>{currentUser.availability}</span>
                          </div>
                          {currentUser.linkedin && (
                            <div className="detail-row">
                              <strong>💼 LinkedIn:</strong>
                              <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer">
                                View Profile →
                              </a>
                            </div>
                          )}
                          {currentUser.github && (
                            <div className="detail-row">
                              <strong>💻 GitHub:</strong>
                              <a href={currentUser.github} target="_blank" rel="noopener noreferrer">
                                View Profile →
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="profile-skills">
                          <strong>🛠️ Technical Skills ({(currentUser.skills || []).length}):</strong>
                          <div className="skills-display">
                            {(currentUser.skills || []).map(skill => (
                              <span key={skill} className="skill-tag-display">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {resume && (
                          <div className="resume-status">
                            <IoDocumentAttach /> Resume: {resumePreview}
                            <span className="resume-ready">✓ Ready to Send</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ===== HR FORM - Enhanced with config-based dropdowns ===== */
              <>
                <div className="section-header">
                  <div className="header-icon">
                    <IoPersonAdd />
                  </div>
                  <div className="header-text">
                    <h3>Add HR Contact</h3>
                    <p>
                      Save to database •
                      {currentUser ? (
                        <span className="sender-info"> Sender: {currentUser.fullName}</span>
                      ) : (
                        <span className="no-sender"> No active profile</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="section-content">
                  {!currentUser && (
                    <div className="alert-notice profile-required">
                      <div className="alert-content">
                        <IoPersonCircle className="alert-icon" />
                        <div className="alert-text">
                          <strong>Complete Your Profile First!</strong>
                          <p>Please create your profile in "My Profile" tab before adding HR contacts.</p>
                        </div>
                        <button
                          className="alert-btn"
                          onClick={() => setActiveTab('user')}
                        >
                          Create Profile →
                        </button>
                      </div>
                    </div>
                  )}

                  {!resume && currentUser && (
                    <div className="alert-notice resume-required">
                      <div className="alert-content">
                        <IoDocumentAttach className="alert-icon" />
                        <div className="alert-text">
                          <strong>Upload Resume First!</strong>
                          <p>Please upload your resume in "My Profile" tab before adding HR contacts.</p>
                        </div>
                        <button
                          className="alert-btn"
                          onClick={() => setActiveTab('user')}
                        >
                          Upload Resume →
                        </button>
                      </div>
                    </div>
                  )}

                  <Form onSubmit={handleSubmit} className="responsive-form">
                    <div className="form-fields-container">
                      <div className="form-row-top">
                        <div className="input-wrapper">
                          <label className="input-label required">
                            <i className="bi bi-person" /> HR Name *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            name="hrName"
                            value={formData.hrName}
                            onChange={handleInputChange}
                            required
                            disabled={!currentUser}
                            placeholder="Enter HR/Recruiter name"
                          />
                        </div>
                        <div className="input-wrapper">
                          <label className="input-label required">
                            <i className="bi bi-envelope" /> HR Email *
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={!currentUser}
                            placeholder="hr@company.com"
                          />
                        </div>
                        <div className="input-wrapper">
                          <label className="input-label required">
                            <i className="bi bi-building" /> Company *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                            disabled={!currentUser}
                            placeholder="Company name"
                          />
                        </div>
                      </div>

                      <div className="form-row-bottom">
                        <div className="input-wrapper position-field">
                          <label className="input-label required">
                            <i className="bi bi-briefcase" /> Job Position *
                          </label>
                          <select
                            className="form-input"
                            name="jobPosition"
                            value={formData.jobPosition}
                            onChange={handleInputChange}
                            required
                            disabled={!currentUser}
                          >
                            {AppConfig.jobPositions.map(position => (
                              <option key={position.value} value={position.value}>
                                {position.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="input-wrapper skills-field">
                          <label className="input-label required">
                            <i className="bi bi-gear" /> Required Skills *
                            <small className="skill-count">({formData.requiredSkills?.length || 0} selected)</small>
                          </label>
                          <div
                            className="multiselect-container"
                            onBlur={() => setIsSkillsOpen(false)}
                          >
                            <div
                              className={`multiselect-input-wrapper ${!currentUser ? 'disabled' : ''}`}
                              onClick={() => currentUser && setIsSkillsOpen(true)}
                            >
                              {formData.requiredSkills.map(skill => (
                                <span key={skill} className="skill-chip">
                                  {skill}
                                  <button
                                    type="button"
                                    className="remove-skill-btn"
                                    onClick={() => removeSkill(skill)}
                                    disabled={!currentUser}
                                    title={`Remove ${skill}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className="multiselect-input"
                                placeholder={
                                  !currentUser
                                    ? 'Complete profile first...'
                                    : formData.requiredSkills.length
                                      ? 'Add more skills…'
                                      : 'Type to search required skills…'
                                }
                                value={skillSearchTerm}
                                onChange={e => {
                                  setSkillSearchTerm(e.target.value);
                                  setIsSkillsOpen(true);
                                }}
                                onKeyDown={handleSkillsInputKeyDown}
                                onFocus={() => setIsSkillsOpen(true)}
                                disabled={!currentUser}
                              />
                            </div>
                            {isSkillsOpen && filteredSkills.length > 0 && currentUser && (
                              <div className="skills-inline-options">
                                {filteredSkills.slice(0, 8).map(skill => (
                                  <button
                                    key={skill}
                                    type="button"
                                    className="skill-option-btn"
                                    onMouseDown={() => addSkill(skill)}
                                    title={`Add ${skill}`}
                                  >
                                    + {skill}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <small className="field-help">
                            Add skills that this job position requires. Minimum 1 skill required.
                          </small>
                        </div>
                      </div>
                    </div>

                    <button
                      className="primary-btn"
                      disabled={isLoading || !currentUser || !formData.requiredSkills.length}
                      type="submit"
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner" /> Saving Contact…
                        </>
                      ) : (
                        <>
                          <IoPersonAdd /> Save HR Contact
                        </>
                      )}
                    </button>
                  </Form>
                </div>
              </>
            )}
          </section>

          {/* Contact List Section - Enhanced with real user info and Clone functionality */}
          <section className="contacts-section">
            <div className="section-header">
              <div className="header-left">
                <div className="header-icon">
                  <IoIosContacts />
                </div>
                <div className="header-text">
                  <h3>My HR Network ({hrContacts.length})</h3>
                  <p>
                    Ready for email automation
                    {currentUser && <span> • Managed by: {currentUser.fullName}</span>}
                  </p>
                </div>
              </div>

              {hrContacts.length > 0 && (
                <button
                  className="secondary-btn"
                  onClick={handleBulkSend}
                  disabled={!resume || !currentUser || isBulkSending}
                  title={
                    !currentUser
                      ? 'Complete profile first'
                      : !resume
                        ? 'Upload resume in My Profile first'
                        : `Send resume from ${currentUser.fullName} to all ${hrContacts.length} HRs`
                  }
                >
                  {isBulkSending ? (
                    <>
                      <div className="spinner" /> Sending to {hrContacts.length} HRs...
                    </>
                  ) : (
                    <>
                      <IoSend /> Send to All ({hrContacts.length})
                      {resume && <IoDocumentAttach className="resume-indicator" />}
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="section-content">
              {hrContacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-inbox" />
                  </div>
                  <h4>No HR contacts yet</h4>
                  <p>Add your first HR contact to start your job application journey!</p>
                  {!currentUser && (
                    <small className="empty-help">Complete your profile first to add contacts</small>
                  )}
                </div>
              ) : (
                <div className="contacts-container">
                  {hrContacts.map(contact => (
                    <div key={contact.id} className="contact-item">
                      {editingId === contact.id ? (
                        /* ===== ✅ ENHANCED EDIT MODE WITH PROPER FORM ===== */
                        <div className="edit-mode">
                          <div className="edit-header">
                            <h4>✏️ Editing HR Contact</h4>
                            <div className="edit-actions">
                              <button
                                className="save-btn"
                                onClick={saveEdit}
                                title="Save changes"
                                disabled={!editFormData.hrName?.trim() || !editFormData.email?.trim() || !editFormData.companyName?.trim() || !editFormData.jobPosition?.trim() || !editFormData.requiredSkills?.length}
                              >
                                <IoSave />
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={cancelEditing}
                                title="Cancel editing"
                              >
                                <IoClose />
                              </button>
                            </div>
                          </div>

                          {/* ✅ PROPER EDIT FORM */}
                          <div className="edit-form-container">
                            <div className="edit-form-row">
                              <div className="edit-input-wrapper">
                                <label className="edit-label">HR Name *</label>
                                <input
                                  type="text"
                                  className="edit-input"
                                  name="hrName"
                                  value={editFormData.hrName || ''}
                                  onChange={handleEditInputChange}
                                  placeholder="Enter HR name"
                                  required
                                />
                              </div>
                              <div className="edit-input-wrapper">
                                <label className="edit-label">HR Email *</label>
                                <input
                                  type="email"
                                  className="edit-input"
                                  name="email"
                                  value={editFormData.email || ''}
                                  onChange={handleEditInputChange}
                                  placeholder="hr@company.com"
                                  required
                                />
                              </div>
                            </div>

                            <div className="edit-form-row">
                              <div className="edit-input-wrapper">
                                <label className="edit-label">Company *</label>
                                <input
                                  type="text"
                                  className="edit-input"
                                  name="companyName"
                                  value={editFormData.companyName || ''}
                                  onChange={handleEditInputChange}
                                  placeholder="Company name"
                                  required
                                />
                              </div>
                              <div className="edit-input-wrapper">
                                <label className="edit-label">Job Position *</label>
                                <select
                                  className="edit-input"
                                  name="jobPosition"
                                  value={editFormData.jobPosition || ''}
                                  onChange={handleEditInputChange}
                                  required
                                >
                                  {AppConfig.jobPositions.map(position => (
                                    <option key={position.value} value={position.value}>
                                      {position.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* ✅ EDIT SKILLS SECTION */}
                            <div className="edit-skills-wrapper">
                              <label className="edit-label">Required Skills * ({editFormData.requiredSkills?.length || 0})</label>
                              <div
                                className="edit-multiselect-container"
                                onBlur={() => setIsEditSkillsOpen(false)}
                              >
                                <div
                                  className="edit-multiselect-input-wrapper"
                                  onClick={() => setIsEditSkillsOpen(true)}
                                >
                                  {(editFormData.requiredSkills || []).map(skill => (
                                    <span key={skill} className="edit-skill-chip">
                                      {skill}
                                      <button
                                        type="button"
                                        className="edit-remove-skill-btn"
                                        onClick={() => removeEditSkill(skill)}
                                        title={`Remove ${skill}`}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    className="edit-multiselect-input"
                                    placeholder="Add skills..."
                                    value={editSkillSearchTerm}
                                    onChange={e => {
                                      setEditSkillSearchTerm(e.target.value);
                                      setIsEditSkillsOpen(true);
                                    }}
                                    onKeyDown={handleEditSkillsKeyDown}
                                    onFocus={() => setIsEditSkillsOpen(true)}
                                  />
                                </div>
                                {isEditSkillsOpen && filteredEditSkills.length > 0 && (
                                  <div className="edit-skills-options">
                                    {filteredEditSkills.slice(0, AppConfig.ui.editSkillsDropdownLimit).map(skill => (
                                      <button
                                        key={skill}
                                        type="button"
                                        className="edit-skill-option-btn"
                                        onMouseDown={() => addEditSkill(skill)}
                                        title={`Add ${skill}`}
                                      >
                                        + {skill}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ===== ✅ ENHANCED VIEW MODE WITH CLONE BUTTON ===== */
                        <>
                          <div className="contact-header">
                            <SafeAvatar
                              name={contact.hr_name}
                              className="contact-avatar"
                              fallback={AppConfig.defaults.contactAvatarFallback}
                            />
                            <div className="contact-details">
                              <h4>{contact.hr_name}</h4>
                              <p className="company-name">{contact.company_name}</p>
                              <small className="job-position">{contact.job_position}</small>
                            </div>
                            <div className="contact-actions">
                              <button
                                className="send-individual-btn"
                                onClick={() => sendToIndividual(contact)}
                                disabled={!resume || !currentUser || sendingContactId === contact.id}
                                title={
                                  !currentUser
                                    ? 'Complete profile first'
                                    : !resume
                                      ? 'Upload resume first'
                                      : `Send resume from ${currentUser.fullName} to ${contact.hr_name}`
                                }
                              >
                                {sendingContactId === contact.id ? (
                                  <div className="spinner-small" />
                                ) : (
                                  <IoSend />
                                )}
                              </button>
                              {/* ✅ NEW: CLONE BUTTON */}
                              <button
                                className="clone-button"
                                onClick={() => startCloning(contact)}
                                title={`Clone contact: ${contact.hr_name}`}
                              >
                                <IoCopy />
                              </button>
                              <button
                                className="edit-button"
                                onClick={() => startEditing(contact)}
                                title="Edit contact details"
                              >
                                <IoPencil />
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => confirmDelete(contact)}
                                title="Delete contact"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </div>
                          <div className="contact-info">
                            <div className="info-item">
                              <i className="bi bi-envelope" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                          <div className="contact-skills">
                            {(contact.required_skills || []).map(skill => (
                              <span key={skill} className="skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ----------  ✅ ENHANCED FOOTER WITH REAL DATA  ---------- */}
      <footer className="app-footer">
        <div className="stats-container-clean">
          <div className="stat-box">
            <span className="stat-number">{hrContacts.length}</span>
            <span className="stat-text">HR Contacts</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{sentCount}</span>
            <span className="stat-text">Emails Sent</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{resume ? '✓' : '✗'}</span>
            <span className="stat-text">Resume</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{currentUser ? '✓' : '✗'}</span>
            <span className="stat-text">Profile</span>
          </div>
        </div>
        {currentUser && (
          <div className="footer-user-info">
            <small>
              🎯 Active Session: {currentUser.fullName} • {currentUser.email} •
              {currentUser.experienceYears} Experience •
              {(currentUser.skills || []).length} Skills
            </small>
          </div>
        )}
      </footer>

      {/* ----------  ✅ NEW: CLONE MODAL  ---------- */}
      <Modal show={showCloneModal} onHide={cancelCloning} size="lg" centered>
        <Modal.Header closeButton className="modal-header-enhanced">
          <Modal.Title>
            <IoCopy /> Clone HR Contact
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="clone-modal-content">
            {contactToClone && (
              <div className="clone-source-info">
                <strong>📋 Cloning from:</strong>
                <div className="source-contact-preview">
                  <SafeAvatar name={contactToClone.hr_name} className="source-avatar" />
                  <div className="source-details">
                    <span className="source-name">{contactToClone.hr_name}</span>
                    <span className="source-company">{contactToClone.company_name}</span>
                    <span className="source-position">{contactToClone.job_position}</span>
                  </div>
                </div>
              </div>
            )}

            <Form onSubmit={handleCloneSubmit} className="clone-form">
              <div className="clone-form-fields">
                <div className="clone-form-row">
                  <div className="clone-input-wrapper">
                    <label className="clone-label required">
                      <i className="bi bi-person" /> HR Name *
                    </label>
                    <input
                      type="text"
                      className="clone-input"
                      name="hrName"
                      value={cloneFormData.hrName}
                      onChange={handleCloneInputChange}
                      placeholder="Enter new HR name"
                      required
                    />
                  </div>
                  <div className="clone-input-wrapper">
                    <label className="clone-label required">
                      <i className="bi bi-envelope" /> HR Email *
                    </label>
                    <input
                      type="email"
                      className="clone-input"
                      name="email"
                      value={cloneFormData.email}
                      onChange={handleCloneInputChange}
                      placeholder="Enter new HR email"
                      required
                    />
                  </div>
                </div>

                <div className="clone-form-row">
                  <div className="clone-input-wrapper">
                    <label className="clone-label required">
                      <i className="bi bi-building" /> Company *
                    </label>
                    <input
                      type="text"
                      className="clone-input"
                      name="companyName"
                      value={cloneFormData.companyName}
                      onChange={handleCloneInputChange}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div className="clone-input-wrapper">
                    <label className="clone-label required">
                      <i className="bi bi-briefcase" /> Job Position *
                    </label>
                    <select
                      className="clone-input"
                      name="jobPosition"
                      value={cloneFormData.jobPosition}
                      onChange={handleCloneInputChange}
                      required
                    >
                      {AppConfig.jobPositions.map(position => (
                        <option key={position.value} value={position.value}>
                          {position.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ✅ CLONE SKILLS SECTION */}
                <div className="clone-skills-wrapper">
                  <label className="clone-label required">
                    <i className="bi bi-gear" /> Required Skills *
                    <small className="clone-skill-count">({cloneFormData.requiredSkills?.length || 0} selected)</small>
                  </label>
                  <div
                    className="clone-multiselect-container"
                    onBlur={() => setIsCloneSkillsOpen(false)}
                  >
                    <div
                      className="clone-multiselect-input-wrapper"
                      onClick={() => setIsCloneSkillsOpen(true)}
                    >
                      {(cloneFormData.requiredSkills || []).map(skill => (
                        <span key={skill} className="clone-skill-chip">
                          {skill}
                          <button
                            type="button"
                            className="clone-remove-skill-btn"
                            onClick={() => removeCloneSkill(skill)}
                            title={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="clone-multiselect-input"
                        placeholder={
                          (cloneFormData.requiredSkills || []).length
                            ? 'Add more skills…'
                            : 'Type to search skills…'
                        }
                        value={cloneSkillSearchTerm}
                        onChange={e => {
                          setCloneSkillSearchTerm(e.target.value);
                          setIsCloneSkillsOpen(true);
                        }}
                        onKeyDown={handleCloneSkillsKeyDown}
                        onFocus={() => setIsCloneSkillsOpen(true)}
                      />
                    </div>
                    {isCloneSkillsOpen && filteredCloneSkills.length > 0 && (
                      <div className="clone-skills-options">
                        {filteredCloneSkills.slice(0, AppConfig.ui.cloneSkillsDropdownLimit).map(skill => (
                          <button
                            key={skill}
                            type="button"
                            className="clone-skill-option-btn"
                            onMouseDown={() => addCloneSkill(skill)}
                            title={`Add ${skill}`}
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <small className="clone-field-help">
                    Skills are pre-filled from the original contact. You can modify them as needed.
                  </small>
                </div>
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelCloning} disabled={isCloning}>
            <IoClose /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCloneSubmit}
            disabled={isCloning || !cloneFormData.hrName?.trim() || !cloneFormData.email?.trim() || !cloneFormData.companyName?.trim() || !cloneFormData.jobPosition?.trim() || !cloneFormData.requiredSkills?.length}
          >
            {isCloning ? (
              <>
                <div className="spinner" /> Cloning Contact...
              </>
            ) : (
              <>
                <IoCopy /> Create Cloned Contact
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------  ✅ ENHANCED USER DETAILS MODAL  ---------- */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg" centered>
        <Modal.Header closeButton className="modal-header-enhanced">
          <Modal.Title>
            <IoPersonCircle /> Complete Profile Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser ? (
            <div className="user-details-modal">
              <div className="user-details-header">
                <SafeAvatar
                  name={currentUser.fullName}
                  className="user-details-avatar"
                  fallback={AppConfig.defaults.avatarFallback}
                />
                <div className="user-details-info">
                  <h3>{currentUser.fullName}</h3>
                  <p className="user-role">{currentUser.currentRole || AppConfig.defaults.userRole}</p>
                  <p className="user-experience">{currentUser.experienceYears} Experience</p>
                  <p className="user-location">📍 {currentUser.location}</p>
                </div>
              </div>

              <div className="user-details-grid">
                <div className="detail-item">
                  <strong>📧 Email Address:</strong>
                  <span>{currentUser.email}</span>
                </div>
                <div className="detail-item">
                  <strong>📱 Phone Number:</strong>
                  <span>{currentUser.phone}</span>
                </div>
                <div className="detail-item">
                  <strong>🏢 Job Availability:</strong>
                  <span>{currentUser.availability}</span>
                </div>
                <div className="detail-item">
                  <strong>💼 Current Position:</strong>
                  <span>{currentUser.currentRole || 'Not specified'}</span>
                </div>
                {currentUser.linkedin && (
                  <div className="detail-item">
                    <strong>💼 LinkedIn Profile:</strong>
                    <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer">
                      Open LinkedIn Profile →
                    </a>
                  </div>
                )}
                {currentUser.github && (
                  <div className="detail-item">
                    <strong>💻 GitHub Profile:</strong>
                    <a href={currentUser.github} target="_blank" rel="noopener noreferrer">
                      Open GitHub Profile →
                    </a>
                  </div>
                )}
              </div>

              <div className="user-skills-modal">
                <strong>🛠️ Technical Skills ({(currentUser.skills || []).length} total):</strong>
                <div className="skills-grid">
                  {(currentUser.skills || []).map(skill => (
                    <span key={skill} className="skill-tag-modal">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {resume && (
                <div className="resume-info-modal">
                  <strong>📎 Uploaded Resume:</strong>
                  <div className="resume-details-modal">
                    <IoDocumentAttach />
                    <span>{resumePreview}</span>
                    <span className="resume-status-modal">✓ Ready for sending</span>
                  </div>
                </div>
              )}

              <div className="profile-summary">
                <strong>📊 Profile Summary:</strong>
                <ul>
                  <li>✅ Profile Created</li>
                  <li>{resume ? '✅' : '❌'} Resume Uploaded</li>
                  <li>✅ {(currentUser.skills || []).length} Skills Added</li>
                  <li>✅ Contact Information Complete</li>
                  <li>{currentUser.linkedin ? '✅' : '➖'} LinkedIn Profile {currentUser.linkedin ? 'Added' : 'Not Added'}</li>
                  <li>{currentUser.github ? '✅' : '➖'} GitHub Profile {currentUser.github ? 'Added' : 'Not Added'}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-user-modal">
              <IoPersonCircle size={60} />
              <h4>No Profile Found</h4>
              <p>Please create your profile first to view details.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
          {currentUser && (
            <Button variant="primary" onClick={handleEditProfile}>
              <IoPencil /> Edit Profile
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ----------  DELETE USER CONFIRMATION MODAL  ---------- */}
      <Modal show={showDeleteUserModal} onHide={() => setShowDeleteUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">⚠️ Delete Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <div>
              <p><strong>Are you sure you want to permanently delete your profile?</strong></p>
              <div className="delete-warning">
                <strong>🚨 This action will permanently delete:</strong>
                <ul>
                  <li>👤 Your profile: <strong>{currentUser.fullName}</strong></li>
                  <li>📧 Email: <strong>{currentUser.email}</strong></li>
                  <li>📱 Phone: <strong>{currentUser.phone}</strong></li>
                  <li>🛠️ All your skills ({(currentUser.skills || []).length} skills)</li>
                  <li>📎 Your uploaded resume</li>
                  <li>🔗 LinkedIn and GitHub links</li>
                </ul>
                <div className="danger-notice">
                  <strong>⚠️ THIS ACTION CANNOT BE UNDONE!</strong>
                  <p>You will need to recreate your entire profile from scratch.</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteUserModal(false)}>
            Cancel - Keep Profile
          </Button>
          <Button variant="danger" onClick={handleDeleteProfile}>
            <MdDelete /> Yes, Delete Everything
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------  DELETE CONTACT CONFIRMATION MODAL  ---------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Contact Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactToDelete && (
            <div>
              <p>Are you sure you want to delete this HR contact?</p>
              <div className="contact-delete-info">
                <strong>Contact Details:</strong>
                <ul>
                  <li>👤 HR Name: <strong>{contactToDelete.hr_name}</strong></li>
                  <li>🏢 Company: <strong>{contactToDelete.company_name}</strong></li>
                  <li>📧 Email: <strong>{contactToDelete.email}</strong></li>
                  <li>💼 Position: <strong>{contactToDelete.job_position}</strong></li>
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteContact}>
            <MdDelete /> Delete Contact
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------  ✅ ENHANCED REACT-TOASTIFY CONTAINER  ---------- */}
      <ToastContainer
        position="top-right"
        autoClose={AppConfig.ui.toastAutoCloseTime}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif'
        }}
        toastStyle={{
          borderRadius: '12px',
          fontWeight: '500'
        }}
      />
    </div>
  );
}

export default Dashboard;
