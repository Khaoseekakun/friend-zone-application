import axios from "axios";

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