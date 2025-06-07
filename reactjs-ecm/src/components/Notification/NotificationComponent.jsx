import React, { useContext } from "react";
import { NotificationContext } from "./NotificationProvider";

const NotificationComponent = () => {
    const { notifications } = useContext(NotificationContext);

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map((noti, index) => (
                    <li key={index}>{noti.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationComponent;
