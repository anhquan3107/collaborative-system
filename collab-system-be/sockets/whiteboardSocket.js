export function initWhiteboardSocket(io) {
    
    io.on("connection", (socket) => {
        console.log(`🟢 Whiteboard sockets initialized for: ${socket.id}`);

        /**
         * 1. JOIN WHITEBOARD ROOM
         */
        socket.on("join_whiteboard", ({ whiteboardId }) => {
            const room = `whiteboard_${whiteboardId}`;
            socket.join(room);

            console.log(`🎨 Socket ${socket.id} joined ${room}`);

            const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
            console.log(`👥 Room ${room} now has ${roomSize} users`);
        });

        /**
         * 2. LEAVE WHITEBOARD ROOM
         */
        socket.on("leave_whiteboard", ({ whiteboardId }) => {
            const room = `whiteboard_${whiteboardId}`;
            socket.leave(room);
            console.log(`🚪 Socket ${socket.id} left ${room}`);
        });

        /**
         * 3. LIVE DRAWING EVENT
         * patch = the new strokes (array of stroke objects)
         */
        socket.on("draw_whiteboard", ({ whiteboardId, patch }) => {
            const room = `whiteboard_${whiteboardId}`;

            // Safe preview for logs
            let patchPreview = "Object";
            try {
                patchPreview = JSON.stringify(patch).substring(0, 80) + "...";
            } catch {}

            console.log(`🖌️ Received draw_whiteboard from ${socket.id}:`, {
                room,
                whiteboardId,
                patchPreview
            });

            // Broadcast to everyone including sender
            io.to(room).emit("whiteboard_patch", {
                whiteboardId,
                patch,
                fromSocketId: socket.id
            });
        });

        /**
         * 4. CURSOR POSITION BROADCAST (optional)
         */
        socket.on("cursor_whiteboard", ({ whiteboardId, cursor }) => {
            const room = `whiteboard_${whiteboardId}`;
            socket.to(room).emit("whiteboard_cursor", {
                socketId: socket.id,
                cursor
            });
        });

        /**
         * 5. SAVE WHITEBOARD (triggered by API save)
         * This ONLY informs others — actual DB save happens in REST controller
         */
        socket.on("save_whiteboard", async ({ whiteboardId }) => {
            try {
                console.log(`💾 Save notification received for whiteboard ${whiteboardId}`);

                const room = `whiteboard_${whiteboardId}`;

                io.to(room).emit("whiteboard_saved", {
                    whiteboardId,
                    updatedAt: new Date().toISOString()
                });

                console.log(`✅ Save notification broadcasted for whiteboard ${whiteboardId}`);
            } catch (err) {
                console.error("❌ save_whiteboard error:", err);
            }
        });

        /**
         * 6. DISCONNECT
         */
        socket.on("disconnect", () => {
            console.log(`🔴 Socket ${socket.id} disconnected`);
        });

        socket.on("error", (error) => {
            console.error(`❌ Socket error for ${socket.id}:`, error);
        });
    });
}
