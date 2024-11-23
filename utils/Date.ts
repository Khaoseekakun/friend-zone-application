import dayjs from 'dayjs';
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('th');

export function formatTimeDifference(timestamp: string): string {
    const now = dayjs();
    const createdAt = dayjs(timestamp); 
    const diffInSeconds = now.diff(createdAt, 'second');

    if (diffInSeconds < 60) {
        return `${diffInSeconds} วิ`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} นาที`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ชม.`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} วัน`; 
    } else {
        return createdAt.add(543, 'year').format('DD-MM-YYYY');
    }
}

export function getAge(birthday: string){
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    
    const hasNotHadBirthdayThisYear = 
        today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

    if (hasNotHadBirthdayThisYear) {
        age--;
    }
    
    return age;
};

export function makeid(length : number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
