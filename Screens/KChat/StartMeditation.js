import { doc, updateDoc, getFirestore } from 'firebase/firestore';

const startMeditation = async (duration, song) => {
  const db = getFirestore();
  const sessionId = 'your-session-id'; // A unique ID for the meditation session

  // Update the session in Firestore
  const sessionRef = doc(db, 'Sessions', sessionId);
  await updateDoc(sessionRef, {
    isStarted: true,
    duration: duration,
    song: song,
  });

  // Navigate the instructor to the Chat page
  navigation.navigate('ChatPage', { duration, song, chatRoomId: sessionId });
};
