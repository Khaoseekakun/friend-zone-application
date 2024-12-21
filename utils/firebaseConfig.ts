import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyB6-tcwtkosfRGDQq4_6Nvpz47Lnt33_UM",
    authDomain: "friendszone-d1e20.firebaseapp.com",
    databaseURL: "https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "friendszone-d1e20",
    storageBucket: "friendszone-d1e20.appspot.com",
    messagingSenderId: "820285031495",
    appId: "1:820285031495:web:154296ce35bf7171bcdd62",
    measurementId: "G-RN2B2NF5DM",
};

let FireBaseApp: FirebaseApp 

if (!getApps().length) {
    FireBaseApp = initializeApp(firebaseConfig);
} else {
    FireBaseApp = getApps()[0];
}

export default FireBaseApp;
