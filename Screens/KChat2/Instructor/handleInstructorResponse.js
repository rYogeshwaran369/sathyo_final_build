import { getDoc,collection, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {auth,db} from "../../../firebase"
import { sendChatRequest } from '../sendChatRequest';
import { useNavigation } from '@react-navigation/native';

export async function handleInstructorResponse(chatRequestId, accepted,navigation) {
  console.log("handle Instructor Response is called")
  const chatRequestRef = doc(db, 'chatRequests', chatRequestId);
  const chatRequestDoc = await getDoc(chatRequestRef);
  // const navigation = useNavigation();
  
  if (!chatRequestDoc.exists()) {
    console.log('For Meditator : Chat request not found.');
    return;
  }
  
  const chatRequest = chatRequestDoc.data();
  const { instructorEmail, meditatorEmail } = chatRequest;
   
  if (accepted) {
    await updateDoc(chatRequestRef, { status: 'accepted' });
    
    
    const chatRoomRef = doc(db, 'ChatRooms', chatRequestId);
    await setDoc(chatRoomRef, {
      instructorEmail,
      meditatorEmails: [meditatorEmail], 
      status: 'created',
    });
    console.log('Navigating to Meditation Lobby for', instructorEmail, meditatorEmail);
    console.log("Chat room created with status created")

  } else {
    await updateDoc(chatRequestRef, { status: 'rejected' });

    // TODO : need to change blacklist logic
    const blacklistRef = doc(db, 'TemporaryBlacklist', instructorEmail);
    await setDoc(blacklistRef, { status: 'blacklisted', timestamp: serverTimestamp() });

    console.log('Instructor', instructorEmail, 'rejected the request and was blacklisted.');

    // await sendChatRequest(meditatorEmail);
    await sendChatRequest();
    
  }
}
