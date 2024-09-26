// import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// const requestChatRoom = async () => {
//   const auth = getAuth();
//   const userId = auth.currentUser.uid;
//   const db = getFirestore();

//   // Initialize an empty array to keep track of rejected instructors
//   let rejectedInstructors = [];

//   const findNextAvailableInstructor = async () => {
//     // Query to find an available instructor that hasn't been rejected yet
//     const instructorsRef = collection(db, 'users');
//     const q = query(instructorsRef, where('userType', '==', 'Instructor'), where('availability', '==', true));
//     const querySnapshot = await getDocs(q);

//     // Find an instructor who has not been rejected
//     const availableInstructor = querySnapshot.docs.find(doc => !rejectedInstructors.includes(doc.id));

//     return availableInstructor ? availableInstructor.id : null;
//   };

//   const createChatRequest = async (instructorId) => {
//     // Create a chat request
//     const chatRequestsRef = collection(db, 'chatRequests');
//     await addDoc(chatRequestsRef, {
//       meditatorId: userId,
//       instructorId: instructorId,
//       status: 'pending',
//       timestamp: Date.now(),
//     });

//     // Optionally, update instructor's availability if needed
//     // await updateDoc(doc(db, 'users', instructorId), { availability: false });

//     alert('Chat request sent to instructor.');
//   };

//   let instructorId = await findNextAvailableInstructor();

//   while (instructorId) {
//     try {
//       await createChatRequest(instructorId);

//       // You need to handle listening to instructor acceptance/rejection
//       const response = await listenForInstructorResponse(instructorId); // Mockup, you need to implement this

//       if (response === 'accepted') {
//         // Instructor accepted, break the loop
//         break;
//       } else if (response === 'rejected') {
//         // Instructor rejected, add to rejected list and try the next one
//         rejectedInstructors.push(instructorId);
//         instructorId = await findNextAvailableInstructor();
//       }
//     } catch (error) {
//       console.error('Error creating chat request: ', error);
//       alert('Something went wrong. Please try again later.');
//       break;
//     }
//   }

//   if (!instructorId) {
//     alert('No available instructors found.');
//   }
// };
