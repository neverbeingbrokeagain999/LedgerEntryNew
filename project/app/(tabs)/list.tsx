import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { getLedgerEntries } from '@/utils/database';

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

  const loadSuppliers = async () => {
    try {
      const data = await getLedgerEntries();
      // Sort suppliers by LastUpdate in descending order (newest first)
      const sortedData = data.sort((a, b) => {
        // Convert dates to timestamps, using 0 for invalid dates
        const dateA = new Date(a.LastUpdate || '').getTime() || 0;
        const dateB = new Date(b.LastUpdate || '').getTime() || 0;
        return dateB - dateA; // Sort in descending order (newest first)
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

  const formatBalance = (amount: number, type: string) => {
    const value = Math.abs(amount);
    return `${value.toFixed(2)} ${type}`;
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
          {!suppliers || suppliers.length === 0 ? (
            <Text style={styles.noDataText}>No suppliers found</Text>
          ) : (
            suppliers.map((supplier) => (
              <View key={supplier.SupplierId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.supplierName}>{supplier.Supplier}</Text>
                  <View style={[styles.badge, supplier.Isactive === 'Y' ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={styles.badgeText}>
                      {supplier.Isactive === 'Y' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  {supplier.PrintName !== supplier.Supplier && (
                    <Text style={styles.printName}>Print as: {supplier.PrintName}</Text>
                  )}
                  <Text style={styles.contactInfo}>
                    {supplier.Mobile_No && `📱 ${supplier.Mobile_No}`}
                    {supplier.Mailid && `\n✉️ ${supplier.Mailid}`}
                  </Text>
                  <Text style={styles.balance}>
                    Opening Balance: {formatBalance(supplier.OpBalAmt, supplier.OpType)}
                  </Text>
                </View>
              </View>
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
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#e6f4ea',
  },
  inactiveBadge: {
    backgroundColor: '#fce8e6',
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },
  cardContent: {
    marginTop: 8,
  },
  printName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  balance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
});