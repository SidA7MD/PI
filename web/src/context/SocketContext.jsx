// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // URL du backend - à ajuster selon l'env
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            transports: ['websocket'],
            autoConnect: true
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user) {
            console.log('🔗 Joining socket rooms for user:', user._id);
            socket.emit('join', {
                userId: user._id,
                schoolId: user.school?._id || user.school // Depend on if school is populated
            });
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
