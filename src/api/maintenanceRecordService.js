import api from './apiConfig';

// Get all maintenance records
export const getAllMaintenanceRecords = async () => {
  try {
    const response = await api.get('/api/maintenance-records');
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    throw error;
  }
};

// Get all parts used for a specific maintenance record
export const getMaintenanceRecordParts = async (recordId) => {
  try {
    const response = await api.get(`/api/maintenance-records/${recordId}/all-parts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance record parts:', error);
    throw error;
  }
};
