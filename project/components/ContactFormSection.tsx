import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { User, Phone, Smartphone, Mail } from 'lucide-react-native';

interface ContactFormSectionProps {
  formData: {
    contact: string;
    mobileNumber: string;
    phoneNumber: string;
    email: string;
  };
  errors: Record<string, string>;
  updateFormField: (field: string, value: string) => void;
}

const ContactFormSection: React.FC<ContactFormSectionProps> = ({
  formData,
  errors,
  updateFormField,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>

      {/* Contact Person */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <User color="#555" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contact Person"
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

export default ContactFormSection;