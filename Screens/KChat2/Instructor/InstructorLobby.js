import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref, listAll, getDownloadURL} from 'firebase/storage';
import { getFirestore, addDoc, getDocs,collection, updateDoc, doc,setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { Picker } from '@react-native-picker/picker';

const InstructorLobby = ({ route, navigation }) => {
  const { meditatorEmails, chatRoomId } = route.params;
  const [duration, setDuration] = useState('0');
  const [selectedSong, setSelectedSong] = useState('');
  const [songsList, setSongsList] = useState([]); 

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const storage = getStorage();
        const songsRef = ref(storage, 'gs://sathyodhayam-50d9a.appspot.com'); 
        const listResponse = await listAll(songsRef);

        const fetchedSongs = await Promise.all(
          listResponse.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return { title: itemRef.name, musicLink: url };
          })
        );

        setSongsList(fetchedSongs);
        if (fetchedSongs.length > 0) {
          setSelectedSong(fetchedSongs[0].musicLink); // Select the first song by default
        }
      } catch (error) {
        console.error("Error fetching songs: ", error);
        Alert.alert('Error', 'Failed to load songs from storage');
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    const updateChatRoom = async () => {
      try {
        const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
  
        await updateDoc(chatRoomRef, {
          song: selectedSong,
          duration: parseInt(duration),
          messages: [],
        });
      } catch (error) {
        console.error("Error updating chat room:", error);
      }
    };
  
    if (selectedSong) {
      updateChatRoom();
    }
  }, [selectedSong, duration, chatRoomId, db]);

  const startMeditation = async () => {
    console.log("selectedSong  ", selectedSong);
    if (!selectedSong || !duration) {
      Alert.alert('Missing Info', 'Please select a song and enter a duration');
      return;
    }
    
    const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);

    await updateDoc(chatRoomRef, {
      status: "active"
    });
    
    
    // Navigate meditators to MeditationTimer page
    navigation.navigate('MeditationTimerAndChat', {
      chatRoomId: chatRoomRef.id,
      selectedSong,
      duration,
    });
  };

  return (
    <View style={{backgroundColor:'white',height:'100%'}}>
    <View style={styles.formContainer}>
    {/* Select Song */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Select Song:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSong}
          onValueChange={(itemValue) => setSelectedSong(itemValue)}
          style={styles.picker}
        >
          {songsList.map((song, index) => (
            <Picker.Item key={index} label={song.title} value={song.musicLink} />
          ))}
        </Picker>
      </View>
    </View>

    {/* Set Duration */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Set Duration (minutes):</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        placeholder="Enter duration"
        keyboardType="numeric"
        style={styles.input}
      />
    </View>

    {/* Start Meditation Button */}
    <View style={styles.formGroup}>
      <Button title="Start Meditation" onPress={startMeditation} />
    </View>
  </View>
  </View>
  );
};
const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

export default InstructorLobby;
