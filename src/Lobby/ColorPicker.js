import React from 'react';
import { ButtonGroup, Button, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import playerColours from '../Match/playerColours.json';
import socket from '../socket';

const useStyles = makeStyles((theme) => ({
    colorButton: {
        color: 'white',
        height: '2.5em',
        minWidth: 0,
        width: 24,
        height: 24,
        padding: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
}));

const rows = 10;
const columns = 10;

function ColorPicker(props) {
    const classes = useStyles();

    const [selected, setSelected] = React.useState(props.selected);
    const [taken, setTaken] = React.useState([]);

    React.useEffect(() => {
        socket.emit('changeColor', selected);
    });

    if (props.matchInfo != null) {
        React.useEffect(() => {
            let showTaken = matchInfo => {
                console.log(':O');
                setTaken(matchInfo.players.map(p => p.num));
            };
            socket.on('matchUpdate', showTaken);
            showTaken(props.matchInfo);
            return () => socket.off('matchUpdate', showTaken);
        }, []);
    }

    return (
        <ButtonGroup orientation="vertical">
            {(() => {
                let buttonGroups = [];
                for (let i = 0; i < rows * columns; i+=rows) {
                    buttonGroups.push(<ButtonGroup>{(() => {
                        let buttons = [];
                        for (let k = i; k < i+rows; k++) {
                            buttons.push(
                                <Tooltip title={playerColours[k]}>
                                    <Button
                                        className={classes.colorButton}
                                        style={{backgroundColor: playerColours[k]}}
                                        onClick={() => {
                                            if (!taken.includes(k)) {
                                                localStorage.cccolor = String(k);
                                                setSelected(k);
                                            }
                                        }}
                                    >{selected == k ? '✓' : (taken.includes(k) ? '✕' : ' ')}</Button>
                                </Tooltip>
                            );
                        }
                        return buttons;
                    })()}</ButtonGroup>);
                }
                return buttonGroups;
            })()}
        </ButtonGroup>
    );
}

export default ColorPicker;