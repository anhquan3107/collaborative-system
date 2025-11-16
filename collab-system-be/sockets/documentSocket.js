// backend/sockets/documentSocket.js - FIXED BROADCAST
import { updateDocumentContent } from "../models/documentModel.js";

export function initDocumentSocket(io, socket) {
    console.log(`🟢 Document sockets initialized for: ${socket.id}`);

    // join a document room
    socket.on("join_document", ({ docId }) => {
        const room = `document_${docId}`;
        socket.join(room);
        console.log(`✅ Socket ${socket.id} joined ${room}`);
        
        // Debug: Count users in room
        const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
        console.log(`👥 Room ${room} now has ${roomSize} users`);
    });

    // leave a document room
    socket.on("leave_document", ({ docId }) => {
        const room = `document_${docId}`;
        socket.leave(room);
        console.log(`🚪 Socket ${socket.id} left ${room}`);
    });

    // 🚨 FIX: live edit content - BROADCAST TO ALL IN ROOM INCLUDING SENDER
    socket.on("edit_document", ({ docId, patch }) => {
        const room = `document_${docId}`;
        
        console.log(`📨 Received edit_document from ${socket.id}:`, {
            room: room,
            docId: docId,
            patchLength: patch?.length,
            patchPreview: patch?.substring(0, 50) + '...'
        });

        // 🚨 CRITICAL FIX: Use io.to(room).emit() instead of socket.to(room).emit()
        // This broadcasts to ALL clients in the room INCLUDING the sender
        io.to(room).emit("document_patch", { 
            docId: docId, 
            patch: patch,
            fromSocketId: socket.id // For debugging
        });

        console.log(`📤 Broadcasted to room ${room}`);
    });

    // cursor/selection updates
    socket.on("cursor_document", ({ docId, cursor }) => {
        const room = `document_${docId}`;
        socket.to(room).emit("document_cursor", { socketId: socket.id, cursor });
    });

    // explicit save (client triggers)
    socket.on("save_document", async ({ docId, content }) => {
        try {
            console.log(`💾 Saving document ${docId}, content length: ${content?.length}`);
            await updateDocumentContent(docId, content);
            const room = `document_${docId}`;
            
            // let others know document was saved (timestamp update)
            io.to(room).emit("document_saved", { 
                docId, 
                updatedAt: new Date().toISOString() 
            });
            
            console.log(`✅ Document ${docId} saved successfully`);
        } catch (err) {
            console.error("❌ save_document error:", err);
            socket.emit("document_save_error", { message: "Save failed" });
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Socket ${socket.id} disconnected`);
    });

    // Add error handling
    socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
    });
}