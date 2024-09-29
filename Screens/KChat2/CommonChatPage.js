import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, onSnapshot, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Ensure firebase is correctly set up

const CommonChatPage = ({ route, navigation }) => {
  const chatRoomId = route.params?.chatRoomId || "";
  const meditatorEmails = route.params?.meditatorEmails || [];
  const [userType, setUserType] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatRoomData, setChatRoomData] = useState(null);
  const [isMeditationStartEnabled, setIsMeditationStartEnabled] = useState(false);

  useEffect(() => {
    const getUserType = async () => {
      const userTypeStored = await AsyncStorage.getItem('userType');
      setUserType(userTypeStored);
    };
    getUserType();

    const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
    const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
      const data = docSnapshot.data();

      // Check if chat room data exists
      if (data) {
        setChatRoomData(data);
        
        const combinedMessages = [
          ...(data.instructorMessages || []),
        ];
        setMessages(combinedMessages);

        const selectedSong = data.song || null;
        const duration = data.duration || null;
        const status = data.status || null;

        if (selectedSong && duration && status === "active") {
          navigation.navigate('MeditationTimerAndChat', {
            chatRoomId: docSnapshot.id,
            selectedSong,
            duration,
          });
        }

        const meditatorEmails = data.meditatorEmails || [];
        let flag = true;
        meditatorEmails.forEach((email) => {
          const trimmedEmail = email.split('.com')[0];
          flag = flag && (data[trimmedEmail]?.com === true);
        });

        setIsMeditationStartEnabled(flag);
      } else {
        // If no chat room data, show no messages
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatRoomId, meditatorEmails]);

  const sendMessage = async () => {
    if (!message) return;

    const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
    const messageToSend = { text: message, timestamp: new Date() };

    try {
      if (userType === 'Instructor') {
        // Update instructorMessages in the chat room document
        await updateDoc(chatRoomRef, {
          instructorMessages: [...(chatRoomData?.instructorMessages || []), messageToSend],
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  // Button handlers for instructor
  const handleStartMeditationButton = () => {
    navigation.navigate('InstructorLobby', { chatRoomId: chatRoomId });
  }
  
  const handleThanksButton = () => console.log('Instructor Button 2 pressed');
  const handleInstructorButton3 = () => console.log('Instructor Button 3 pressed');

  const handleReadyButton = async () => {
    try {
      const email = auth.currentUser.email;
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
      await updateDoc(chatRoomRef, {
        [email]: true,
      });

      console.log("Meditator status updated.");
    } catch (error) {
      console.error("Error updating meditator status: ", error);
    }
  };

  const handleWaitButton = () => console.log('Meditator Button 2 pressed');
  
  const handleLaterButton = async () => {
    try {
      const email = auth.currentUser.email;
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId); 

      await updateDoc(chatRoomRef, {
        meditatorsEmail: arrayRemove(email),
      });

      console.log('User removed from chat room.');
      navigation.navigate('Home'); 
    } catch (error) {
      console.error('Error removing user from chat room: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Message list */}
      <FlatList
        data={messages.sort((a, b) => a.timestamp - b.timestamp)} // Sort by timestamp
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{item.timestamp?.toDate().toLocaleTimeString()}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.noMessages}>No messages</Text>} // Display "No messages" if the list is empty
        contentContainerStyle={styles.listContent} // Style for FlatList content
      />

      {/* Button container */}
      <View style={styles.buttonContainer}>
        {userType === 'Instructor' ? (
          <>
            <Button
              title="Start Meditation"
              onPress={handleStartMeditationButton}
              disabled={!isMeditationStartEnabled}
              color={isMeditationStartEnabled ? '#007BFF' : '#808080'} 
            />
            <Button title="Thanks for joining" onPress={handleThanksButton} />
            {/* <Button title="Instructor Btn 3" onPress={handleInstructorButton3} /> */}
          </>
        ) : (
          <>
            <Button title="Ready" onPress={handleReadyButton} />
            <Button title="Wait" onPress={handleWaitButton} />
            <Button title="I'll join later" onPress={handleLaterButton} />
          </>
        )}
      </View>

      {/* Chat input box */}
      {userType === 'Instructor' && (
        <View style={styles.messageInputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={sendMessage}>
            <Text style={styles.sendButton}>Send ➔</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'flex-end', // Aligns content at the bottom
  },
  listContent: {
    paddingBottom: 80, // Add padding to the bottom to prevent overlap with buttons
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2, // Adds shadow effect for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 1 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 1, // Shadow radius for iOS
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2, // Adds shadow effect for Android
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    color: '#007BFF',
    fontSize: 16,
  },
  noMessages: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default CommonChatPage;
