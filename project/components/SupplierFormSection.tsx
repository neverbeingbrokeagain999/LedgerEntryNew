import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Building, User } from 'lucide-react-native';

interface SupplierFormSectionProps {
  formData: {
    ledgerName: string;
    printName: string;
  };
  errors: Record<string, string>;
  updateFormField: (field: string, value: string) => void;
}

const SupplierFormSection: React.FC<SupplierFormSectionProps> = ({
  formData,
  errors,
  updateFormField,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
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
  inputRow: {
    marginBottom: 12,
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
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SupplierFormSection;