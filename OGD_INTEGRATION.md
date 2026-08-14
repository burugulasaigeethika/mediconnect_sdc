# OGD API Integration Documentation

This document explains how to use the Open Government Data (OGD) API integration for medicine data in the MediConnect healthcare platform.

## Setup

1. Add the OGD API key and resource ID to your `.env` file:
```
OGD_API_KEY=579b464db66ec23bdd0000014e87fb8815a74895499dc5c1366c4225
OGD_MEDICINE_RESOURCE_ID=your-actual-resource-id-here
```

2. Find the appropriate resource ID for medicine data on [data.gov.in](https://data.gov.in). Common resource IDs include:
   - Medicine price data
   - Generic medicine data
   - Medicine availability data

3. Update the `OGD_MEDICINE_RESOURCE_ID` in your `.env` file with the actual resource ID.

## Backend Integration

### Services

The integration includes a medicine service (`backend/services/medicineService.js`) with the following functions:

1. `fetchOGDMedicines(params)` - Fetch medicine data from OGD API
2. `searchOGDMedicines(searchTerm, filters)` - Search medicines in OGD API
3. `getOGDMedicineById(medicineId)` - Get specific medicine by ID

### API Routes

The medicine routes (`backend/routes/medicineRoutes.js`) have been updated to support both local database and OGD API data sources:

- GET `/api/medicines` - Fetch all medicines
  - Query parameter `source`: 'local' (default) or 'ogd'
  - Query parameter `limit`: Number of records to fetch (default: 100)

- GET `/api/medicines/search` - Search medicines
  - Query parameter `q`: Search term (required)
  - Query parameter `source`: 'local' (default) or 'ogd'

## Frontend Integration

### Services

The frontend includes a medicine service (`frontend/src/services/medicineService.js`) with:

1. `fetchMedicines(options)` - Fetch medicines from backend
2. `searchMedicines(searchTerm, options)` - Search medicines
3. `getMedicineById(medicineId)` - Get medicine by ID

### Usage in Components

The Pharmacy page (`frontend/src/pages/Pharmacy.jsx`) demonstrates how to use the integration:

```javascript
// Fetch medicines from OGD API
const medicines = await fetchMedicines({ source: 'ogd', limit: 50 });

// Search medicines in OGD API
const results = await searchMedicines('paracetamol', { source: 'ogd' });
```

## Data Format Handling

The integration handles different data formats between local database and OGD API:

- Local database: Uses schema defined in `Medicine` model
- OGD API: Adapts to the structure provided by data.gov.in

## Error Handling

The integration includes proper error handling:
- API key validation
- Network error handling
- Fallback to local data if OGD API fails

## Security

- API key is stored in environment variables
- Not exposed to frontend
- Server-side only access

## Testing

To test the integration:

1. Start the backend server
2. Visit the Pharmacy page
3. Select "OGD API (data.gov.in)" from the data source dropdown
4. Browse or search for medicines

If the OGD API is not accessible, the system will automatically fallback to local database data.