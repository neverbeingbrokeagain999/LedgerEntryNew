import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface City {
  CityId: number;
  CITY: string;
}

export interface LedgerGroup {
  LedgerGroupId: number;
  LEDGERGROUP: string;
}

export const fetchCities = async (): Promise<City[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const fetchLedgerGroups = async (compId: number): Promise<LedgerGroup[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ledger-groups/${compId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ledger groups:', error);
    throw error;
  }
};