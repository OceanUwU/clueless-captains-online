import React from 'react';
import { Typography } from '@material-ui/core';

function Turn() {
    return (
        <div>
            <Typography variant="h4">Turn</Typography>
            <Typography variant="h5">Selection phase</Typography>
            <Typography>First, the cards in the draw pile are counted, and if there aren't enough to deal everyone a hand, the discard pile is shuffled in with the draw pile. Then, 3 cards are dealt to each player. They each select one to play. Everyone's selected cards are then collected and shuffled. Talking is not allowed during the selection phase.</Typography>
            <br />
            <Typography variant="h5">Playing phase</Typography>
            <Typography>In the playing phase, the selected cards (which have been shuffled, so no one knows who played which) are revealed one by one, performing the action on the played card each time. Talking is not allowed during the playing phase.</Typography>
            <br />
            <Typography variant="h5">Discussion phase</Typography>
            <Typography>During the discussion phase, players may claim which card they played and which they had in their hand as well as discuss anything else important. Ask anyone any question you want, but the answer may not always be the truth. When ready to move on to the next turn, players can click ready. Everyone needs to click ready for the turn to end. If a voting card was played in the playing phase, this phase is replaced with the voting phase.</Typography>
            <br />
            <Typography variant="h5">Voting phase</Typography>
            <Typography>This phase only happens if a voting card was played in the playing phase. Players may discuss the same as they would during the discussion, but instead of readying up, they must vote for the action on the card. Votes are not revealed until everyone has made their vote. There must be at least [number of alive players - number of sea monsters] of identical votes, or nothing will happen, and the next phase starts as normal. You may vote for yourself.</Typography>
        </div>
    );
};

export default Turn;