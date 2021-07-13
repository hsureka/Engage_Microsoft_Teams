////Begining of all the required modules

require('dotenv').config();
const nodemailer = require('nodemailer'); // required to mail meet link
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");  // socket io is required for successful connection between peers
const io = socket(server);
const path = require('path');
const mongoose = require("mongoose"); // mongo DB used to save users's account info
const cors = require("cors");
const passport = require("passport"); // passport-local used for user authentication
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");   // used to encrypt user's password
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./user");
const flash = require("express-flash");  


////End of all the required modules




////Starting of Code which deals with User Authentication


//Connecting server to MongDB
const dbURI ="mongodb+srv://harshit_787:Harshit@2503@cluster0.xli3t.mongodb.net/test";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  	.then(result => {
    	console.log("Mongoose Is Connected");
    	server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));
    })
  	.catch(err => console.log(err));

  
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

////cors is used to allow cross-origin request

app.use(
  	cors({
	    origin: "http://localhost:3000", 
    	methods: [ "GET", "POST" ],
    	credentials: true,
  	})
);

app.use(
    session({
      	secret: "secretcode",
      	resave: true,
      	saveUninitialized: true,
    })
);

app.use(cookieParser("secretcode"));

////Initializing local-passport for user authentication
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);
  
////Verifyication of password when a user tries to log in
app.post("/login",  (req, res, next) => { // req is request, res is response
    passport.authenticate("local", (err, user, info) => {
      	if (err) throw err;  
      	if (!user) {
        	var redir = {  message:"Incorrect Username or Wrong Password"};
        	return res.json(redir);
    	}
      	else {
        	req.logIn(user, (err) => {
          		if (err) throw err;
          		var redir = { redirect: "/" , message:"Login Successfully" , userName:req.user.username };
          		///// redir is the redirect information passed to front end react app.
          		return res.json(redir);
        	});
      	}
    })(req, res, next);
});


////When login page is requested by the user,
////we check if user is already logged in or not  
app.get('/login',  (req, res) => {
    if (req.isAuthenticated()) {
        var redir = { redirect: "/" , message:'Already Logged In', userName:req.user.username};
        return res.json(redir);
    }
    else{
      	var redir = { redirect: "/login", message:'Enter your credentials to Log In' };
        return res.json(redir);
    }
});


////When a new user tries to register to our website
app.post("/register",  (req, res) => {
    ////checking if another user with same username already exists
    User.findOne({ username: req.body.username }, async (err, doc) => {
      	if (err) throw err;
      	if (doc){ 
	        var redir = {  redirect: "/register", message:"User Already Exists"};
        	return res.json(redir);
    	} 
      	if (!doc) {
        	////username and password is required during creation of an account

        	if(req.body.username.length==0){
          		var redir = {  redirect: "/register", message:"Username cannot be empty"};
          		return res.json(redir);  
        	}
        	if(req.body.password.length==0){
          		var redir = {  redirect: "/register", message:"Password cannot be empty"};
          		return res.json(redir);  
        	}

        	////encryption of password using bcrypt
        	const hashedPassword = await bcrypt.hash(req.body.password, 10);
        	const newUser = new User({
          		username: req.body.username,
          		password: hashedPassword,
        	});
        	await newUser.save();
        	var redir = { redirect: "/login", message:"User Created"};
        	return res.json(redir);
    	}
    });
});

////Checking if user is already logged in or not
app.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        var redir = { redirect: "/", message:'Already Registered' };
        return res.json(redir);
    }
    else{
      	var redir = { redirect: "/register" , message:'Register Now'};
        return res.json(redir);
    }
});

