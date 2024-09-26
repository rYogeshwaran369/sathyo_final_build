import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { findAvailableInstructor } from './findAvailableInstructor';
import {auth,db} from "../../firebase"
import 'react-native-get-random-values';


export async function sendChatRequest() {
  console.log("sendChatRequest has been called")
    const meditatorEmail= auth.currentUser.email

    const instructorEmail = await findAvailableInstructor();
    console.log("If instructr not found after seearch",instructorEmail)
  if (!instructorEmail) {
    console.log('No available instructors.');
    return;
  }

  const chatRequestRef = doc(collection(db, 'chatRequests'), uuidv4());
  const chatRequestId = chatRequestRef.id;

  await setDoc(chatRequestRef, {
    chatRequestId,
    instructorEmail,
    meditatorEmail,
    status: 'pending',
    timestamp: serverTimestamp(),
  });

  console.log('Chat request sent to:', instructorEmail);
  return chatRequestId;
}
