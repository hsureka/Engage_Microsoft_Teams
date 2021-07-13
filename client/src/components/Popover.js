import React, { useState } from 'react';
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Emaillink from './Emaillink'
import Participants from './Participants'

////This code deals with Inviting participants by sending link
////and viewing participants already present in meeting

////participants is an array of usernames of all other users in the current room
////username is the array of the current user
////moderatorUserName is the username of the moderator
////isModerator to check whether current user is the moderator
//// emailTo is the email id to which we want to send the meet link to
//// sendMeetLink is the function in Room.js which handles the front end logic to send emailTo
//// showInviteSentAlert decides when the show the flash message

const PopOver = ({participants, userName, setEmailTo, sendMeetLink, emailTo, 
						showInviteSentAlert, setShowInviteSentAlert, isModerator,moderatorUserName}) => {
  
  ////popoverOpen resembles whether Popover is currenty open or not
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const toggle = () => setPopoverOpen(!popoverOpen);
    
  
  return (
      
    <div>
    	<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
    		overlay={(props) => (
  			<Tooltip id="button-tooltip" {...props}>
    			Invite/View Participants
  			</Tooltip>
  			)}
  		>
			<div className='participants' style={{fontSize: '1.25em',padding: '0.95em 0'}}>
			  	<Button variant='light' id="Popover1"><i className="fas fa-users" ></i></Button></div>
  		</OverlayTrigger>

      	<Popover placement="bottom" isOpen={popoverOpen} target="Popover1" toggle={toggle}>
        	<PopoverBody>
        		<Tabs defaultActiveKey="participants" id="uncontrolled-tab-example">
  				
				  	<Tab eventKey="Invite" title="Invite">
						<Emaillink emailTo={emailTo}  setEmailTo={setEmailTo} sendMeetLink={sendMeetLink} 
							showInviteSentAlert={showInviteSentAlert} setShowInviteSentAlert={setShowInviteSentAlert}/> 
  					</Tab>
  
  					<Tab eventKey="participants" title="Participants">
  						<Participants participants={participants} userName={userName} 
						  isModerator={isModerator} moderatorUserName={moderatorUserName}/>
  					</Tab>
				</Tabs>
        	</PopoverBody>
      </Popover>
    </div>
  );
}

export default PopOver;

