import React, { useState,useEffect } from 'react';
import { View, Text, Button,Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, addDoc, getDocs,collection, updateDoc, doc,setDoc } from 'firebase/firestore';
import {auth,db} from "../../../firebase"
import {Picker} from '@react-native-picker/picker';

const InstructorLobby = ({ route ,navigation}) => {
  const { meditatorEmails, chatRequestId } = route.params;
  const [duration, setDuration] = useState('');
  const [song, setSong] = useState('');
  const [songsList, setSongsList] = useState([]); 
  const [selectedSong, setSelectedSong] = useState(''); 
  // const navigation = useNavigation();
  
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jabam'));
        const fetchedSongs = [];
        querySnapshot.forEach((doc) => {
          const songData = doc.data();
          fetchedSongs.push({ title: songData.title, musicLink: songData.music_Link });
        });
        setSongsList(fetchedSongs); 
        setSelectedSong(songsList[0])
      } catch (error) {
        console.error("Error fetching songs: ", error);
        Alert.alert('Error', 'Failed to load songs from database');
      }
    };

    fetchSongs();
  }, []);

  const startMeditation = async () => {
    console.log("selectedSong  " , selectedSong)
    if (!selectedSong || !duration) {
      Alert.alert('Missing Info', 'Please select a song and enter a duration');
      return;
    }
    console.log("start meditation clicked")
    console.log(chatRequestId)
    
    const chatRoomRef = doc(db, 'ChatRooms', chatRequestId);

    await updateDoc(chatRoomRef, {
      song: selectedSong,
      duration: parseInt(duration),
      messages: [],
      status: "active"
    });
    
    
    // Navigate meditators to MeditationTimer page
    // const navigation = useNavigation();
    navigation.navigate('MeditationTimerAndChat', {
      chatRoomId: chatRoomRef.id,
      selectedSong,
      duration,
    });

    
  };

  return (
    <View>
      <Text>Select Song:</Text>
      <Picker
        selectedValue={selectedSong}
        onValueChange={(itemValue) => setSelectedSong(itemValue)}
      >
        {songsList.map((song, index) => (
          <Picker.Item key={index} label={song.title} value={song.musicLink} />
        ))}
      </Picker>

      <Text>Set Duration (minutes):</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        placeholder="Enter duration"
        keyboardType="numeric"
      />

      <Button title="Start Meditation" onPress={startMeditation} />
    </View>
  );
};

export default InstructorLobby;
