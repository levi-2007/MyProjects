
        // ==========================================
        // 🛠️ FIREBASE CONFIGURATION (YEKHANE URL LAGBE)
        // ==========================================
        const firebaseConfig = {
            apiKey: "AIzaSyBQnoC36eLALqfGlwcjXvaB5cZanQRYFkA",
            authDomain: "web-chat-app-30ead.firebaseapp.com",
            databaseURL: "https://web-chat-app-30ead-default-rtdb.firebaseio.com/", // <-- Firebase Realtime Database URL ekhane boshabe
            projectId: "web-chat-app-30ead",
            storageBucket: "web-chat-app-30ead.firebasestorage.app",
            messagingSenderId: "96758103589",
            appId: "1:96758103589:web:ccc8950b83e7c3987fc9cc"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        let myUserId = localStorage.getItem('chat_userId');
        let myName = localStorage.getItem('chat_userName');
        let currentChatId = null;
        let currentPartnerId = null;

        // Auto login if already saved in LocalStorage
        window.onload = () => {
            if (myUserId && myName) {
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainScreen').classList.remove('hidden');
                document.getElementById('myNameDisplay').innerText = myName;
                document.getElementById('myIdDisplay').innerText = myUserId;
                initApp();
            }
        };

        function loginUser() {
            const name = document.getElementById('usernameInput').value.trim();
            if (!name) return alert('Please enter your name!');

            myUserId = 'user_' + Math.random().toString(36).substr(2, 9);
            myName = name;

            localStorage.setItem('chat_userId', myUserId);
            localStorage.setItem('chat_userName', myName);

            // Save user to Firebase Database
            db.ref('users/' + myUserId).set({
                name: myName,
                status: 'online'
            });

            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainScreen').classList.remove('hidden');
            document.getElementById('myNameDisplay').innerText = myName;
            document.getElementById('myIdDisplay').innerText = myUserId;
            initApp();
        }

        function logout() {
            localStorage.clear();
            location.reload();
        }

        function initApp() {
            loadRequests();
            loadChats();
        }

        // Send Chat Request
        function sendRequest() {
            const receiverId = document.getElementById('searchIdInput').value.trim();
            if (!receiverId || receiverId === myUserId) return alert('Enter a valid User ID!');

            db.ref('users/' + receiverId).once('value').then(snapshot => {
                if (!snapshot.exists()) {
                    alert('User not found!');
                    return;
                }

                const requestId = [myUserId, receiverId].sort().join('_');
                db.ref('requests/' + requestId).set({
                    from: myUserId,
                    fromName: myName,
                    to: receiverId,
                    status: 'pending'
                });
                alert('Request sent successfully!');
                document.getElementById('searchIdInput').value = '';
            });
        }

        // Load Incoming Requests
        function loadRequests() {
            db.ref('requests').on('value', snapshot => {
                const requestsList = document.getElementById('requestsList');
                requestsList.innerHTML = '';
                
                snapshot.forEach(childSnap => {
                    const req = childSnap.val();
                    if (req.to === myUserId && req.status === 'pending') {
                        requestsList.innerHTML += `
                            <div class="p-2 flex justify-between items-center text-sm">
                                <span>${req.fromName}</span>
                                <button onclick="acceptRequest('${childSnap.key}', '${req.from}', '${req.fromName}')" class="bg-blue-500 text-white px-2 py-1 rounded text-xs">Accept</button>
                            </div>
                        `;
                    }
                });
            });
        }

        function acceptRequest(requestId, partnerId, partnerName) {
            db.ref('requests/' + requestId).update({ status: 'accepted' });
            
            // Create chat room mapping
            const chatId = [myUserId, partnerId].sort().join('_');
            db.ref('chats/' + chatId + '/members').set({
                [myUserId]: myName,
                [partnerId]: partnerName
            });
        }

        // Load Accepted Chats
        function loadChats() {
            db.ref('chats').on('value', snapshot => {
                const chatsList = document.getElementById('chatsList');
                chatsList.innerHTML = '';

                snapshot.forEach(childSnap => {
                    const chat = childSnap.val();
                    if (chat.members && chat.members[myUserId]) {
                        const partnerId = Object.keys(chat.members).find(id => id !== myUserId);
                        const partnerName = chat.members[partnerId];

                        chatsList.innerHTML += `
                            <div onclick="openChat('${childSnap.key}', '${partnerId}', '${partnerName}')" class="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
                                <span class="font-medium text-sm text-gray-700">${partnerName}</span>
                            </div>
                        `;
                    }
                });
            });
        }

        // Open Chat Window
        function openChat(chatId, partnerId, partnerName) {
            currentChatId = chatId;
            currentPartnerId = partnerId;

            document.getElementById('noChatSelected').classList.add('hidden');
            document.getElementById('activeChatContainer').classList.remove('hidden');
            document.getElementById('chatHeaderName').innerText = partnerName;

            loadMessages();
        }

        // Load Messages in Real-time
        function loadMessages() {
            const msgBox = document.getElementById('messagesBox');
            db.ref('chats/' + currentChatId + '/messages').on('value', snapshot => {
                msgBox.innerHTML = '';
                snapshot.forEach(childSnap => {
                    const msg = childSnap.val();
                    const isMe = msg.sender === myUserId;
                    msgBox.innerHTML += `
                        <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                            <div class="max-w-xs px-4 py-2 rounded-lg text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}">
                                ${msg.text}
                            </div>
                        </div>
                    `;
                });
                msgBox.scrollTop = msgBox.scrollHeight;
            });
        }

        function sendMessage() {
            const text = document.getElementById('messageInput').value.trim();
            if (!text || !currentChatId) return;

            db.ref('chats/' + currentChatId + '/messages').push({
                sender: myUserId,
                text: text,
                timestamp: Date.now()
            });

            document.getElementById('messageInput').value = '';
        }

        function handleKeyPress(e) {
            if (e.key === 'Enter') sendMessage();
        }
