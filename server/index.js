const { SportsCricket } = require('@material-ui/icons');
const cfg = require('./cfg');
const maxUsernameLength = 6;
const allowedUsernameChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 áéíóúÁÉÍÓÚ!"£$€%^&*()-=_+[]{};\'#:@~,./<>?\\|`¬¦';
const colorsAllowed = [...Array(16).keys()];
const playersAllowed = [1, 8];
const HPAllowed = [1, 999];
const tileDamageAllowed = [1, 4];
const leaveDamageAllowed = [0, 3];
const treasureHealAllowed = [0, 3];
const boardSizeAllowed = [2, 15];
const tiles = [
    ['treasure', true],
    ['rock', false],
    ['iceberg', false],
    ['waves', false],
    ['storm', false],
    ['alcohol', false],
    ['whirlpoolleft', false],
    ['whirlpoolright', false],
];
const requiredTiles = tiles.filter(tile => tile[1]).map(tile => tile[0]);
const topPlayedAllowed = [0, 3];
const handSizeAllowed = [2, 5];
const cards = [
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
    ['turnr4', true],
    ['seasickness', true],
    ['persist', true],
    ['relocate', true],
    ['chaos', true],
    ['bravery', true],
    ['compass0', true],
    ['compass1', true],
    ['compass2', true],
    ['compass3', true],
    ['compass4', true],
    ['compass5', true],
    ['compass6', true],
    ['compass7', true],
    ['hammer', true],
    ['nail', true],
    ['hammernail', false],
    ['lookout', true],
    ['reinforce', true],
    ['matchstick', true],
    ['block', true],
    ['mute', true],
    ['brig', true],
    ['captain', true],
    ['investigate', false],
    ['mutiny', false],
];
const nrCards = cards.filter(card => card[1]).map(card => card[0]);
const votingAnonymities = [0,1,2];
const modesAllowed = [0,1,2,3];
const namesAllowed = [0,1,2];

const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const io = require("socket.io")(cfg.port, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
});

function generateUsername(socket) {
    socket.username = `P${String(Math.random()).slice(2, 2+3)}`;
}

function joinMatch(match, socket) {
    if (socket.ingame)
        return socket.emit('err');
    if (Object.keys(match.players).length >= match.maxPlayers)
        return socket.emit('err', 'That match was full or had already started.', 'Couldn\'t join match');
    match.join(socket.id);
    socket.join(match.code);
    socket.emit('joinMatch');
    socket.ingame = match.code;
}

function createMatch(socket, options) {
    if (socket != null && socket.ingame)
        return;
    let match = new Match(options);
    let code = generateMatchCode();
    matches[code] = match;
    match.code = code;
    if (socket != null)
        joinMatch(match, socket);
    setTimeout(() => {
        if (matches[code] && Object.keys(matches[code].players).length == 0)
            delete matches[code];
    }, 10000);
    return match;
}

