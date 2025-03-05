import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

/**
 * Get company ID from the Company_store table
 * @returns Promise containing the company ID
 */
export const getCompanyId = async () => {
  try {
    // Make API call to get company information from Company_store table
    const response = await axios.get(`${API_URL}/company-store/active`);
    
    // Extract the CompanyId from the response
    if (response.data && response.data.CompanyId) {
      return response.data.CompanyId;
    } else {
      console.warn('No active company found in Company_store table');
      return null;
    }
  } catch (error) {
    console.error('Error fetching company ID:', error);
    throw error;
  }
};

/**
 * Get all companies from the Company_store table
 * @returns Promise containing all companies
 */
export const getAllCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}/company-store`);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies from Company_store:', error);
    throw error;
  }
};