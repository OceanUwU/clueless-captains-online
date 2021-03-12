import React from 'react';
import { Typography, Divider } from '@material-ui/core';

function Mode2() {
    return (
        <div>
            <Typography variant="h4">Allied Traitor Mode</Typography>
            <Typography>Allied Traitor is an alternate gamemode which is available with 6-8 players. It adds some new roles and changes the way the game is played. If the "Play Allied Traitor when available" match option is enabled and there aren't enough players, the Sea Blindness mode will be used instead.</Typography>
            <Divider />

            <Typography variant="h5">Pirate Roles</Typography>
            <Typography variant="h6">Pirate</Typography>
            <img src="/roles/pirate.png" width={100} />
            <Typography>same as the normal pirate lol</Typography>
            <br />
            <Typography variant="h6">Biologist</Typography>
            <img src="/roles/biologist.png" width={100} />
            <Typography>There is 1 biologist in a game. This royal biologist wins with the pirates. The biologist knows the role of every player, but the pirates hold a grudge against the royals, so the pirates can't find out who the biologist is, and neither can the Sea Master, because they will out the biologist to the pirates. Therefore, the biologist must use the information they have to help them win the game, while laying low about their identity.</Typography>
            <Divider />

            <Typography variant="h5">Sea Monster Roles</Typography>
            <Typography variant="h6">Sea Master</Typography>
            <img src="/roles/seamaster.png" width={100} />
            <Typography>There is 1 Sea Master in a game. The Sea Master always knows who the Sea Servant is. After the pirates win (if a sea monster is mutinied or all treasures are found), the sea monsters still have a chance! The Sea Master chooses a player who they think was the biologist. If they're correct, the Sea Monsters win instead of the pirates.</Typography>
            <br />
            <Typography variant="h6">Sea Servant</Typography>
            <img src="/roles/seaservant.png" width={100} />
            <Typography>There is 1 Sea Servant in a game. They're forgetful, and have no idea who the Sea Master disguised themself as - the Sea Servant does not know who the Sea Master is.</Typography>
            <br />
        </div>
    );
};

export default Mode2;