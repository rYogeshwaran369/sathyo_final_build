import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from "../../firebase";

export async function findAvailableInstructor() {
  console.log("findAvailableInstructor has been called")
 
  const instructorsRef = collection(db, 'Users');
  const q = query(
    instructorsRef,
    where('userType', '==', 'Instructor'),
    where('availability', '==', true)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log('No available instructors found.');
    return null;
  }

  for (const instructorDoc of querySnapshot.docs) {
    const instructor = instructorDoc.data();
    const instructorEmail = instructor.email;

    // Check the blacklist status of the instructor
    const blacklistRef = doc(db, 'TemporaryBlacklist', instructorEmail);
    const blacklistDoc = await getDoc(blacklistRef);

    if (blacklistDoc.exists()) {
      const blacklistData = blacklistDoc.data();
      const rejectionTimestamp = blacklistData?.timestamp;

      if (rejectionTimestamp) {
        // const rejectionTime = new Date();
        // try {
        const rejectionTime = rejectionTimestamp.toDate();
        // } catch (error) {
        //   console.log(error)
        // }
        const now = new Date();
        const timeDiff = now - rejectionTime; // Difference in milliseconds

        if (timeDiff < 5 * 60 * 1000) {
          // console.log(`${instructorEmail} is still blacklisted.`);
          console.log(`No instructor still found.`);
          continue;
        }
      }
    }
    return instructorEmail;
  }
  console.log('No available instructors outside of blacklist.');
  return null;
}








// import { auth, db } from "../../firebase";
// import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';

// export async function findAvailableInstructor() {
//   const instructorsRef = collection(db, 'Users');
//   const blacklistRef = collection(db, 'TemporaryBlacklist');
//   console.log('1')
//   const fiveMinutesAgo = Timestamp.now().toDate();
//   console.log('2')
//   fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

//   const q = query(
//     instructorsRef,
//     where('userType', '==', 'Instructor'),
//     where('availability', '==', true)
//   );

//   const querySnapshot = await getDocs(q);

//   if (querySnapshot.empty) {
//     console.log('No available instructors found.');
//     return null;
//   }

//   // Iterate over available instructors to find one not blacklisted
//   for (const docSnap of querySnapshot.docs) {
//     const instructor = docSnap.data();
//     const instructorEmail = instructor.email;

//     // Check if the instructor is in the blacklist
//     const blacklistDocRef = doc(blacklistRef, instructorEmail);
//     const blacklistDocSnap = await getDoc(blacklistDocRef);

//     if (blacklistDocSnap.exists()) {
//       const blacklistData = blacklistDocSnap.data();
//     //   const rejectionTimestamp = blacklistData.rejectionTimestamp.toDate();
//         console.log(blacklistData.timestamp)
//       const rejectionTimestamp = blacklistData.timestamp.toDate();

//       // Skip this instructor if the rejection was less than 5 minutes ago
//       if (rejectionTimestamp > fiveMinutesAgo) {
//         console.log(`Instructor ${instructorEmail} is temporarily blacklisted.`);
//         continue;
//       }
//     }

//     // Return the first available instructor not in the blacklist or blacklist expired
//     return instructorEmail;
//   }

//   console.log('No available instructors found after blacklist check.');
//   return null;
// }
