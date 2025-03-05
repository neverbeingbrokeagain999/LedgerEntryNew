import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteLedgerEntry } from '../utils/database';

interface SupplierListItemProps {
  supplier: {
    SupplierId: number;
    Supplier: string;
    PrintName: string;
    Add1: string;
    Add2: string;
    Add3: string;
    City: number;
    TNGST_No: string;
    Contact_person: string;
    Mobile_No: string;
    Phone: string;
    Mailid: string;
    OpBalAmt: number;
    OpType: string;
    Isactive: string;
  };
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onUpdate: (id: number, data: any) => Promise<void>;
}

const SupplierListItem: React.FC<SupplierListItemProps> = ({
  supplier,
  onEdit,
  onView,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    Supplier: supplier.Supplier,
    PrintName: supplier.PrintName || '',
    Add1: supplier.Add1 || '',
    Add2: supplier.Add2 || '',
    Add3: supplier.Add3 || '',
    City: supplier.City,
    TNGST_No: supplier.TNGST_No || '',
    Contact_person: supplier.Contact_person || '',
    Mobile_No: supplier.Mobile_No || '',
    Phone: supplier.Phone || '',
    Mailid: supplier.Mailid || '',
    OpBalAmt: supplier.OpBalAmt || 0,
    OpType: supplier.OpType || 'Dr',
    Isactive: supplier.Isactive || 'Y'
  });

  const handleSave = async () => {
    try {
      const updatedData = {
        ledgerName: editedData.Supplier,
        printName: editedData.PrintName,
        address1: editedData.Add1,
        address2: editedData.Add2,
        address3: editedData.Add3,
        city: editedData.City || 1,
        gstNumber: editedData.TNGST_No,
        contact: editedData.Contact_person,
        mobileNumber: editedData.Mobile_No,
        phoneNumber: editedData.Phone,
        email: editedData.Mailid,
        openingBalance: editedData.OpBalAmt || 0,
        balanceType: editedData.OpType,
        isActive: editedData.Isactive === 'Y',
        ledgerGroupId: 1
      };
      await onUpdate(supplier.SupplierId, updatedData);
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update supplier');
    }
  };

  if (isEditing) {
    return (
      <ScrollView style={styles.editContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            value={editedData.Supplier}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Supplier: text }))}
            placeholder="Ledger Name"
          />
          <TextInput
            style={styles.input}
            value={editedData.PrintName}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, PrintName: text }))}
            placeholder="Print Name"
          />

          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TextInput
            style={styles.input}
            value={editedData.Contact_person}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Contact_person: text }))}
            placeholder="Contact Person"
          />
          <TextInput
            style={styles.input}
            value={editedData.Mobile_No}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Mobile_No: text }))}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={editedData.Phone}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Phone: text }))}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={editedData.Mailid}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Mailid: text }))}
            placeholder="Email"
            keyboardType="email-address"
          />

          <Text style={styles.sectionTitle}>Address</Text>
          <TextInput
            style={styles.input}
            value={editedData.Add1}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Add1: text }))}
            placeholder="Address Line 1"
          />
          <TextInput
            style={styles.input}
            value={editedData.Add2}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Add2: text }))}
            placeholder="Address Line 2"
          />
          <TextInput
            style={styles.input}
            value={editedData.Add3}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, Add3: text }))}
            placeholder="Address Line 3"
          />

          <Text style={styles.sectionTitle}>Financial Information</Text>
          <TextInput
            style={styles.input}
            value={editedData.TNGST_No}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, TNGST_No: text }))}
            placeholder="GST Number"
          />
          <TextInput
            style={styles.input}
            value={editedData.OpBalAmt.toString()}
            onChangeText={(text) => setEditedData(prev => ({ ...prev, OpBalAmt: parseFloat(text) || 0 }))}
            placeholder="Opening Balance"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-outline" size={24} color="#28A745" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditing(false)}
          >
            <Ionicons name="close-outline" size={24} color="#DC3545" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{supplier.Supplier}</Text>
        <Text style={styles.details}>GST: {supplier.TNGST_No || 'N/A'}</Text>
        <Text style={styles.details}>Mobile: {supplier.Mobile_No || 'N/A'}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onView(supplier.SupplierId)}
        >
          <Ionicons name="eye-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="pencil-outline" size={24} color="#28A745" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    maxHeight: 500
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  }
});

export default SupplierListItem;