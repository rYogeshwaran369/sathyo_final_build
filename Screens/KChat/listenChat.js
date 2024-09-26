import { onSnapshot } from 'firebase/firestore';

const listenForChatRequests = (instructorId) => {
  const db = getFirestore();
  const chatRequestsRef = collection(db, 'chatRequests');
  const q = query(chatRequestsRef, where('instructorId', '==', instructorId), where('status', '==', 'pending'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const request = change.doc.data();
        const requestId = change.doc.id;
        Alert.alert(
          'Chat Request',
          'You have a new chat request from a meditator',
          [
            {
              text: 'Accept',
              onPress: () => acceptChatRequest(requestId, request),
            },
            {
              text: 'Reject',
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      }
    });
  });

  // Call unsubscribe() when you want to stop listening
};

const acceptChatRequest = async (requestId, request) => {
  const db = getFirestore();
  const chatRequestRef = doc(db, 'chatRequests', requestId);

  // Update the chat request status to 'accepted'
  await updateDoc(chatRequestRef, { status: 'accepted' });

  // Create the chat room
  const chatRoomsRef = collection(db, 'chatRooms');
  const chatRoomDoc = await addDoc(chatRoomsRef, {
    participants: [request.meditatorId, request.instructorId],
    messages: [],
    createdAt: Date.now(),
  });

  // Optionally, navigate to the chat room screen
  // navigation.navigate('ChatRoom', { roomId: chatRoomDoc.id });
};
