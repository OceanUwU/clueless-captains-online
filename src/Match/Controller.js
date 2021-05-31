import React from 'react';
import { Typography, Divider, Tooltip, Button, FormControl, FilledInput, IconButton, InputAdornment, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import showDialog from '../Dialog/show';
import socket from '../socket';
import playerColours from './playerColours.json';
import formatText from './formatText';

import ChatIcon from '@material-ui/icons/Chat';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles({
    root: {
        background: '#f7f0d5',
        borderTop: '1px solid #0000001f',
    },

    cards: {
        height: '100%',
        overflowX: 'scroll',
        textAlign: 'center',
        whiteSpace: 'nowrap',
    },

    card: {
        height: '18vh'
    },

    playingStatusContainer: {
        textAlign: 'center',
    },

    playingStatus: {
        borderRadius: 5,
        paddingRight: 5,
        display: 'inline-block',
        color: 'white',
        '& span': {
            fontSize: 32,
            paddingLeft: 10,
            paddingRight: 10,
            borderRight: '1px solid #0000001f',
            marginRight: 5,
        },
    },

    playingCards: {
        display: 'flex',
        justifyContent: 'space-between',
        '& span': {
            textAlign: 'center',
            '& img': {
                height: '24vh',
            },
        },
    },

    chat: {
        padding: '10px 15px',
        overflowY: 'scroll',
        maxHeight: 'inherit',
        width: '100%',
        wordBreak: 'break-word',
    },

    voteArea: {
        width: '15em',
        overflowY: 'scroll',
        '& div': {
            borderBottom: '1px solid #0000001f',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
        },
    },

    textField: {
        width: '100%',
    },
});

function Controller(props) {
    const classes = useStyles();
    const chatRef = React.createRef();
    const bottomRef = React.createRef();

    const [display, setDisplay] = React.useState('discuss');
    const [cards, setCards] = React.useState([]);
    const [cardsSelected, setCardsSelected] = React.useState(Array(props.matchInfo.options.handSize).fill(false));
    const [playingStatus, setPlayingStatus] = React.useState([]);
    const [playedCard, setPlayedCard] = React.useState('blank');
    const [cardsLeft, setCardsLeft] = React.useState(1);
    const [vote, setVote] = React.useState(null);
    const [chooseTitle, setChooseTitle] = React.useState('');
    const [muted, setMuted] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const [messageTyped, setMessageTyped] = React.useState('');
    const sendMessage = () => {
        socket.emit('msg', messageTyped);
        setMessageTyped('');
    };
    let [votes, setVotes] = React.useState(Array(props.matchInfo.players.length).fill(null));
    let votesA = Array(props.matchInfo.players.length).fill(null);

    React.useEffect(() => {
        //chatRef.current.scrollTop = chatRef.current.scrollHeight - chatRef.current.clientHeight - chatRef.current.clientTop;

        socket.on('wait', newPlayingStatus => {
            setPlayingStatus(newPlayingStatus)
            setDisplay('wait');
        });
        socket.on('cards', newCards => {
            setCards(newCards);
            setCardsSelected(Array(props.matchInfo.options.handSize).fill(false));
            setDisplay('select');
        });
        socket.on('play', (card, newCardsLeft) => {
            setPlayedCard(card);
            setCardsLeft(newCardsLeft);
            setDisplay('play');
        });
        socket.on('currentVote', newVote => {
            setVote(newVote);
        });
        socket.on('discuss', newVote => {
            window.chatStart = true;
            setDisplay('chat');
            setVote(newVote);
        });
        socket.on('vote', (index, newVote) => {
            votesA[index] = newVote;
            setVotes(JSON.parse(JSON.stringify(votesA)));
        });
        socket.on('choosePlayer', title => {
            setChooseTitle(title);
            setDisplay('choosePlayer');
        });
        socket.on('die', dead => {
            props.matchInfo.players.find(p => p.num == dead).dead = true;
            setDisplay('chat');
        });
        socket.on('mute', newMuted => {
            setMessageTyped('');
            setMuted(newMuted);
            if (props.matchInfo.players.find(p => p.dead && socket.id.startsWith(p.id))) {
                setMuted(true);
            } else if (newMuted) {
                showDialog({
                    title: 'Muted!',
                    description: 'Someone played a mute card, so no one can talk this turn.'
                });
            }
        });
        socket.on('message', message => {
            console.log(message);
            setMessages(prevMessages => [...prevMessages, message])
        });

        return () => {
            socket.off('wait');
            socket.off('cards');
            socket.off('play');
            socket.off('currentVote');
            socket.off('discuss');
            socket.off('vote');
            socket.off('choosePlayer');
            socket.off('die');
            socket.off('message');
            socket.off('muted');
        };
    }, []);

    React.useEffect(() => {
        if (display == 'chat') {
            if (window.chatStart) {
                window.chatStart = false;
                bottomRef.current.scrollIntoView();
            } else {
                let lastMessage = chatRef.current.children[chatRef.current.children.length - 1];
                if (chatRef.current.scrollHeight - chatRef.current.clientHeight - chatRef.current.clientTop - chatRef.current.scrollTop < lastMessage.clientHeight + 35)
                    bottomRef.current.scrollIntoView();
            }
        }
    });

    return (
        <div class={classes.root} style={{height: props.height, maxHeight: 'calc(30vh - 1px)'}}>
            {(() => {
                switch (display) {
                    case 'select':
                        let cardsSelectedAmount = cardsSelected.filter(card => card).length;
                        let sendBlocked = cardsSelectedAmount < props.matchInfo.options.minPlayed || cardsSelectedAmount > props.matchInfo.options.maxPlayed;
                        return (<div>
                        <div class={classes.cards}>
                            {cards.map((card, index) => (
                                <Tooltip title={<img src={`/cards/${card}.png`} width={200} />}>
                                    <Button onClick={() => setCardsSelected(cardsSelected.map((card, i) => index == i ? !card : card))}>
                                        <img class={classes.card} src={`/cards/${card}.png`} style={{opacity: cardsSelected[index] ? 1 : 0.5}} />
                                    </Button>
                                </Tooltip>
                            ))}
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <Button
                                color="primary"
                                style={{opacity: sendBlocked ? 0.5 : 1}}
                                disabled={sendBlocked}
                                onClick={() => socket.emit('play', cardsSelected.map((card, index) => [index, card]).filter(e => e[1]).map(e => e[0]))}
                            >
                                Play {cardsSelectedAmount}/{props.matchInfo.options.maxPlayed}
                            </Button>
                        </div>
                    </div>);
                    
                    case 'wait': return (<div className={classes.playingStatusContainer}>
                        {playingStatus.map(p => {
                            let player = props.matchInfo.players.find(pl => pl.num == p.n);
                            //if (player.dead) return <s>{player.name}</s>
                            return <span className={classes.playingStatus} style={{background: playerColours[p.n]}}>
                                <span style={{textDecoration: `${player.dead ? 'line-through' : ''}${socket.id.startsWith(player.id) ? ' underline' : ''}`}}>{player.name}</span>
                                {[<MoreHorizIcon />, <CheckIcon />, <CloseIcon />][p.s]}
                            </span>;
                        })}
                    </div>);

                    case 'play': return (<div className={classes.playingCards}>
                        <span><img src={`/cards/${cardsLeft == 0 ? 'blank' : 'back'}.png`} /><br />To play: {cardsLeft}</span>
                        <span><img src={`/cards/${playedCard}.png`} /><br />Playing</span>
                        <span><img src={`/cards/${vote == null ? 'blank' : vote}.png`} /><br />Vote</span>
                    </div>);

                    case 'chat': return (<div style={{maxHeight: 'inherit', display: 'flex'}}>
                        <div ref={chatRef} className={classes.chat}>
                            {messages.map(msg => {
                                if (msg.hasOwnProperty('l')) {
                                    let color;
                                    switch (msg.o) {
                                        case 's': color = '#ff4f4f';break;
                                        case 'i': color = '#6bc4ff';break;
                                        default: color = '#858585';break;
                                    };
                                    return <Typography style={{color}}>
                                        {formatText(msg.l)}
                                    </Typography>;
                                } else {
                                    return <Typography>
                                        <span style={{color: '#777777'}}>[<span style={{color: playerColours[msg.p]}}>{props.matchInfo.players.find(p => p.num == msg.p).name}</span>]</span>
                                        {' '}
                                        {formatText(msg.m)}
                                    </Typography>;
                                }
                            })}
                            <FormControl className={classes.textField} variant="filled">
                                <InputLabel htmlFor="messageInput">
                                    Message
                                </InputLabel>
            
                                <FilledInput
                                    id="messageInput"
                                    type="text"
                                    value={messageTyped}
                                    onChange={e => setMessageTyped(e.target.value)}
                                    autoComplete="off"
                                    inputProps={{
                                        maxLength: 99,
                                        onKeyDown: e => {if (e.key == 'Enter') sendMessage()},
                                    }}
                                    disabled={muted}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Join"
                                                onClick={sendMessage}
                                                edge="end"
                                            >
                                                <ChatIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                            <span ref={bottomRef} />
                        </div>
                        <div className={classes.voteArea}>
                            <div style={{color: 'black', fontSize: 13, cursor: 'auto', height: 25}}>
                                <span style={{textAlign: 'center', width: '100%'}}>Voting for: {vote == null ? 'Turn end' : `${vote[0].toUpperCase()}${vote.slice(1)}`}</span>
                            </div>
                            {props.matchInfo.players.map(player => {
                                return <div onClick={() => socket.emit('vote', player.num)}>
                                    <div style={{background: playerColours[player.num], width: '100%'}}>
                                    <span style={{textDecoration: `${player.dead ? 'line-through' : ''} ${socket.id.startsWith(player.id) ? 'underline' : ''}`}}>{player.name}</span>
                                    </div>
                                    <span style={{borderLeft: '1px solid #0000001f', fontSize: 0, padding: 8, background: ((votes[player.num] == null || votes[player.num] == null == true) ? 'white' : playerColours[votes[player.num]])}}>{votes[player.num] == null ? (player.dead ? <CloseIcon style={{color: 'black'}} /> : <MoreHorizIcon style={{color: 'black'}} />) : <CheckIcon style={{color: votes[player.num] === true ? 'black' : 'white'}} />}</span>
                                </div>;
                            })}
                        </div>
                    </div>);

                    case 'choosePlayer': return <div>
                        <Typography variant="h4">{chooseTitle}</Typography>
                        {props.matchInfo.players.map(player => {
                            if (player.dead) return;
                            return <button style={{background: playerColours[player.num]}} onClick={() => socket.emit('choosePlayer', player.num)}>{player.name}</button>
                        })}
                    </div>;
                }
            })()}
        </div>
    );
}

export default Controller;