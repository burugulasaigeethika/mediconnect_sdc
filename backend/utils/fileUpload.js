const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const ensureDirectoryExists = (dirPath) => {
    console.log('ensureDirectoryExists called with dirPath:', dirPath);
    if (!fs.existsSync(dirPath)) {
        console.log('Creating directory:', dirPath);
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configure storage for different file types
const configureStorage = (destination, fileNamePrefix) => {
    console.log('configureStorage called with destination:', destination, 'fileNamePrefix:', fileNamePrefix);
    return multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('Multer destination callback called with file:', file);
            ensureDirectoryExists(destination);
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            console.log('Multer filename callback called with file:', file);
            const uniqueId = uuidv4();
            const extension = path.extname(file.originalname);
            const filename = `${fileNamePrefix}-${uniqueId}${extension}`;
            console.log('Generated filename:', filename);
            cb(null, filename);
        }
    });
};

// File filter for prescription files
const prescriptionFileFilter = (req, file, cb) => {
    console.log('prescriptionFileFilter called with file:', file);
    // Allowed mime types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf'
    ];

    // Check if file type is allowed
    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('File type is allowed');
        cb(null, true);
    } else {
        console.log('File type is not allowed');
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and PDF files are allowed.'), false);
    }
};

// File filter for profile pictures
const profilePictureFilter = (req, file, cb) => {
    console.log('profilePictureFilter called with file:', file);
    // Allowed mime types for profile pictures
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];

    // Check if file type is allowed
    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('Profile picture file type is allowed');
        cb(null, true);
    } else {
        console.log('Profile picture file type is not allowed');
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed for profile pictures.'), false);
    }
};

// Create uploaders
const createUploader = (destination, fileNamePrefix, fileFilter, sizeLimit = 5 * 1024 * 1024) => {
    console.log('createUploader called with destination:', destination, 'fileNamePrefix:', fileNamePrefix, 'sizeLimit:', sizeLimit);
    return multer({
        storage: configureStorage(destination, fileNamePrefix),
        fileFilter: fileFilter,
        limits: {
            fileSize: sizeLimit // Default 5MB
        }
    });
};

// Export uploaders
const prescriptionUploader = createUploader(
    path.join(__dirname, '../uploads/prescriptions'),
    'prescription',
    prescriptionFileFilter
);

const profilePictureUploader = createUploader(
    path.join(__dirname, '../uploads/profile-pictures'),
    'profile',
    profilePictureFilter,
    2 * 1024 * 1024 // 2MB limit for profile pictures
);

const doctorPrescriptionUploader = createUploader(
    path.join(__dirname, '../uploads/doctor-prescriptions'),
    'doctor-prescription',
    prescriptionFileFilter,
    5 * 1024 * 1024 // 5MB limit for doctor prescriptions
);

module.exports = {
    prescriptionUploader: prescriptionUploader.single('prescriptionFile'),
    profilePictureUploader: profilePictureUploader.single('profilePicture'),
    doctorPrescriptionUploader: doctorPrescriptionUploader.single('prescription'),
    prescriptionFileFilter,
    profilePictureFilter
};