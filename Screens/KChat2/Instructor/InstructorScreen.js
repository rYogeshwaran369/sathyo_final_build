import React, { useEffect, useState } from 'react';
import { query, collection, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import InstructorResponseModal from './InstructorResponseModal';
import { db, auth } from "../../../firebase";
import { View, Text } from 'react-native';

const InstructorScreen = ({ navigation }) => {
  const instructorEmail = auth.currentUser.email;
  const [chatRequestId, setChatRequestId] = useState(null);
  const [meditatorEmail, setMeditatorEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [checkBlacklistInterval, setCheckBlacklistInterval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
   
    const checkBlacklist = async () => {
      const blacklistRef = doc(db, 'TemporaryBlacklist', instructorEmail);
      const blacklistDoc = await getDoc(blacklistRef);
      if (blacklistDoc.exists()) {
        const blacklistData = blacklistDoc.data();
        const rejectionTimestamp = blacklistData.timestamp;

        if (rejectionTimestamp) {
          const rejectionTime = rejectionTimestamp.toDate();
          const now = new Date();
          const timeDiff = now - rejectionTime; 
          
          if (timeDiff < 5 * 60 * 1000) { //TODO : change blacklist time (less)
            setIsBlacklisted(true);
            setLoading(false); 
            return;
          }
        }
      }
      setIsBlacklisted(false);
    };

    checkBlacklist(); 

    const intervalId = setInterval(checkBlacklist, 60 * 1000);
    setCheckBlacklistInterval(intervalId);

    return () => clearInterval(intervalId); 
  }, [instructorEmail]);

  useEffect(() => {
    if (!isBlacklisted) {
      const q = query(
        collection(db, 'chatRequests'),
        where('instructorEmail', '==', instructorEmail),
        where('status', '==', 'pending')
      );
    
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setLoading(false);
          console.log("Chat request received");
          snapshot.forEach((doc) => {
            const data = doc.data();
            setChatRequestId(data.chatRequestId);
            setMeditatorEmail(data.meditatorEmail);
            setShowModal(true);
          });
        }
        else {
          // Reset states when there are no pending requests
          setChatRequestId(null);
          setMeditatorEmail(null);
          setShowModal(false);
          setLoading(true);
        }
      });

      return () => unsubscribe(); 
    }
  }, [instructorEmail, isBlacklisted]);

  return (
    <View>
      {loading && !isBlacklisted && <Text>Waiting for chat requests...</Text>}
      {isBlacklisted && <Text>You are temporarily unable to receive requests.</Text>}
      {showModal && chatRequestId && meditatorEmail && (
        <InstructorResponseModal 
          chatRequestId={chatRequestId} 
          instructorEmail={instructorEmail}
          meditatorEmail={meditatorEmail} 
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
};

export default InstructorScreen;


