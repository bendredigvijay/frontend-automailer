// src/config/appConfig.js
export const AppConfig = {
    // Skills Configuration
    predefinedSkills: [
        'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js',
        'Python', 'Django', 'Flask', 'PostgreSQL', 'MySQL',
        'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular',
        'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#',
        'ASP.NET', 'Ruby', 'Rails', 'Go', 'Rust',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'GraphQL', 'REST API', 'Git', 'Jenkins', 'Redis',
        'Bootstrap', 'Sass', 'Tailwind CSS', 'Material UI',
        'Next.js', 'Nuxt.js', 'Redux', 'Vuex', 'Firebase'
    ],

    // Experience Levels
    experienceLevels: [
        { value: '', label: 'Select experience level' },
        { value: 'Fresher', label: 'Fresher (0 years)' },
        { value: '0.5+ years', label: '0.5+ years' },
        { value: '1+ years', label: '1+ years' },
        { value: '2+ years', label: '2+ years' },
        { value: '3+ years', label: '3+ years' },
        { value: '4+ years', label: '4+ years' },
        { value: '5+ years', label: '5+ years' },
        { value: '6+ years', label: '6+ years' },
        { value: '7+ years', label: '7+ years' },
        { value: '8+ years', label: '8+ years' },
        { value: '9+ years', label: '9+ years' },
        { value: '10+ years', label: '10+ years' }
    ],

    // Availability Options
    availabilityOptions: [
        { value: '', label: 'Select availability' },
        { value: 'Immediate joining', label: 'Immediate Joining' },
        { value: '15 days notice', label: '15 days notice' },
        { value: '30 days notice', label: '30 days notice' },
        { value: '45 days notice', label: '45 days notice' },
        { value: '60 days notice', label: '60 days notice' },
        { value: '90 days notice', label: '90 days notice' }
    ],

    // Job Positions
    jobPositions: [
        { value: '', label: 'Select job position' },
        { value: 'Software Engineer', label: 'Software Engineer' },
        { value: 'Full Stack Developer', label: 'Full Stack Developer' },
        { value: 'Frontend Developer', label: 'Frontend Developer' },
        { value: 'Backend Developer', label: 'Backend Developer' },
        { value: 'React Developer', label: 'React Developer' },
        { value: 'Node.js Developer', label: 'Node.js Developer' },
        { value: 'Python Developer', label: 'Python Developer' },
        { value: 'Java Developer', label: 'Java Developer' },
        { value: 'DevOps Engineer', label: 'DevOps Engineer' },
        { value: 'Data Scientist', label: 'Data Scientist' }
    ],

    // File Upload Configuration
    fileUpload: {
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        maxSizeInMB: 5,
        acceptedExtensions: '.pdf,.doc,.docx'
    },

    // UI Configuration
    ui: {
        skillsDropdownLimit: 10,
        editSkillsDropdownLimit: 6,
        cloneSkillsDropdownLimit: 8,
        toastAutoCloseTime: 5000,
        successToastAutoCloseTime: 3000,
        longToastAutoCloseTime: 6000
    },

    // App Information
    app: {
        title: 'AUTO MAILER',
        subtitle: 'Professional HR Email Automation',
        version: '1.0.0'
    },

    // Default Values
    defaults: {
        userRole: 'Software Developer',
        avatarFallback: 'U',
        contactAvatarFallback: 'H',
        profileAvatarFallback: 'P'
    }
};
