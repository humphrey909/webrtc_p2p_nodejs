const express = require('express');
const socketIO = require('socket.io');
var app = express();
const http = require('http');
const server = http.createServer(app);
// const sql = require("./models/db.js");
const {select_user} = require("./models/xc_call_user_state.model.js");


// (async () => {
//     data = await select_user();
//     console.log(data);
// })();


/**
 * 소켓에 이름 생성하여 통화할 수 있도록 하는 websocket 코드
 * socketIO로 변형 중
 * 
*/


server.listen(3000, () => {
    console.log("Express server has started on port 3000")
})

//소켓 생성
// const webSocket = new Socket({httpServer:server})

//유저 리스트 - 방에 어떤 유저가 들어있는지 룸 id, 회원 id, socket 정보
let users = {} // {'roomname': [ {idx:idx, socket:socket, idx:idx, socket:socket} ] }

//룸 리스트 - 추후에 찾는데 오래걸리면 따로 빼서 관리할 것
// const rooms = [] // {roomname:roomidx, num:count}


// 방의 최대 인원수
const MAXIMUM = 2;

const io = socketIO(server, {
    cors: {
        origin: ["http://54.180.104.245:80/", "*", "*:*"],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


        // 잘 불러오는 것 확인
        // console.log(users["30"]);
        // console.log(users["30"][0]['userid']);
        // console.log(users["30"][0]['socket']);

        //방에 유저 수 확인 users[data].length

        //잘 보내짐
        // io.sockets.to(socket.id).emit("test", JSON.stringify({
        //     userid:"3",
        //     room: "222",
        //     data:"123"
        // }));

        //해당방이 있는지 존재 여부 확인 가능
        // if(users["30"]){
        //     console.log("방 존재");
        //     users["35"] = [{ userid: data_json.userid, socket: socket.id }];
        // }else{
        //     console.log("방 미존재");
        //     users["30"] = [{ userid: data_json.userid, socket: socket.id }];
        // }

io.on('connection', (socket) => {
    console.log('새로운 클라이언트가 연결되었습니다.');
    console.log(`User Socket Connected: ${socket.id}`);


    //방 매칭되기 위해 찾는 명령어 - start, userid, null, null
    socket.on("start", (data) => {
        const data_json = JSON.parse(data)


        //start, userid, null, null
        //userid가 입장한 방이 있는지 체크 -> 있으면 반환 error 처리
        //없으면

        //room리스트에 유저가 몇명인지 체크 -> 1명 있는 방이 있는지 찾음 
        //있으면 -? 그 방에 입장 -> enter로 요청한사람에게만 전송 -> 이때 offer 생성하여 전송 시작 
        //없으면 -? 새로운 방 생성하여 그 방에 입장 -> create로 요청한 사람에게 전송 -> 대기
        console.log("data 정보");
        console.log(data_json);
        console.log(data_json.userid);

        console.log("users 정보 리스트");
        console.log(users);


        // 방이 기존에 생성되어 있다면
        if (Object.keys(users).length != 0) {
            console.log("방 존재");

            var room_rest_state = 0; //룸 남은 상태 
            var idx = 0;


            //이슈
            //1. idx++; 안으로 변경해서 고침 
            // 남는 방 찾는 로직 따로 함수로 빼서 만들기, 시작할때마다 실행
            //

            //room리스트에 유저가 몇명인지 체크 -> 1명 있는 방이 있는지 찾음 
            for (var room in users) {

                if (users[room].length == 1) { //1명 있는 방이 있는지 찾음
                    idx++;

                    //첫번째 있는 방에 입장. 
                    if (idx == 1) {
                        // console.log(idx); // idx
                        // console.log(room, users[room]); // 유저 내용
                        // console.log(users[room].length); // 방 입장 수

                        //해당 룸에 입장 
                        users[room] = [...users[room], { userid: data_json.userid, socket: socket.id }];

                        socket.join(room);
                        console.log("room join");
                        console.log(socket.rooms);
                        console.log("room join");

                        io.sockets.to(socket.id).emit("enter", JSON.stringify({
                            userid: data_json.userid,
                            room: room,
                            data: null
                        }));

                        room_rest_state = 1;
                    }
                }
            }

            //1명 있는 방이 없는 경우. (다 꽉찬 경우) -> 룸 생성
            if (room_rest_state == 0) {
                // let roomName = createRoom();
                users["41"] = [{ userid: data_json.userid, socket: socket.id }];

                socket.join("41");
                console.log("room join");
                console.log(socket.rooms);
                console.log("room join");

                io.sockets.to(socket.id).emit("create", JSON.stringify({
                    userid: data_json.userid,
                    room: "41",
                    data: null
                }));
            }
        } else {
            console.log("방 미존재");

            //존재하지 않는 방 이름 생성
            // let roomName = createRoom();
            users["40"] = [{ userid: data_json.userid, socket: socket.id }];

            socket.join("40");
            console.log("room join");
            console.log(socket.rooms);
            console.log("room join");

            io.sockets.to(socket.id).emit("create", JSON.stringify({
                userid: data_json.userid,
                room: "40",
                data: null
            }));
        }

        // users[data] = [...users[data], { id: socket.id }];

        console.log("users 정보 파싱");
        console.log(users);
        console.log(Object.keys(users).length); // 방 전체 갯수 불러옴

        console.log("users 내용 불러오기");
        for (var prop in users) {
            console.log(prop, users[prop]); // 유저 내용
            console.log(users[prop].length); // 방 입장 수
        }
    });

    //sdp 전송
    socket.on("create_offer", (data) => {
        const data_json = JSON.parse(data)
        console.log("create_offer data 정보");
        console.log(data_json);

        console.log(data_json.userid);
        console.log(data_json.room);
        // console.log(data_json.data);
        console.log("data 정보");

        let other_user = findUser(data_json)
        console.log("other_user");
        console.log(other_user);

        if (other_user) {
            socket.to(other_user.socket).emit("offer_received", JSON.stringify({
                userid: data_json.userid,
                room: data_json.room,
                data: data_json.data.sdp
            }));
        }
    });
    //sdp 전송
    socket.on("create_answer", (data) => {
        const data_json = JSON.parse(data)
        console.log("create_answer data 정보");
        console.log(data_json);


        let other_user = findUser(data_json)
        console.log("other_user");
        console.log(other_user);

        if (other_user) {
            socket.to(other_user.socket).emit("answer_received", JSON.stringify({
                userid: data_json.userid,
                room: data_json.room,
                data: data_json.data.sdp
            }));
        }
    });
    //ice 전송
    socket.on("ice_candidate", (data) => {
        const data_json = JSON.parse(data)
        console.log("ice_candidate data 정보");
        console.log(data_json);

        let other_user = findUser(data_json)
        console.log("other_user");
        console.log(other_user);

        if (other_user) {
            socket.to(other_user.socket).emit("ice_candidate", JSON.stringify({
                userid: data_json.userid,
                room: data_json.room,
                data: {
                    sdpMLineIndex: data_json.data.sdpMLineIndex,
                    sdpMid: data_json.data.sdpMid,
                    sdpCandidate: data_json.data.sdpCandidate
                }
            }));
        }
    });
    socket.on("disconnect", () => {
        console.log('클라이언트가 끊어졌습니다.');
        console.log(`User disconnect: ${socket.id}`);

        for (var room in users) {
            console.log("삭제할 객체 찾는 중");
            console.log(room);
            console.log("삭제할 객체 찾는 중");

            for (var objs in users[room]) {

                //삭제할 객체 찾음
                if (users[room][objs]['socket'] == socket.id) {

                    //룸 전체에 전달
                    io.to(room).emit("delete_user", JSON.stringify({
                        userid: users[room][objs]['userid'],
                        room: room, // 방
                        data: null //삭제한 유저
                    }));

                    delete users[room][objs];
                    socket.leave(room);
                }
            }

            //방에 유저가 null이 나올 경우 전부 제거 후 저장.(delete를 했지만 자리를 찾아있는 경우)
            users[room] = users[room].filter((value) => users[room] != null)

            //방에 유저가 없는 경우 방 삭제
            if (users[room].length == 0) {
                delete users[room];
            }
        }



        console.log("삭제할 개체 검색");
        console.log(users);
        console.log("삭제할 개체 검색");


        //이슈1. 만들어진 방에만 회원이 있는경우 방에 있는 회원 끼리 매칭을 시켜줘야한다. 
        //이슈2. 상대방이 나가면 방에 알림을 줄것(완료) -> 리모트 회원 정보 초기화 진행 
        //이슈3. 




        // if (users[roomID]) {
        //     users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
        //     if (users[roomID].length <= 1) {
        //         delete users[roomID];
        //         delete socketRoom[socket.id];

        //         console.log("지우고 난 후 ");
        //         console.log(users);
        //         console.log(socketRoom);

        //         return;
        //     }
        // }
        // socket.broadcast.to(users[roomID]).emit("user_exit", { id: socket.id });
    });
});





//연결 시작
// webSocket.on('request',(req)=>{
//     const connection = req.accept()


//     connection.on('message',(message)=>{
//         const data = JSON.parse(message.utf8Data)
//         console.log("data");
//         console.log(data);
//         const user = findUser(data.name)

//         switch(data.type){
//             case "store_user": // 유저 등록
//                 if(user !=null){
//                     //our user exists
//                     connection.send(JSON.stringify({
//                         type:'user already exists'
//                     }))
//                     return

//                 }

//                 const newUser = {
//                     name:data.name, conn: connection
//                 }

//                 // console.log("newUser");
//                 // console.log(newUser);
//                 users.push(newUser)
//             break

//             case "start_call": //해당 유저와 전화 시작
//                 let userToCall = findUser(data.target)

//                 //해당 타겟에 보내주는 부분
//                 if(userToCall){
//                     connection.send(JSON.stringify({
//                         type:"call_response", data:"user is ready for call"
//                     }))
//                 } else{
//                     connection.send(JSON.stringify({
//                         type:"call_response", data:"user is not online"
//                     }))
//                 }

//             break

//             case "create_offer": //전화 받은 사람이 offer 전송
//                 let userToReceiveOffer = findUser(data.target)

//                 if (userToReceiveOffer){

//                     //해당 유저의 conn으로 전송함. 상대방에게 보내주는 것.
//                     userToReceiveOffer.conn.send(JSON.stringify({
//                         type:"offer_received",
//                         name:data.name,
//                         data:data.data.sdp
//                     }))
//                 }
//             break

//             case "create_answer": //최적의 경로를 찾으면 서버에게 알려주어 서로 주고 받도록 함. 
//                 let userToReceiveAnswer = findUser(data.target)
//                 if(userToReceiveAnswer){
//                     userToReceiveAnswer.conn.send(JSON.stringify({
//                         type:"answer_received",
//                         name: data.name,
//                         data:data.data.sdp
//                     }))
//                 }
//             break

//             case "ice_candidate":
//                 let userToReceiveIceCandidate = findUser(data.target)
//                 if(userToReceiveIceCandidate){
//                     userToReceiveIceCandidate.conn.send(JSON.stringify({
//                         type:"ice_candidate",
//                         name:data.name,
//                         data:{
//                             sdpMLineIndex:data.data.sdpMLineIndex,
//                             sdpMid:data.data.sdpMid,
//                             sdpCandidate: data.data.sdpCandidate
//                         }
//                     }))
//                 }
//             break


//         }

//     })

//     connection.on('close', () =>{
//         users.forEach( user => {
//             if(user.conn === connection){
//                 users.splice(users.indexOf(user),1)
//             }
//         })
//     })





// })


const findUser = data_json => {

    console.log("findUser");
    console.log(users[data_json.room]);

    var select_id = "";
    for (var idx in users[data_json.room]) {

        console.log(idx);
        console.log(users[data_json.room][idx]['userid']);
        if (users[data_json.room][idx]['userid'] == data_json.userid) {
            if (idx == 0) {
                select_id = users[data_json.room][1];
            } else {
                select_id = users[data_json.room][0];
            }
        }
    }
    return select_id
}

const createRoom = () => {
    //db에서 생성해서 idx 넣어주면 되지 않아? 
    // for (var prop in users) {
    //     console.log(prop, users[prop]); // 유저 내용
    //     console.log(users[prop].length); // 방 입장 수
    // }

    // return users[i]
}