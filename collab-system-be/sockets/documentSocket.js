import Delta from "quill-delta";

const liveDocuments = new Map();

export function initDocumentSocket(io) {
    
    // The function sets up its own connection listener
    io.on("connection", (socket) => {
        console.log(` Document sockets initialized for: ${socket.id}`);

        // 1. Join a document room
        socket.on("join_document", ({ docId, content }) => {
            const room = `document_${docId}`;
            socket.join(room);

            if (!liveDocuments.has(docId)) {
                if (content) {
                    liveDocuments.set(docId, new Delta(content));
                } else {
                    liveDocuments.set(docId, new Delta());
                }
            }

            const snapshot = liveDocuments.get(docId);
            if (snapshot) {
                socket.emit("document_snapshot", {
                    docId,
                    content: snapshot
                });
            }
        });


        // 2. Leave a document room
        socket.on("leave_document", ({ docId }) => {
            const room = `document_${docId}`;
            socket.leave(room);
            console.log(`Socket ${socket.id} left ${room}`);
        });

        // 3. Live edit content - BROADCAST TO ALL IN ROOM INCLUDING SENDER

        socket.on("edit_document", ({ docId, patch }) => {
            const room = `document_${docId}`;

            const patchDelta = new Delta(patch);

            const current = liveDocuments.get(docId) || new Delta();
            const updated = current.compose(patchDelta);

            liveDocuments.set(docId, updated);

            io.to(room).emit("document_patch", {
                docId,
                patch,
                fromSocketId: socket.id
            });
        });


        // 5. Explicit save (Notification Only)
        socket.on("save_document", ({ docId }) => {
            const room = `document_${docId}`;

            io.to(room).emit("document_saved", {
                docId,
                updatedAt: new Date().toISOString()
            });

            const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
            if (roomSize === 0) {
                liveDocuments.delete(docId);
            }
        });



        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected`);
        });

        socket.on("error", (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });
}