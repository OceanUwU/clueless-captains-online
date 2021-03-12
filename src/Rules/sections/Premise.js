import React from 'react';
import { Typography, Link } from '@material-ui/core';

function Premise() {
    let videoID = 'ScMzIvxBSi4';
    return (
        <div>
            <img src="/icon.png" style={{maxWidth: '100%', width: 300}} />
            <Typography>Clueless Captains is a game about going on a pirate adventure to try and find the hidden treasures. You can play with between 2 and 8 people but for the best experience we reccommend anything between 3 and 5.</Typography>
            <br />
            <Typography variant="h5">The gist of what's going on</Typography>
            <Typography>In Clueless Captains, all players simultaneously control a ship on a grid. You're trying to find all the treasure in this area, but some of your crew may be attempting to sabotage this mission by sinking your ship. The ship starts with a set amount of HP which is lost when it takes damage from rocks or other sources. HP can be regained from finding treasure (if this option is enabled). When the ship's HP becomes 0, it sinks.</Typography>
            <br />
            <Typography variant="h5">Video</Typography>
            <Typography>Here's <Link href={`https://youtu.be/${videoID}`} target="_blank" rel="noopener">a YouTube video</Link> showing the game in action. Most of the rules are explained here, but you won't know every nook and cranny of the game. This is enough knowledge, though, as you can come back and read the rules of the game at any point during a match.</Typography>
            <iframe style={{width: '100%', height: '250px'}} src={`https://www.youtube.com/embed/${videoID}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <Typography variant="h6">Timestamps</Typography>
            <Typography>
                The timestamp of each important point in the video above.
                <ul>
                    <li>0:00 - Intro</li>
                    <li>0:01 - Roles</li>
                    <li>1:00 - Selection phase & Cards</li>
                    <li>1:01 - Playing phase & Tiles</li>
                    <li>1:02 - Discussion phase</li>
                    <li>1:03 - Voting phase</li>
                </ul>
            </Typography>
        </div>
    );
};

export default Premise;