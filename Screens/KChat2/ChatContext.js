

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
// import { db, auth } from '../../firebase'; 

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [chatRequest, setChatRequest] = useState(null);
//   const clearChatRequest = () => {
//     setChatRequest(null); 
//   };
//   return (
//     <ChatContext.Provider value={{ chatRequest, setChatRequest ,clearChatRequest }}>
//       {children}
//       <ChatListener />
//     </ChatContext.Provider>
//   ); 
// }; 

// const ChatListener = () => {
//   const navigation = useNavigation();
//   const {chatRequest, setChatRequest } = useContext(ChatContext);


//   console.log("navigation :" ,navigation)
//   console.log(chatRequest)

  
//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) {
//       console.log("User is not authenticated, navigating to Login");
//       // setChatRequest(null); 
//       navigation.navigate("Login");
//       return;
//     }
//     const q = query(
//       collection(db, 'chatRequests'),
//       where('instructorEmail', '==', user.email),
//       where('status', '==', 'pending'),
//       // orderBy('createdAt', 'desc'), 
//       // limit(1)
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();
//         setChatRequest(data);
//       } else {
//         setChatRequest(null);
//       }
//     });

//     return () => unsubscribe();
//   }, [navigation,chatRequest,auth,db]);

//   return null;
// };

// export const useChatContext = () => {
//   return useContext(ChatContext);
// };


import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatRequest, setChatRequest] = useState(null);
  
  const clearChatRequest = () => {
    setChatRequest(null); 
  };

  return (
    <ChatContext.Provider value={{ chatRequest, setChatRequest, clearChatRequest }}>
      {children}
      <ChatListener />
    </ChatContext.Provider>
  ); 
}; 

const ChatListener = () => {
  const navigation = useNavigation();
  const { setChatRequest } = useContext(ChatContext);
  
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("User is not authenticated, navigating to Login");
        setChatRequest(null); 
        navigation.navigate("Login");
      } else {
        const q = query(
          collection(db, 'chatRequests'),
          where('instructorEmail', '==', user.email),
          where('status', '==', 'pending')
        );

        const unsubscribeChatRequests = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setChatRequest(data);
          } else {
            setChatRequest(null);
          }
        });

        // Cleanup function for the chat requests listener
        return () => unsubscribeChatRequests();
      }
    });

    // Cleanup function for the authentication listener
    return () => unsubscribeAuth();
  }, [navigation, setChatRequest]);

  return null; // This component does not render anything
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
