const http = require("http")
const Socket = require("websocket").server
const server = http.createServer(()=>{})

/**
 * 소켓에 이름 생성하여 통화할 수 있도록 하는 websocket 코드
 * 
 * 
*/


server.listen(3000,()=>{
    
})

//소켓 생성
const webSocket = new Socket({httpServer:server})

//유저 리스트
const users = []


//연결 시작
webSocket.on('request',(req)=>{
    const connection = req.accept()
   

    connection.on('message',(message)=>{
        const data = JSON.parse(message.utf8Data)
        console.log("data");
        console.log(data);
        const user = findUser(data.name)
       
        switch(data.type){
            case "store_user": // 유저 등록
                if(user !=null){
                    //our user exists
                    connection.send(JSON.stringify({
                        type:'user already exists'
                    }))
                    return

                }

                const newUser = {
                    name:data.name, conn: connection
                }

                // console.log("newUser");
                // console.log(newUser);
                users.push(newUser)
            break

            case "start_call": //해당 유저와 전화 시작
                let userToCall = findUser(data.target)

                //자신에게 다시 보내주는 부분
                if(userToCall){
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is ready for call"
                    }))
                } else{
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is not online"
                    }))
                }

            break
            
            case "create_offer": //전화 받은 사람이 offer 전송
                let userToReceiveOffer = findUser(data.target)

                if (userToReceiveOffer){

                    //해당 유저의 conn으로 전송함. 상대방에게 보내주는 것.
                    userToReceiveOffer.conn.send(JSON.stringify({
                        type:"offer_received",
                        name:data.name,
                        data:data.data.sdp
                    }))
                }
            break
                
            case "create_answer": //최적의 경로를 찾으면 서버에게 알려주어 서로 주고 받도록 함. 
                let userToReceiveAnswer = findUser(data.target)
                if(userToReceiveAnswer){
                    userToReceiveAnswer.conn.send(JSON.stringify({
                        type:"answer_received",
                        name: data.name,
                        data:data.data.sdp
                    }))
                }
            break

            case "ice_candidate":
                let userToReceiveIceCandidate = findUser(data.target)
                if(userToReceiveIceCandidate){
                    userToReceiveIceCandidate.conn.send(JSON.stringify({
                        type:"ice_candidate",
                        name:data.name,
                        data:{
                            sdpMLineIndex:data.data.sdpMLineIndex,
                            sdpMid:data.data.sdpMid,
                            sdpCandidate: data.data.sdpCandidate
                        }
                    }))
                }
            break


        }

    })
    
    connection.on('close', () =>{
        users.forEach( user => {
            if(user.conn === connection){
                users.splice(users.indexOf(user),1)
            }
        })
    })





})

const findUser = username =>{
    for(let i=0; i<users.length;i++){
        if(users[i].name === username)
        return users[i]
    }
}