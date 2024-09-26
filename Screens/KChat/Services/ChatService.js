import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';
// // Find an available instructor
export const findAvailableInstructor = async () => {
  const db = getFirestore();
  const instructorsRef = collection(db, 'Users');
  const q = query(instructorsRef, where('userType', '==', 'instructor'), where('availability', '==', true));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data(); // Return the first available instructor
  }
  return null;
};


export const listenForInstructorResponse = (chatRequestId, onAccepted, onRejected) => {
  const db = getFirestore();

  // Reference to the chat request document
  const chatRequestRef = doc(db, 'chatRequests', chatRequestId);

  // Set up a real-time listener for the chat request status
  const unsubscribe = onSnapshot(chatRequestRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      
      if (data.status === 'accepted') {
        onAccepted();  // Call the function passed when accepted
      } else if (data.status === 'rejected') {
        onRejected();  // Call the function passed when rejected
      }
    }
  }, (error) => {
    console.error('Error listening for instructor response: ', error);
  });

  // Return the unsubscribe function to allow cleaning up
  return unsubscribe;
};

// // Create a chat room and navigate users to the ChatLobby
// export const createChatRoomAndNavigate = async (instructor, meditator, navigation) => {
//   const db = getFirestore();

//   // Create a chat room
//   const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
//     instructorId: instructor.id,
//     meditatorId: meditator.id,
//     song: null,
//     duration: null,
//     message: null
//   });

//   const chatRoomId = chatRoomRef.id;

//   // Navigate both users to the ChatLobby
//   navigation.navigate('ChatLobby', { chatRoomId });
// };

// // Update the chat room with song and duration
// export const updateChatRoomWithSongAndTimer = async (chatRoomId, song, duration) => {
//   const db = getFirestore();
//   const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

//   await updateDoc(chatRoomRef, {
//     song: song,
//     duration: duration,
//   });
// };

// // Send message to meditators
// export const sendMessageToMeditators = async (chatRoomId, message) => {
//   const db = getFirestore();
//   const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

//   await updateDoc(chatRoomRef, { message });

//   // Clear the message after 4 seconds
//   setTimeout(async () => {
//     await updateDoc(chatRoomRef, { message: null });
//   }, 4000);
// };

// // Listen for messages sent to meditators
// export const listenForMessages = (chatRoomId, setMessage) => {
//   const db = getFirestore();
//   const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

//   onSnapshot(chatRoomRef, (docSnapshot) => {
//     const data = docSnapshot.data();
//     if (data && data.message) {
//       setMessage(data.message);

//       // Clear message after 4 seconds
//       setTimeout(() => setMessage(null), 4000);
//     }
//   });
// };



export const requestChatRoom = async () => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const email = auth.currentUser.email;
  const db = getFirestore();

  try {
    // Find an available instructor
    const instructorsRef = collection(db, 'users');
    const q = query(instructorsRef, where('userType', '==', 'Instructor'), where('availability', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Pick the first available instructor
      const instructorDoc = querySnapshot.docs[0];
      const instructorId = instructorDoc.id;
      const instructorEmail = instructorDoc.data().email;

      // Create a chat request
      const chatRequestsRef = collection(db, 'chatRequests');
      const chatRequestDoc = await addDoc(chatRequestsRef, {
        meditatorId: userId,
        meditatorEmail: email,
        instructorId: instructorId,
        instructorEmail: instructorEmail,
        status: 'pending',
        timestamp: Date.now(),
      });

      const chatRequestId = chatRequestDoc.id;

      // Return chatRequestId for listener setup
      return chatRequestId;
    } else {
      Alert.alert('No available instructor at the moment.');
      return null;
    }
  } catch (error) {
    console.error('Error creating chat request:', error);
    Alert.alert('Error', 'Something went wrong. Please try again later.');
    throw error;
  }
};
