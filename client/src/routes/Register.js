 
import React, { useState , useEffect} from "react";
import Axios from "axios";
import {Link} from 'react-router-dom';
import Toast from 'react-bootstrap/Toast'
import {Row, Form, Button, Col, Image} from 'react-bootstrap';

////Register page of our website
//// registerUsername is the entered username by the user
//// registerPassword is the entered password by the user

//// authMsg is the flash message which may be show if 
//// user enters a used username or empty username or empty password

const Register = (props) => {
    const [registerUsername, setRegisterUsername] = useState("");
  	const [registerPassword, setRegisterPassword] = useState("");
  	const [authMsg, setAuthMsg] = useState("");
  	const [showAuthMsg, setShowAuthMsg] = useState(false);
	const [showPassword, setShowPassword]=useState(false);
	
	const handleShowPassword = () =>{
		setShowPassword(!showPassword);
	}

	////function to register user from the server after he has entered the information
    //// if all the information is valid redirect him to login page else display the flash message
  	const register = () => {
	    Axios({
			method: "POST",
			data: {
			username: registerUsername,
			password: registerPassword,
			},
			withCredentials: true,
			url: "/register",
      	}).then(function (response) {
        	setAuthMsg(response.data.message);
        	setShowAuthMsg(true);
        	if (response.data.redirect == '/') {
            	props.history.push(`/`);
        	} 
			else if(response.data.redirect == '/login') {
				props.history.push(`/auth/login`);
			}
     	});
  	};
   
  	////when a user requests for the register , we check if he is already logged in
    ////If user is already logged in redirect him to home page else
    ////send the register page to let him register
  	useEffect ( () => {
      
    	Axios({
      		method: "GET",
      		withCredentials: true,
      		url: "/register",
      	}).then(function (response) {
			setAuthMsg(response.data.message);
        	setShowAuthMsg(true);
        	if (response.data.redirect == '/') {
            	props.history.push(`/`);
        	} 
     	}); 

  	}, []);



  	return (
    <>
    <Row style={{ marginLeft: "0px",marginRight: "0px"}}>
        <Col >
        	<div>
				<br/>
				<br/>
				<br/>
				<Form style={{width:"80%", marginLeft:"10%", marginTop:"10%"}}>
            		<h1>Register</h1>
            		<Toast onClose={() => setShowAuthMsg(false)} show={showAuthMsg} delay={2000} autohide>
          
              			<Toast.Body>{authMsg}</Toast.Body>
            		</Toast>
                	<Form.Group >
                    	<Form.Label>Enter a unique username</Form.Label>
                    	<Form.Control type="username" placeholder="Type your username here ..." 
						onChange={(e) => setRegisterUsername(e.target.value)} />
                	</Form.Group>
                	<Form.Group >
	                    <Form.Label>Enter your password</Form.Label>
                    	<Form.Control type={showPassword?"text":"password"} placeholder="Enter your password"  
						onChange={(e) => setRegisterPassword(e.target.value)}/>
                	</Form.Group>
					<Form.Group controlId="formBasicCheckbox">
	 					<Form.Check type="checkbox" label="Show Password" onClick={handleShowPassword} />
  					</Form.Group>
                	<Button  onClick={register}>Submit</Button>
                	<br />
                	<br />
                	<div>Already have an account? Login Now...</div>
                	<br />
                	<Link to="/auth/login"><Button >Login</Button></Link>
            	</Form>
        	</div>
        </Col>
        
        <Col >
        	<br />
        	<Row>
        		<Col>
        			<h2>Microsoft Teams</h2>
					<h5>A Video Conferencing Website</h5>
          		</Col>
          		<Col md={{ span: 3, offset: 3 }}>
          
          			<Link to="/auth/login"><Button >Login</Button></Link>
    
        		</Col>
        	</Row>
        	<div>
           		<Image src="https://thumbs.dreamstime.com/z/video-conference-people-group-computer-screen-taking-colleague-conferencing-online-communication-vector-concept-153955307.jpg" thumbnail style={{border:"none"}} /> 
        	</div>
        </Col>
    </Row>
    </>
  );
}
 
export default Register;