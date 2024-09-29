import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth,db } from '../../firebase'; // Ensure firebase is correctly set up

const CommonChatPage = ({ route,navigation }) => {
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
      setChatRoomData(data);

      const combinedMessages = [
        ...(data.instructorMessages || []),
      ];
      setMessages(combinedMessages);

      // here only navgatin to time=chat
      if (data) {
  
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
      }
      
      const meditatorEmails = data.meditatorEmails;
      let flag=true;
      meditatorEmails.map((email) => {
        const trimmedEmail = email.split('.com')[0];  
        flag = flag && (data[trimmedEmail]?.com === true);
      })

      
      setIsMeditationStartEnabled(flag)
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
      navigation.navigate('InstructorLobby',{chatRoomId: chatRoomId})
  }
  const handleThanksButton = () => console.log('Instructor Button 2 pressed');
  const handleInstructorButton3 = () => console.log('Instructor Button 3 pressed');

  const handleReadyButton = async () => {
    try {
      const email = auth.currentUser.email; 
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
      await updateDoc(chatRoomRef, {
        [email]:true
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
      meditatorsEmail: arrayRemove(email) 
    });

    console.log('User removed from chat room.');
    
    navigation.navigate('Home'); 
  } catch (error) {
    console.error('Error removing user from chat room: ', error);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {userType === 'Instructor' ? (
          <>
            <Button
              title="Start Meditation"
              onPress={handleStartMeditationButton}
              disabled={!isMeditationStartEnabled}
              color={isMeditationStartEnabled ? '#007BFF' : '#808080'} 
            />
            <Button title="Thanks" onPress={handleThanksButton} />
            <Button title="Instructor Btn 3" onPress={handleInstructorButton3} />
          </>
        ) : (
          <>
            <Button title="Ready" onPress={handleReadyButton} />
            <Button title="Wait" onPress={handleWaitButton} />
            <Button title="I'll join later" onPress={handleLaterButton} />
          </>
        )}
      </View>

      {/* Message list */}
      <FlatList
        data={messages.sort((a, b) => a.timestamp - b.timestamp)} // Sort by timestamp
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>{item.timestamp?.toDate().toLocaleTimeString()}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

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
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  messageItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
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
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
  },
  sendButton: {
    paddingHorizontal: 16,
    color: '#007BFF',
    fontSize: 16,
  },
});

export default CommonChatPage;


// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
// import { db } from '../../firebase'; // Make sure you have the firebase config setup

// const CommonChatPage = ({ route }) => {
//   const chatRoomId = route.params?.chatRoomId || ""
//   const [userType, setUserType] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [chatRoomData, setChatRoomData] = useState(null);

//   useEffect(() => {
//     const getUserType = async () => {
//       const userTypeStored = await AsyncStorage.getItem('userType');
//       setUserType(userTypeStored);
//     };

//     getUserType();

//     // Fetch chat room data and listen for real-time updates
//     const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
//     const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
//       const data = docSnapshot.data();
//       setChatRoomData(data);

//       // Combine instructorMessages and meditator messages for display
//       const combinedMessages = [
//         ...(data.instructorMessages || []),
//       ];
//       setMessages(combinedMessages);
//     });

//     return () => unsubscribe();
//   }, [chatRoomId]);

//   const sendMessage = async () => {
//     if (!message) return;

//     const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
//     const messageToSend = { text: message, timestamp: new Date() };

//     try {
//       if (userType === 'Instructor') {
//         // Update instructorMessages in the chat room document
//         await updateDoc(chatRoomRef, {
//           instructorMessages: [...(chatRoomData?.instructorMessages || []), messageToSend],
//         });
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
    
//     setMessage(''); // Clear the message input
//   };

//   // Button handlers for instructor
//   const handleStartMeditationButton = () => console.log('Instructor Button 1 pressed');
//   const handleThanksButton = () => console.log('Instructor Button 2 pressed');
//   const handleInstructorButton3 = () => console.log('Instructor Button 3 pressed');

//   // Button handlers for meditator
//   const handleReadyButton = () => console.log('Meditator Button 1 pressed');
//   const handleWaitButton = () => console.log('Meditator Button 2 pressed');
//   const handleLaterButton = () => console.log('Meditator Button 3 pressed');

//   return (
//     <View style={styles.container}>
//       <View style={styles.buttonContainer}>
//         {userType === 'Instructor' ? (
//           <>
//             <Button title="Instructor Btn 1" onPress={handleStartMeditationButton} />
//             <Button title="Instructor Btn 2" onPress={handleThanksButton} />
//             <Button title="Instructor Btn 3" onPress={handleInstructorButton3} />
//           </>
//         ) : (
//           <>
//             <Button title="Ready" onPress={handleReadyButton} />
//             <Button title="Wait" onPress={handleWaitButton} />
//             <Button title="I'll join later" onPress={handleLaterButton} />
//           </>
//         )}
//       </View>

//       {/* Message list */}
//       <FlatList
//         data={messages.sort((a, b) => a.timestamp - b.timestamp)} // Sort by timestamp
//         renderItem={({ item }) => (
//           <View style={styles.messageItem}>
//             <Text>{item.text}</Text>
//             <Text style={styles.timestamp}>{item.timestamp?.toDate().toLocaleTimeString()}</Text>
//           </View>
//         )}
//         keyExtractor={(item, index) => index.toString()}
//       />

//       {/* Chat input box */}
//       {userType === 'Instructor' && (
//         <View style={styles.messageInputContainer}>
//           <TextInput
//             value={message}
//             onChangeText={setMessage}
//             style={styles.input}
//             placeholder="Type a message..."
//           />
//           <TouchableOpacity onPress={sendMessage}>
//             <Text style={styles.sendButton}>Send ➔</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   messageItem: {
//     padding: 10,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   timestamp: {
//     fontSize: 10,
//     color: '#999',
//     alignSelf: 'flex-end',
//   },
//   messageInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     paddingVertical: 8,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 8,
//     borderRadius: 4,
//   },
//   sendButton: {
//     paddingHorizontal: 16,
//     color: '#007BFF',
//     fontSize: 16,
//   },
// });

// export default CommonChatPage;
