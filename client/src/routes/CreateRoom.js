import React, { useState , useEffect} from "react";
import Axios from "axios";
import { v1 as uuid } from "uuid";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import {Row,  Col, Image} from 'react-bootstrap';

////This is the home page of the website, which is user directed to the
////after he has been authenticated, where he is given 2 options whether
////to join an existing room or create a new one

////data represents username of the logged in username
////join room is the invitation link to which user must be redirected to
const CreateRoom = (props) => {
	const [userName, setUserName] = useState(null);
	const [joinRoomLink, setJoinRoomLink] = useState('');

	function create() {
		const roomId = uuid();
		props.history.push(`/room/${roomId}`);
	}

	////to get username of logged in user from the server
	const getUser = () => {
		Axios({
			method: "GET",
			withCredentials: true,
			url: "/user",
		}).then((res) => {
			setUserName(res.data);
		});
	};

	////to authenticate user before allowing him to enter the home page
	////if he is not redirect him to login page
	useEffect ( () => {
		Axios({
			method: "GET",
			withCredentials: true,
			url: "/login",
		}).then(function (response) {
			if (response.data.redirect == '/login') {
				props.history.push(`/auth/login`);
			} 
			else{
				getUser();
			}
		}); 
		
	}, []);
		
	////function to redirect user to the room , whose
	////invitation link the user has eneterd
	const joinRoomByLink = (event) => {
		event.preventDefault();
		var ind=0, c=0;
		var roomLinkUrl;
		for(var i =joinRoomLink.length; i>=0; i--){
			if(joinRoomLink[i]=='/')  c++;
			if(c==2)  {
				ind=i;  break;
			}
		}
		roomLinkUrl = joinRoomLink.substr(ind);
		props.history.push(roomLinkUrl);
					
	}

	////function to log out user of the website
	const handleLogOut = () =>{
		Axios({
			method: "GET",
			withCredentials: true,
			url: "/logout",
		}).then((res) => {
			props.history.push(`/auth/login`);
		});
	}

	return (
		<>
		<Row style={{ marginLeft: "0px",marginRight: "0px"}}>
			<Col >
				<div>
					<br/>
					<br/>
					<br/>
					<Form style={{width:"80%", marginLeft:"10%", marginTop:"10%"}}>
						<div>
						{userName ? <h1>Welcome Back {userName.username}</h1> : <h1>Welcome Back</h1>}
						<br />
						<br />
						</div>
						<div>Want to organise a conference?</div>
						<Button onClick={create}>Create room</Button>
						<br />
						<br />
						<Form onSubmit={joinRoomByLink}> 
							<Form.Group className="mb-3" controlId="formBasicEmail">
								<Form.Label>Want to join an existing conference?</Form.Label>
								<Form.Control type="text" placeholder="Enter your invite link here ..." 
									value = {joinRoomLink} onChange={(e)=> setJoinRoomLink(e.target.value)}
								/>
								<Form.Text className="text-muted"></Form.Text>
							</Form.Group>

							<Button variant="primary" type="submit">
								Join Room
							</Button>
						</Form>

						<br />
						<br />
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
					
						<Button onClick={handleLogOut}>
							Log Out
						</Button>
		
					</Col>
				</Row>
				<div>
					<Image src="https://thumbs.dreamstime.com/z/vector-employee-talk-video-call-laptop-diverse-colleagues-video-conferencing-home-man-having-video-call-meeting-189992748.jpg" 
						thumbnail style={{border:"none"}} /> 
				</div>
			</Col>
		</Row>
		</>
	);
};

export default CreateRoom;
