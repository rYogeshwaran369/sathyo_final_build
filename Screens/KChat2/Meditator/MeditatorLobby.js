import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc,onSnapshot, query, where, collection } from 'firebase/firestore';
import { db, auth } from '../../../firebase';

const MeditatorLobby = ({route}) => {
  const {chatRoomId}  = route.params;
  const [loading, setLoading] = useState(true); 
  // const [chatRoomId, setChatRoomId] = useState(null); 
  const navigation = useNavigation();

  useEffect(() => {
    console.log("in meditator lobby")
    console.log("chatRoomId")
    console.log(chatRoomId)
    const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);


    const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
      if (docSnapshot.exists()) { 
        const data = docSnapshot.data(); 
    
        if (data) {
          console.log("Document updated", data);
    
          const selectedSong = data.song || null;
          console.log("Meditator Looby song is " , selectedSong)
          const duration = data.duration || null;
          const status = data.status || null;
    
          if (selectedSong && duration && status === "active") {
            // setChatRoomId(docSnapshot.id);
    
            navigation.navigate('MeditationTimerAndChat', {
              chatRoomId: docSnapshot.id, 
              selectedSong,           
              duration,       
            });
            setLoading(false); 
          }
        } else {
          console.log("No data found in the document");
        }
      } else {
        console.log("No such document!");
      }
    
      
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View>
      {loading ? (
        <>
          <Text>Waiting for the instructor to start the meditation session...</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      ) : (
        <Text>Session started! Redirecting...</Text>
      )}
    </View>
  );
};

export default MeditatorLobby;
