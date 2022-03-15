import React from 'react';
import { Typography, Button, Divider, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CodeInput from './CodeInput';
import NameInput from './NameInput';
import ColorPicker from '../Lobby/ColorPicker';
import socket from '../socket';
import showMatchOptions from './showMatchOptions';
import showDialog from '../Dialog/show';
import playerColours from '../Match/playerColours.json';
import rules from '../Rules';

const useStyles = makeStyles({
    logoImage: {
        display: 'block',
        textAlign: 'center',
        margin: 'auto',
        maxWidth: 350,
    },

    controls: {
        textAlign: 'center',
        border: '1px solid #0000001f',
        borderRadius: 10,
    },
});

function Home() {
    const classes = useStyles();

    return (
        <div>
            <Typography className={classes.title} variant="h3" gutterBottom><img className={classes.logoImage} src="/iconanimated.png" alt="Clueless Captains" /></Typography>

            <Typography variant="body1" style={{textAlign: 'center'}} gutterBottom>
                <span style={{fontWeight: 'bold', fontSize: '1.5em'}}>An online version of <Link href="https://www.willgriff.org/clueless-captains" target="_blank">the board game by Will Griff</Link>.</span>
                <br />
                Embark on a pirate adventure together. <Link onClick={rules.showRules}>Read the rules <rules.ShowRulesIcon fontSize="inherit" /></Link>
            </Typography>

            <div className={classes.controls}>
                <NameInput />
                <ColorPicker selected={localStorage.cccolor ? Number(localStorage.cccolor) : (() => {localStorage.cccolor = Math.floor(Math.random() * playerColours.length);return localStorage.cccolor})()} matchInfo={null} />

                <Divider />
                <br />

                <Button size="large" color="primary" onClick={() => socket.emit('findMatch')}>Find Match</Button>
                <br />
                <Button size="small" color="secondary" onClick={() => showMatchOptions.showMatchOptions({editable: true, started: false})}>Create Match</Button>

                <br /><br /><br />

                <CodeInput />
            </div>

            <div style={{textAlign: 'center', marginTop: 30}}>
                <a href="https://ocean.lol">
                    <img width={100} src="https://ocean.lol/media/mark-b.png" />
                </a>
            </div>
        </div>
    );
}

export default Home;