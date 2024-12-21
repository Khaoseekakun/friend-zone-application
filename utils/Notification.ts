import axios from "axios";
import FireBaseApp from "./firebaseConfig";
import { getDatabase, push, ref, set } from "firebase/database";
import { Notification } from "@/types";

export const sendPushNotification = async (userToken : string ,receiverId: string, notify: {
    title: string;
    body: string;
    imageUrl?: string;
    screen? : {
        name : string,
        data : any
    }
}) => {
    try {
        await axios.post('https://friendszone.app/api/notification/send', {
            title: notify.title,
            body: notify.body,
            imageUrl: notify.imageUrl,
            userId: receiverId,
            screen: screen
        }, {
            headers: {
                'Authorization': `All ${userToken}`,
                'Content-Type': "application/json"
            }
        })
    } catch (error) {

    }
};


const database = getDatabase(FireBaseApp);

export const addNotification = async (userId: string, notification: Notification) => {
    try {
        const notiRef = ref(database, `notifications/${userId}`);
        await push(notiRef, notification);
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};