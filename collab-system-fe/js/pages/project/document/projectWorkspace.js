// frontend/js/pages/projectWorkspace.js - ADD DEBUGGING
import { listDocuments, createDocument, getDocument, saveDocument } from "../../../../api/document.js";
import { inviteToProject } from "../../../../api/invitation.js";
import { getProjectMembers } from "../../../../api/project.js";


const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');
const projectName = urlParams.get('projectName') || 'Untitled';
let projectMembers = []; 

let currentDocId = null;
let socket = null;
let isConnected = false;
let isReceivingRemoteUpdate = false;

// Initialize the workspace
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }

    if (!projectId) {
        alert('Project ID missing from URL');
        return;
    }

    console.log('🚀 Initializing workspace for project:', projectId);
    document.getElementById('projectName').textContent = projectName;
    initializeSocket();
    loadDocuments();
    loadMembers();
    setupEventListeners();
});

function initializeSocket() {
    console.log('🔌 Initializing Socket.IO connection...');
    socket = io();
    
    socket.on('connect', () => {
        isConnected = true;
        updateConnectionStatus('Connected', 'text-success');
        console.log('✅ Socket.IO Connected - ID:', socket.id);
    });

    socket.on('disconnect', () => {
        isConnected = false;
        updateConnectionStatus('Disconnected', 'text-danger');
        console.log('❌ Socket.IO Disconnected');
    });

    // REAL-TIME COLLABORATION - WITH DEBUGGING
    socket.on('document_patch', (data) => {
        console.log('📨 RECEIVED document_patch:', {
            receivedDocId: data.docId,
            currentDocId: currentDocId,
            patchLength: data.patch?.length,
            isReceivingRemoteUpdate: isReceivingRemoteUpdate,
            match: data.docId == currentDocId
        });
        
        if (data.docId == currentDocId) {
            const editor = document.getElementById('editor');
            const currentContent = editor.value;
            
            console.log('🔄 Content comparison:', {
                currentLength: currentContent.length,
                patchLength: data.patch.length,
                isDifferent: currentContent !== data.patch
            });
            
            if (currentContent !== data.patch && !isReceivingRemoteUpdate) {
                console.log('✅ Applying remote update');
                
                const cursorPos = editor.selectionStart;
                isReceivingRemoteUpdate = true;
                
                editor.value = data.patch;
                const newCursorPos = Math.min(cursorPos, data.patch.length);
                editor.setSelectionRange(newCursorPos, newCursorPos);
                
                setTimeout(() => {
                    isReceivingRemoteUpdate = false;
                }, 100);
                
                flashEditorBorder('success');
            } else {
                console.log('⏩ Skipping update - same content or receiving update');
            }
        } else {
            console.log('❌ Document ID mismatch - ignoring update');
        }
    });

    socket.on('document_saved', (data) => {
        console.log('💾 RECEIVED document_saved:', data);
        if (data.docId == currentDocId) {
            document.getElementById('lastSaved').textContent = 
                `Last saved: ${new Date(data.updatedAt).toLocaleString()}`;
            flashEditorBorder('info');
        }
    });

    socket.on('document_cursor', (data) => {
        console.log('🎯 RECEIVED cursor update:', data);
    });

    // Add error handling
    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        updateConnectionStatus('Connection Failed', 'text-danger');
    });
}

function flashEditorBorder(type) {
    const editor = document.getElementById('editor');
    const originalBorder = editor.style.border;
    
    if (type === 'success') {
        editor.style.border = '2px solid #28a745';
    } else if (type === 'info') {
        editor.style.border = '2px solid #17a2b8';
    }
    
    setTimeout(() => {
        editor.style.border = originalBorder || '1px solid #ddd';
    }, 500);
}

function updateConnectionStatus(status, className) {
    const statusEl = document.getElementById('editorStatus');
    statusEl.textContent = status;
    statusEl.className = `small ${className}`;
}

