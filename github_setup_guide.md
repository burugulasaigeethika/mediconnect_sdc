# GitHub Setup Guide for MediConnect

## Prerequisites
1. Install Git from https://git-scm.com/download/win
2. Create a GitHub account at https://github.com/signup

## Steps to Push Your Code to GitHub

### 1. Initialize Git Repository (if not already done)
```bash
cd "C:\Users\SRI SAI GUTHA\OneDrive\Desktop\MediConnect"
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Commit Your Changes
```bash
git commit -m "Initial commit of MediConnect healthcare platform"
```

### 4. Create Repository on GitHub
1. Go to https://github.com/new
2. Name your repository (e.g., "MediConnect")
3. Choose Public or Private
4. Don't initialize with README
5. Click "Create repository"

### 5. Connect Local Repository to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

### 6. Push to GitHub
```bash
git push -u origin main
```

## What's Included in This Commit
- Complete frontend React application with all portals
- Backend Node.js/Express server
- Proper .gitignore files to exclude node_modules
- All healthcare platform features:
  - Patient portal
  - Doctor portal
  - Pharmacy portal
  - Admin dashboard
  - Authentication system
  - Medical records management
  - Appointment booking
  - Prescription handling

## Notes
- node_modules directories are excluded via .gitignore
- Environment files (.env) are excluded for security
- Only source code and configuration files are included