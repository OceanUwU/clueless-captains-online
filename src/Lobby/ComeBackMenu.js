import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import socket from '../socket';
import playerColours from '../Match/playerColours.json';

const useStyles = makeStyles((theme) => ({

}));

function ComeBackMenu(props) {
    return (
        <div>
            <Typography variant="h3">Who will you rejoin the game as?</Typography>
            {props.choices.map(choice =>
                <button
                    style={{background: playerColours[choice.num]}}
                    onClick={() => socket.emit('comeback', choice.num, props.code)}
                >{choice.name}</button>
            )}
        </div>
    );
}

export default ComeBackMenu;