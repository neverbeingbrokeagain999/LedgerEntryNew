import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { getLedgerEntries, updateLedgerEntry } from '@/utils/database';
import { router } from 'expo-router';
import SupplierListItem from '@/components/SupplierListItem';

type Supplier = {
  SupplierId: number;
  Supplier: string;
  PrintName: string;
  Mobile_No: string;
  Mailid: string;
  OpBalAmt: number;
  OpType: string;
  Isactive: string;
};

export default function SupplierListScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers?.filter(supplier =>
    (supplier.Supplier?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
    (supplier.PrintName?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
  );

  const loadSuppliers = async () => {
    try {
      const data = await getLedgerEntries();
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.LastUpdate || '').getTime() || 0;
        const dateB = new Date(b.LastUpdate || '').getTime() || 0;
        return dateB - dateA;
      });
      setSuppliers(sortedData);
      setError('');
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
      const errorMessage = err.message || 'Failed to load suppliers. Please try again.';
      setError(errorMessage);
      setSuppliers(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/edit/${id}`);
  };

  const handleView = (id: number) => {
    router.push(`/view/${id}`);
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      // Convert opening balance to number
      const openingBalanceValue = data.openingBalance
        ? parseFloat(data.openingBalance)
        : 0;

      // Adjust sign based on Dr/Cr
      const finalBalance = data.balanceType === 'Dr'
        ? Math.abs(openingBalanceValue)
        : -Math.abs(openingBalanceValue);

      const updatedData = {
        ...data,
        city: parseInt(data.city) || 1,
        ledgerGroupId: parseInt(data.ledgerGroupId) || 1,
        openingBalance: finalBalance,
        isActive: data.isActive ? 'Y' : 'N'
      };
      await updateLedgerEntry(id, updatedData);
      await loadSuppliers();
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      Alert.alert('Error', err.message || 'Failed to update supplier');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading suppliers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Saved Suppliers</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search suppliers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSuppliers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {!filteredSuppliers || filteredSuppliers.length === 0 ? (
            <Text style={styles.noDataText}>{searchQuery ? 'No matching suppliers found' : 'No suppliers found'}</Text>
          ) : (
            filteredSuppliers.map((supplier) => (
              <SupplierListItem
                key={supplier.SupplierId}
                supplier={supplier}
                onEdit={handleEdit}
                onView={handleView}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});