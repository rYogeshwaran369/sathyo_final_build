import { collection, doc, setDoc, serverTimestamp, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from "../../firebase";
import 'react-native-get-random-values';

export async function findExisitingRooms() {

  const meditatorEmail = auth.currentUser.email;  // Get the current user's email

  const existingChatRoomQuery = query(
    collection(db, 'ChatRooms'),
    where('status', '==', 'created')
  );

  const existingChatRoomsSnapshot = await getDocs(existingChatRoomQuery);

  if (!existingChatRoomsSnapshot.empty) {
    const chatRoomDoc = existingChatRoomsSnapshot.docs[0];
    const chatRoomRequestRef = doc(db, 'ChatRooms', chatRoomDoc.id);

    await updateDoc(chatRoomRequestRef, {
      meditatorEmails: arrayUnion(meditatorEmail), 
      // status: 'active',
      // timestamp: serverTimestamp(),
    });

    console.log('Existing chat room found and updated:', chatRoomDoc.id);
    return chatRoomDoc.id;  
  }

  console.log('No existing chat rooms found with status "created".');
  return null;
};
