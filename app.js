const express = require('express');
const socketIO = require('socket.io');
var app = express();
const http = require('http');
const server = http.createServer(app);



// 어떤 방에 어떤 유저가 들어있는지
let users = {};
// socket.id기준으로 어떤 방에 들어있는지
let socketRoom = {};

// 방의 최대 인원수
const MAXIMUM = 2;


const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 클라이언트가 연결될 때 실행되는 이벤트 핸들러
io.on('connection', (socket) => {
    console.log('새로운 클라이언트가 연결되었습니다.');
    console.log(`User Connected: ${socket.id}`);
    console.log("socketRoom");
    console.log(socketRoom);
    console.log("users");
    console.log(users);



    socket.on("join_room", (data) => {

        console.log("join_room");
        console.log(users[data.room]);

        // 방이 기존에 생성되어 있다면
        if (users[data.room]) {
            console.log("방이 있는 경우");

            // 현재 입장하려는 방에 있는 인원수
            const currentRoomLength = users[data.room].length;
            console.log("currentRoomLength : ");
            console.log(currentRoomLength);

            if (currentRoomLength === MAXIMUM) {
                // 인원수가 꽉 찼다면 돌아갑니다.
                socket.to(socket.id).emit("room_full");
                return;
            }

            // 여분의 자리가 있다면 해당 방 배열에 추가해줍니다.
            users[data.room] = [...users[data.room], { id: socket.id }];
            socketRoom[socket.id] = data.room;

            console.log(users[data.room]);
            console.log(socketRoom);
        } else {
            console.log("방이 없는 경우");


            // 방이 존재하지 않다면 값을 생성하고 추가해줍시다.
            users[data.room] = [{ id: socket.id }];
            socketRoom[socket.id] = data.room;

            console.log("users");
            console.log(users);
            console.log("socketRoom");
            console.log(socketRoom);
        }


        console.log("유저 누구 잇니?");
        console.log(users);
        console.log(socketRoom);
        console.log(socket);


        // 입장
        socket.join(data.room);

        console.log("유저 누구 잇니? 2");
        console.log(socket);


        // 입장하기 전 해당 방의 다른 유저들이 있는지 확인하고
        // 다른 유저가 있었다면 offer-answer을 위해 알려줍니다.
        const others = users[data.room].filter((user) => user.id !== socket.id);
        console.log("others");
        console.log(others);
        console.log(others.length);

        if (others.length) {
            console.log("유저 누구 잇니?");
            console.log(socket.id);

            //나중에 들어온놈한테 전송함. 반대측의 피어를 알려주는 것 
            io.sockets.to(socket.id).emit("all_users", others);
        }
    });



    socket.on("offer", (sdp, roomName) => {
        console.log("offer");
        console.log(sdp);
        console.log("offer");



        // offer를 전달받고 다른 유저들에게 전달해 줍니다.
        socket.to(roomName).emit("getOffer", sdp);
    });

    // Answer를 전달받을 때 실행되는 이벤트 핸들러
    socket.on("answer", (sdp, roomName) => {
        console.log("answer");
        console.log(sdp);
        console.log("answer");

        // answer를 전달받고 방의 다른 유저들에게 전달해 줍니다.
        socket.to(roomName).emit("getAnswer", sdp);
    });

    // ICE candidate를 전달받을 때 실행되는 이벤트 핸들러
    socket.on("candidate", (candidate, roomName) => {
        console.log("candidate");
        console.log(candidate);
        console.log(roomName);

        // candidate를 전달받고 방의 다른 유저들에게 전달해 줍니다.
        socket.to(roomName).emit("getCandidate", candidate);
    });

    // 클라이언트와의 연결이 끊겼을 때 실행되는 이벤트 핸들러
    socket.on("disconnect", () => {
        console.log('클라이언트가 끊어졌습니다.');
        console.log(`User Connected: ${socket.id}`);

        console.log(socketRoom);
        console.log(users);
        console.log("@@@@");
        console.log(socketRoom[socket.id]);
        console.log(socket.id);



        // 방을 나가게 된다면 socketRoom과 users의 정보에서 해당 유저를 지워줍니다.
        const roomID = socketRoom[socket.id];
        console.log(`roomID: ${roomID}`);


        if (users[roomID]) {
            users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
            if (users[roomID].length <= 1) {
                delete users[roomID];
                delete socketRoom[socket.id];

                console.log("지우고 난 후 ");
                console.log(users);
                console.log(socketRoom);

                return;
            }
        }
        socket.broadcast.to(users[roomID]).emit("user_exit", { id: socket.id });
    });
});

server.listen(3000, function () {
    console.log("Express server has started on port 3000")
});



