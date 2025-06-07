import React, { createContext, useEffect, useState } from "react";
import {listenToNotifications} from "../../services/notification-service.js";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        listenToNotifications((parsedNotifications) => {
            setNotifications(parsedNotifications);
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
