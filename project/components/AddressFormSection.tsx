import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

interface AddressFormSectionProps {
  formData: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    pinCode: string;
  };
  cities: Array<{
    CityId: number;
    CITY: string;
  }>;
  errors: Record<string, string>;
  updateFormField: (field: string, value: string) => void;
  isLoading?: boolean;
}

const AddressFormSection: React.FC<AddressFormSectionProps> = ({
  formData,
  cities,
  errors,
  updateFormField,
  isLoading
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Address Information</Text>

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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 40,
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 40,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default AddressFormSection;