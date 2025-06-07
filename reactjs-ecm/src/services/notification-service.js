import { ref, onValue, push } from "firebase/database";
import { database } from "./firebase-config";

export const listenToNotifications = (callback) => {
    const notificationsRef = ref(database, "notificationAdmins/");
    onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const parsedData = Object.entries(data).map(([key, value]) => [
                key,
                {
                    isRead: value.isRead,
                    message: value.message,
                    order_id: value.order_id,
                    status: value.status,
                    createdAt: value.createdAt,
                    notificationType: value.notificationType,
                }
            ]);
            callback(parsedData);
        } else {
            callback([]);
        }
    });
};