async function loadDocuments() {
    try {
        console.log('📂 Loading documents for project:', projectId);
        const data = await listDocuments(projectId);
        console.log('📂 Documents loaded:', data.documents);
        renderDocumentList(data.documents);
    } catch (err) {
        console.error('❌ Failed to load documents:', err);
        document.getElementById('fileList').innerHTML = 
            '<div class="text-danger">Failed to load documents</div>';
    }
}

function renderDocumentList(documents) {
    const fileList = document.getElementById('fileList');
    
    if (documents.length === 0) {
        fileList.innerHTML = '<div class="text-muted">No documents yet</div>';
        return;
    }

    fileList.innerHTML = documents.map(doc => `
        <div class="doc-item ${doc.id === currentDocId ? 'active' : ''}" 
             data-doc-id="${doc.id}" data-doc-title="${doc.title}">
            <div class="font-weight-bold">${doc.title}</div>
            <small class="text-muted">Updated: ${new Date(doc.updated_at).toLocaleDateString()}</small>
            <div class="real-time-indicator" id="indicator-${doc.id}" style="display: none;">
                <small class="text-success">● Live</small>
            </div>
        </div>
    `).join('');

    fileList.querySelectorAll('.doc-item').forEach(item => {
        item.addEventListener('click', () => openDocument(
            item.dataset.docId, 
            item.dataset.docTitle
        ));
    });
}

async function openDocument(docId, docTitle) {
    try {
        console.log('📖 Opening document:', { docId, docTitle, currentDocId });
        
        // Leave previous document room
        if (currentDocId && socket) {
            console.log('🚪 Leaving previous room:', currentDocId);
            socket.emit('leave_document', { docId: currentDocId });
            const prevIndicator = document.getElementById(`indicator-${currentDocId}`);
            if (prevIndicator) prevIndicator.style.display = 'none';
        }

        const data = await getDocument(projectId, docId);
        currentDocId = Number(docId);
        
        // Update UI
        document.getElementById('docTitle').textContent = docTitle;
        
        const editor = document.getElementById('editor');
        editor.value = data.document.content || '';
        editor.disabled = false;
        editor.focus();
        
        document.getElementById('lastSaved').textContent = 
            `Last saved: ${new Date(data.document.updated_at).toLocaleString()}`;

        // Update active document in list
        document.querySelectorAll('.doc-item').forEach(item => {
            const isActive = Number(item.dataset.docId) === currentDocId;
            item.classList.toggle('active', isActive);
            
            const indicator = document.getElementById(`indicator-${item.dataset.docId}`);
            if (indicator) {
                indicator.style.display = isActive ? 'block' : 'none';
            }
        });

        // Join document room for real-time collaboration
        if (socket) {
            console.log('🚪 Joining room:', currentDocId);
            socket.emit('join_document', { docId: currentDocId });
            updateConnectionStatus('Connected - Collaborative', 'text-success');
            
            const indicator = document.getElementById(`indicator-${currentDocId}`);
            if (indicator) indicator.style.display = 'block';
        }

        console.log('✅ Document opened successfully');

    } catch (err) {
        console.error('❌ Failed to open document:', err);
        alert('Failed to load document');
    }
}

