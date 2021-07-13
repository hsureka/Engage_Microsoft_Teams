import React, { useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
////This code deals with arranging layout of multiple 
////video elements when a user joins or leave the conference

let Width,Height,Margin, max;


////used to calculate the best possible width of each video element
function Area(Increment, Count, width, height, margin = 10) {
    let i = 0;
    let w=0;
    let h = Increment * 0.75 + (margin * 2);
    while (i < (Count)) {
        if ((w + Increment) > width) {
            w = 0;
            h = h + (Increment * 0.75) + (margin * 2);
        }
        w = w + Increment + (margin * 2);
        i++;
    }
    if (h > height) return false;
    else return Increment;
}

let mystyle;

function setstyle (){
    mystyle = {       
    height: Height,
    width: Width,
    margin:Margin,
  };
}

////video element of other peers in the room
const Video = (props) => {
    const ref = useRef();
    const toggleFullScreen = (id) => {
        var el = document.getElementById(id);
        if (el.requestFullscreen) {
          	el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
          	el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          	el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
          	el.webkitRequestFullscreen();
        }
      };
    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);
    return (
        <div className='video-container'>
        <video id = { props.videoId } hidden={!(props.isMeeting) || !(props.isVideo)} className="camera" style={mystyle} playsInline autoPlay ref={ref} />
        
        <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						Full Screen
					</Tooltip>
				)}
			>
                <Button variant="primary" hidden={!(props.isMeeting) || !(props.isVideo)} className='player-buttons' onClick={()=>toggleFullScreen(props.videoId)}><i class="fas fa-expand"></i></Button>
			</OverlayTrigger>
        </div>
        
    );
}

////peers is the information and stream of other users int the room
////userVideo is video of the current userVideo
////isMeetiing resembles whether meeting has started or not
////isVideo indicates whether to display videos of all peers or writing pad
const Dish = ({peers,userVideo, isMeeting, isVideo}) => {

    ////uniquePeers is to ensure no peer information is duplicated in peers array
    const uniquePeers = peers.map(e => e['peerId'])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => peers[e]).map(e => peers[e]);      

    peers=uniquePeers;
    Margin = 2;
    
    Width =  window.innerWidth - (Margin * 2);
    Height = window.innerHeight - (Margin * 2);
    max = 0;
    let i = 1;

    while (i < 5000) {
        let w = Area(i, peers.length+1, Width, Height, Margin);
        if (w === false) {
            max =  i - 1;
            break;
        }
        i++;
    }
    max = max - (Margin * 2); //width
    Width=max-10;
    Height = (0.75*max)-7.5;
    setstyle();
    return ( 
        <>
        <div className='video-container'>
        <video hidden={!isMeeting || !isVideo} className="camera" style={mystyle} muted ref={userVideo} autoPlay playsInline />        
        </div>
        
        {peers.map((peer) => {
            return (
                <Video key={peer.peerId} videoId={peer.peerId} peer={peer.peer} isMeeting={isMeeting} isVideo={isVideo}/>
            );
        })}
        </>
     );
}
 
export default Dish;

