// Simple test script to verify upload functionality
const fs = require('fs');
const path = require('path');

// Create a simple text file for testing
const testContent = 'This is a test prescription file';
const testFilePath = path.join(__dirname, 'test-prescription.txt');

fs.writeFileSync(testFilePath, testContent);
console.log('Created test file:', testFilePath);

console.log('Test file created successfully. You can now test the upload functionality in the browser.');