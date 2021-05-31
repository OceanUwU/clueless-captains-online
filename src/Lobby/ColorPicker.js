import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core';
import playerColours from '../Match/playerColours.json';
import socket from '../socket';

function saveColor(num) {
}

function ColorPicker(props) {
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
                for (let i = 0; i < 16; i+=4) {
                    buttonGroups.push(<ButtonGroup>{(() => {
                        let buttons = [];
                        for (let k = i; k < i+4; k++) {
                            buttons.push(
                                <Button
                                    style={{color: 'white', backgroundColor: playerColours[k], height:'2.5em', width: 0}}
                                    onClick={() => {
                                        if (!taken.includes(k)) {
                                            localStorage.cccolor = String(k);
                                            setSelected(k);
                                        }
                                    }}
                                >{selected == k ? '✓' : (taken.includes(k) ? '✕' : ' ')}</Button>
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