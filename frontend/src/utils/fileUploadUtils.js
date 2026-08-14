/**
 * File Upload Utilities
 * Provides helper functions for file uploads with progress tracking
 */

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {Number} maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result
 */
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
    console.log('validateFile called with file:', file, 'allowedTypes:', allowedTypes, 'maxSize:', maxSize);
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        console.log('File type not allowed');
        return {
            isValid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        };
    }
    
    // Check file size
    if (file.size > maxSize) {
        console.log('File size exceeds limit');
        return {
            isValid: false,
            error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
        };
    }
    
    console.log('File validation passed');
    return {
        isValid: true,
        error: null
    };
};

export default {
    validateFile
};