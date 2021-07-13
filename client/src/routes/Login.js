import React, { useState, useEffect } from "react";
import Axios from "axios";
import {Link} from 'react-router-dom';
import Toast from 'react-bootstrap/Toast'
import {Row, Form, Button, Col, Image} from 'react-bootstrap';

/////Login page of our website
//// loginUsername is the entered username by the user
//// loginPassword is the entered password by the user

//// authMsg is the flash message which may be show if 
//// user enters wrong user name or password



const Login = (props) => {
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [authMsg, setAuthMsg] = useState("");
    const [showAuthMsg, setShowAuthMsg] = useState(false);
    const [showPassword, setShowPassword]=useState(false);
	
	const handleShowPassword = () =>{
		setShowPassword(!showPassword);
	}

    ////function to authenticate user from the server after he has entered the credentials,
    //// if he is authorized redirect him to home page , otherwise dsiplay the flash message
    const login = () => {
        Axios({
            method: "POST",
            data: {
                username: loginUsername,
                password: loginPassword,
            },
            withCredentials: true,
            url: "/login",
        }).then(function (response) {
            setAuthMsg(response.data.message);
            setShowAuthMsg(true);
            if (response.data.redirect == '/') {
                props.history.push(`/`);
            } 
        });
    };


    ////when a user requests for the login , we check if he is already logged in
    ////If user is already logged in redirect him to home page else
    ////send the login page to enter credentials
    
    useEffect ( () => {
      
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/login",
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
                        <h1>Login</h1>
                        <Toast onClose={() => setShowAuthMsg(false)} show={showAuthMsg} delay={2000} autohide>
                            <Toast.Body>{authMsg}</Toast.Body>
                        </Toast>
                        <Form.Group >
                            <Form.Label>Enter your username</Form.Label>
                            <Form.Control type="username" placeholder="Type your username here ..." 
                            onChange={(e) => setLoginUsername(e.target.value)} />
                        </Form.Group>
                        <Form.Group >
                            <Form.Label>Enter your password</Form.Label>
                            <Form.Control type={showPassword?"text":"password"} placeholder="Enter your password"  
                            onChange={(e) => setLoginPassword(e.target.value)}/>
                        </Form.Group>
                        <Form.Group controlId="formBasicCheckbox">
 					        <Form.Check type="checkbox" label="Show Password" onClick={handleShowPassword} />
  				        </Form.Group>
                        <Button  onClick={login}>Submit</Button>
                        <br />
                        <br />
                        <div>Dont have an account? Register Now...</div>
                        <br />
                        <Link to="/auth/register"><Button >Register</Button></Link>
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
                        <Link to="/auth/register"><Button >Register</Button></Link>
    
                    </Col>
                </Row>
                <div>
                    <Image src="https://thumbs.dreamstime.com/z/video-conference-people-group-computer-screen-taking-colleague-conferencing-online-communication-vector-concept-153955307.jpg" 
                    thumbnail style={{border:"none"}} /> 
                </div>
            </Col>
        </Row>
        
        </>
     );
}

export default Login;