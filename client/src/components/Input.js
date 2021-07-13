import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

////It deals with sending of entered messgae to all
////other users present in the same room

//// messageText is the contained message which user wants to send to the room
//// sendMessage is the function that manages the fronend logic to send message
//// in the form user just types the message he want to send to the current room

const Input = ({ setMessageText, sendMessage, messageText }) => {
    return (
        <Form className="chatForm" onSubmit={sendMessage}> 
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label></Form.Label>
                <Form.Control type="text" placeholder="Type here ..." 
                    value = {messageText} onChange={(e)=> setMessageText(e.target.value)}
                />
                <Form.Text className="text-muted">
                </Form.Text>
            </Form.Group>

            <Button variant="primary" type="submit">
                <i styles={{'float':'right'}} className="fas fa-paper-plane"></i>
            </Button>
        </Form>
    );
}

export default Input;