import React from 'react';
import { Typography, Divider, Button, ButtonGroup, Tooltip, IconButton, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import StarsIcon from '@material-ui/icons/Stars';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ClearIcon from '@material-ui/icons/Clear';
import LinkIcon from '@material-ui/icons/Link';
import EditIcon from '@material-ui/icons/Edit';
import socket from '../socket';
import copy from 'clipboard-copy';
import playerColours from '../Match/playerColours.json';
import NameInput from '../Home/NameInput';
import ColorPicker from './ColorPicker';
import showDialog from '../Dialog/show';
import showMatchOptions from '../Home/showMatchOptions';
import rules from '../Rules';

const useStyles = makeStyles({
    root: {
        textAlign: 'center',
    },

    privacyIcon: {
        marginRight: 10
    },

    table: {
        width: 400,
        margin: 'auto',
    },

    head: {
        backgroundColor: '#ececec',
    },

    tableCell: {
        textAlign: 'center',
    },

    you: {
        textDecoration: 'underline',
    },
});

function Lobby(props) {
    const classes = useStyles();

    let tableBody = [];
    let amHost = socket.id.startsWith(props.matchInfo.host);
    for (let i = 0; i < props.matchInfo.options.players; i++) {
        let content = '';
        let you = false;
        if (i in props.matchInfo.players) {
            content = props.matchInfo.players[i].name;
            you = socket.id.startsWith(props.matchInfo.players[i].id);
        }
        tableBody.push(
            <TableRow key={i}>
                <TableCell className={classes.tableCell}>
                    {i in props.matchInfo.players && props.matchInfo.host == props.matchInfo.players[i].id ?
                        <Tooltip title="This player is the host. They have the ability to start the game.">
                            <StarsIcon fontSize="inherit" />
                        </Tooltip>
                    : null}
                    <span style={i in props.matchInfo.players ? {color:playerColours[props.matchInfo.players[i].num]} : null}>{you ? <span className={classes.you}>{content}</span> : content}</span>
                    {you ? <Tooltip title="Customise">
                        <IconButton size="small" onClick={() => showDialog({title: 'Customisation'}, <div style={{textAlign: 'center'}}><NameInput /><ColorPicker selected={props.matchInfo.players[i].num} matchInfo={props.matchInfo} /></div>)}><EditIcon fontSize="inherit" /></IconButton>
                    </Tooltip> : null}
                    {i in props.matchInfo.players && amHost && !props.matchInfo.starting && !you ? <span>
                        <Tooltip title="Kick - remove this player from this lobby.">
                            <IconButton size="small" onClick={() => socket.emit('kick', props.matchInfo.players[i].id)}><ClearIcon fontSize="inherit" /></IconButton>
                        </Tooltip>
                        {!props.matchInfo.players[i].bot ? 
                            <Tooltip title="Promote - transfer your host privileges to this player." onClick={() => socket.emit('promote', props.matchInfo.players[i].id)}>
                                <IconButton size="small"><StarBorderIcon fontSize="inherit" /></IconButton>
                            </Tooltip>
                        : null}
                    </span> : null}
                </TableCell>
            </TableRow>
        );
    }

    React.useEffect(() => {
        showMatchOptions.hostChanged(amHost);
    });

    if (props.matchInfo.starting) {
        (new Audio(`/countdown/${props.matchInfo.startTimer}.mp3`)).play();
    }

    let copyHelp = 'Copy a link others can use to join this lobby to your clipboard.';
    let [copyTitle, setCopyTitle] = React.useState(copyHelp);

    return (
        <div>
            <IconButton onClick={() => window.location.reload()}>
                <MeetingRoomIcon />
            </IconButton>
            <rules.ShowRulesButton />

            <div className={classes.root}>
                <Typography variant="overline" display="block" gutterBottom>
                    Room code
                </Typography>
                <Typography variant="h3" gutterBottom>
                    <span className={classes.privacyIcon}>
                        {props.matchInfo.options.public ? <Tooltip title="This is a public match. Anyone can join this match from the 'Find Match' button on the homepage."><PublicIcon /></Tooltip> : <Tooltip title="This is a private match. Only people with the room code can join."><LockIcon /></Tooltip>}
                    </span>
                    {props.matchInfo.code}
                    <Tooltip title={copyTitle}>
                        <IconButton onClick={() => {
                            copy(`${window.location.protocol}//${window.location.host}?${props.matchInfo.code}`);
                            setCopyTitle('Copied to clipboard!');
                            setTimeout(() => {
                                setCopyTitle(copyHelp);
                            }, 3000);
                        }}><LinkIcon /></IconButton>
                    </Tooltip>
                </Typography>

                <Button color="secondary" onClick={() => showMatchOptions.showMatchOptions({editable: amHost, started: true})}>Match options</Button>
                <br /><br />
                {props.matchInfo.starting ?
                    <Typography variant="h4">Starting in {props.matchInfo.startTimer}...</Typography>
                :
                    <Tooltip title={amHost ? 'Begin a timer to start the match. No more players will be able to join.' : 'Only the host can start the match.'}>
                        <span>
                            <Button color={amHost ? 'primary' : 'default'} size="large" onClick={() => socket.emit('startMatch')} disabled={!amHost}>Start Match</Button>
                        </span>
                    </Tooltip>
                }

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow className={classes.head}>
                                <TableCell className={classes.tableCell}>
                                    Players: {props.matchInfo.players.length}/{props.matchInfo.options.players}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableBody}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}

export default Lobby;