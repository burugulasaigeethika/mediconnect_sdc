/**
 * Cloud Storage Service
 * This service provides abstraction for different cloud storage providers
 * Currently supports AWS S3 with fallback to local storage
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class CloudStorageService {
    constructor() {
        // Check if AWS credentials are configured
        this.isAWSEnabled = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
        console.log('CloudStorageService: AWS enabled:', this.isAWSEnabled);
        
        if (this.isAWSEnabled) {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION || 'us-east-1'
            });
            this.bucketName = process.env.AWS_S3_BUCKET_NAME;
        }
    }

    /**
     * Upload file to cloud storage
     * @param {Object} file - Multer file object
     * @param {String} folder - Folder path in cloud storage
     * @returns {Promise<Object>} - Uploaded file information
     */
    async uploadFile(file, folder = 'uploads') {
        console.log('CloudStorageService: uploadFile called with file:', file);
        console.log('CloudStorageService: folder:', folder);
        
        // If AWS is not configured, fallback to local storage
        if (!this.isAWSEnabled) {
            console.log('CloudStorageService: Using local storage fallback');
            return this.saveLocally(file, folder);
        }

        try {
            const fileContent = fs.readFileSync(file.path);
            
            const params = {
                Bucket: this.bucketName,
                Key: `${folder}/${file.filename}`,
                Body: fileContent,
                ContentType: file.mimetype
            };

            const data = await this.s3.upload(params).promise();
            
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
            
            return {
                url: data.Location,
                key: data.Key,
                bucket: data.Bucket
            };
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload file to cloud storage');
        }
    }

    /**
     * Save file locally (fallback method)
     * @param {Object} file - Multer file object
     * @param {String} folder - Folder path
     * @returns {Object} - File information
     */
    saveLocally(file, folder) {
        console.log('CloudStorageService: saveLocally called with file:', file);
        console.log('CloudStorageService: folder:', folder);
        
        const relativePath = `/uploads/${folder}/${file.filename}`;
        const absolutePath = path.join(__dirname, '..', 'uploads', folder, file.filename);
        
        console.log('CloudStorageService: relativePath:', relativePath);
        console.log('CloudStorageService: absolutePath:', absolutePath);
        
        return {
            url: relativePath,
            path: absolutePath,
            filename: file.filename
        };
    }

    /**
     * Delete file from cloud storage
     * @param {String} key - File key in cloud storage
     * @returns {Promise<Boolean>} - Success status
     */
    async deleteFile(key) {
        // If AWS is not configured, delete locally
        if (!this.isAWSEnabled) {
            return this.deleteLocally(key);
        }

        try {
            const params = {
                Bucket: this.bucketName,
                Key: key
            };

            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('Error deleting from S3:', error);
            return false;
        }
    }

    /**
     * Delete file locally
     * @param {String} filePath - File path
     * @returns {Boolean} - Success status
     */
    deleteLocally(filePath) {
        try {
            const absolutePath = path.join(__dirname, '..', filePath);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
            return true;
        } catch (error) {
            console.error('Error deleting local file:', error);
            return false;
        }
    }

    /**
     * Generate presigned URL for private files
     * @param {String} key - File key in cloud storage
     * @param {Number} expires - Expiration time in seconds (default: 1 hour)
     * @returns {Promise<String>} - Presigned URL
     */
    async generatePresignedUrl(key, expires = 3600) {
        // If AWS is not configured, return local path
        if (!this.isAWSEnabled) {
            return `/uploads/${key}`;
        }

        try {
            const params = {
                Bucket: this.bucketName,
                Key: key,
                Expires: expires
            };

            const url = await this.s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            throw new Error('Failed to generate file access URL');
        }
    }
}

module.exports = new CloudStorageService();