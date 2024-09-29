import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// Import the custom header
import Login from "../Authentiction/Login";
import Sign_up from "../Authentiction/Sign_up";
import Home from "../Home/Home";
import Forget_Password from "../Authentiction/Forget_password";
import Email_Sent from "../Authentiction/Email_Sent";
import News from "../News/News";
import Podcasts from "../Podcasting/Podcasts";
import MeditationTimer from "../Meditation/MeditationTimer";
import Meditation_Page from "../Meditation/Meditation_page";
import Jabam from "../Meditation/Jabam";
import AppHeader from "../../Components/AppHeader";
import Profile from "../../Screens/Profile/Profile_page"
import MeditatorPage from "../KChat2/Meditator/MeditatorPage";
import InstructorScreen from "../KChat2/Instructor/InstructorScreen";
import InstructorLobby from "../KChat2/Instructor/InstructorLobby";
import MeditatorLobby from "../KChat2/Meditator/MeditatorLobby";
import MeditationTimerAndChat from "../KChat2/MeditationTimerAndChat";
import SongPlayer from "../MusicPlayer/SongPlayer";
import CommonChatPage from "../KChat2/CommonChatPage";
import UploadMp3 from "../Upload/UploadMp3";
import DeleteOldChatRequests from "../Utils/DeleteOldChatRequests";

const Stack = createStackNavigator();

export default function AppStack() {
    return (

        <Stack.Navigator initialRouteName="Login">
            
            
            <Stack.Screen
                name="Login"
                options={{ headerShown: false }}
                component={Login}
            />
            <Stack.Screen
                name="Sign_up"
                options={{ headerShown: false }}
                component={Sign_up}
            />
            <Stack.Screen
                name="Profile_page"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={Profile}
            />
            <Stack.Screen
                name="Home"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={Home}
            />
            <Stack.Screen
                name="Forget_Password"
                options={{ headerShown: false }}
                component={Forget_Password}
            />
            <Stack.Screen
                name="Email_Sent"
                options={{ headerShown: false }}
                component={Email_Sent}
            />
            <Stack.Screen
                name="News"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={News}
            />
            <Stack.Screen
                name="Podcast"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={Podcasts}
            />
            
            <Stack.Screen
                name="MeditationTimer"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={MeditationTimer}
            />
            <Stack.Screen
                name="Meditation_page"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={Meditation_Page}
            />
            <Stack.Screen
                name="Jabam"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={Jabam}
            />
            
            
            
            
            
            
            
            
            <Stack.Screen
                name="MeditatorPage"
                options={{ headerShown: false }}
                component={MeditatorPage}
            />
            
            <Stack.Screen
                name="InstructorPage"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> // Use the custom header
                }}
                component={InstructorScreen}
            />
            <Stack.Screen
                name="InstructorLobby"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={InstructorLobby}
            />
            <Stack.Screen
                name="MeditatorLobby"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={MeditatorLobby}
            />
            <Stack.Screen
                name="MeditationTimerAndChat"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={MeditationTimerAndChat}
            />
            
            <Stack.Screen
                name="SongPlayer"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={SongPlayer}
            /> 
            <Stack.Screen
                name="UploadMp3"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={UploadMp3}
            />
            <Stack.Screen
                name="CommonChatPage"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={CommonChatPage}
            />
            <Stack.Screen
                name="DeleteOldChatRequests"
                options={{
                    headerTitle: '', 
                    header: (props) => <AppHeader {...props} /> 
                }}
                component={DeleteOldChatRequests}
            />
            
        </Stack.Navigator>
    );
}