////To get username of the logged in user
app.get("/user", (req, res) => {
    res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

//To Log Out of session
app.get('/logout', (req, res) => {
  	req.logOut() ;   // logOut function by Passport
  	req.session.destroy();
  	return res.status(200).json({message: 'LOGOUT_SUCCESS'});
})


////Ending of Code which deals with User Authentication




////Starting of code to send invite link on entering email

function sendMeetLink(toEmail, meetLink){

	const transporter = nodemailer.createTransport({
		service:"hotmail",
		auth: {
			user: "hsurekaengage@outlook.com", //email-id used to send meet link to entered email
			pass: "Engage@2021"               
		}
	});

	/////Body of the email sent to entered email id
	let options={
		from : "hsurekaengage@outlook.com",
		to : toEmail,
		subject: 'Join meeting at this link',
		text: meetLink,
	};


	transporter.sendMail(options, function(err, info){
		if(err){
			console.log(err);
			return;
		}
	})

}

////Ending of code to send invite link on entering email



////Starting of code to establish connection between users in same room

const allUsers ={};       ////all users who tried to enter our website
const usersByRoom = {};         ////user socket id  grouped by their roomId
const userRoom = {};      ////roomId of corresponding user is mapped using their their socket id
const usersNameIdByRoom ={};    ////user socket id and username  groupd by their roomId
const roomModerator={};   ////moderator of the room mapped by the roomId
const meetingStatus = {}; ////meeting status of the room, if true meeting is going on and vice-versa
const trackMeeting={};    //// Number given according to meeting status

io.on('connection', socket => {
    ////called when a new user tries to joins the room
    socket.on("join", (roomId, userName) => {
      
        allUsers[socket.id]=1; ////1 resembles they are present in room
        if (usersByRoom[roomId]) {
            //// if a room is already created, moderator decides who should be let in the meeting
            const currentRoomModerator = roomModerator[roomId].id;
            io.to(currentRoomModerator).emit("newUserWantsToJoin",userName, socket.id );  
        } 
		else {
            //// if a room is just created we make the person the moderator of the room
            usersByRoom[roomId] = [socket.id];
            usersNameIdByRoom[roomId] = [({id:socket.id, name:userName})];
            roomModerator[roomId] = {id:socket.id, name:userName};
            meetingStatus[roomId]=false;
            trackMeeting[roomId] = 0;
			////current user is the moderator and should be directly allowed to enter
			allowedToEnterRoom(roomId, userName, socket.id);
        }
    });

	//// called when the moderator has accepted new user's request to join meeting
	socket.on('admitUserToRoom', (roomId, userName, id) =>{
    	if(allUsers[id]==1){
			usersByRoom[roomId].push(id);
        	usersNameIdByRoom[roomId].push({id:id, name:userName});
			allowedToEnterRoom(roomId, userName, id);
    	}
	}); 


	//// called when the moderator denies the entry of new user
	socket.on('denyUserToRoom', (roomId, userName, id) =>{
		io.to(id).emit("notAllowed");
	}); 

	////called to initiate the procedure to enter the new user to the requested room
	const allowedToEnterRoom = ((roomId, userName, socketId) => {
    
        userRoom[socketId] = roomId;

        ////usersInCurrentRoom is an array of socket id of all 
        ////users in the same room except the new user
        const usersInCurrentRoom = usersByRoom[roomId].filter(id => id !== socketId);

        ////usersNameIDInCurrentRoom is an array of socket id 
        ////and name of all users in the same room except the new user
        const usersNameIdInCurrentRoom = usersNameIdByRoom[roomId].filter(userId => userId.id !== socketId);
        
		////call made to the front end to resemble current user is the moderator
		if((roomModerator[roomId].id) === socketId){
          	socket.emit("youAreModerator");  
        }

        
		////call made to front end to pass information of all other users in the room
        io.to(socketId).emit("otherUsers", usersInCurrentRoom, usersNameIdInCurrentRoom, 
					(roomModerator[roomId].name),meetingStatus[roomId], trackMeeting[roomId]);
	});

    ////handles the logic when a user sends message in the room
    socket.on('sendMessage', (message)=>{
        const roomId = userRoom[socket.id];
        const usersInCurrentRoom = usersByRoom[roomId];

        ////sender username is filtered out using their corresponding socket id
        const sender = usersNameIdByRoom[roomId].filter(userId => userId.id == socket.id);


		////call made to  front end to each user in the room to denote 
		//// that a new message was sent by a user( here sender)
        usersInCurrentRoom.forEach(userId=>{
            io.to(userId).emit('message',message,userId, socket.id, sender[0].name);
        });
    });

    ////handles the logic when a user enters email to send invite 
    socket.on('serverSendMeetLink', (emailTo, meetLink)=>{
        sendMeetLink(emailTo, meetLink);
    });

	////new user signals to all other users currently in room
    socket.on("sendSignal", data => {
        io.to(data.userToSignal).emit('newUserJoined', { signal: data.signal, newUserId: data.newUserId , 
			sentBy: data.sentBy});
    });

	////user currently in room signals back to the new user
    socket.on("returnSignal", data => {
        io.to(data.newUserId).emit('signalByUserInRoom', { signal: data.signal, id: socket.id });
    });

	////called when the moderator wants to start or end the meetingStatus[roomId]
	////and this should be reflected back to every other user in the room
    socket.on('meeting', meeting => {
      	const roomId = userRoom[socket.id];
      	const usersInCurrentRoom = usersByRoom[roomId];
      	meetingStatus[roomId]=meeting;
      	if(meeting) trackMeeting[roomId]=1; //1 resembles meeting is going on
      	else        trackMeeting[roomId]=0;	// 0 resembles meeting is  NOT going on
      	usersInCurrentRoom.forEach(userId=>{
        	io.to(userId).emit('meeting',meeting);
    	});
	})

	

	////when a user leaves the video conference
    socket.on('disconnect', () => {
      	allUsers[socket.id]=0;    ////0 resembles user has left the room
        const roomId = userRoom[socket.id];
		let currentRoomModerator = roomModerator[roomId];
        let room = usersByRoom[roomId];
        let roomUsersNameId = usersNameIdByRoom[roomId];
		var closeMeeting= false;
        if (room) {
			////we filter out the socket id of the user who is leaving the room from users array
            room = room.filter(id => id !== socket.id);
            usersByRoom[roomId] = room;

			////name and the socket id of the left user is filtered out
			let leftUser = roomUsersNameId.filter(userId => userId.id === socket.id);
			
			////we filter out the socket id of the user who is leaving the room from usersNameId array
            roomUsersNameId = roomUsersNameId.filter(userId => userId.id !== socket.id);
            usersNameIdByRoom[roomId]= roomUsersNameId;
			
			
			////We delete the current user from allUsers array
			delete allUsers[socket.id];
			
      
			
			//// To check if the moderator leaves the rrom, the meeting should be closed immediately
			if(currentRoomModerator.name === leftUser[0].name)	{
				meetingStatus[roomId]=false;
				trackMeeting[roomId]=2; ////2 resembles moderator has left the meeting
				closeMeeting = true;	////close meeting is set to true as user has left the meeting

				
			}

			////if there are no users left in the room, delete the 
			////roomId completely from our server from all arrays
			if(room.length == 0){
				delete usersByRoom[roomId];
				delete usersNameIdByRoom[roomId];
				delete roomModerator[roomId];
				delete meetingStatus[roomId];
				delete trackMeeting[roomId];
			}
			else{
				////call made  to frontEnd to signify that a user has left the meeting
			  room.forEach(userId=>{
				  io.to(userId).emit('userDisconnected', socket.id, closeMeeting,  trackMeeting[roomId]);
			  });
		  }
		}
    });

	////emiited for all other users when a user starts to draw something on pad
	socket.on('drawing', function(data){

		const roomId = userRoom[socket.id];
		const usersInCurrentRoom = usersByRoom[roomId].filter(id => id !== socket.id);
		usersInCurrentRoom.forEach(userId=>{
        	io.to(userId).emit('drawing', data);
    	});

	  });
	  
	  socket.on('copyCanvas', function(data){
		
		const roomId = userRoom[socket.id];
		const usersInCurrentRoom = usersByRoom[roomId].filter(id => id !== socket.id);
		usersInCurrentRoom.forEach(userId=>{
        	io.to(userId).emit('copyCanvas', data);
    	});
	  });
	  
	  ////enables when a user clicks on claer all, to clear the whiteboard.
	  socket.on('Clearboard', function(data){
		
		const roomId = userRoom[socket.id];
		const usersInCurrentRoom = usersByRoom[roomId].filter(id => id !== socket.id);
		usersInCurrentRoom.forEach(userId=>{
        	io.to(userId).emit('Clearboard', data);
    	});
	  });

});

////Ending of code to establish connection between users in same room


/////Logic which deals with deployement on Heroku

if(process.env.PROD){
    app.use(express.static(path.join(__dirname, './client/build')));
    app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname, './client/build/index.html'));
    });
}
