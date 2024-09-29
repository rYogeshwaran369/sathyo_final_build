import React, { useEffect, useState } from 'react';
import { Button, View, Text, Alert, StyleSheet } from 'react-native';
import { sendChatRequest } from '../sendChatRequest';
import { doc, onSnapshot, updateDoc ,serverTimestamp} from 'firebase/firestore';
import { auth, db } from "../../../firebase";
import { findExisitingRooms } from '../findExisitingRooms';
export default function MeditatorPage({ navigation }) {
  const [chatRequestId, setChatRequestId] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChatRequest = async () => {
    setLoading(true);
    
    try {
      const roomId = await findExisitingRooms(auth.currentUser.email);
      if(roomId==null)
      {
        const requestId = await sendChatRequest(auth.currentUser.email); 
        setChatRequestId(requestId);
        console.log("chatrequest id setted" , requestId)
      }
      else{
        //TODO : navigate , write snapshot to navigate to the lobby , or will the sanpshot from other component work? , need to check
        setChatRoomId(roomId)
        const chatRequestRef = doc(db, 'chatRequests', roomId); // Use roomId directly as the document ID

        await updateDoc(chatRequestRef, {
          // chatRequestId: roomId,
          meditatorEmail:auth.currentUser.email,
          status: 'pending',
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to send chat request');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRequestId) {
      console.log("use effect called")
      const chatRequestRef = doc(db, 'chatRequests', chatRequestId);

      const unsubscribe = onSnapshot(chatRequestRef, (snapshot) => {
        const chatRequestData = snapshot.data();

        if (chatRequestData?.status === 'accepted') {
          listenForChatRoomCreation(chatRequestId);
        }
      });

      return () => unsubscribe();
    }
  }, [chatRequestId]);

  useEffect(() => {
    if (chatRoomId) {
      listenForChatRoomCreation(chatRoomId);
    }
  }, [chatRoomId]);

  const listenForChatRoomCreation = (chatRequestId) => {
    console.log("listenForChatRoomCreation called")
    const chatRoomRef = doc(db, 'ChatRooms', chatRequestId);
    
    const unsubscribe = onSnapshot(chatRoomRef, (snapshot) => {
      console.log("ChatRooms updated");
      
      // if (!snapshot.exists()) {
      //   console.error("Chat room does not exist");
      //   return;
      // }
  
      const chatRoomData = snapshot.data();
      if (chatRoomData?.status === 'created'  && chatRoomData?.meditatorEmails.includes(auth.currentUser.email)) {
        // navigation.navigate('MeditatorLobby' , {chatRoomId});
        navigation.navigate('CommonChatPage' , {chatRoomId: chatRequestId});
        setLoading(false);
      } else {
        console.log("Waiting for chat room to be created...");
      }
    });
  
    return () => unsubscribe(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meditator Page</Text>
      {loading ? (
        <Text style={styles.loadingText}>Looking for an instructor...</Text>
      ) : (
        <Button title="Find Instructor and Start" onPress={handleChatRequest} />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
  },
});





// import React, { useEffect } from 'react';
// import { Button, View, Text, Alert } from 'react-native';
// // import { findAvailableInstructor, requestChatRoom, listenForInstructorResponse } from '../services/ChatService';
// import { findAvailableInstructor, requestChatRoom, listenForInstructorResponse } from "../../KChat/Services/ChatService"
// import { sendChatRequest } from '../sendChatRequest';
// import {auth,db} from "../../../firebase"

// export default function MeditatorPage({ navigation }) {
  
//   return (
//     <View>
//       <Text>Meditator Page</Text>
//       <Button title="Find Instructor and Start" onPress={()=>{sendChatRequest()}} />
//     </View>
//   );
// }
