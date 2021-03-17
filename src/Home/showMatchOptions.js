import React from 'react';
import { Typography, Divider, FormControl, Select, MenuItem, InputLabel, FormLabel, Slider, Tooltip, IconButton, TextField, Grid, Switch, Button, ButtonGroup, FormControlLabel, Checkbox, RadioGroup, Radio, FormHelperText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import LinkIcon from '@material-ui/icons/Link';
import showDialog from '../Dialog/show';
import socket from '../socket';
import defaultMatchOptions from './defaultMatchOptions.json';
import copy from 'clipboard-copy';
import { TextFieldsOutlined } from '@material-ui/icons';
const allowedPlayers = [1, 8];
const maxGamesAllowed = [1, 4];

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
    },
    select: {
        width: 200,
    },
    smallSelect: {
        width: 50,
    },
}));

const tilesAvailable = [ //[name:string, at least 1 required:boolean]
    ['treasure', true],
    ['rock', false],
    ['iceberg', false],
    ['waves', false],
    ['storm', false],
    ['alcohol', false],
    ['whirlpoolleft', false],
    ['whirlpoolright', false],
];
const cardsAvailable = [ //[name:string, non-removable:boolean]
    ['n1', true],
    ['n2', true],
    ['n3', true],
    ['n4', true],
    ['ne1', true],
    ['ne2', true],
    ['ne3', true],
    ['ne4', true],
    ['e1', true],
    ['e2', true],
    ['e3', true],
    ['e4', true],
    ['se1', true],
    ['se2', true],
    ['se3', true],
    ['se4', true],
    ['s1', true],
    ['s2', true],
    ['s3', true],
    ['s4', true],
    ['sw1', true],
    ['sw2', true],
    ['sw3', true],
    ['sw4', true],
    ['w1', true],
    ['w2', true],
    ['w3', true],
    ['w4', true],
    ['nw1', true],
    ['nw2', true],
    ['nw3', true],
    ['nw4', true],
    ['forward1', true],
    ['forward2', true],
    ['forward3', true],
    ['forward4', true],
    ['turnl1', true],
    ['turnl2', true],
    ['turnl3', true],
    ['turnr1', true],
    ['turnr2', true],
    ['turnr3', true],
    ['flip', true],
    ['persist', true],
    ['relocate', true],
    ['compass1', true],
    ['compass2', true],
    ['hammer', true],
    ['nail', true],
    ['hammernail', false],
    ['lookout', true],
    ['reinforce', true],
    ['matchstick', true],
    ['brig', true],
    ['captain', true],
    ['investigate', false],
    ['mutiny', false],
]

var options = {
    ...defaultMatchOptions,
    ...localStorage.MatchOptions ? JSON.parse(localStorage.MatchOptions) : {},
    tiles: {...defaultMatchOptions.tiles, ...localStorage.MatchOptions ? JSON.parse(localStorage.MatchOptions).tiles : {},},
    cards: {...defaultMatchOptions.cards, ...localStorage.MatchOptions ? JSON.parse(localStorage.MatchOptions).cards : {},},
};

for (let i in options) {
    if (typeof options[i] == 'object' && !Array.isArray(options[i]))
        options[i] = {
            ...localStorage.MatchOptions ? JSON.parse(localStorage.MatchOptions)[i] : {},
            ...options[i]
        }
}

function NumberTweaker(props) {
    return (
        <ButtonGroup size="small">
            {props.bigChange ? <Button onClick={() => props.fn(-10)} disabled={props.disabled || props.state == props.min}>- -</Button> : null}
            <Button onClick={() => props.fn(-1)} disabled={props.disabled || props.state == props.min}>-</Button>
            <Button disabled>{props.state}</Button>
            <Button onClick={() => props.fn(+1)} disabled={props.disabled || props.state == props.max}>+</Button>
            {props.bigChange ? <Button onClick={() => props.fn(+10)} disabled={props.disabled || props.state == props.max}>++</Button> : null}
        </ButtonGroup>
    );
}

