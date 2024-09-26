import React, { useEffect,useState } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import {handleInstructorResponse} from "./handleInstructorResponse"
import { useNavigation } from '@react-navigation/native';

const InstructorResponseModal = ({ chatRequestId, instructorEmail, meditatorEmail}) => {
  const [modalVisible, setModalVisible] = useState(true); 
  const navigation = useNavigation();
  
  
  const handleAccept =async () => {
    await handleInstructorResponse(chatRequestId, true,navigation); 
    setModalVisible(false); 
    navigation.navigate('InstructorLobby',{meditatorEmails:[meditatorEmail] , chatRequestId: chatRequestId})
  };

  const handleReject = async () => {
    await handleInstructorResponse(chatRequestId, false); 
    setModalVisible(false);
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)} 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>New Chat Request!</Text>
          <Text>Instructor: {instructorEmail}</Text>
          <Text>Meditator: {meditatorEmail}</Text>
          
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={handleAccept} color="green" />
            <Button title="Reject" onPress={handleReject} color="red" />
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default InstructorResponseModal;
