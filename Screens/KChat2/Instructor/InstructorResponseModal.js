import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { handleInstructorResponse } from "./handleInstructorResponse";
import { useNavigation } from '@react-navigation/native';

const InstructorResponseModal = ({ chatRequestId, instructorEmail, meditatorEmail,onClose   }) => {
  const [modalVisible, setModalVisible] = useState(true); 
  const navigation = useNavigation();

  const handleAccept = async () => {
    await handleInstructorResponse(chatRequestId, true, navigation); 
    setModalVisible(false); 
    navigation.navigate('CommonChatPage', { chatRoomId: chatRequestId });
    onClose();
  };

  const handleReject = async () => {
    await handleInstructorResponse(chatRequestId, false);
    setModalVisible(false);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={() => 
        {setModalVisible(false);onClose();}
      } 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Meditation Request</Text>
          <Text style={styles.modalSubtitle}>Meditation discussion</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleReject}>
              <Text style={styles.buttonText}>reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50', 
  },
  modalSubtitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  addButton: {
    backgroundColor: '#007BFF', 
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default InstructorResponseModal;

