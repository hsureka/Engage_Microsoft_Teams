import React from 'react';

////The code to display username of all users currently in same room

////participants is an array of usernames of all other users in the current room
////username is the array of the current user
////moderatorUserName is the username of the moderator
////isModerator to check whether current user is the moderator
const Participants = ({participants, userName, isModerator,moderatorUserName}) => {

    ////To avoid repeation of any participant of same username while mapping 
    const uniqueParticipants = participants.map(e => e['participantId'])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => participants[e]).map(e => participants[e]);      

    participants=uniqueParticipants;

    return (
        <>
            <h1>Participants</h1>
            <div>{userName}(You{isModerator?' , Moderator':''}) </div>
            {participants.map((participant) => {
                return (
                    <div key={participant.participantId}> {participant.participantName} 
                        {(participant.participantName === moderatorUserName)?'(Moderator)':''} 
                    </div>
                );
            })}
       </> 
    );
}
 
export default Participants;