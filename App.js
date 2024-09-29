import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from './Screens/KChat2/ChatContext'; // Ensure this path is correct
import AppStack from './Screens/Router/AppStack';
import NotificationListener from './Screens/KChat2/NotificationListener';
export default function App() {
  return (
    <NavigationContainer>
      <ChatProvider >
          <AppStack/>
          <NotificationListener /> 
        </ChatProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
