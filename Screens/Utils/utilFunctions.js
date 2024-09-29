import { PermissionsAndroid } from 'react-native';
import { doc, onSnapshot, updateDoc, arrayUnion,deleteDoc } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc, arrayUnion,deleteDoc } from 'firebase/firestore';
import { auth, db  } from "../../firebase";


export async function requestStoragePermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your storage to pick and upload files',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
    } else {
      console.log('Storage permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}


export const deleteChatRoom = async () => {
  if (chatRoomId) {
    const chatRoomRef = doc(db, 'ChatRooms', chatRoomId);

    try {
      // Delete the document
      await deleteDoc(chatRoomRef);
      console.log(`Chat room ${chatRoomId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting chat room ${chatRoomId}:`, error);
    }
  }
};