import React from 'react';
import { Typography, Tooltip, IconButton, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import socket from '../socket/';
import playerColours from '../Match/playerColours.json';
import rules from '../Rules';
import showMatchOptions from '../Home/showMatchOptions';
import SettingsIcon from '@material-ui/icons/Settings';
//import { gameNameChars } from '../Match/gameplay';

const wins = {
    'treasure': [true, 'The pirates found all the treasure they needed!'],
    'kill': [true, 'The pirates found and killed a sea monster!'],
    'sink': [false, 'The ship sank.'],
    'snitch': [false, 'The Sea Master found the biologist and snitched on them.'],
};

const useStyles = makeStyles({
    root: {
        textAlign: 'center',
    },

    tableCell: {
        textAlign: 'center',
    },

    gamesContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        '& div': {
            marginLeft: 25,
            marginRight: 25,
        },
    },

    gameImage: {
        width: 150,
    },

    counterImage: {
        height: 10,
    },

    you: {
        color: 'red',
    },

    otherPlayer: {
    },
});

function Results(props) {
    const classes = useStyles();
    
    (new Audio('/endMatch.mp3')).play();
    
    let win = wins[props.results.cause];

    return (
        <div>
            <div className={classes.root}>
                <IconButton onClick={() => showMatchOptions.showMatchOptions({editable: false, started: true, ingame: true, options: props.matchInfo.options})}>
                    <SettingsIcon />
                </IconButton>
                <IconButton onClick={() => window.location.reload()}>
                    <HomeIcon />
                </IconButton>
                <rules.ShowRulesButton />
                <Typography variant="h3">
                    <span style={{color: win[0] ? '#00ff00' : '#ff0000'}}>{win[0] ? 'Pirate' : 'Sea Monster'}s</span> win!
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {win[1]}
                </Typography>

                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {props.results.roles.map(player => {
                        let p = props.matchInfo.players.find(pl => pl.num == player.num);
                        return (
                            <span style={{margin: 10}}>
                                <img src={`/roles/${player.role}.png`} width={100} /><br />
                                <span style={{fontSize: 20, textAlign: 'center', color: playerColours[p.num], textDecoration: `${p.dead ? 'line-through' : ''} ${props.myId.startsWith(p.id) ? 'underline': ''}`}}>{p.name}</span>
                            </span>
                        );
                    })}
                </div>

                <br />
                <Button color="primary" size="large" style={{margin: '16px 0'}} onClick={() => socket.emit('rejoin', props.rjCode, props.matchInfo.options)}>Play again</Button>

                <Divider/>

                <Typography variant="h3">
                    Final board
                </Typography>
                <img src={props.finalBoard} style={{height: '80vh', maxWidth: '100%', objectFit: 'contain'}} />
            </div>
        </div>
    );
}

export default Results;