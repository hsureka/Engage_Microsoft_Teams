import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import io from "socket.io-client"; ////to connect to socket io clinet side
import Peer from "simple-peer";    ////simple peer is the package that deals with the WebRTC part of website
import styled from "styled-components";
import Dish from '../components/Videos';
import Axios from "axios";        ////used to post and get request from server
import {toast} from 'react-toastify';//// used to display message popup to user if chat box is closed
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../components/NavBar';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal' 

import $ from 'jquery';
toast.configure();

const Container = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    vertical-align: middle;
    position: sticky;
    width: 100%;
    height: 100%;
`;

////This is the brain of the website 

let myVideoStream;              ////stream of user's video
let screenShareTrack;           ////video track of user while sharing screen
let mediaRecorder;              ////media recorder used to record screen
let screenRecordTrack;          ////video track when user is recording screen 
let screenRecordAudioTrack;     ////audio track when user is recording screen 
let screenShareAudioTrack;     ////audio track when user is sharing screen 
let combinedScreenShareStream; ////combined stream of user's screen and user's audio

var tools = {};
var colorPicked="#ffffff";
var lineWidthPicked;

var canvas, context, canvaso, contexto;
var tool='pencil';
var tool_default = 'pencil';
var tool_select;

const Room = (props) => {
    const roomId = props.match.params.roomID;
    const myVideoStreamRef = useRef(null);
    const [isMeeting, setIsMeeting] = useState(false);      ////signfies whether meeting has started or not
    const [isModerator, setIsModerator] = useState(false);  ////signifies wether current user is moderator or not
    const [moderatorUserName, setModeratorUserName] = useState('');

    ////used to show alert to leave call to the user whose entrance was denied by moderator
    const [showAlertToDeniedUser, setShowAlertToDeniedUser] = useState(false);
    const handleCloseAlertToDeniedUser = () => setShowAlertToDeniedUser(false);
    
    const counter = useRef(-1);

    const [peers, setPeers] = useState([]);     ////list of arrays which contain peerID and stream of all other users
    const peersRef = useRef([]);               ////ref of peers 

    ////peers is used to update and render front end ,whenever a user leaves or joins a room
    ////peersRef is used to handle the logic ,whenever a user leaves or joins a room
    
    
    ////participants used to keep username of all other users in room
    const [participants, setParticipants] = useState([]); 

    const participantsRef = useRef([]);         ////ref of participants to hnadle logic, when a user leaves or join 
    
    const [userName, setUserName] = useState('');     //// username of the currentUser 
    let currentUser="";                                         

    const socketRef = useRef();               ////socket-id of current user on client side
    const userVideo = useRef();              ////video Element of  current user
    
    const [sideBar, setSideBar]  = useState(false);

    ////messageText is the text to be sent to the current room by currentUser 
    const[messageText, setMessageText] = useState(''); 

    const [allMessages, setAllMessages] = useState([]);     
    const showNotify=useRef(true);
    var pop="";                  ////stores information about the new received message and displays a popup 
    var today;                    //// used to get current time     
    const toastId = useRef(null); ////popup Id of the popup message
    
    //// Video Controls and Icons of respective control 
    const chatIcon = useRef(true);
    const [micOn, setMicOn] = useState(false);
	const [videoOn, setVideoOn] = useState(false);
    const[disableControlButton, setDisableControlButton] = useState(true);
    const micIcon = useRef(false);
	const videoIcon = useRef(false);
    const [disableChatLeave, setDisableChatLeave] = useState(true);
    const screenSharingRef=useRef(false);                       
    const[screenSharing, setScreenSharing] = useState(false); ////denotes whether screen is being shared or not

    const screenRecordingRef=useRef(false);                     
    const[screenRecording, setScreenRecording] = useState(false);////denotes whether screen is being recorded or not
    const recordedChunks= useRef([]);      ////array to store chunks of stream during screen recording 

    const[emailTo, setEmailTo] = useState('');                 
    const [showInviteSentAlert, setShowInviteSentAlert] = useState(false);                

    
    const [colorDisable, setColorDisable] = useState(true);
    const [fontColour, setFontColour]=useState('#ffffff');
    const [isVideo, setIsVideo] = useState(true);
    
    const [dimensions, setDimensions] = useState({ 
        height: window.innerHeight,
        width: window.innerWidth
    })
    
    useEffect(() => {
        function handleResize() {
            setDimensions({
              height: window.innerHeight,
              width: window.innerWidth
            })
          
        }

        window.addEventListener('resize', handleResize);
        
        ////To check if the user is logged in or not, if not redirect him to login page
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/login",
            }).then(function (response) {
                if (response.data.redirect === '/login') {    
                    window.location = "/auth/login"
                }
                else{
                    currentUser=(response.data.userName);
                }
              
           
            socketRef.current = io.connect("/");

            ////used to get user's stream with video and audio
            navigator.mediaDevices.getUserMedia
            ({ video: true, audio: true })
            .then(stream => {

                userVideo.current.srcObject = stream;
                myVideoStream = stream;   
                myVideoStreamRef.current=stream;
                ////Initially user's video is offf and is muted
                myVideoStream.getVideoTracks()[0].enabled = false;
                myVideoStream.getAudioTracks()[0].enabled = false;

                ////if meeting has started, enable video control buttons
                if(isMeeting){
                    setDisableControlButton(false);
                }

                ////call to server side to enable user to join the requested room
                socketRef.current.emit("join", roomId, currentUser);
            
                ////called from the front end, if the current user has created the room, 
                ////made the current user moderator of this room
                socketRef.current.on("youAreModerator", () => {
                    setIsModerator(true);
                    setModeratorUserName(currentUser);
                });

                ////called for the moderator when a new user wants to join his room
                ////moderator may accept or deny his request
                socketRef.current.on('newUserWantsToJoin', (userToJoinName, id)=>{
                    notifyAlert(userToJoinName, id);
                });

                ////called when the new user is not allowed to join the room
                socketRef.current.on('notAllowed', ()=>{
                    setShowAlertToDeniedUser(true);
                });
            
                ////information about other users already present in the room sent from the server
                socketRef.current.on("otherUsers", (users, usersName, roomModeratorName, 
                    meetingStatus, trackMeeting) => {

                    setDisableChatLeave(false); ////allow to user to chat before, during and after the meeting
                    counter.current= trackMeeting;
                    setIsMeeting(meetingStatus);  ////status of meeting if already started or not
                    handleMeetingControls(meetingStatus); ////manage video control buttons depending on status of meeting

                    ////set username of moderator of the room
                    if(!isModerator){
                        setModeratorUserName(roomModeratorName);
                    }

                    const peers = [];          ////local peers
                    const participants =[];    ////local participants

                    users.forEach(userId => { ////store information and stream of all other users

                        ////new user creates a peer for every other user already in room
                        const peer = createPeer(currentUser, userId, socketRef.current.id, stream);

                        ////if user wants to share his screen , replace his video with screen for all other peers
                        if(screenSharingRef.current === true){
                            peer.replaceTrack(peer.streams[0].getAudioTracks()[0], 
                                                combinedScreenShareStream.getAudioTracks()[0], peer.streams[0] );
                            
                            peer.replaceTrack(peer.streams[0].getVideoTracks()[0], screenShareTrack, peer.streams[0] );
                        }

                        peersRef.current.push({
                            peerId: userId,
                            peer,
                        })

                        peers.push({
                            peerId: userId,
                            peer
                        })
                    })

                    usersName.forEach(userId=>{ ////store username of all other users
                        participantsRef.current.push({
                            participantId: userId.id, 
                            participantName: userId.name
                        })

                        participants.push({
                            participantId: userId.id, 
                            participantName: userId.name
                        })
                    })

                    setUserName(currentUser);
                    setPeers(peers);
                    setParticipants(participants);
                })
            
                ////called for the rest of the users already in room , when a new user joins
                ////user already in room, adds new user to the list of peers and participants
                socketRef.current.on("newUserJoined", data => {
                    ////using the new user socket id and signal, they create a new peer
                    const peer = addPeer(data.signal, data.newUserId, stream); 

                    ////if user is already sharing his screen , replace his video with screen for new peer
                    if(screenSharingRef.current === true){
                        peer.replaceTrack(peer.streams[0].getAudioTracks()[0], 
                                            combinedScreenShareStream.getAudioTracks()[0], peer.streams[0] );

                        peer.replaceTrack(peer.streams[0].getVideoTracks()[0], screenShareTrack, peer.streams[0] );
                    }

                    peersRef.current.push({
                        peerId: data.newUserId,
                        peer,
                    })

                    setPeers(users => [...users,
                        {
                            peerId: data.newUserId,
                            peer,
                        }
                    ])
                
                    participantsRef.current.push({
                        participantId: data.newUserId, 
                        participantName: data.sentBy
                    })    

                    setParticipants(users => [...users,{
                        participantId: data.newUserId, 
                        participantName: data.sentBy
                    }])

                });

                ////user already in room, receives a signal from new user and return him back his own signal
                socketRef.current.on("signalByUserInRoom", data => {
                    const item = peersRef.current.find(p => p.peerId === data.id);
                    item.peer.signal(data.signal);
                });

                ////called from server , when a new message has been sent to room
                socketRef.current.on('message', (receivedMessage, userId, sender, senderName)=>{
                    today=new Date();
                    if(userId !== sender){
                        onShowAlert({msg: receivedMessage, sender: senderName, 
                            hour:today.getHours(), minutes:today.getMinutes()});
                    }
                    else{
                        senderName = 'You';
                    }
                    setAllMessages(messages => [ ...messages, {msg: receivedMessage, 
                                        sender: senderName, hour:today.getHours(), minutes:today.getMinutes()}]);
                
                });

                ////called when meeting is started or ended by the moderator
                socketRef.current.on('meeting', (metingStatus)=>{
                    setIsMeeting(metingStatus);
                    handleMeetingControls(metingStatus);
                });

                ////called when a user disconnects from the room 
                socketRef.current.on('userDisconnected', (leftUserId , closeMeeting, trackMeeting) =>{
                    counter.current= trackMeeting;
                    
                    ////close the meeting if moderator was the user who disconnected
                    if(closeMeeting){
                        setIsMeeting(false);
                        handleMeetingControls(false);
                    }

                    const leftPeerObj = peersRef.current.find(p => p.peerId === leftUserId);
                    if(leftPeerObj){
                        //destroying all the connections attached to this user
                        leftPeerObj.peer.destroy();
                    }
                    
                    ////other users removes the user who has left from their peer and participants array

                    const pers = peersRef.current.filter(p => p.peerId !==leftUserId);
                    peersRef.current = pers;
                    setPeers(pers);
                
                    const updateParticipants = participantsRef.current.filter(p => p.participantId !== leftUserId);
                    participantsRef.current = updateParticipants;
                    setParticipants(updateParticipants);
                
                });

                ////////////////Start of Drawing Pad code

                // Find the canvas element.
                canvaso = document.getElementById('imageView');
                // Get the 2D canvas context.
                contexto = canvaso.getContext('2d');

                // Add the temporary canvas.
                var container = canvaso.parentNode;

                canvas = document.createElement('canvas');
                
                canvas.id     = 'imageTemp';
                canvas.width  = canvaso.width;
                canvas.height = canvaso.height;
                container.appendChild(canvas);

                context = canvas.getContext('2d');

                tool_select = document.getElementById('pencil-button');

                //tool_select.addEventListener('change', ev_tool_change, false);
                
                //Choose colour picker
                
                
                //Choose line Width
                lineWidthPicked = $("#line-Width").val();
                    
                $("#line-Width").change(function(){
                    lineWidthPicked = $("#line-Width").val();
                });
                
                
                if (tools[tool_default]) {
                tool = new tools[tool_default]();
                tool_select.value = tool_default;
                }
                
                function pic_tool_click(pick){
                    console.log('pick.value=', pick.value);
                    if (tools[pick.value]) {
                    tool = new tools[pick.value]();
                    console.log(tool);
                    }
                }
                
                $("#pencil-button").click(function(){
                    setColorDisable(false);
                    console.log('pencil selected');
                    console.log('this=', this);
                    pic_tool_click(this)
                });
                
                
                $("#text-button").click(function(){
                    pic_tool_click(this)
                });

                // limit the number of events per second
            function throttle(callback, delay) {
                var previousCall = new Date().getTime();
                return function() {
                var time = new Date().getTime();

                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
                };
            }

                // Attach the mousedown, mousemove and mouseup event listeners.
                canvas.addEventListener('mousedown', ev_canvas, false);
                //canvas.addEventListener('mousemove', ev_canvas, false);
                canvas.addEventListener('mousemove', throttle(ev_canvas, 10), false);
                canvas.addEventListener('mouseup',   ev_canvas, false);
            

            // The general-purpose event handler. This function just determines the mouse 
            // position relative to the canvas element.
            function ev_canvas (ev) {
                //console.log(ev)
                var CanvPos = canvas.getBoundingClientRect();  //Global Fix cursor position bug
                if (ev.clientX || ev.clientX == 0) { // Firefox
                //ev._x = ev.clientX;
                ev._x = ev.clientX - CanvPos.left;
                // ev._x = ev.layerX;
                //ev._y = ev.clientY;
                ev._y = ev.clientY - CanvPos.top;
                //ev._y = ev.layerY;
                } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                //ev._x = ev.offsetX;
                //ev._y = ev.offsetY;
                }
                
                // Call the event handler of the tool.
                var func = tool[ev.type];
                if (func) {
                func(ev);
                }
                //Hide textbox if not equals to text tool

                
            }
            
            
            // This function draws the #imageTemp canvas on top of #imageView, after which 
            // #imageTemp is cleared. This function is called each time when the user 
            // completes a drawing operation.
            function img_update(trans) {
                    contexto.drawImage(canvas, 0, 0);
                    context.clearRect(0, 0, canvas.width, canvas.height);
            //        console.log(tool)
                    if (!trans) { return; }

                    socketRef.current.emit('copyCanvas', {
                    transferCanvas: true
                    });
            }
            
                function onCanvasTransfer(data){
                        img_update();
                }
            
            socketRef.current.on('copyCanvas', onCanvasTransfer);

            

            // The drawing pencil.
            function drawPencil(x0, y0, x1, y1, color, linewidth, emit){
                    context.beginPath();
                    context.moveTo(x0, y0);
                    context.lineTo(x1, y1);
                    if(color)
                        context.strokeStyle = color;
                    else
                        context.strokeStyle = colorPicked; 
                    if(linewidth)
                        context.lineWidth = linewidth;
                    else
                        context.lineWidth = lineWidthPicked;
                    context.stroke();
                    context.closePath();

                    if (!emit) { return; }
                    var w = canvaso.width;
                    var h = canvaso.height;

                    socketRef.current.emit('drawing', {
                    x0: x0 / w,
                    y0: y0 / h,
                    x1: x1 / w,
                    y1: y1 / h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                    });
                }
                
                function onDrawingEvent(data){
                    var w = canvaso.width;
                    var h = canvaso.height;
                    drawPencil(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
                }
                
                socketRef.current.on('drawing', onDrawingEvent);
            
            
            tools.pencil = function () {
                var tool = this;
                this.started = false;

                // This is called when you start holding down the mouse button.
                // This starts the pencil drawing.
                this.mousedown = function (ev) {
                    //context.beginPath();
                    //context.moveTo(ev._x, ev._y);
                    tool.started = true; 
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                };

                // This function is called every time you move the mouse. Obviously, it only 
                // draws if the tool.started state is set to true (when you are holding down 
                // the mouse button).
                this.mousemove = function (ev) {
                if (tool.started) {
                    drawPencil(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                }
                };

                // This is called when you release the mouse button.
                this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
                };
            };
            
            
            //Text Tool start
            

            // Text tool's text container for calculating
            // lines/chars
            var tmp_txt_ctn = document.createElement('div');
            tmp_txt_ctn.style.display = 'none';
            container.appendChild(tmp_txt_ctn);



            function clearAll_update(trans) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                contexto.clearRect(0, 0, canvaso.width, canvaso.height);
                
                    if (!trans) { return; }

                    socketRef.current.emit('Clearboard', {
                    CleardrawingBoard: true
                    });
            }
            
            function onClearAll(data){
                        clearAll_update();
                }

            socketRef.current.on('Clearboard', onClearAll);

            $("#clear-all").click(function(){
                context.clearRect(0, 0, canvas.width, canvas.height);
                contexto.clearRect(0, 0, canvaso.width, canvaso.height);
                clearAll_update(true)
            });



                ///////////////End of Drawing Pad code
            
            }); 
     
        });

    }, []);

    const handleStartMeeting = (() =>{ ////when the moderator wants to start or end the meeting
        socketRef.current.emit('meeting', !isMeeting); 
    });

    const handleAdmitNewUser = ((userNameToJoin, id)=>{ ////when moderator accepts new user's request to join room
        toast.dismiss(id);
        socketRef.current.emit('admitUserToRoom',roomId, userNameToJoin,id);
    });

    const handleDenyNewUser = ((userNameToJoin, id)=>{ ////when moderator cancels new user's request to join room
        toast.dismiss(id);
        socketRef.current.emit('denyUserToRoom',roomId, userNameToJoin,id);
    });

    const notifyAlert =(userToJoinName, id) => { ////popup called for the moderator, when a new user requested to join
        toast(
            <>
                <div>{userToJoinName} wants to join the room.</div>
                <br />
                <Button variant="primary" onClick={()=>{handleAdmitNewUser(userToJoinName, id)}}>
                    Admit
                </Button>
                <Button variant="secondary" onClick={()=>{handleDenyNewUser(userToJoinName, id)}}>
                    Deny
                </Button>
            </>
            , {
            toastId: id,
            position:toast.POSITION.TOP_CENTER,
            autoClose:false,
            hideProgressBar: true,
            closeOnClick: true,
            closeButton:false,
            closeOnClick:false
        });
    }

    ////deals with the video control buttons, depending on meeting status
    const handleMeetingControls =( (metingStatus) =>{ 
        if(metingStatus){
            setDisableControlButton(false);
        }
        else{
            console.log('screenSharingRef.current=', screenSharingRef.current);
            console.log('meeting will be close');
            setDisableControlButton(true);
            if(screenSharingRef.current){
                console.log('so stop sharing screen');
                setScreenSharing(false);
                screenSharingRef.current=false;
                stopShareScreen();
            }
            
            setMicOn(false);
            micIcon.current=false;
            myVideoStream.getAudioTracks()[0].enabled = false;

            setVideoOn(false);
            videoIcon.current=false;
            myVideoStream.getVideoTracks()[0].enabled = false;

            setIsVideo(true);

        }
    });

    function createPeer(sentBy, userToSignal, newUserId, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });
        ////new user signals to user already in room
        peer.on("signal", signal => {
            socketRef.current.emit("sendSignal", { userToSignal, newUserId, signal, sentBy })
        })

        return peer;
    }

    function addPeer(incomingSignal, newUserId, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })
        ////user already in room signals back to new user who has joined the meeting
        peer.on("signal", signal => {
            socketRef.current.emit("returnSignal", { signal, newUserId });
            
        })
        ////user already in room accepts incoming signal from new user
        peer.signal(incomingSignal);

        return peer;
    }

    const handleSidebar= (()=>{ //// to open and close chat drawer
        if(sideBar){
            setSideBar(false);
            ////when sideBar is close, any new message in room, should also be shown as a popup message
            showNotify.current=true; 
            chatIcon.current=true; 
        }
        else{
            setSideBar(true);
            showNotify.current=false;
            chatIcon.current=false;
        }
    })

    const sendMessage = (event) => { ////to handle logic when currentUser wants to send a message to the room
        event.preventDefault();
        if(messageText.length > 0){
            socketRef.current.emit('sendMessage',messageText);
        }
        setMessageText('');
    }

    const onShowAlert = (receivedMessage)=>{ ////to dispaly a popup meesage when a new message is sent to room
        pop=receivedMessage;
        if(showNotify.current)   notify();
    }

    const CustomToast = () =>{  ////handles what to dispaly in popup message, sender, message and time when he sent
        return(
            <>
                <div>{pop.sender} {pop.hour}:{pop.minutes}</div>
                <br />
                <div>{pop.msg}</div>
            </>
        )
    }

    const notify =() => { ////called to invoke a popup message for the current user
        if(! toast.isActive(toastId.current)) {
                toastId.current = toast(<CustomToast/>, {
                    position:toast.POSITION.TOP_CENTER,
                    hideProgressBar: true,});
        }
        else{
            toast.update(toastId.current, {
                render: CustomToast,
                autoClose: 5000,
                hideProgressBar: true,
            });
            
        }
    }

    const muteUnmute = () => { ////to mute and unmute current user
        const enabled = myVideoStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            setMicOn(false);
            micIcon.current=false;
        } else {
            myVideoStream.getAudioTracks()[0].enabled = true;
            setMicOn(true);	
            micIcon.current=true;
        }
    }

    const playPause = () => { ////to turn video on and off current user
        let enabled = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            setVideoOn(false);
            videoIcon.current=false;
        } else {
            myVideoStream.getVideoTracks()[0].enabled = true;
            setVideoOn(true);	
            videoIcon.current=true;
        }
    }

    const sendMeetLink = (event) => { //// to handle logic to send meet link to entered email id
        event.preventDefault();
        socketRef.current.emit('serverSendMeetLink',emailTo,window.location.href);
        setEmailTo('');
        setShowInviteSentAlert(true);
        //event.target.elements.
    }

    const shareScreen = () => { ////when current user requests to share his screen

        ////get display of user's screen
        navigator.mediaDevices.getDisplayMedia({
            video:{
                cursor:'always'
            },
            audio:{
                echoCancellation:true,
                noiseSuppressions:true
            }
        }).then((stream) => {
            setScreenSharing(true);
            screenSharingRef.current=true;
            userVideo.current.srcObject = stream;
            screenShareTrack = stream.getVideoTracks()[0];
            screenShareAudioTrack = stream.getAudioTracks()[0];
            const tracks = [
                ...stream.getVideoTracks(), 
                ...mergeAudioStreams(stream, myVideoStreamRef.current)
            ];
            combinedScreenShareStream = new MediaStream(tracks);

            ////Replace his webcam stream with sreen stream for every other peer currently in room
            ////Replace his audio with sreen audio and his own audio for every other peer currently in room
            peersRef.current.forEach(peer=>{
                peer.peer.replaceTrack(peer.peer.streams[0].getAudioTracks()[0], 
                                        combinedScreenShareStream.getAudioTracks()[0], peer.peer.streams[0] );

                peer.peer.replaceTrack(peer.peer.streams[0].getVideoTracks()[0], screenShareTrack, peer.peer.streams[0] );
            });

            ////on end of screen share, replace screen stream with user's webcam video
            ////on end of screen share, replace screen audio + user's audio with  only user's audio
            screenShareTrack.onended = function() {
                setScreenSharing(false);
                if(screenShareAudioTrack){
                    screenShareAudioTrack.stop();
                }
                screenSharingRef.current=false;
                userVideo.current.srcObject =myVideoStream ;
                peersRef.current.forEach(peer=>{
                    peer.peer.replaceTrack(peer.peer.streams[0].getAudioTracks()[0],
                                             myVideoStream.getAudioTracks()[0], peer.peer.streams[0] );

                    peer.peer.replaceTrack(peer.peer.streams[0].getVideoTracks()[0], 
                                                myVideoStream.getVideoTracks()[0], peer.peer.streams[0] );
                });
            }
        })
    }

    const stopShareScreen =() =>{ ////handle the request to stop screen sharing
        if(screenShareTrack){
            if(screenShareAudioTrack){
                screenShareAudioTrack.stop();
            }
            screenShareTrack.stop();
            userVideo.current.srcObject =myVideoStream ;
            peersRef.current.forEach(peer=>{
                peer.peer.replaceTrack(peer.peer.streams[0].getAudioTracks()[0],
                                             myVideoStream.getAudioTracks()[0], peer.peer.streams[0] );

                peer.peer.replaceTrack(peer.peer.streams[0].getVideoTracks()[0], 
                                            myVideoStream.getVideoTracks()[0], peer.peer.streams[0] );
            });
        }
    }

    const handleShareScreen = () =>{
        if(screenSharingRef.current){
            setScreenSharing(false);
            screenSharingRef.current=false;
            stopShareScreen();
        }
        else{
            shareScreen();
        }
    }

    const stopScreenRecord =(()=>{ ////to stop screen recording
        if(screenRecordAudioTrack)  screenRecordAudioTrack.stop();
        mediaRecorder.stop();
        mediaRecorder.onstop = ()=>{
            setScreenRecording(false);
            screenRecordingRef.current=false;
            
            const blob = new Blob ((recordedChunks.current), {
                type:"video/webm"
            });
            recordedChunks.current=[];
            const filename = window.prompt('Enter file name'); // input filename from user for download
            const url = URL.createObjectURL(blob); // create download link for the file

            ////automatically initiate downloading after recording stops
            const fileDownload= document.createElement("a");
            document.body.appendChild(fileDownload);
            fileDownload.style = "display:none";
            fileDownload.href=url;
            fileDownload.download = `${filename}.mp4`;
            fileDownload.click();
        }
    });

    ////To merge desktop audio stream and User Auido Stream 
    const mergeAudioStreams = (desktopStream, voiceStream) => {
        const context = new AudioContext();
        const destination = context.createMediaStreamDestination();
        let hasDesktop = false;
        let hasVoice = false;
        if (desktopStream && desktopStream.getAudioTracks().length > 0) {
          // If you don't want to share Audio from the desktop it should still work with just the voice.
            const source1 = context.createMediaStreamSource(desktopStream);
            const desktopGain = context.createGain();
            desktopGain.gain.value = 0.7;
            source1.connect(desktopGain).connect(destination);
            hasDesktop = true;
        }
        
        if (voiceStream && voiceStream.getAudioTracks().length > 0) {
            const source2 = context.createMediaStreamSource(voiceStream);
            const voiceGain = context.createGain();
            voiceGain.gain.value = 0.7;
            source2.connect(voiceGain).connect(destination);
            hasVoice = true;
        }
          
        return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
    };
    

    const screenRecord = () => { ////to allow user to record screen when requested
        navigator.mediaDevices.getDisplayMedia({
            video:{
                cursor:'always'
            },
            audio:{
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        }).then((stream) => {
            setScreenRecording(true);
            screenRecordingRef.current=true;
            screenRecordTrack = stream.getVideoTracks()[0];
            screenRecordAudioTrack = stream.getAudioTracks()[0];
            /////////
            const tracks = [
                ...stream.getVideoTracks(), 
                ...mergeAudioStreams(stream, myVideoStreamRef.current)
              ];
              
            let combinedStream = new MediaStream(tracks);

            ///////////
            mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            mediaRecorder.start(1000);

            ////chunks of stream is saved in recordedChunks array
            mediaRecorder.ondataavailable =  function (e){
                recordedChunks.current.push(e.data);
            }

            screenRecordTrack.onended = function() {
                stopScreenRecord();
            }

        });
    }

    const handleScreenRecord = () =>{
        if(screenRecordingRef.current){
            screenRecordTrack.stop();
            stopScreenRecord();
        }
        else{
            screenRecord();
        }
    }

    const showVideo = () =>{
        setIsVideo(!isVideo);
    }

    const leaveCall = ()=>{ ////handle when the current user leaves the room

        ////close the meeting if moderator left the room
        if(isModerator){
            socketRef.current.emit('meeting', false);
        }

        socketRef.current.close();
        if(myVideoStream)       myVideoStream.getVideoTracks()[0].stop();
        if(screenSharingRef.current){
            setScreenSharing(false);
            screenSharingRef.current=false;
            stopShareScreen();
        }
        if(screenRecordingRef.current){
            screenRecordTrack.stop();
            stopScreenRecord();
        }
        props.history.push(`/`);
    }

    return (
        <>
        
        <NavBar allMessages={allMessages} messageText={messageText} setMessageText={setMessageText} 
        sendMessage={sendMessage} muteUnmute = {muteUnmute} playPause = {playPause} leaveCall={leaveCall} 
        handleShareScreen={handleShareScreen} screenSharing={screenSharing} emailTo={emailTo}  setEmailTo={setEmailTo} 
        sendMeetLink={sendMeetLink} participants={participants} userName={userName}  
        showInviteSentAlert={showInviteSentAlert} setShowInviteSentAlert={setShowInviteSentAlert} 
        sideBar={sideBar} setSideBar={setSideBar} handleSidebar={handleSidebar} chatIcon={chatIcon} micOn={micOn} 
        videoOn={videoOn} disableControlButton={disableControlButton} micIcon={micIcon} videoIcon={videoIcon} 
        disableChatLeave={disableChatLeave} isModerator={isModerator} moderatorUserName={moderatorUserName}
        handleStartMeeting={handleStartMeeting} isMeeting={isMeeting} handleScreenRecord={handleScreenRecord} 
        screenRecording={screenRecording} isVideo={isVideo} showVideo={showVideo}
         />
        <div id='video-dish'>
            <Container>
                <Modal show={showAlertToDeniedUser} onHide={handleCloseAlertToDeniedUser} backdrop="static" keyboard={false}>
                    <Modal.Header >
                        <Modal.Title>Moderator denied your request to join the room</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={leaveCall}>
                            Leave Room
                        </Button>
                    </Modal.Footer>
                </Modal>

            <br/>
            {(!isMeeting) && <h1>
                {(counter.current==-1)?'Waiting for Moderator to let you in':'Meeting hasnt started'}
            </h1>}
            <br/>
        
        
                <Dish  peers={peers} userVideo = {userVideo} isMeeting={isMeeting} isVideo={isVideo} />
            </Container>
        </div>
        
        <div class="container" hidden={!isMeeting || isVideo }>
            <Button style={{margin: '5px'}}  variant="warning" value="pencil" id="pencil-button">Click Me to Draw</Button>
            <Button style={{margin: '5px'}} variant="warning" value="pencil" id="clear-all">Clear All</Button>
            <label for="colour" style={{position:'absolute'}}>Colour : </label>
            <input style={{margin: '5px'}} disabled={colorDisable} type="color" id="colour-picker" value={fontColour} style={{width:'80px'}}  onChange={(e) => {setFontColour(e.target.value); colorPicked=e.target.value; console.log('fontCpolor=', fontColour)}}></input>
            <span style={{margin: '5px'}} class="form-group" style={{width: '90px',display: 'inline-block'}}>
                <label for="line-Width">Thickness: </label>
                <select class="form-control" id="line-Width">
                    <option>2</option>
                    <option>4</option>
                    <option>6</option>
                    <option>8</option>
                    <option>10</option>
                    <option>12</option>
                    <option>14</option>
                </select>
            </span>
      
            <div id="container">
                <canvas id="imageView" width="1000" height="500">
                    <p>Unfortunately, your browser is currently unsupported by our web
                    application.  We are sorry for the inconvenience. Please use one of the
                    supported browsers listed below, or draw the image you want using an
                    offline tool.</p>
                    <p>Supported browsers: <a href="http://www.opera.com">Opera</a>, <a
                    href="http://www.mozilla.com">Firefox</a>, <a
                    href="http://www.apple.com/safari">Safari</a>, and <a
                    href="http://www.konqueror.org">Konqueror</a>.</p>
                </canvas>
            </div>
        </div>

    </>
    );
};

export default Room;