let optionsValid = options => (
    typeof options == 'object'
    && typeof options.public == 'boolean'
    && Number.isInteger(options.players)
    && options.players >= playersAllowed[0]
    && options.players <= playersAllowed[1]
    && Number.isInteger(options.startHP)
    && options.startHP >= HPAllowed[0]
    && options.startHP <= HPAllowed[1]
    && Number.isInteger(options.maxHP)
    && options.maxHP >= HPAllowed[0]
    && options.maxHP <= HPAllowed[1]
    && options.maxHP >= options.startHP
    && Number.isInteger(options.rockDamage)
    && options.rockDamage >= tileDamageAllowed[0]
    && options.rockDamage <= tileDamageAllowed[1]
    && Number.isInteger(options.iceDamage)
    && options.iceDamage >= tileDamageAllowed[0]
    && options.iceDamage <= tileDamageAllowed[1]
    && Number.isInteger(options.leaveDamage)
    && options.leaveDamage >= leaveDamageAllowed[0]
    && options.leaveDamage <= leaveDamageAllowed[1]
    && Number.isInteger(options.treasureHeal)
    && options.treasureHeal >= treasureHealAllowed[0]
    && options.treasureHeal <= treasureHealAllowed[1]
    && Array.isArray(options.boardSize)
    && options.boardSize.every(i => Number.isInteger(i) && i >= boardSizeAllowed[0] && i <= boardSizeAllowed[1])
    && Array.isArray(options.startPos)
    && options.startPos.every((i, e) => Number.isInteger(i) && i >= 0 && i < options.boardSize[e])
    && Number.isInteger(options.startDir)
    && options.startDir >= 0
    && options.startDir <= 10
    && typeof options.revealTiles == 'boolean'
    && typeof options.tiles == 'object'
    && Object.keys(options.tiles).length == tiles.length //there are the right amount of tile type valuess
    && tiles.every(tile=>options.tiles.hasOwnProperty(tile[0])) //every tile type name is a real tile type name
    && Object.values(options.tiles).every(tile => Number.isInteger(tile) && tile >= 0) //every tile's value is an integer
    && requiredTiles.every(tile => options.tiles[tile] > 0) //every required tile has a value of at least 1
    && Object.values(options.tiles).reduce((a,b)=>a+b) < options.boardSize[0]*options.boardSize[1] //there arent more tiles than the board can handle
    && Number.isInteger(options.treasuresNeeded)
    && options.treasuresNeeded >= 1
    && options.treasuresNeeded <= options.tiles.treasure
    && Number.isInteger(options.topPlayed)
    && options.topPlayed >= topPlayedAllowed[0]
    && options.topPlayed <= topPlayedAllowed[1]
    && typeof options.evilsSeeCards == 'boolean'
    && Number.isInteger(options.handSize)
    && options.handSize >= handSizeAllowed[0]
    && options.handSize <= handSizeAllowed[1]
    && Number.isInteger(options.minPlayed)
    && options.minPlayed >= 0
    && options.minPlayed <= options.handSize
    && Number.isInteger(options.maxPlayed)
    && options.maxPlayed >= 1
    && options.maxPlayed <= options.handSize
    && options.maxPlayed >= options.minPlayed
    && typeof options.cards == 'object'
    && Object.keys(options.cards).length == cards.length //there are the right amount of card type valuess
    && cards.every(card=>options.cards.hasOwnProperty(card[0])) //every card name is a real card name
    && Object.values(options.cards).every(card => Number.isInteger(card) && card >= 0 && card <= 99) //every card's value is an integer
    && nrCards.map(card=>options.cards[card]).reduce((a,b)=>a+b) >= options.players*options.handSize+options.topPlayed //there are enough non-removable cards so that a hand can be dealt to every player
    && Number.isInteger(options.votingAnonymity)
    && votingAnonymities.includes(options.votingAnonymity)
    && Number.isInteger(options.mode)
    && modesAllowed.includes(options.mode)
    && Number.isInteger(options.names)
    && namesAllowed.includes(options.names)
);

