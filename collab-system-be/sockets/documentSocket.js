import { updateDocumentContent } from "../models/documentModel.js";

// ✅ STYLE A: Function only takes 'io'
export function initDocumentSocket(io) {
    
    // ✅ The function sets up its own connection listener
    io.on("connection", (socket) => {
        console.log(`🟢 Document sockets initialized for: ${socket.id}`);

        // 1. Join a document room
        socket.on("join_document", ({ docId }) => {
            const room = `document_${docId}`;
            socket.join(room);
            console.log(`✅ Socket ${socket.id} joined ${room}`);
            
            // Debug: Count users in room
            const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
            console.log(`👥 Room ${room} now has ${roomSize} users`);
        });

        // 2. Leave a document room
        socket.on("leave_document", ({ docId }) => {
            const room = `document_${docId}`;
            socket.leave(room);
            console.log(`🚪 Socket ${socket.id} left ${room}`);
        });

        // 3. Live edit content - BROADCAST TO ALL IN ROOM INCLUDING SENDER
        socket.on("edit_document", ({ docId, patch }) => {
            const room = `document_${docId}`;
            
            // SAFE LOGGING: Check type before calling substring
            let patchPreview = "Object/Delta";
            if (typeof patch === 'string') {
                patchPreview = patch.substring(0, 50) + '...';
            } else {
                patchPreview = JSON.stringify(patch).substring(0, 50) + '...';
            }

            console.log(`📨 Received edit_document from ${socket.id}:`, {
                room: room,
                docId: docId,
                // patchLength: patch?.length, // <--- REMOVE THIS (Objects don't have .length)
                patchPreview: patchPreview
            });

            // Broadcast
            io.to(room).emit("document_patch", { 
                docId: docId, 
                patch: patch,
                fromSocketId: socket.id 
            });
        });

        // 4. Cursor/selection updates
        socket.on("cursor_document", ({ docId, cursor }) => {
            const room = `document_${docId}`;
            socket.to(room).emit("document_cursor", { socketId: socket.id, cursor });
        });

        // 5. Explicit save (Notification Only)
        socket.on("save_document", async ({ docId, content }) => {
            try {
                console.log(`💾 Socket received save notification for doc ${docId}`);
                
                // 🚨 FIX APPLIED: We removed the DB call here to prevent "Access Denied".
                // Your Frontend API (projectWorkspace.js) already saved the data to the DB.
                // This socket event just needs to tell everyone else to update their timestamp.
                
                // await updateDocumentContent(docId, content); // <--- REMOVED TO PREVENT CRASH

                const room = `document_${docId}`;
                
                // Let others know document was saved (timestamp update)
                io.to(room).emit("document_saved", { 
                    docId, 
                    updatedAt: new Date().toISOString() 
                });
                
                console.log(`✅ Save notification broadcasted for doc ${docId}`);
            } catch (err) {
                console.error("❌ save_document error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 Socket ${socket.id} disconnected`);
        });

        socket.on("error", (error) => {
            console.error(`❌ Socket error for ${socket.id}:`, error);
        });
    });
}