function MatchOptions(props) {
    const classes = useStyles();

    if (props.options)
        options = props.options;

    const sendUpdate = () => {
        if (props.editable && props.started)
            socket.emit('updateOptions', options);
    }
    const [publicity, setPublicity] = React.useState(options.public);
    const handlePublicityChange = event => {
        options.public = !publicity;
        setPublicity(!publicity);
        sendUpdate();
    };
    const [players, setPlayers] = React.useState(options.players);
    const changePlayers = change => {
        options.players += change;
        if (options.players < allowedPlayers[0]) options.players = allowedPlayers[0];
        if (options.players > allowedPlayers[1]) options.players = allowedPlayers[1];
        setPlayers(options.players);
        resetCards();
        sendUpdate();
    };
    const [startHP, setStartHP] = React.useState(options.startHP);
    const changeStartHP = change => {
        options.startHP += change;
        if (options.startHP < 1) options.startHP = 1;
        if (options.startHP > 999) options.startHP = 999;
        if (options.startHP > options.maxHP) changeMaxHP(options.startHP - options.maxHP);
        setStartHP(options.startHP);
        sendUpdate();
    };
    const [maxHP, setMaxHP] = React.useState(options.maxHP);
    const changeMaxHP = change => {
        options.maxHP += change;
        if (options.maxHP < 1) options.maxHP = 1;
        if (options.maxHP > 999) options.maxHP = 999;
        if (options.startHP > options.maxHP) changeStartHP(options.maxHP - options.startHP);
        setMaxHP(options.maxHP);
        sendUpdate();
    };
    const [rockDamage, setRockDamage] = React.useState(options.rockDamage);
    const changeRockDamage = (event, value) => {
        value = Number(value);
        options.rockDamage = value;
        setRockDamage(value);
        sendUpdate();
    };
    const [iceDamage, setIceDamage] = React.useState(options.iceDamage);
    const changeIceDamage = (event, value) => {
        value = Number(value);
        options.iceDamage = value;
        setIceDamage(value);
        sendUpdate();
    };
    const [leaveDamage, setLeaveDamage] = React.useState(options.leaveDamage);
    const changeLeaveDamage = (event, value) => {
        value = Number(value);
        options.leaveDamage = value;
        setLeaveDamage(value);
        sendUpdate();
    };
    const [treasureHeal, setTreasureHeal] = React.useState(options.treasureHeal);
    const changeTreasureHeal = (event, value) => {
        value = Number(value);
        options.treasureHeal = value;
        setTreasureHeal(value);
        sendUpdate();
    };
    const [boardSize, setBoardSize] = React.useState([...options.boardSize]);
    const changeBoardSize = (value, axis) => {
        options.boardSize[axis] = value;
        setBoardSize([...options.boardSize]);
        resetTiles();
        options.startPos = [Math.round((options.boardSize[0]-1)/2), Math.round((options.boardSize[1]-1)/2)];
        setStartPos([...options.startPos]);
        sendUpdate();
    };
    const [startPos, setStartPos] = React.useState([...options.startPos]);
    const changeStartPos = (value, axis) => {
        options.startPos[axis] = value;
        setStartPos([...options.startPos]);
        sendUpdate();
    };
    const [startDir, setStartDir] = React.useState(options.startDir);
    const handleStartDirChange = event => {
        options.startDir = event.target.value;
        setStartDir(event.target.value);
        sendUpdate();
    };
    const [revealTiles, setRevealTiles] = React.useState(options.revealTiles);
    const handleRevealTilesChange = event => {
        options.revealTiles = !revealTiles;
        setRevealTiles(!revealTiles);
        sendUpdate();
    };
    const [tiles, setTiles] = React.useState(options.tiles);
    const changeTiles = (change, tile) => {
        options.tiles[tile] += change;
        setTiles({...tiles, [tile]: options.tiles[tile]});
        if (options.treasuresNeeded > options.tiles.treasure) changeTreasuresNeeded(options.treasuresNeeded - options.tiles.treasure);
        sendUpdate();
    };
    const [treasuresNeeded, setTreasuresNeeded] = React.useState(options.treasuresNeeded);
    const changeTreasuresNeeded = change => {
        options.treasuresNeeded += change;
        if (options.treasuresNeeded < 1) options.treasuresNeeded = 1;
        if (options.treasuresNeeded > options.tiles.treasure) options.treasuresNeeded = options.tiles.treasure;
        if (options.treasuresNeeded > options.tiles.treasure) changeTreasuresNeeded(options.treasuresNeeded - options.tiles.treasure);
        setTreasuresNeeded(options.treasuresNeeded);
        sendUpdate();
    };
    const resetTiles = () => {
        let newTiles = {...tiles, ...(options.boardSize[0]**options.boardSize[1] > Object.values(defaultMatchOptions.tiles).reduce((a,b)=>a+b) ? defaultMatchOptions.tiles : Object.fromEntries(Object.entries(defaultMatchOptions.tiles).map(e => [e[0], tilesAvailable.find(t => t[0] == e[0])[1] ? 1 : 0])))};
        setTiles(newTiles);
        options.tiles = {...newTiles};
    };
    const [handSize, setHandSize] = React.useState(options.handSize);
    const changeHandSize = (event, value) => {
        value = Number(value);
        options.handSize = value;
        setHandSize(value);
        if (options.minPlayed > value)
            changeMinPlayed({target: {value}});
        if (options.maxPlayed > value)
            changeMaxPlayed({target: {value}});
        resetCards();
        sendUpdate();
    };
    const [minPlayed, setMinPlayed] = React.useState(options.minPlayed);
    const changeMinPlayed = event => {
        options.minPlayed = event.target.value;
        setMinPlayed(event.target.value);
        sendUpdate();
    };
    const [maxPlayed, setMaxPlayed] = React.useState(options.maxPlayed);
    const changeMaxPlayed = event => {
        options.maxPlayed = event.target.value;
        setMaxPlayed(event.target.value);
        if (options.minPlayed > options.maxPlayed)
            changeMinPlayed({target: {value: event.target.value}});
        sendUpdate();
    };
    const [topPlayed, setTopPlayed] = React.useState(options.topPlayed);
    const changeTopPlayed = (event, value) => {
        value = Number(value);
        options.topPlayed = value;
        setTopPlayed(value);
        resetCards();
        sendUpdate();
    };
    const [cards, setCards] = React.useState(options.cards);
    const changeCards = (change, card) => {
        options.cards[card] += change;
        setCards({...cards, [card]: options.cards[card]});
        sendUpdate();
    };
    const resetCards = () => {
        let newCards = {...cards, ...defaultMatchOptions.cards};
        setCards(newCards);
        options.cards = {...newCards};
    };
    const [votingAnonymity, setVotingAnonymity] = React.useState(options.votingAnonymity);
    const handleVotingAnonymityChange = event => {
        options.votingAnonymity = event.target.value;
        setVotingAnonymity(event.target.value);
        sendUpdate();
    };
    const [mode, setMode] = React.useState(options.mode);
    const handleModeChange = event => {
        options.mode = event.target.value;
        setMode(event.target.value);
        sendUpdate();
    };
    const [nameConvention, setNameConvention] = React.useState(options.names);
    const handleNameConventionChange = event => {
        options.names = event.target.value;
        setNameConvention(event.target.value);
        sendUpdate();
    };
    
    let updateOptions = () => {
        setPublicity(options.public);
        setPlayers(options.players);
        setStartHP(options.startHP);
        setMaxHP(options.maxHP);
        setRockDamage(options.rockDamage);
        setIceDamage(options.iceDamage);
        setLeaveDamage(options.leaveDamage);
        setTreasureHeal(options.treasureHeal);
        setBoardSize(options.boardSize);
        setStartPos(options.startPos);
        setStartDir(options.startDir);
        setRevealTiles(options.revealTiles);
        setTiles({...tiles, ...options.tiles});
        setTreasuresNeeded(options.treasuresNeeded);
        setTopPlayed(options.topPlayed);
        setHandSize(options.handSize);
        setMinPlayed(options.minPlayed);
        setMaxPlayed(options.maxPlayed);
        setCards({...cards, ...options.cards});
        setVotingAnonymity(options.votingAnonymity);
        setMode(options.mode);
        setNameConvention(options.names);
    };
    React.useEffect(() => {
        sendUpdate();
        window.addEventListener('matchOptionsChanged', updateOptions);
        return () => window.removeEventListener('matchOptionsChanged', updateOptions);
    }, []);

    let nrCards = cardsAvailable.filter(card => card[1]).map(card => cards[card[0]]).reduce((a,b)=>a+b);

    return (
        <div>
            <Button color={props.editable ? 'primary' : 'default'} size="small" disabled={!props.editable} onClick={() => {
                options = {...options, ...defaultMatchOptions};
                updateOptions();
                sendUpdate();
            }}>Reset to defaults</Button>
            <Button color="secondary" size="small" onClick={() => {
                presetLoader(props);
            }}>Save/Load preset</Button>
            <Divider style={{marginTop: 16}} />

            <FormControl className={classes.formControl}>
                <FormLabel>Privacy</FormLabel>
                <Typography component="div">
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item><LockIcon /></Grid>
                        <Grid item>
                            <Switch color="primary" checked={publicity} onChange={handlePublicityChange} disabled={!props.editable} />
                        </Grid>
                        <Grid item><PublicIcon /></Grid>
                    </Grid>
                </Typography>

                {props.started ? <Button color={props.editable ? 'primary' : 'disabled'} size="small" onClick={() => socket.emit('newRoomCode')} disabled={!props.editable}>New room code</Button> : null}
            </FormControl>

            <Divider />
            
            <FormControl className={classes.formControl}>
                <FormLabel style={{marginBottom: 5}}>Max players</FormLabel>
                <NumberTweaker fn={changePlayers} min={allowedPlayers[0]} max={allowedPlayers[1]} state={players} disabled={props.started} bigChange />
            </FormControl>
            <Typography>Changing this will also reset the amounts of each type of cards. This cannot be changed in the lobby.</Typography>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel style={{marginBottom: 5}}>Starting ship HP</FormLabel>
                <NumberTweaker fn={changeStartHP} min={1} max={999} state={startHP} disabled={!props.editable} bigChange />
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel style={{marginBottom: 5}}>Maximum ship HP</FormLabel>
                <NumberTweaker fn={changeMaxHP} min={1} max={999} state={maxHP} disabled={!props.editable} bigChange />
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>HP lost per rock hit</FormLabel>
                <RadioGroup value={rockDamage} onChange={changeRockDamage} row>
                    {[1, 2, 3, 4].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>HP lost per iceberg hit</FormLabel>
                <RadioGroup value={iceDamage} onChange={changeIceDamage} row>
                    {[1, 2, 3, 4].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>HP lost when ship tries to move out of the board</FormLabel>
                <RadioGroup value={leaveDamage} onChange={changeLeaveDamage} row>
                    {[0, 1, 2, 3].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>HP healed per treasure found</FormLabel>
                <RadioGroup value={treasureHeal} onChange={changeTreasureHeal} row>
                    {[0, 1, 2, 3].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Board Size</FormLabel>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <Select
                    value={boardSize[1]}
                    onChange={e => changeBoardSize(e.target.value, 1)}
                    displayEmpty
                    className={classes.smallSelect}
                    disabled={!props.editable}
                >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
                <FormHelperText>Width</FormHelperText>
            </FormControl>
            <span style={{
                position: 'relative',
                top: 10,
                fontSize: 35,
            }}>x</span>
            <FormControl className={classes.formControl}>
                <Select
                    value={boardSize[0]}
                    onChange={e => changeBoardSize(e.target.value, 0)}
                    displayEmpty
                    className={classes.smallSelect}
                    disabled={!props.editable}
                >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
                <FormHelperText>Height</FormHelperText>
            </FormControl>
            <span style={{
                position: 'relative',
                top: 14,
                fontSize: 16,
            }}>= {boardSize[1] * boardSize[0]} tiles</span>
            <Typography>Changing this will also reset the amounts of each type of tile and the ship's starting location.</Typography>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Ship starting location</FormLabel>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <Select
                    value={startPos[1]}
                    onChange={e => changeStartPos(e.target.value, 1)}
                    displayEmpty
                    className={classes.smallSelect}
                    disabled={!props.editable}
                >
                    {Array(boardSize[1]).fill(null).map((i, e) => e).map(n => <MenuItem key={n} value={n}>{n+1}</MenuItem>)}
                </Select>
                <FormHelperText>X</FormHelperText>
            </FormControl>
            <span style={{
                position: 'relative',
                top: 0,
                fontSize: 35,
            }}>, </span>
            <FormControl className={classes.formControl}>
                <Select
                    value={startPos[0]}
                    onChange={e => changeStartPos(e.target.value, 0)}
                    displayEmpty
                    className={classes.smallSelect}
                    disabled={!props.editable}
                >
                    {Array(boardSize[0]).fill(null).map((i, e) => e).map(n => <MenuItem key={n} value={n}>{n+1}</MenuItem>)}
                </Select>
                <FormHelperText>Y</FormHelperText>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Ship starting direction</FormLabel>
                <Select
                    value={startDir}
                    onChange={handleStartDirChange}
                    disabled={!props.editable}
                >
                    <MenuItem value={0}>Random (Any)</MenuItem>
                    <MenuItem value={1}>Random (Straight)</MenuItem>
                    <MenuItem value={2}>Random (Diagonal)</MenuItem>
                    <MenuItem value={3}>N</MenuItem>
                    <MenuItem value={4}>NE</MenuItem>
                    <MenuItem value={5}>E</MenuItem>
                    <MenuItem value={6}>SE</MenuItem>
                    <MenuItem value={7}>S</MenuItem>
                    <MenuItem value={8}>SW</MenuItem>
                    <MenuItem value={9}>W</MenuItem>
                    <MenuItem value={10}>NW</MenuItem>
                </Select>
                <FormHelperText>{(() => ({
                    0: 'Ship can start facing any direction',
                    1: 'Ship can start facing any of the following directions: N, E, S, W',
                    2: 'Ship can start facing any of the following directions: NE, SE, SW, NW',
                    3: '↑',
                    4: '↗',
                    5: '→',
                    6: '↘',
                    7: '↓',
                    8: '↙',
                    9: '←',
                    10: '↖',
                }[startDir]))()}</FormHelperText>
            </FormControl>

            <Divider />

            <FormControlLabel
                control={<Checkbox color="primary" checked={revealTiles} onChange={handleRevealTilesChange} disabled={!props.editable} />}
                label="Play with all tiles revealed?"
                labelPlacement="start"
            />

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Tiles</FormLabel>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        tilesAvailable.map(tile => <span style={{marginRight: 5, textAlign: 'center'}}>
                            <img src={`/tiles/${tile[0]}.png`} width={50} />
                            <br />
                            <NumberTweaker fn={change => changeTiles(change, tile[0])} min={tile[1] ? 1 : 0} max={(boardSize[0]*boardSize[1])-(Object.values(tiles).reduce((a,b)=>a+b)-tiles[tile[0]])-1} state={tiles[tile[0]]} disabled={!props.editable} />
                        </span>)
                    }
                </div>
                <Typography>There will be {(boardSize[0]*boardSize[1])-Object.values(tiles).reduce((a,b)=>a+b)} water tile(s).</Typography>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel style={{marginBottom: 5}}>Treasures needed for pirates to win</FormLabel>
                <NumberTweaker fn={changeTreasuresNeeded} min={1} max={tiles.treasure} state={treasuresNeeded} disabled={!props.editable} bigChange />
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Cards played from the top of the deck each turn</FormLabel>
                <RadioGroup value={topPlayed} onChange={changeTopPlayed} row>
                    {[0, 1, 2, 3].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
                <Typography>Changing this will also reset the amounts of each type of cards.</Typography>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Cards drawn per hand</FormLabel>
                <RadioGroup value={handSize} onChange={changeHandSize} row>
                    {[2, 3, 4, 5].map(n => <FormControlLabel value={n} key={n} control={<Radio color="primary" disabled={!props.editable} />} label={n} />)}
                </RadioGroup>
                <Typography>Changing this will also reset the amounts of each type of cards. A deck with at least {players*handSize+topPlayed} non-removable cards is required (also changes based on max players and "Cards played from the top of the deck each turn").</Typography>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Minimum and maximum cards played per player per turn</FormLabel>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <Select
                    value={minPlayed}
                    onChange={changeMinPlayed}
                    displayEmpty
                    className={classes.smallSselect}
                    disabled={!props.editable}
                >
                    {[0, 1, 2, 3, 4, 5].filter(n => n <= handSize && n <= maxPlayed).map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
                <FormHelperText>Min</FormHelperText>
            </FormControl>
            <span style={{
                position: 'relative',
                top: 10,
                fontSize: 35,
            }}>/</span>
            <FormControl className={classes.formControl}>
                <Select
                    value={maxPlayed}
                    onChange={changeMaxPlayed}
                    displayEmpty
                    className={classes.smallSselect}
                    disabled={!props.editable}
                >
                    {[1, 2, 3, 4, 5].filter(n => n <= handSize).map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
                <FormHelperText>Max</FormHelperText>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Cards</FormLabel>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        cardsAvailable.map(card => <span style={{marginRight: 5, textAlign: 'center'}}>
                            <img src={`/cards/${card[0]}.png`} width={70} />
                            <br />
                            <NumberTweaker fn={change => changeCards(change, card[0])} min={card[1] ? (nrCards <= players*handSize+topPlayed ? cards[card[0]] : 0) : 0} max={99} state={cards[card[0]]} disabled={!props.editable} />
                        </span>)
                    }
                </div>
                <Typography>There's {Object.values(cards).reduce((a,b)=>a+b)} cards in this deck ({nrCards} non-removable).</Typography>
            </FormControl>
            
            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Voting anonymity</FormLabel>
                <Select
                    value={votingAnonymity}
                    onChange={handleVotingAnonymityChange}
                    disabled={!props.editable}
                >
                    <MenuItem value={0}>Open</MenuItem>
                    <MenuItem value={1}>Reveal</MenuItem>
                    <MenuItem value={2}>Anonymous</MenuItem>
                </Select>
                <FormHelperText>{(() => ({
                    0: 'Players\' votes are always visible to everyone',
                    1: 'Players\' votes are only visible after everyone has voted and they are no longer allowed to change their vote',
                    2: 'Players\' votes are never shown',
                }[votingAnonymity]))()}</FormHelperText>
            </FormControl>
            
            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Mode</FormLabel>
                <Select
                    value={mode}
                    onChange={handleModeChange}
                    disabled={!props.editable}
                >
                    <MenuItem value={0}>Sea Sight</MenuItem>
                    <MenuItem value={1}>Sea Blindness</MenuItem>
                    <MenuItem value={2}>Allied Traitor</MenuItem>
                    <MenuItem value={3}>Undefended</MenuItem>
                </Select>
                <FormHelperText>{(() => ({
                    0: 'All Sea Monsters know their teammate (if they have one)',
                    1: 'Sea Monsters don\'t know who their teammate is',
                    2: 'Play with Allied Traitor rules (see rulebook)',
                    3: 'Pirates only! No Sea Monsters in this mode!',
                }[mode]))()}</FormHelperText>
            </FormControl>

            <Divider />

            <FormControl className={classes.formControl}>
                <FormLabel>Naming convention</FormLabel>
                <Select
                    value={nameConvention}
                    onChange={handleNameConventionChange}
                    disabled={!props.editable}
                >
                    <MenuItem value={0}>Normal</MenuItem>
                    <MenuItem value={1}>Gifted</MenuItem>
                    <MenuItem value={2}>Random</MenuItem>
                </Select>
                <FormHelperText>{(() => ({
                    0: 'Players use their chosen name',
                    1: 'Players\' chosen names are shuffled between them',
                    2: 'Each player gets a pirate name',
                }[nameConvention]))()}</FormHelperText>
            </FormControl>
        </div>
    );
}

function changeOptions(newOptions) {
    options = newOptions;
    window.dispatchEvent(new Event('matchOptionsChanged'));
}

function hostChanged(amNowHost) {
    if (dialog.state.open && dialog.editable != amNowHost)
        showMatchOptions({editable: amNowHost, started: true});
}

var dialog = {
    state: {
        open: false,
    }
};

async function showMatchOptions(props) {
    let elem;

    dialog = await showDialog({
        ...(props.started ? {
            title: 'Match options',
            description: `Current options${props.ingame ? '' : ' (editable by the host)'}:`,
        } : {
            title: 'Create Match',
            description: 'Match options:',
            buttonText: 'Create',
            buttonAction: () => {
                dialog.handleClose();
                localStorage.MatchOptions = JSON.stringify(options);
                socket.emit('createMatch', options);
            }
        }),
    }, <MatchOptions {...props} />);
    dialog.editable = props.editable;
}

function PresetLoader(props) {
    let [enteredOptions, setEnteredOptions] = React.useState('');
    let copyHelp = 'Copy the options code for your currently chosen match options.';
    let [copyTitle, setCopyTitle] = React.useState(copyHelp);

    return (<div>
        <TextField
            label="Options code"
            defaultValue=""
            value={enteredOptions}
            onChange={e => setEnteredOptions(e.target.value)}
            helperText="Paste your options code here and click Load to load it"
            variant="outlined"
            disabled={!props.editable}
        />
        <Button color={props.editable ? 'primary' : 'default'} disabled={!props.editable} onClick={() => {
            try {
                options = {...options, ...JSON.parse(atob(enteredOptions))};
                showMatchOptions(props);
            } catch(e) {
                alert(e);
            }
        }}>Load</Button>

        <Divider />
        <Tooltip title={copyTitle}>
            <IconButton onClick={() => {
                copy(btoa(JSON.stringify(options)));
                setCopyTitle('Copied to clipboard!');
                setTimeout(() => {
                    setCopyTitle(copyHelp);
                }, 3000);
            }}><LinkIcon /></IconButton>
        </Tooltip>
    </div>);
}

async function presetLoader(props) {
    let elem;

    dialog = await showDialog({
        title: 'Preset loader/saver',
        buttonText: 'Match options',
        buttonAction: () => showMatchOptions(props),
    }, <PresetLoader {...props} />);
}

export default {
    showMatchOptions,
    changeOptions,
    hostChanged,
};