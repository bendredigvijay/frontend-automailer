import React, { useState, useEffect } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import {
  IoSend,
  IoPersonAdd,
  IoDocumentAttach,
  IoCloudUpload,
  IoPencil,
  IoSave,
  IoClose
} from 'react-icons/io5';
import { MdEmail, MdDelete } from 'react-icons/md';
import { contactService, emailService } from '../../apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';

function Dashboard() {
  const [formData, setFormData] = useState({
    hrName: '',
    email: '',
    companyName: '',
    jobPosition: '',
    requiredSkills: []
  });

  const [hrContacts, setHrContacts] = useState([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumePreview, setResumePreview] = useState('');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
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

  /* ------------  PRE-DEFINED SKILLS  ------------ */
  const predefinedSkills = [
    'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js',
    'Python', 'Django', 'Flask', 'PostgreSQL', 'MySQL',
    'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular',
    'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#',
    'ASP.NET', 'Ruby', 'Rails', 'Go', 'Rust',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'GraphQL', 'REST API', 'Git', 'Jenkins', 'Redis',
    'Bootstrap', 'Sass', 'Tailwind CSS', 'Material UI',
    'Next.js', 'Nuxt.js', 'Redux', 'Vuex', 'Firebase'
  ];

  const filteredSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !formData.requiredSkills.includes(s)
  );

  const filteredEditSkills = predefinedSkills.filter(
    s =>
      s.toLowerCase().includes(editSkillSearchTerm.toLowerCase()) &&
      !editFormData.requiredSkills?.includes(s)
  );

  /* ------------  LOAD CONTACTS ON COMPONENT MOUNT  ------------ */
  useEffect(() => {
    loadContactsFromDatabase();
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

  /* ------------  GENERAL INPUTS  ------------ */
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ------------  SKILLS MULTISELECT  ------------ */
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

  /* ------------  EDIT FUNCTIONALITY  ------------ */
  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditFormData({
      hrName: contact.hr_name,
      email: contact.email,
      companyName: contact.company_name,
      jobPosition: contact.job_position,
      requiredSkills: [...contact.required_skills] || []
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
    setEditSkillSearchTerm('');
    setIsEditSkillsOpen(false);
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
    try {
      const response = await contactService.updateContact(editingId, editFormData);
      if (response.success) {
        // Update local state instead of reloading
        setHrContacts(prev =>
          prev.map(contact =>
            contact.id === editingId ? response.data : contact
          )
        );

        cancelEditing();
        toast.success(`✅ Contact updated successfully!`);
      } else {
        toast.error(`Failed to update contact: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact. Please try again.');
    }
  };

  /* ------------  RESUME UPLOAD  ------------ */
  const handleResumeUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload PDF, DOC or DOCX only');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    setResume(file);
    setResumePreview(file.name);
    toast.success(`📎 Resume uploaded: ${file.name}`);
  };

  const removeResume = () => {
    setResume(null);
    setResumePreview('');
    document.getElementById('resume-upload').value = '';
    toast.info('📎 Resume removed');
  };

  /* ------------  FORM SUBMIT - SAVE TO DATABASE  ------------ */
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

        // Add to local state instead of reloading
        setHrContacts(prev => [response.data, ...prev]);

        // Clear form
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

  /* ------------  DELETE CONTACT FROM DATABASE  ------------ */
  const confirmDelete = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const deleteContact = async () => {
    try {
      const response = await contactService.deleteContact(contactToDelete.id);
      if (response.success) {
        console.log('🗑️ CONTACT DELETED:', contactToDelete.id);

        // Remove from local state instead of reloading
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

  /* ------------  INDIVIDUAL SEND EMAIL  ------------ */
  const sendToIndividual = async (contact) => {
    if (!resume) {
      toast.error('Please upload resume first! 📎');
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

      console.log('📤 INDIVIDUAL SEND:', contactData[0]);

      const response = await emailService.sendBulkEmails(contactData, resume);

      if (response.success) {
        setSentCount(prev => prev + 1);
        toast.success(`✅ Resume sent to ${contact.hr_name} at ${contact.company_name}!`, {
          position: "top-right",
          autoClose: 5000,
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

  /* ------------  BULK SEND - SAME RESUME TO ALL HRs  ------------ */
  const handleBulkSend = async () => {
    if (!resume) {
      toast.error('Please upload resume first! 📎');
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

      console.log('📤 BULK SEND INITIATED:', {
        totalContacts: allContactsData.length,
        resumeFile: resume.name,
        resumeSize: (resume.size / 1024 / 1024).toFixed(2) + ' MB',
        contacts: allContactsData
      });

      const response = await emailService.sendBulkEmails(allContactsData, resume);

      if (response.success) {
        const successCount = response.data?.successCount || allContactsData.length;
        setSentCount(prev => prev + successCount);

        toast.success(
          `🎉 Resume sent successfully to ${successCount} HRs! 
           File: ${resume.name} (${(resume.size / 1024 / 1024).toFixed(2)}MB)`,
          {
            position: "top-right",
            autoClose: 6000,
            style: {
              fontSize: '14px'
            }
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

  return (
    <div className="fullscreen-app">
      {/* ----------  HEADER  ---------- */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <MdEmail />
          </div>
          <div className="brand-info">
            <h1 className="app-title">AUTO MAILER</h1>
            <p className="app-subtitle">Professional HR Email Automation</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge primary">✨ Templates</div>
          <div className="stat-badge secondary">⚡ Bulk Send</div>
          <div className="stat-badge success">📊 Analytics</div>
        </div>
      </header>

      {/* ----------  MAIN  ---------- */}
      <main className="app-main">
        <div className="main-container">
          {/* =======  LEFT – FORM  ======= */}
          <section className="form-section">
            <div className="section-header">
              <div className="header-icon">
                <IoPersonAdd />
              </div>
              <div className="header-text">
                <h3>Add HR Contact</h3>
                <p>Save to database</p>
              </div>
            </div>

            <div className="section-content">
              <Form onSubmit={handleSubmit} className="responsive-form">
                {/* -----  RESUME SECTION  ----- */}
                <div className="resume-section">
                  <h4 className="resume-title">
                    <IoDocumentAttach /> Upload Resume (Will be sent to all HRs)
                  </h4>

                  <div className="resume-upload-container">
                    {!resumePreview ? (
                      <label htmlFor="resume-upload" className="resume-upload-area">
                        <div className="upload-content">
                          <IoCloudUpload className="upload-icon" />
                          <span className="upload-text">Click to upload</span>
                          <small className="upload-hint">
                            PDF, DOC, DOCX (max 5 MB)
                          </small>
                        </div>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
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
                              {(resume.size / 1024 / 1024).toFixed(2)} MB
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

                {/* -----  INPUT FIELDS  ----- */}
                <div className="form-fields-container">
                  <div className="form-row-top">
                    {/* HR Name */}
                    <div className="input-wrapper">
                      <label className="input-label">
                        <i className="bi bi-person" /> HR Name *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        name="hrName"
                        value={formData.hrName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter HR name"
                      />
                    </div>

                    {/* Email */}
                    <div className="input-wrapper">
                      <label className="input-label">
                        <i className="bi bi-envelope" /> Email *
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="hr@company.com"
                      />
                    </div>

                    {/* Company */}
                    <div className="input-wrapper">
                      <label className="input-label">
                        <i className="bi bi-building" /> Company *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div className="form-row-bottom">
                    {/* Position */}
                    <div className="input-wrapper position-field">
                      <label className="input-label">
                        <i className="bi bi-briefcase" /> Position *
                      </label>
                      <select
                        className="form-input"
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select position</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="React Developer">React Developer</option>
                        <option value="Node.js Developer">Node.js Developer</option>
                      </select>
                    </div>

                    {/* Skills */}
                    <div className="input-wrapper skills-field">
                      <label className="input-label">
                        <i className="bi bi-gear" /> Skills *
                      </label>

                      <div
                        className="multiselect-container"
                        onBlur={() => setIsSkillsOpen(false)}
                      >
                        <div
                          className="multiselect-input-wrapper"
                          onClick={() => setIsSkillsOpen(true)}
                        >
                          {formData.requiredSkills.map(skill => (
                            <span key={skill} className="skill-chip">
                              {skill}
                              <button
                                type="button"
                                className="remove-skill-btn"
                                onClick={() => removeSkill(skill)}
                              >
                                ×
                              </button>
                            </span>
                          ))}

                          <input
                            type="text"
                            className="multiselect-input"
                            placeholder={
                              formData.requiredSkills.length
                                ? 'Add more…'
                                : 'Search & select skills…'
                            }
                            value={skillSearchTerm}
                            onChange={e => {
                              setSkillSearchTerm(e.target.value);
                              setIsSkillsOpen(true);
                            }}
                            onKeyDown={handleSkillsInputKeyDown}
                            onFocus={() => setIsSkillsOpen(true)}
                          />
                        </div>

                        {isSkillsOpen && filteredSkills.length > 0 && (
                          <div className="skills-inline-options">
                            {filteredSkills.slice(0, 6).map(skill => (
                              <button
                                key={skill}
                                type="button"
                                className="skill-option-btn"
                                onMouseDown={() => addSkill(skill)}
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

                <button className="primary-btn" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <div className="spinner" /> Saving to DB…
                    </>
                  ) : (
                    <>
                      <IoPersonAdd /> Save Contact
                    </>
                  )}
                </button>
              </Form>
            </div>
          </section>

          {/* =======  RIGHT – CONTACT LIST FROM DATABASE  ======= */}
          <section className="contacts-section">
            <div className="section-header">
              <div className="header-left">
                <div className="header-icon">
                  <i className="bi bi-people-fill" />
                </div>
                <div className="header-text">
                  <h3>My Network ({hrContacts.length})</h3>
                  <p>Ready for bulk email</p>
                </div>
              </div>

              {hrContacts.length > 0 && (
                <button
                  className="secondary-btn"
                  onClick={handleBulkSend}
                  disabled={!resume || isBulkSending}
                  title={!resume ? 'Upload resume first' : 'Send same resume to all HRs'}
                >
                  {isBulkSending ? (
                    <>
                      <div className="spinner" /> Sending to {hrContacts.length} HRs...
                    </>
                  ) : (
                    <>
                      <IoSend /> Send to All ({hrContacts.length})&nbsp;
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
                  <h4>No contacts in database</h4>
                  <p>Add your first HR contact!</p>
                </div>
              ) : (
                <div className="contacts-container">
                  {hrContacts.map(contact => (
                    <div key={contact.id} className="contact-item">
                      {editingId === contact.id ? (
                        /* ===== EDIT MODE ===== */
                        <div className="edit-mode">
                          <div className="edit-header">
                            <h4>✏️ Editing Contact</h4>
                            <div className="edit-actions">
                              <button
                                className="save-btn"
                                onClick={saveEdit}
                                title="Save changes"
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

                          <div className="edit-form">
                            <div className="edit-row">
                              <input
                                type="text"
                                className="edit-input"
                                name="hrName"
                                value={editFormData.hrName}
                                onChange={handleEditInputChange}
                                placeholder="HR Name"
                              />
                              <input
                                type="email"
                                className="edit-input"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                                placeholder="Email"
                              />
                            </div>
                            <div className="edit-row">
                              <input
                                type="text"
                                className="edit-input"
                                name="companyName"
                                value={editFormData.companyName}
                                onChange={handleEditInputChange}
                                placeholder="Company Name"
                              />
                              <select
                                className="edit-input"
                                name="jobPosition"
                                value={editFormData.jobPosition}
                                onChange={handleEditInputChange}
                              >
                                <option value="">Select position</option>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Full Stack Developer">Full Stack Developer</option>
                                <option value="Frontend Developer">Frontend Developer</option>
                                <option value="Backend Developer">Backend Developer</option>
                                <option value="React Developer">React Developer</option>
                                <option value="Node.js Developer">Node.js Developer</option>
                              </select>
                            </div>
                            <div className="edit-skills-section">
                              <div className="multiselect-container">
                                <div className="multiselect-input-wrapper">
                                  {editFormData.requiredSkills?.map(skill => (
                                    <span key={skill} className="skill-chip">
                                      {skill}
                                      <button
                                        type="button"
                                        className="remove-skill-btn"
                                        onClick={() => removeEditSkill(skill)}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    className="multiselect-input"
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
                                  <div className="skills-inline-options">
                                    {filteredEditSkills.slice(0, 6).map(skill => (
                                      <button
                                        key={skill}
                                        type="button"
                                        className="skill-option-btn"
                                        onMouseDown={() => addEditSkill(skill)}
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
                        /* ===== VIEW MODE ===== */
                        <>
                          <div className="contact-header">
                            <div className="contact-avatar">
                              {contact.hr_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="contact-details">
                              <h4>{contact.hr_name}</h4>
                              <p>{contact.company_name}</p>
                            </div>
                            <div className="contact-actions">
                              <button
                                className="send-individual-btn"
                                onClick={() => sendToIndividual(contact)}
                                disabled={!resume || sendingContactId === contact.id}
                                title={!resume ? 'Upload resume first' : 'Send resume to this HR'}
                              >
                                {sendingContactId === contact.id ? (
                                  <div className="spinner-small" />
                                ) : (
                                  <IoSend />
                                )}
                              </button>
                              <button
                                className="edit-button"
                                onClick={() => startEditing(contact)}
                                title="Edit contact"
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
                              <i className="bi bi-briefcase" />
                              <span>{contact.job_position}</span>
                            </div>
                            <div className="info-item">
                              <i className="bi bi-envelope" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                          <div className="contact-skills">
                            {contact.required_skills?.map(skill => (
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

      {/* ----------  FOOTER  ---------- */}
      <footer className="app-footer">
        <div className="stats-container-clean">
          <div className="stat-box">
            <span className="stat-number">{hrContacts.length}</span>
            <span className="stat-text">Contacts</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{sentCount}</span>
            <span className="stat-text">Sent</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{resume ? 1 : 0}</span>
            <span className="stat-text">Resume</span>
          </div>
        </div>
      </footer>

      {/* ----------  DELETE CONFIRMATION MODAL  ---------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactToDelete && (
            <p>
              Are you sure you want to delete <strong>{contactToDelete.hr_name}</strong> from{' '}
              <strong>{contactToDelete.company_name}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteContact}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------  REACT-TOASTIFY CONTAINER  ---------- */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          fontSize: '14px'
        }}
      />
    </div>
  );
}

export default Dashboard;
