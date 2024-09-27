import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from "../../firebase";

const SongPlayer = () => {
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const fetchFirstSong = async () => {
      try {
        const q = query(collection(db, 'jabam'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const songData = querySnapshot.docs[0].data();
          setSong(songData.url); // Assuming 'url' contains the download link for the song
        } else {
          console.log('No songs found in the collection');
        }
      } catch (error) {
        console.error('Error fetching song:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirstSong();
  }, []);

  useEffect(() => {
    let soundInstance;

    // Play the song when the component mounts
    if (song) {
      soundInstance = new Sound(song, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        soundInstance.play((success) => {
          if (success) {
            console.log('Successfully finished playing');
          } else {
            console.log('Playback failed due to audio decoding errors');
          }
        });
      });
      setSound(soundInstance);
    }

    // Clean up the sound instance when the component unmounts
    return () => {
      if (soundInstance) {
        soundInstance.stop(() => {
          soundInstance.release();
        });
      }
    };
  }, [song]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : song ? (
        <>
          <Text style={styles.text}>Now playing...</Text>
          <Button title="Stop" onPress={() => sound && sound.stop()} />
        </>
      ) : (
        <Text style={styles.text}>No songs found!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default SongPlayer;