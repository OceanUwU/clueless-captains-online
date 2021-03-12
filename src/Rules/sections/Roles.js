import React from 'react';
import { Typography, Divider } from '@material-ui/core';

function Roles() {
    return (
        <div>
            <Typography variant="h4">Roles</Typography>
            <Typography>All crewmates are given one of two roles at the start of the game. This role decides their win condition.</Typography>
            <Divider />

            <Typography variant="h5">Pirate</Typography>
            <img src="/roles/pirate.png" width={100} />
            <Typography>The pirates discovered an area with tons of (seemingly) abandoned booty just waiting to be plundered! They're here, and they won't stop until they take it all (or die trying)! Pirates should almost always be telling the truth to their crewmates.</Typography>
            <br />
            <Typography><u>Pirates win if all the treasures are found or if a Sea monster is killed.</u></Typography>
            <Divider />

            <Typography variant="h5">Sea monster</Typography>
            <img src="/roles/seamonster.png" width={100} />
            <Typography>The sea monsters discovered filthy pirates heading into their territory, and pirates could only be there for one reason - treasure. This treasure means everything to them, so they've disguised themselves as pirates and infiltrated the ship. They'll do anything they can to foil the pirates' foolish plan.<br /><br />Sea monsters are heavily outnumbered by Pirates, and may lose (by getting killed) if their identity is revealed, so they'll have to blend in with the pirates by lying about which cards they play.</Typography>
            <br />
            <Typography><u>Sea monsters win if the ship sinks.</u></Typography>
            <br />
            <Typography>In 1-2 player games, there are no sea monsters. In 3-5 player games, there is 1 sea monster. In 6-8 player games, there are 2 sea monsters.</Typography>
        </div>
    );
};

export default Roles;