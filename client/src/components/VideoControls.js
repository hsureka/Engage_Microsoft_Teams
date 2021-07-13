import React,{useState, useRef} from 'react';
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Button from 'react-bootstrap/Button'

////This code deals with mute unmute, video on-off ,screen sharing and screen recording logic

////muteUnmute is the function to mute and unmute ourselves.
//// play pause is the function to turn our video on and off
////screenSharing resembels whether currently screen is being shared or not 
////handleShareScreen is the function to share our screen
////screenRecording resembels whether currently screen is being recorded or not
////handleScreenRecord is the function to record our screen
////disableControlButton is used to enable and disable video control buttons 
////showVideo used to toggle between writing pad and video of all peers

const VideoControls = ({muteUnmute, playPause,handleShareScreen, screenSharing, 
	 disableControlButton,videoIcon, micIcon,screenRecording, handleScreenRecord ,showVideo, isVideo}) => {
	
	return (  
		<>
			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						{micIcon.current?'Mute':'UnMute'}
					</Tooltip>
				)}
			>
				<span className="video-controls">
					<Button variant='light' disabled={disableControlButton} onClick={muteUnmute}>
						<i className={micIcon.current? 'mic fas fa-microphone' : 'mic fas fa-microphone-slash' }></i>
					</Button>
				</span>
			</OverlayTrigger>

			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						{videoIcon.current?'Turn  Off':'Turn On'}
					</Tooltip>
				)}
			>
				<span className="video-controls">
					<Button variant='light' disabled={disableControlButton} onClick={playPause}>
						<i className={videoIcon.current? 'cam fas fa-video' : 'cam fas fa-video-slash' }></i>
					</Button>
				</span>
			</OverlayTrigger>

			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						{screenSharing?'Stop Sharing':'Share Screen'}
					</Tooltip>
				)}
			>
				<span className="video-controls">
					<Button variant='light' disabled={disableControlButton} onClick={handleShareScreen}>
						<i className={screenSharing? 'far fa-window-close':'fas fa-desktop' }></i>
					</Button>
				</span>
			</OverlayTrigger>

			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						{screenRecording?'Stop Recordinging':'Record'}
					</Tooltip>
				)}
			>
				<span className="video-controls">
					<Button variant={screenRecording?'danger':'light'} disabled={disableControlButton} 
					onClick={handleScreenRecord}>

						<i className="fas fa-record-vinyl"></i>
						
					</Button>
				</span>
			</OverlayTrigger>
			<OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
				overlay={(props) => (
					<Tooltip id="button-tooltip" {...props}>
						{isVideo?'Show Pad':'Show Video'}
					</Tooltip>
				)}
			>
				<span className="video-controls">
					<Button variant={isVideo?'light':'warning'} disabled={disableControlButton} onClick={showVideo}>
						<i className='fas fa-pen-alt'></i>
					</Button>
				</span>
			</OverlayTrigger>
		</>
	);
}
 
export default VideoControls;