import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getLedgerEntryById } from '@/utils/database';

type Supplier = {
  SupplierId: number;
  Supplier: string;
  PrintName: string;
  Add1: string;
  Add2: string;
  Add3: string;
  City: number;
  Phone: string;
  Mobile_No: string;
  TNGST_No: string;
  Mailid: string;
  Contact_person: string;
  OpBalAmt: number;
  OpType: string;
  Isactive: string;
  LastUpdate: string;
};

export default function ViewSupplierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSupplierDetails();
  }, [id]);

  const loadSupplierDetails = async () => {
    try {
      if (!id) throw new Error('Supplier ID is required');
      const data = await getLedgerEntryById(parseInt(id));
      setSupplier(data);
    } catch (err: any) {
      console.error('Error loading supplier details:', err);
      setError(err.message || 'Failed to load supplier details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0d5c46" />
        <Text style={styles.loadingText}>Loading supplier details...</Text>
      </View>
    );
  }

  if (error || !supplier) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Supplier not found'}</Text>
      </View>
    );
  }

  const formatBalance = (amount: number, type: string) => {
    const value = Math.abs(amount);
    return `${value.toFixed(2)} ${type}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ledger Name:</Text>
            <Text style={styles.value}>{supplier.Supplier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Print Name:</Text>
            <Text style={styles.value}>{supplier.PrintName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, supplier.Isactive === 'Y' ? styles.activeText : styles.inactiveText]}>
              {supplier.Isactive === 'Y' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Contact Person:</Text>
            <Text style={styles.value}>{supplier.Contact_person || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile:</Text>
            <Text style={styles.value}>{supplier.Mobile_No || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{supplier.Phone || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{supplier.Mailid || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {supplier.Add1 && (
            <View style={styles.row}>
              <Text style={styles.label}>Address 1:</Text>
              <Text style={styles.value}>{supplier.Add1}</Text>
            </View>
          )}
          {supplier.Add2 && (
            <View style={styles.row}>
              <Text style={styles.label}>Address 2:</Text>
              <Text style={styles.value}>{supplier.Add2}</Text>
            </View>
          )}
          {supplier.Add3 && (
            <View style={styles.row}>
              <Text style={styles.label}>Address 3:</Text>
              <Text style={styles.value}>{supplier.Add3}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>GST Number:</Text>
            <Text style={styles.value}>{supplier.TNGST_No || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Opening Balance:</Text>
            <Text style={styles.value}>
              {formatBalance(supplier.OpBalAmt, supplier.OpType)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {new Date(supplier.LastUpdate).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d5c46',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    width: 120,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  activeText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
});