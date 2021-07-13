import React from 'react';
import ReactShadowScroll from 'react-shadow-scroll';

////This displays all the messages in the chat box
////and re renders whenever a new message is received

////ReactShadowScroll is used to scroll along the messages in the chat box.
//// allMessages is the list of all the messages in our current room
const Messages = ({ allMessages }) => {
   
  return (
    <>
    <div className="messagesChat">
      	<ReactShadowScroll>
        	<ul>
          		{allMessages.map((message, index) => 
					<li key={index}>
					<br />  
					{message.sender} {message.hour}:{message.minutes}
					<br />
					{message.msg}
					<br />
					</li>
        		)}
    		</ul>
  		</ReactShadowScroll>
  	</div>
    </>
  )
}

export default Messages;
