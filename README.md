Check the live website here :- 



Features of this Microsoft Teams Clone:-

1) Able to connect more than 2 peers at a time
2) User Authentication System
3) Invite participants via email by pasting their email id
4) Modertor's authority to accept/deny user's request to join room
5) Chat even before or after the meeting has begun or ended respectively
6) Mute/Unmute your microphone
7) Turn your video on/off
8) Share Screen with audio
9) Full Screen user's video when they share screen
10)Record the entire meeting 
11) View all participants by their username
12) Shareable Writing Pad
13) Chat with  users with text popup feature to view messages even if chat box is off
14) Automatic adjustement of size of video and its layout, when a user joins or leave the meeting.


Packages that I have used: 

For the server end using node js:- 
1) nodemailer - required to send meet link
2) socket.io  - required for successful connection between peers
3) mongoose   - mongo DB used to save users's account info
4) passport   - passport-local used for user authentication
5) bcryptjs   - used to encrypt user's password

For the client end using react:-
1) socket.io-client - to connect to socket io clinet side
2) simple-peer      - simple peer is the package that deals with the WebRTC part of website
3) axios            - used to post and get request from server
4) react-toastify   - used to display message popup to user if chat box is closed
