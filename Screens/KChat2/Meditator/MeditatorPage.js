import React, { useEffect, useState } from 'react';
import { Button, View, Text, Alert } from 'react-native';
import { findAvailableInstructor, requestChatRoom, listenForInstructorResponse } from "../../KChat/Services/ChatService";
import { sendChatRequest } from '../sendChatRequest';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from "../../../firebase";
import { findExisitingRooms } from '../findExisitingRooms';
export default function MeditatorPage({ navigation }) {
  const [chatRequestId, setChatRequestId] = useState(null);
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
      }
    } catch (error) {
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
      const chatRoomId=chatRequestId;
      if (chatRoomData?.status === 'created'  && chatRoomData?.meditatorEmails.includes(auth.currentUser.email)) {
        navigation.navigate('MeditatorLobby' , {chatRoomId});
        setLoading(false);
      } else {
        console.log("Waiting for chat room to be created...");
      }
    });
  
    return () => unsubscribe(); 
  };

  return (
    <View>
      <Text>Meditator Page</Text>
      {loading ? (
        <Text>Looking for an instructor...</Text>
      ) : (
        <Button title="Find Instructor and Start" onPress={handleChatRequest} />
      )}
    </View>
  );
}








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
