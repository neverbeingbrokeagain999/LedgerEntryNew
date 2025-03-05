import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { DollarSign } from 'lucide-react-native';

interface BalanceFormSectionProps {
  formData: {
    openingBalance: string;
    balanceType: string;
  };
  errors: Record<string, string>;
  updateFormField: (field: string, value: string) => void;
}

const BalanceFormSection: React.FC<BalanceFormSectionProps> = ({
  formData,
  errors,
  updateFormField,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Balance Information</Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  balanceInput: {
    flex: 1,
    marginRight: 8,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  balanceTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  balanceTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  balanceTypeActive: {
    backgroundColor: '#0d5c46',
  },
  balanceTypeText: {
    fontSize: 14,
    color: '#666',
  },
  balanceTypeTextActive: {
    color: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
});

export default BalanceFormSection;