function setupEventListeners() {
    // Create document
    document.getElementById('createDocBtn').addEventListener('click', () => {
        console.log('📝 Opening create document modal');
        $('#createDocModal').modal('show');
    });

    document.getElementById('createDocSubmit').addEventListener('click', async () => {
        const title = document.getElementById('newDocTitle').value.trim();
        if (!title) {
            alert('Title required');
            return;
        }

        try {
            const result = await createDocument(projectId, title);
            console.log('✅ Document created:', result);
            
            $('#createDocModal').modal('hide');
            document.getElementById('newDocTitle').value = '';
            
            await openDocument(result.document.id, result.document.title);
            loadDocuments();
            
        } catch (err) {
            console.error('❌ Failed to create document:', err);
            alert('Failed to create document: ' + (err.message || 'Unknown error'));
        }
    });

    document.getElementById('viewMembersBtn')?.addEventListener('click', () => {
        const listContainer = document.getElementById('projectMembersList');
        $('#projectMembersModal').modal('show');

        if (projectMembers.length === 0) {
            listContainer.innerHTML = '<div class="p-3 text-muted">No members found</div>';
            return;
        }

        // Render the list (already loaded in memory!)
        listContainer.innerHTML = projectMembers.map(m => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-user-circle text-gray-400 mr-2"></i>
                    <span class="font-weight-bold">${m.username}</span>
                    <div class="small text-muted ml-4">${m.email}</div>
                </div>
                <span class="badge badge-${m.role === 'owner' ? 'primary' : 'secondary'}">
                    ${m.role}
                </span>
            </div>
        `).join('');
    });

    // Save document
    document.getElementById('saveDocBtn').addEventListener('click', saveCurrentDocument);

    // Real-time editing
    const editor = document.getElementById('editor');
    let saveTimer = null;
    let editTimer = null;

    editor.addEventListener('input', (e) => {
        if (isReceivingRemoteUpdate) {
            console.log('🔄 Skipping emit - receiving remote update');
            return;
        }

        if (socket && currentDocId) {
            clearTimeout(editTimer);
            editTimer = setTimeout(() => {
                console.log('📤 SENDING edit_document:', {
                    docId: currentDocId,
                    patchLength: editor.value.length,
                    socketId: socket.id
                });
                socket.emit('edit_document', { 
                    docId: currentDocId, 
                    patch: editor.value 
                });
            }, 300);
        }

        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveCurrentDocument, 2000);
    });

    editor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentDocument();
        }
    });


     document.getElementById('inviteBtn').addEventListener('click', () => {
        $('#inviteModal').modal('show');
    });

    document.getElementById('inviteSubmit').addEventListener('click', async () => {
        const email = document.getElementById('inviteEmail').value.trim();
        const role = document.getElementById('inviteRole').value;

        if (!email) {
            alert('Email is required');
            return;
        }

        try {
            const result = await inviteToProject(projectId, email, role);
            alert('Invitation sent successfully!');
            $('#inviteModal').modal('hide');
            document.getElementById('inviteEmail').value = '';
            
        } catch (err) {
            console.error('Failed to send invitation:', err);
            alert('Failed to send invitation: ' + err.message);
        }
    });
}

async function saveCurrentDocument() {
    if (!currentDocId) {
        alert('No document selected to save');
        return;
    }

    const content = document.getElementById('editor').value;
    
    try {
        console.log('💾 Saving document:', { docId: currentDocId, contentLength: content.length });
        await saveDocument(projectId, currentDocId, content);
        
        if (socket) {
            console.log('📤 SENDING save_document');
            socket.emit('save_document', { docId: currentDocId, content });
        }
        
        document.getElementById('lastSaved').textContent = 
            `Last saved: ${new Date().toLocaleString()}`;
        
        console.log('✅ Document saved successfully');
            
    } catch (err) {
        console.error('❌ Failed to save document:', err);
        alert('Failed to save document');
    }
}

// Enhanced debug function
window.debugCollaboration = function() {
    console.log('=== 🔍 COLLABORATION DEBUG INFO ===');
    console.log('Project ID:', projectId);
    console.log('Current Doc ID:', currentDocId, '(Type:', typeof currentDocId, ')');
    console.log('Socket Connected:', isConnected);
    console.log('Socket ID:', socket?.id);
    console.log('Receiving Remote Update:', isReceivingRemoteUpdate);
    console.log('Editor Content Length:', document.getElementById('editor').value.length);
    console.log('==================================');
};

// Test real-time manually
window.testRealTime = function() {
    if (!socket || !currentDocId) {
        console.error('❌ Socket not connected or no document open');
        return;
    }
    
    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
    console.log('🧪 Sending test message:', testMessage);
    
    socket.emit('edit_document', {
        docId: currentDocId,
        patch: testMessage
    });
};

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert('Please log in first');
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

async function loadMembers() {
    try {
        const data = await getProjectMembers(projectId);
        projectMembers = data.members || [];
        
        // Update the button text
        const countSpan = document.getElementById('memberCountBadge');
        if (countSpan) {
            countSpan.textContent = `${projectMembers.length} Members`;
        }
        
    } catch (err) {
        console.error("Failed to load members:", err);
    }
}
