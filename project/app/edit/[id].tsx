import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';
import { getLedgerEntryById, updateLedgerEntry } from '@/utils/database';
import { fetchCities, fetchLedgerGroups, City, LedgerGroup } from '@/utils/apiService';
import { useLocalSearchParams, router } from 'expo-router';
import SupplierFormSection from '@/components/SupplierFormSection';
import ContactFormSection from '@/components/ContactFormSection';
import AddressFormSection from '@/components/AddressFormSection';
import BalanceFormSection from '@/components/BalanceFormSection';

export default function EditSupplierScreen() {
  const { id } = useLocalSearchParams();
  const [cities, setCities] = useState<City[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    ledgerName: '',
    printName: '',
    ledgerType: 'SUNDRY DEBTORS',
    ledgerGroupId: '',
    address1: '',
    address2: '',
    address3: '',
    state: '01 - JAMMU & KASHMIR',
    city: '',
    pinCode: '',
    gstNumber: '',
    contact: '',
    mobileNumber: '',
    phoneNumber: '',
    email: '',
    openingBalance: '',
    balanceType: 'Dr',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyId = await AsyncStorage.getItem('companyId');
        if (!companyId) {
          setError('Company ID not found. Please log in again.');
          return;
        }

        const [citiesData, ledgerGroupsData, supplierData] = await Promise.all([
          fetchCities(),
          fetchLedgerGroups(parseInt(companyId)),
          getLedgerEntryById(Number(id))
        ]);

        setCities(citiesData);
        setLedgerGroups(ledgerGroupsData);

        setFormData({
          ledgerName: supplierData.Supplier || '',
          printName: supplierData.PrintName || '',
          ledgerType: 'SUNDRY DEBTORS',
          ledgerGroupId: supplierData.LedgerGroupId?.toString() || '',
          address1: supplierData.Add1 || '',
          address2: supplierData.Add2 || '',
          address3: supplierData.Add3 || '',
          state: '01 - JAMMU & KASHMIR',
          city: supplierData.City?.toString() || '',
          pinCode: '',
          gstNumber: supplierData.TNGST_No || '',
          contact: supplierData.Contact_person || '',
          mobileNumber: supplierData.Mobile_No || '',
          phoneNumber: supplierData.Phone || '',
          email: supplierData.Mailid || '',
          openingBalance: supplierData.OpBalAmt?.toString() || '',
          balanceType: supplierData.OpType || 'Dr',
          isActive: supplierData.Isactive === 'Y'
        });

      } catch (err) {
        setError('Error loading supplier data');
        console.error('Error loading form data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const updateFormField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ledgerName.trim()) {
      newErrors.ledgerName = 'Ledger name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    if (formData.openingBalance && isNaN(Number(formData.openingBalance))) {
      newErrors.openingBalance = 'Opening balance must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const openingBalanceValue = formData.openingBalance 
          ? parseFloat(formData.openingBalance) 
          : 0;
          
        const finalBalance = formData.balanceType === 'Dr' 
          ? openingBalanceValue 
          : -openingBalanceValue;
          
        const ledgerData = {
          ...formData,
          city: parseInt(formData.city),
          ledgerGroupId: parseInt(formData.ledgerGroupId),
          openingBalance: finalBalance
        };
        
        await updateLedgerEntry(Number(id), ledgerData);
        Alert.alert(
          "Success", 
          "Supplier updated successfully!",
          [{ 
            text: "OK",
            onPress: () => router.back()
          }]
        );
      } catch (error: any) {
        console.error('Error updating supplier:', error);
        Alert.alert(
          "Error", 
          error.message || "Failed to update supplier. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading supplier data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <SupplierFormSection
            formData={formData}
            errors={errors}
            updateFormField={updateFormField}
          />

          <AddressFormSection
            formData={formData}
            cities={cities}
            errors={errors}
            updateFormField={updateFormField}
            isLoading={isLoading}
          />

          <ContactFormSection
            formData={formData}
            errors={errors}
            updateFormField={updateFormField}
          />

          <BalanceFormSection
            formData={formData}
            errors={errors}
            updateFormField={updateFormField}
          />

          {/* Active Status */}
          <View style={styles.checkboxContainer}>
            <Check color="#555" size={20} style={styles.inputIcon} />
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => updateFormField('isActive', !formData.isActive)}
            >
              <View style={[styles.checkboxInner, formData.isActive && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Active</Text>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
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
  retryButton: {
    marginTop: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0d5c46',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0d5c46',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#0d5c46',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});