import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Function to listen for the instructor's response in real-time
const listenForInstructorResponse = (chatRequestId, onAccepted, onRejected) => {
  const db = getFirestore();
  const requestRef = doc(db, 'chatRequests', chatRequestId);

  // Listen for changes to the chat request document
  const unsubscribe = onSnapshot(requestRef, (docSnapshot) => {
    const data = docSnapshot.data();

    if (data.status === 'accepted') {
      // If accepted, call the onAccepted callback
      onAccepted();
    } else if (data.status === 'rejected') {
      // If rejected, call the onRejected callback
      onRejected();
    }
  });

  // Return the unsubscribe function to stop listening when no longer needed
  return unsubscribe;
};
