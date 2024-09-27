import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

import { app } from '../../firebase';

const SongPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    setupAudio();
    fetchSongs();
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  // const setupAudio = async () => {
  //   try {
  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: false,
  //       staysActiveInBackground: true,
  //       // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
  //       interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
  //       playsInSilentModeIOS: true,
  //       shouldDuckAndroid: true,
  //       // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  //       interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  //       playThroughEarpieceAndroid: false
  //     });
  //   } catch (error) {
  //     console.error("Error setting audio mode:", error);
  //   }
  // };
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error("Error setting audio mode11:", error);
    }
  };
  const fetchSongs = async () => {
    const storage = getStorage(app);
    const listRef = ref(storage, 'gs://sathyodhayam-50d9a.appspot.com');
    
    try {
      const res = await listAll(listRef);
      const songList = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
      setSongs(songList);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const playSound = async (song) => {
    console.log('Loading Sound');
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setCurrentSong(song);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      console.log('Pausing Sound');
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSound = async () => {
    if (sound) {
      console.log('Resuming Sound');
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      onPress={() => playSound(item)}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>
      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.name}
      />
      {currentSong && (
        <View style={styles.controls}>
          <Text>Now Playing: {currentSong.name}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={isPlaying ? pauseSound : resumeSound}
          >
            <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  songItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default SongPlayer;