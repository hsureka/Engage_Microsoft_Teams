import React,{useRef} from 'react';
import '../styles/NavBar.css';
import PopOver from '../components/Popover';
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Messages from './Messages';
import Input from './Input';
import VideoControls from './VideoControls';
import Button from 'react-bootstrap/Button'

////This code handles navbar and chat box

////allMessages used to display all messages in

////setMessageText, sendMessage, messageText used to handle the message sent by a userName

////muteUnmute, playPause, handleShareScreen, screenSharing,screenRecording, handleScreenRecord,
////disableControlButtonhandles video controls after the meeting starts

////leaveCall handles the logic to leave the current room

////setEmailTo, sendMeetLink, emailTo used to send meet link to enterd email id
////showInviteSentAlert ,setShowInviteSentAlert used to display flash message after link has been sent 

////participants, userName, isModerator, moderatorUserName used to dispaly 
////all participants in current meeting and the moderator userName

////sideBar, handleSidebar used to open and close the chat drawer on click

////micOn, videoOn resembles the current status of microphone and webcam

////handleStartMeeting, isMeeting used to resemble wether a meeting has been started or not

////disableChatLeave is used to let users chat before and after meeting

////isVideo indicates wether we are viewing video of participants or on the writing pad

////showVideo is the function used to toggle between writting pad and videos of all users
const Navbar = ({allMessages,setMessageText, sendMessage, messageText,muteUnmute, playPause, leaveCall,showInviteSentAlert,
    handleShareScreen, screenSharing,setEmailTo, sendMeetLink, emailTo, participants, userName, setShowInviteSentAlert,
	sideBar, handleSidebar, chatIcon,micOn, videoOn,handleStartMeeting,isMeeting, disableControlButton,
	videoIcon, micIcon, disableChatLeave, isModerator, moderatorUserName, screenRecording, handleScreenRecord,
	showVideo, isVideo
}) => {
   
	

    return ( 
        <>
        <div>
        <header className="header">
          	<div className="navContainer">
          	<span className="logo" style={{color:"#fff"  , fontStyle:"italic" , fontWeight:"400"}}>Microsoft Teams</span>
			
			<VideoControls muteUnmute={muteUnmute} playPause={playPause} handleShareScreen={handleShareScreen} 
			screenSharing={screenSharing}  micOn={micOn} videoOn={videoOn} disableControlButton={disableControlButton} 
			micIcon={micIcon} videoIcon={videoIcon} handleScreenRecord={handleScreenRecord} 
			screenRecording={screenRecording} isVideo={isVideo} showVideo={showVideo}
			/>
           
  			<PopOver participants={participants} userName={userName} emailTo={emailTo}  setEmailTo={setEmailTo} 
			  sendMeetLink={sendMeetLink} showInviteSentAlert={showInviteSentAlert} 
			  setShowInviteSentAlert={setShowInviteSentAlert} isModerator={isModerator} 
			  moderatorUserName={moderatorUserName}/>

			{ isModerator && (<span  className="video-controls">
				<Button variant='light' disabled={disableChatLeave} onClick={handleStartMeeting}>
					<i  className="fas fa-handshake">
						{isMeeting?'End Meeting':'Start Meeting'}
					</i></Button></span>)}

  			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
    			overlay={(props) => (
  				<Tooltip id="button-tooltip" {...props}>
    				End Call
  				</Tooltip>
  				)}
  			>
				<span  className="video-controls"><Button variant='light'  
				disabled={disableChatLeave} onClick={leaveCall} id='leave'>Leave</Button></span>
  			</OverlayTrigger>

            <nav>
            	<div className="mainNav" style={sideBar ? { transform: "translateX(0)" } : null}>
                	<span>Chat</span>
                	
					<Messages allMessages={allMessages}  />
                	
					<Input messageText={messageText} setMessageText={setMessageText} sendMessage={sendMessage} />  

            	</div>
            </nav>


            <button disabled={disableChatLeave}
            	onClick = {handleSidebar}
              	className={`navToggle ${sideBar ? "open" : null}`}>
            
			
				<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
						overlay={(props) => (
							<Tooltip id="button-tooltip" {...props}>
								Chat
							</Tooltip>
						)}
					>
					<Button variant='light' disabled={disableChatLeave}>
						<i className={(chatIcon.current)?'fas fa-comment': 'fas fa-times'  }></i> </Button>
				</OverlayTrigger>
  			</button>
            
			<div onClick={handleSidebar} className={`overlay ${sideBar ? "open" : ""}`}/>
        </div>
    </header>
    <div className ="wrapper"></div>
    </div>
    </>
    );
}
 
export default Navbar;
