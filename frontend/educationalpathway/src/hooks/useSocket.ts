"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = (token: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        console.log("[Socket] Attempting connection to:", SOCKET_URL);

        // Initialize socket
        socketRef.current = io(SOCKET_URL, {
            // Remove explicit websocket transport to allow polling fallback for better compatibility
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
            auth: { token }
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("[Socket] Connected successfully with ID:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected. Reason:", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("[Socket] Connection error:", err.message);
            // If it's an auth error, we might want to refresh the token or redirect
            if (err.message === "Authentication error") {
                console.error("[Socket] Invalid token provided");
            }
            setIsConnected(false);
        });

        return () => {
            if (socket) {
                console.log("[Socket] Cleaning up connection...");
                socket.disconnect();
            }
        };
    }, [token]);

    return { socket: socketRef.current, isConnected };
};
