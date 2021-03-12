import React from 'react';
import { Typography } from '@material-ui/core';

function SpecialCases() {
    return (
        <div>
            <Typography variant="h4">Special cases</Typography>
            <Typography variant="h6">Ship tries to move out of the board</Typography>
            <Typography>The ship loses a configurable amount of HP (default 1), and stays where it is.</Typography>
            <br />
            <Typography variant="h6">Captain + Brig interactions</Typography>
            <Typography>If a captain is voted for, everyone else who is in the brig will have their jail time extended by one turn to compensate.<br />If a player in the brig is voted as captain, they will be freed from the brig and will be able to play cards until jailed again.</Typography>
            <br />
            <Typography variant="h6">Finding all treasure and sinking on the same turn</Typography>
            <Typography>In this game it is impossible to draw. If you find the last treasure and sink on the same turn, whichever one happened first dictates the outcome, example:</Typography>
            <br />
            <Typography><i>
                Card one moves you on to the last treasure tile,<br />
                Card two bumps you into a rock, sinking the ship.<br />
                <br />
                In this case the pirates would win as they got the treasure before sinking.
            </i></Typography>

        </div>
    );
};

export default SpecialCases;