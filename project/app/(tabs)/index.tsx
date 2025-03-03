import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Building, 
  User, 
  Users, 
  MapPin, 
  FileText, 
  Phone, 
  Smartphone, 
  Mail, 
  DollarSign,
  Check
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { saveLedgerEntry } from '@/utils/database';
import { fetchCities, fetchLedgerGroups, City, LedgerGroup } from '@/utils/apiService';

export default function LedgerFormScreen() {
  const [cities, setCities] = useState<City[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get company ID from storage
        const companyId = await AsyncStorage.getItem('companyId');
        if (!companyId) {
          setError('Company ID not found. Please log in again.');
          return;
        }

        const [citiesData, ledgerGroupsData] = await Promise.all([
          fetchCities(),
          fetchLedgerGroups(parseInt(companyId))
        ]);
        setCities(citiesData);
        setLedgerGroups(ledgerGroupsData);
      } catch (err) {
        setError('Error loading form data');
        console.error('Error loading form data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const [formData, setFormData] = useState({
    ledgerName: '',
    printName: '',
    ledgerType: 'SUNDRY DEBTORS',
    ledgerGroupId: '',
    address1: '',
    address2: '',
    address3: '',
    state: '01 - JAMMU & KASHMIR',
    city: '',  // Add city field
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

  const updateFormField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
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
        // Convert opening balance to number
        const openingBalanceValue = formData.openingBalance 
          ? parseFloat(formData.openingBalance) 
          : 0;
          
        // Adjust sign based on Dr/Cr
        const finalBalance = formData.balanceType === 'Dr' 
          ? openingBalanceValue 
          : -openingBalanceValue;
          
        const ledgerData = {
          ...formData,
          city: parseInt(formData.city), // Ensure city is a number
          ledgerGroupId: parseInt(formData.ledgerGroupId), // Ensure ledgerGroupId is a number
          openingBalance: finalBalance
        };
        
        const response = await saveLedgerEntry(ledgerData);
        if (response) {
          resetForm();
          Alert.alert(
            "Success", 
            "Ledger entry saved successfully!",
            [{ text: "OK" }]
          );
        }
      } catch (error: any) {
        console.error('Error saving ledger entry:', error);
        Alert.alert(
          "Error", 
          error.message || "Failed to save ledger entry. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      ledgerName: '',
      printName: '',
      ledgerType: 'SUNDRY DEBTORS',
      ledgerGroupId: '',
      address1: '',
      address2: '',
      address3: '',
      state: '01 - JAMMU & KASHMIR',
      city: '',  // Reset city field
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
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Ledger Name */}
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, errors.ledgerName ? styles.inputError : null]}>
              <Building color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ledger Name"
                value={formData.ledgerName}
                onChangeText={(value) => updateFormField('ledgerName', value)}
              />
            </View>
          </View>
          {errors.ledgerName && <Text style={styles.errorText}>{errors.ledgerName}</Text>}

          {/* Print Name */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <User color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Print Name"
                value={formData.printName}
                onChangeText={(value) => updateFormField('printName', value)}
              />
            </View>
          </View>

          {/* Ledger Group */}
          <View style={styles.pickerContainer}>
            <Users color="#555" size={20} style={styles.inputIcon} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.ledgerGroupId}
                style={styles.picker}
                onValueChange={(value) => updateFormField('ledgerGroupId', value)}
                enabled={!isLoading}
              >
                <Picker.Item label="Select Ledger Group" value="" />
                {ledgerGroups.map((group) => (
                  <Picker.Item key={group.LedgerGroupId} label={group.LEDGERGROUP} value={group.LedgerGroupId} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Address 1 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <MapPin color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={formData.address1}
                onChangeText={(value) => updateFormField('address1', value)}
              />
            </View>
          </View>

          {/* Address 2 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={(value) => updateFormField('address2', value)}
              />
            </View>
          </View>

          {/* Address 3 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={(value) => updateFormField('address3', value)}
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.pickerContainer}>
            <MapPin color="#555" size={20} style={styles.inputIcon} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.city}
                style={styles.picker}
                onValueChange={(value) => updateFormField('city', value)}
                enabled={!isLoading}
              >
                <Picker.Item label="Select City" value="" />
                {cities.map((city) => (
                  <Picker.Item key={city.CityId} label={city.CITY} value={city.CityId} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Pin Code */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <MapPin color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pin Code"
                value={formData.pinCode}
                onChangeText={(value) => updateFormField('pinCode', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* GST Number */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <FileText color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="GST Number"
                value={formData.gstNumber}
                onChangeText={(value) => updateFormField('gstNumber', value)}
              />
            </View>
          </View>

          {/* Contact */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <User color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contact"
                value={formData.contact}
                onChangeText={(value) => updateFormField('contact', value)}
              />
            </View>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, errors.mobileNumber ? styles.inputError : null]}>
              <Smartphone color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={(value) => updateFormField('mobileNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

          {/* Phone Number */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Phone color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormField('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
              <Mail color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => updateFormField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Opening Balance */}
          <View style={styles.balanceRow}>
            <View style={[
              styles.inputContainer, 
              styles.balanceInput, 
              errors.openingBalance ? styles.inputError : null
            ]}>
              <DollarSign color="#555" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Opening Balance"
                value={formData.openingBalance}
                onChangeText={(value) => updateFormField('openingBalance', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.balanceTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.balanceTypeButton,
                  formData.balanceType === 'Dr' ? styles.balanceTypeActive : {}
                ]}
                onPress={() => updateFormField('balanceType', 'Dr')}
              >
                <Text style={[
                  styles.balanceTypeText,
                  formData.balanceType === 'Dr' ? styles.balanceTypeTextActive : {}
                ]}>Dr</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.balanceTypeButton,
                  formData.balanceType === 'Cr' ? styles.balanceTypeActive : {}
                ]}
                onPress={() => updateFormField('balanceType', 'Cr')}
              >
                <Text style={[
                  styles.balanceTypeText,
                  formData.balanceType === 'Cr' ? styles.balanceTypeTextActive : {}
                ]}>Cr</Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.openingBalance && <Text style={styles.errorText}>{errors.openingBalance}</Text>}

          {/* Is Active */}
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => updateFormField('isActive', !formData.isActive)}
            >
              {formData.isActive && (
                <Check size={16} color="#0d5c46" />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>IsActive</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 12,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 8,
    height: 40,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  inputIcon: {
    marginRight: 8,
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 38,
    padding: 0,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
    paddingHorizontal: 8,
  },
  pickerWrapper: {
    flex: 1,
    height: 40,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  balanceInput: {
    flex: 1,
  },
  balanceTypeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  balanceTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0d5c46',
    minWidth: 40,
    alignItems: 'center',
  },
  balanceTypeActive: {
    backgroundColor: '#0d5c46',
  },
  balanceTypeText: {
    color: '#0d5c46',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceTypeTextActive: {
    color: 'white',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#0d5c46',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#0d5c46',
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});