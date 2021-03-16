import React from 'react';
import { Typography, Divider, Tooltip, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Controller from './Controller';
import './index.css';
import showMatchOptions from '../Home/showMatchOptions';
import showRoleInfo from './showRoleInfo';
import rules from '../Rules';
import SettingsIcon from '@material-ui/icons/Settings';
import DescriptionIcon from '@material-ui/icons/Description';
import socket from '../socket';

const controllerHeight = '30vh';
const useStyles = makeStyles({
    gameInfo: {
        display: 'flex',
        width: '100%',
        height: 83,
        //marginBottom: 20,
        margin: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: '#ffea8c',
        borderBottom: '1px solid #0000001f',
        zIndex: 100,
        '& div': {
            flexGrow: 1,
        },
    },

    gameInfoTitle: {
        textAlign: 'center',
    },

    gameInfoContent: {
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        /*textAlign: 'center',
        '& *': {
            display: 'inline',
        },*/
    },

    boardContainer: {
        textAlign: 'center',
        lineHeight: 0,
    },

    board: {
        maxHeight: `calc(100vh - 83px - ${controllerHeight})`,
        height: '100vh',
        maxWidth: '100%',
        objectFit: 'contain',
    },

    buttons: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        opacity: 1,
        width: 48,
    },
});

function Match(props) {
    const classes = useStyles();
    let selfPlayer = props.players.find(player => props.myId.startsWith(player.id));

    const [dir, setDir] = React.useState(props.matchInfo.dir);

    React.useEffect(() => {
        showRoleInfo(props.matchInfo);
        socket.on('dir', newDir => setDir(newDir));

        return () => {
            socket.off('dir');
        };
    }, []);

    return (
        <div>
            <div className={classes.gameInfo}>
                <Tooltip title="treasures found / treasures needed (for pirates to win) / total treasures">
                    <div>
                        <div className={classes.gameInfoTitle}>
                            <Typography variant="subtitle1">
                                Treasures found
                            </Typography>
                        </div>
                        <div className={classes.gameInfoContent}>
                            <Typography variant="h3">
                                <span id="treasuresFound">0</span>
                            </Typography>
                            <Typography variant="h5">
                                /<span id="treasuresNeeded">?</span>
                            </Typography>
                            <Typography>
                                /<span id="treasuresTotal">?</span>
                            </Typography>
                        </div>
                    </div>
                </Tooltip>

                <Tooltip title="Ship HP / Maximum ship HP. If this reaches 0, the ship sinks, which means the Sea Monsters win and the pirates lose.">
                <div>
                    <div className={classes.gameInfoTitle}>
                        <Typography variant="subtitle1">
                            Ship HP
                        </Typography>
                    </div>
                    <div className={classes.gameInfoContent}>
                        <Typography variant="h3">
                            <span id="shipHP">?</span>
                        </Typography>
                        <Typography variant="h5">
                            /<span id="maxShipHP">?</span>
                        </Typography>
                    </div>
                </div>
                </Tooltip>

                <Tooltip title="turn number lol">
                    <div>
                        <div className={classes.gameInfoTitle}>
                            <Typography variant="subtitle1">
                                Turn
                            </Typography>
                        </div>
                        <div className={classes.gameInfoContent}>
                            <Typography variant="h3">
                                <span id="turnNumber">?</span>
                            </Typography>
                        </div>
                    </div>
                </Tooltip>
            </div>

            <div className={classes.buttons}>
                <rules.ShowRulesButton />
                <IconButton onClick={() => showRoleInfo(props.matchInfo)}><DescriptionIcon /></IconButton>
                <IconButton onClick={() => showMatchOptions.showMatchOptions({editable: false, started: true, ingame: true, options: props.matchInfo.options})}><SettingsIcon /></IconButton>
            </div>

            <div className={classes.boardContainer}>
                <Tooltip title={<span style={{fontSize: 30}}>Ship direction: {'↑↗→↘↓↙←↖'[dir]}</span>}>
                    <canvas id="gameBoard" className={classes.board} />
                </Tooltip>
            </div>

            <Controller height={controllerHeight} matchInfo={props.matchInfo} />
        </div>
    );
}

export default Match;