import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'

//// emailTo is the email id to which we want to send the meet link to
//// sendMeetLink is the function in Room.js which handles the front end logic to send emailTo
//// showInviteSentAlert decides when the show the flash message

////We have used Toast to display a flash message when
////meeting link is successfuly emailed to entered user email

//// in this form user just needs to enter the email id of the person
//// to whom he want to send the meet link

const Emaillink = ({setEmailTo, sendMeetLink, emailTo, showInviteSentAlert, setShowInviteSentAlert} ) => {
    return ( 
    <Form onSubmit={sendMeetLink}> 
        <Toast onClose={() =>{ setShowInviteSentAlert(false); }} show={showInviteSentAlert} delay={2000} autohide>
            <Toast.Body>Invite link was sent successfully</Toast.Body>
        </Toast>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Paste Email to send invite link</Form.Label>
            <Form.Control type="email" placeholder="Invite via email" 
                value = {emailTo} onChange={(e)=> setEmailTo(e.target.value)}
            />
            <Form.Text className="text-muted">
            </Form.Text>
        </Form.Group>
    
        <Button variant="primary" type="submit">
            Invite
        </Button>
        </Form>
    );
}
 
export default Emaillink;