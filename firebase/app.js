import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAfoThMtNb109swho6DIQ5OkXH9UF0Nh1E",
    authDomain: "frutas-verduras-migui.firebaseapp.com",
    projectId: "frutas-verduras-migui",
    storageBucket: "frutas-verduras-migui.appspot.com",
    messagingSenderId: "1091481058570",
    appId: "1:1091481058570:web:b5eb3cb209770278404ef3"
};

const app = firebase.apps.length !== 0 ?
    firebase.app() :
    firebase.initializeApp(firebaseConfig);
export const storage = app.storage();
export const database = app.firestore();
export const auth = app.auth();
export const arrayUnicon = firebase.firestore.FieldValue.arrayUnion;
export default app;