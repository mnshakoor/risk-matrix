# GitHub Pages Deployment Instructions

## Overview
Your OODA-CARVER Ops Risk Dashboard has been successfully converted to a single `index.html` file that retains all the original features while being optimized for GitHub Pages deployment.

## Features Retained
✅ **Dashboard View**: Portfolio posture, top risks, and interactive data table  
✅ **5×5 Risk Heatmap**: Visual risk matrix with color-coded cells  
✅ **Report Generation**: Comprehensive risk assessment reports  
✅ **Add/Edit/Delete**: Full CRUD operations for risk entries  
✅ **Upload/Export**: CSV and JSON import/export functionality  
✅ **Search & Filter**: Real-time search and role-based column filtering  
✅ **Role-based Views**: Different column sets for All, Ops, Sec, and Comms roles  
✅ **Data Persistence**: Automatic saving to browser localStorage  
✅ **Print Support**: Print-friendly PDF generation  
✅ **Self-tests**: Built-in validation of core functions  
✅ **Responsive Design**: Works on desktop and mobile devices  

## Deployment Steps

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `ooda-carver-dashboard` or your preferred name
3. Make sure it's set to **Public** (required for free GitHub Pages)

### 2. Upload the File
1. Upload the `index.html` file to the root of your repository
2. Commit the changes with a message like "Add OODA-CARVER dashboard"

### 3. Enable GitHub Pages
1. Go to your repository **Settings**
2. Scroll down to **Pages** section in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

### 4. Access Your Dashboard
- Your dashboard will be available at: `https://[username].github.io/[repository-name]/`
- It may take a few minutes for the site to become available
- GitHub will show you the exact URL in the Pages settings

## Technical Details

### Dependencies
- **PapaParse**: Loaded via CDN for CSV parsing (no installation required)
- **Pure HTML/CSS/JavaScript**: No build process needed
- **Self-contained**: All functionality in a single file

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Local storage for data persistence

### File Structure
```
your-repo/
└── index.html (single file containing everything)
```

## Usage Notes

### Data Persistence
- Data is automatically saved to browser localStorage
- Data persists between sessions on the same browser/device
- To backup data, use the export functions (CSV/JSON)

### File Operations
- **Upload**: Supports CSV and JSON files with risk data
- **Export**: Download data as CSV, JSON, or Markdown reports
- **Print**: Generate PDF reports using browser print function

### Customization
- All styling is contained within the `<style>` section
- JavaScript functionality is in the `<script>` section
- Easy to modify colors, layout, or add new features

## Troubleshooting

### Common Issues
1. **Site not loading**: Wait 5-10 minutes after enabling Pages
2. **404 Error**: Ensure `index.html` is in the root directory
3. **Data not saving**: Check if localStorage is enabled in browser
4. **Upload not working**: Ensure file format is CSV or JSON with correct headers

### CSV Format
Required headers: `name,type,country,location,C,A,R,V,E,Rz,notes`

### Support
The dashboard includes built-in self-tests that validate core functionality. If the self-test indicator shows green, all systems are operational.

