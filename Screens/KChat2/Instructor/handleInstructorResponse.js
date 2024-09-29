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
    //check is a room with the roomId already exits if so ,add the meditatorEmail to the array , else create the chat room GOAT logic
    const chatRoomRef = doc(db, 'ChatRooms', chatRequestId);
    const chatRoomSnapshot = await getDoc(chatRoomRef);
    
    if (chatRoomSnapshot.exists()) {
      const existingData = chatRoomSnapshot.data();
      
      if (!existingData.meditatorEmails.includes(meditatorEmail)) {
        await updateDoc(chatRoomRef, {
          meditatorEmails: [...existingData.meditatorEmails, meditatorEmail],
        });
        console.log('Added meditatorEmail to existing chat room:', meditatorEmail);
      } else {
        console.log('MeditatorEmail already exists in the chat room:', meditatorEmail);
      }
    } else {
      await setDoc(chatRoomRef, {
        instructorEmail,
        meditatorEmails: [meditatorEmail],
        status: 'created',
        instructorMessages: [],
      });
      console.log('Chat room created for:', instructorEmail, meditatorEmail);
    }
    await updateDoc(chatRequestRef, { status: 'accepted' });
    
    
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