io.on('connection', socket => {
    generateUsername(socket);
    socket.num = 0;
    socket.ingame = false;

    socket.on('changeName', newName => {
        if (typeof newName == 'string' && !(socket.ingame && matches[socket.ingame].started)) {
            let usernameAllowed = true;
            for (let i of newName)
                if (!allowedUsernameChars.includes(i))
                    usernameAllowed = false;
                
            if (usernameAllowed && newName.length > 0 && newName.length <= maxUsernameLength) {
                socket.username = newName;
            } else
                generateUsername(socket);
            
            if (socket.ingame && matches[socket.ingame].turnNum == 0) {
                matches[socket.ingame].players[socket.id].name = socket.username;
                matches[socket.ingame].matchUpdate();
            }
        }
    });

    socket.on('changeColor', color => {
        color = Number(color);
        if (colorsAllowed.includes(color)) {
            if (socket.ingame) {
                matches[socket.ingame].setNum(socket.id, color);
            } else {
                socket.num = color;
            }
        }
    });

    socket.on('joinMatch', code => {
        if (typeof code == 'string' && matches.hasOwnProperty(code.toUpperCase())) {
            let match = matches[code.toUpperCase()];
            if (Object.keys(match.players).length < match.maxPlayers || match.started) {
                if (!match.started)
                    joinMatch(match, socket);
                else {
                    let disconnected = Object.values(match.players).filter(p => !p.connected);
                    if (disconnected.length > 0) {
                        socket.emit('comebackchoice', disconnected.map(p => ({
                            name: p.name,
                            num: p.num,
                        })), match.code);
                    } else
                        socket.emit('err', ':(', 'That match has already started.');
                }
            } else
                socket.emit('err', `It's reached its ${match.maxPlayers} player limit, and no more players can join.`, 'That match is full.');
        } else
            socket.emit('err', 'Try again.', 'Invalid room code')
    });

    socket.on('findMatch', () => {
        let matchesAvailable = Object.values(matches).filter(e => e.isPublic && !e.started && Object.keys(e.players).length < e.maxPlayers);
        if (matchesAvailable.length > 0) //if there are available matches
            joinMatch(matchesAvailable[Math.floor(Math.random()*matchesAvailable.length)], socket);
        else
            socket.emit('noMatches');
    });

    socket.on('comeback', (num, code) => {
        if (!socket.ingame && Number.isInteger(num) && typeof code == 'string') {
            let match = matches[code];
            if (!match) return socket.emit('err', 'This match is no longer available to join.', 'Too late');
            let player = Object.values(match.players).find(p => p.num == num);
            if (!player || player.connected) return socket.emit('err', 'You can no longer join as this player.', 'Too late');
            match.players[socket.id] = player;
            delete match.players[player.socket.id];
            match.players[socket.id].socket = socket;
            match.players[socket.id].connected = true;
            socket.ingame = match.code;
            socket.join(match.code);
            let players = match.playerInfo(p => ({
                dead: p.dead,
                num: p.num,
            }));
            socket.emit('matchStart', {
                ...JSON.parse(player.startInfo),
                me: players.find(p => p.num == player.num),
                players,
                ship: match.ship,
                dir: match.dir,
                board: match.board.map((row, y) => row.map((tile, x) => match.revealed[y][x] ? tile : 'unknown')),
            });
            setTimeout(() => {
                match.sendLog(`${player.name} rejoined the game.`);

                socket.emit('turnNum', match.turnNum);
                for (let i = 0; i < match.treasuresFound; i++)
                    socket.emit('treasure');
                socket.emit('damage', match.startHP - match.HP);
    
                switch (match.phase) {
                    case 'choose':
                        if (player.waitStatus == 0)
                            socket.emit('cards', player.hand);
                        else
                            socket.emit('wait', Object.values(match.players).map(p => ({n: p.num, s: p.waitStatus})));
                        break;
                    
                    case 'play':
                        io.to(this.code).emit('play', 'back', match.playPile.length);
                        break;
                    
                    case 'choosePlayer':
                        if (match.chooseOccasion == 'alliedTraitor') {
                            if (player.role == 'seamaster') {
                                socket.emit('choosePlayer', 'Who do you think is the biologist?');
                                break;
                            }
                        } else if (match.chooseOccasion == 'investigate') {
                            if (player.num == match.investigator) {
                                socket.emit('choosePlayer', 'Who would you like to learn the role of?');
                                break;
                            }
                        }
                        
                    case 'discuss':
                        socket.emit('discuss', match.currentVote);
                        socket.emit('mute', match.mute > 0);
                        Object.values(match.players).forEach(p => socket.emit('vote', p.num, match.votingAnonymity == 0 ? p.vote : true));
                        socket.emit('vote', player.num, player.vote);
                        break;
                }
            }, 1000);
        }
    });

    socket.on('rejoin', (rejoinCode, options) => {
        if (typeof rejoinCode == 'string') {
            let match = Object.values(matches).find(m => m.rejoinCode == rejoinCode);
            if (match != undefined) {
                socket.emit('rejoin', match.code);
            } else {
                if (optionsValid(options)) {
                    match = createMatch(null, options);
                    match.rejoinCode = rejoinCode;
                    socket.emit('rejoin', match.code);
                }
            }
        }
    });

    socket.on('createMatch', options => {
        console.log(options.evilsSeeCards);
        if (optionsValid(options))
            createMatch(socket, options);
    });

    socket.on('updateOptions', newOptions => {
        if (socket.ingame && matches[socket.ingame].host == socket.id && !matches[socket.ingame].started && optionsValid({...newOptions, players: matches[socket.ingame].maxPlayers}))
            matches[socket.ingame].setOptions({
                ...newOptions,
                players: matches[socket.ingame].maxPlayers,
            });
    });

    socket.on('newRoomCode', () => {
        if (socket.ingame && matches[socket.ingame].host == socket.id && !matches[socket.ingame].started) {
            let match = matches[socket.ingame];
            let oldCode = match.code;
            let newCode = generateMatchCode();
            delete matches[oldCode];
            matches[newCode] = match;
            match.code = newCode;
            Object.keys(match.players).forEach(id => {
                let p = io.sockets.sockets.get(id);
                p.ingame = newCode;
                p.leave(oldCode);
                p.join(newCode);
            });
            match.matchUpdate();
        }
    });

    socket.on('kick', toKick => {
        if (socket.ingame)
            matches[socket.ingame].kick(toKick, socket.id);
    });

    socket.on('promote', toPromote => {
        if (socket.ingame)
            matches[socket.ingame].promote(toPromote, socket.id);
    });

    socket.on('startMatch', () => {
        if (socket.ingame)
            matches[socket.ingame].startStartTimer(socket.id);
    });

    socket.on('msg', msg => {
        if (socket.ingame && typeof msg == 'string' && msg.length > 0 && msg.length <= 99 && !matches[socket.ingame].players[socket.id].dead && matches[socket.ingame].mute <= 0) {
            io.to(socket.ingame).emit('message', {m: msg, p: matches[socket.ingame].players[socket.id].num});
        }
    });

    socket.on('play', cards => {
        if (socket.ingame && Array.isArray(cards)) {
            let match = matches[socket.ingame];
            let player = match.players[socket.id];
            if (match.turnNum > 0 && player.waitStatus == 0 && cards.length >= match.minPlayed && cards.length <= match.maxPlayed && cards.every((card, index) => (player.hand.hasOwnProperty(card) && cards.indexOf(card) == index))) {
                match.chooseCards(socket.id, cards);
            }
        }
    });

    socket.on('vote', num => {
        if (socket.ingame) {
            let match = matches[socket.ingame];
            if (match.allowVoting && Object.values(match.players).some(p => p.num === num && !p.dead) && !match.players[socket.id].dead)
                match.vote(socket.id, num);
        }
    });

    socket.on('choosePlayer', num => {
        if (socket.ingame) {
            let match = matches[socket.ingame];
            let chosen = Object.values(match.players).find(p => p.num == num);
            if (chosen != undefined)
                match.playerChosen(match.players[socket.id], chosen);
        }
    });

    socket.on('disconnect', () => {
        if (socket.ingame && matches[socket.ingame])
            matches[socket.ingame].leave(socket.id);
    });
});

function generateMatchCode() {
    let code;
    if (codeChars ** cfg.codeLength > Object.keys(matches).length)
        cfg.codeLength++;
    do {
        code = '';
        for (let i = 0; i < cfg.codeLength; i++)
            code += codeChars[Math.floor(Math.random()*codeChars.length)];
    } while (matches.hasOwnProperty(code))
    return code;
}

var matches = {};

module.exports = {
    io,
    matches
};

const Match = require('./Match');

console.log(`Server up, port ${cfg.port}`);