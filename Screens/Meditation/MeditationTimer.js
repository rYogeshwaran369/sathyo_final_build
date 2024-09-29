import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, StyleSheet } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

const MeditationTimer = ({ route, navigation }) => {
  const durationInMinutes = route.params?.duration || 0; 
  const songPath = route.params?.selectedSong || null;

  const [duration] = useState(durationInMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [sound, setSound] = useState(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const playSound = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: songPath },
          { shouldPlay: false, isLooping: true }
        );
        setSound(newSound);
        setIsSoundLoaded(true);
      } catch (error) {
        console.error('Error loading sound', error);
      }
    };

    playSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [songPath]);

  useEffect(() => {
    if (!isPaused && isSoundLoaded) {
      sound.playAsync();
    }
  }, [isPaused, isSoundLoaded]);

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerRef.current);
            return 0;
          }
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  useEffect(() => {
    const endMeditation = async () => {
      if (sound) {
        await sound.stopAsync();
      }
      navigation.navigate('Home');
    };

    if (timeLeft === 0) {
      endMeditation();
    }
  }, [timeLeft]);

  // Use focus effect to stop the sound when leaving the page
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          sound.stopAsync(); // Stop the sound when navigating away
        }
      };
    }, [sound])
  );

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safearea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: '76%', marginTop: '4%' }}>
          <CountdownCircleTimer
            isPlaying={!isPaused}
            duration={duration}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[duration / 2, duration / 3, duration / 4, 0]}
            size={250}
            strokeWidth={5}
          >
            {() => (
              <Image
                source={{ uri: 'https://res.cloudinary.com/djc99tekd/image/upload/v1723719615/sathyodhayam/qmad7qesjddv7vwdp9gg.png' }}
                style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: 100,
                  alignSelf: 'center',
                }}
              />
            )}
          </CountdownCircleTimer>

          <View style={{ marginTop: '10%' }}>
            <Text style={{ fontSize: 40 }}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  messageContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '70%',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#004777',
    padding: 10,
  },
  sendButtonText: {
    color: 'white',
  },
  Button: {
    marginTop: 20,
  },
  SignIn_Button_Text: {
    fontSize: 20,
    color: 'black',
  },
});

export default MeditationTimer;
