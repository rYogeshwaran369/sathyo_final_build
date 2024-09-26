import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Fetch pending chat requests for the instructor
export const fetchPendingRequests = async () => {
  const auth = getAuth();
  const instructorId = auth.currentUser.uid;
  const db = getFirestore();

  const chatRequestsRef = collection(db, 'chatRequests');
  const q = query(chatRequestsRef, where('instructorId', '==', instructorId), where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return requests;
  } else {
    return [];
  }
};

// Accept chat request
export const acceptChatRequest = async (requestId) => {
  const db = getFirestore();
  const requestRef = doc(db, 'chatRequests', requestId);

  // Update the chat request status to 'accepted'
  await updateDoc(requestRef, {
    status: 'accepted',
    timestamp: Date.now(),
  });

  alert('Chat request accepted');
};

// Reject chat request
const rejectChatRequest = async (requestId) => {
  const db = getFirestore();
  const requestRef = doc(db, 'chatRequests', requestId);

  // Update the chat request status to 'rejected'
  await updateDoc(requestRef, {
    status: 'rejected',
    timestamp: Date.now(),
  });

  alert('Chat request rejected');
};
