import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    card: {
        width: 125,
        marginRight: 5,
    },
}));

function Cards() {
    const classes = useStyles();
    return (
        <div>
            <Typography variant="h4">Cards</Typography>
            <Typography variant="h5">Movement</Typography>
            <img src="/cards/n1.png" className={classes.card} />
            <img src="/cards/w2.png" className={classes.card} />
            <img src="/cards/se3.png" className={classes.card} />
            <Typography>These cards allow you to move the ship a specified amount in a specified direction. The direction is the letter and border colour, and the amount is the number displayed.</Typography>
            <br />
            <Typography variant="h5">Direction movement cards</Typography>
            <img src="/cards/turnl2.png" className={classes.card} />
            <img src="/cards/turnr4.png" className={classes.card} />
            <img src="/cards/forward2.png" className={classes.card} />
            <Typography>Turning cards turn the ship a specified amount, and forward cards move the ship in whatever direction the ship is facing. The ship is a lot harder to control using these.</Typography>
            <br />
            <Typography variant="h5">Special movement cards</Typography>
            <Typography variant="h6">Relocate</Typography>
            <img src="/cards/relocate.png" className={classes.card} />
            <Typography>The ship moves back to the centre of the board, where it started the game.</Typography>
            <br />
            <Typography variant="h6">Persist</Typography>
            <img src="/cards/persist.png" className={classes.card} />
            <Typography>The action of the last (not including turning or special) movement card to be played is performed again. If no other movement cards have been played this turn, the last movement card from previous turns is played.</Typography>
            <br />

            <Typography variant="h5">Compass</Typography>
            <img src="/cards/compass1.png" className={classes.card} />
            <img src="/cards/compass2.png" className={classes.card} />
            <Typography>When a compass card is played, all tiles that the card specifies are flipped over to be seen. Tiles with effects (e.g. treasure, rock) don't do anything when revealed - the ship must move over them for that to happen.</Typography>
            <br />

            <Typography variant="h5">Healing cards</Typography>
            <Typography variant="h6">Hammer card & Nail card</Typography>
            <img src="/cards/hammer.png" className={classes.card} />
            <img src="/cards/nail.png" className={classes.card} />
            <Typography>If both a hammer card and a nail card are played in the same turn, the ship is healed for 1HP. The ship cannot be healed twice in one turn this way.</Typography>
            <br />
            <Typography variant="h6">Hammer & nail</Typography>
            <img src="/cards/hammernail.png" className={classes.card} />
            <Typography>The ship is immediately healed for 1HP. This card is permanently discarded after being played, whether it heals the ship or not (i.e. the ship's HP is full and cannot be healed further).</Typography>
            <br />
            <Typography variant="h6">Reinforce</Typography>
            <img src="/cards/reinforce.png" className={classes.card} />
            <Typography>After this card is played, the ship cannot take any damage until this turn has ended.</Typography>
            <br />
            <Typography variant="h6">Lookout</Typography>
            <img src="/cards/lookout.png" className={classes.card} />
            <Typography>After this card is played, if the ship would take damage during the same turn, that damage is blocked, then the effect of this card ends.</Typography>
            <br />

            <Typography variant="h5">Detriment Cards</Typography>
            <Typography variant="h6">Matchstick</Typography>
            <img src="/cards/matchstick.png" className={classes.card} />
            <Typography>The ship takes 1 damage upon this card being played.</Typography>
            <br />

            <Typography variant="h5">Voting</Typography>
            <Typography>Voting cards call for an action to be voted on. If multiple voting cards are played in the same turn, only one is used. The card used is the one lowest on the following list.</Typography>
            <br />
            <Typography variant="h6">The Brig</Typography>
            <img src="/cards/brig.png" className={classes.card} />
            <Typography>If someone gets enough votes, they will not be able to play cards for the next two turns. They will still be able to talk and vote.</Typography>
            <br />
            <Typography variant="h6">Captain</Typography>
            <img src="/cards/captain.png" className={classes.card} />
            <Typography>If someone gets enough votes, only they will play cards next turn.</Typography>
            <br />
            <Typography variant="h6">Investigate</Typography>
            <img src="/cards/investigate.png" className={classes.card} />
            <Typography>If someone gets enough votes, they can choose another player to find out the role of. This card is permanently discarded if a player is successfully investigated.</Typography>
            <br />
            <Typography variant="h6">Mutiny</Typography>
            <img src="/cards/mutiny.png" className={classes.card} />
            <Typography>If someone gets enough votes, they're forced off the ship and cannot play cards, talk, vote, or receive votes for the rest of the game. If this player was a sea monster, the pirates win. This card is permanently discarded if a player is successfully mutinied.</Typography>
        </div>
    );
};

export default Cards;