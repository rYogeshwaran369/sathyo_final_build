import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, StyleSheet, TextInput } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Audio } from 'expo-av';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db, deleteDoc  } from "../../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const MeditationTimerAndChat = ({ route, navigation }) => {
  const durationInMinutes = route.params?.duration || 0; 
  const songPath = route.params?.selectedSong || null;
  const chatRoomId = route.params?.chatRoomId || null;


  const user = auth.currentUser;
  const [userType, setUserType] = useState(null);
  const [duration] = useState(durationInMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sound, setSound] = useState(null);
  const [message, setMessage] = useState('');
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const messageTimerRef = useRef(null);
  const timerRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit Meditation',
          'You cannot go back during the meditation session.',
          [{ text: 'OK', onPress: () => {}, style: 'cancel' }],
          { cancelable: true }
        );
        return true; 
      };

      // event listener for hardware back button
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );
  
  const deleteChatRoom = async () => {
    if (chatRoomId) {
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
  
      try {
        // Delete the document
        await deleteDoc(chatRoomRef);
        console.log(`Chat room ${chatRoomId} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting chat room ${chatRoomId}:`, error);
      }
    }
  };


  useEffect(() => {
    const fetchUserType = async () => {
      const storedUserType = await AsyncStorage.getItem('userType');
      setUserType(storedUserType);
      setIsInstructor(storedUserType === "Instructor");
    };

    fetchUserType();
  }, []);

  useEffect(() => {
    const playSound = async () => {
      try { 
        console.log('Loading sound');

        const { sound: newSound } = await Audio.Sound.createAsync(
          // { uri: songPath },
          require('../../assets/Hello.mp3'),
          { shouldPlay: true, isLooping: true }
        );
        setSound(newSound);
        console.log('Sound loaded');
      } catch (error) {
        console.error('Error loading sound', error);
      }
    };
  
    playSound();
  
    return () => {
      if (sound) {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
    };
  }, []); 

  useEffect(() => {
    if (!isPaused) {
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
    if (timeLeft === 0 && chatRoomId) {
      if (sound) {
        sound.stopAsync();
      }
  
      deleteChatRoom();
  
      navigation.navigate('Home');
    }
  }, [timeLeft]);

  useEffect(() => {
    if (chatRoomId) {
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
  
      const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
        const data = docSnapshot.data();
  
        if (data?.isPaused !== undefined) {
          setIsPaused(data.isPaused);
          setIsPlaying(!data.isPaused);
          if (data.isPaused) {
            sound?.pauseAsync();
          } else {
            sound?.playAsync();
          }
        }
  
        if (data?.messages && data.messages.length > 0) {
          const latestMessage = data.messages[data.messages.length - 1];  
          displayMessage(latestMessage);  
        }
      });
  
      return () => unsubscribe();  
    }
  }, [chatRoomId, sound]);

  const displayMessage = (msg) => {
    setTimeout(() => {
      setReceivedMessage(msg);
      setShowMessage(true);
  
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
  
      messageTimerRef.current = setTimeout(() => {
        setShowMessage(false);
      }, 4000);
    }, 0);  
  };

  const sendMessage = async () => {
    if (message && chatRoomId) {
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);

      await updateDoc(chatRoomRef, {
        messages: arrayUnion({
          sender: user.email,
          content: message,
          timestamp: new Date(),
        }),
      });

      setMessage('');
    }
  };

  const togglePlayPause = async () => {
    if (isInstructor && chatRoomId) {
      const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);
      const newPauseState = !isPaused;
      setIsPlaying(!newPauseState);
  
      await updateDoc(chatRoomRef, {
        isPaused: newPauseState,
      });
  
      if (newPauseState) {
        if (sound) {
          await sound.pauseAsync();  
          console.log('Sound paused');
        }
      } else {
        // Resuming the sound
        if (sound) {
          await sound.playAsync(); 
          console.log('Sound playing');
        }
      }
    }
  };

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
                source={{
                  uri: 'https://res.cloudinary.com/djc99tekd/image/upload/v1723719615/sathyodhayam/qmad7qesjddv7vwdp9gg.png',
                }}
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

          {showMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{receivedMessage?.content}</Text>
            </View>
          )}

          {isInstructor && (
            <View style={styles.chatContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message"
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          )}

          {isInstructor && (
            <View style={styles.Button}>
              <TouchableOpacity onPress={togglePlayPause}>
                <Text style={styles.SignIn_Button_Text}>
                  {isPaused ? 'Continue' : 'Pause'} Meditation
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

export default MeditationTimerAndChat;
