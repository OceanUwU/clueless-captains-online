const Game = require('./Game');
const { matches, io } = require('./');
const nameWords = require('./nameWords.js');

const voteOrder = ['brig', 'captain', 'investigate', 'mutiny'];
const defaultPlayer = {
    dead: false,
    playIn: 0,
    hand: [],
};

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

class Match {
    constructor(options) {
        this.started = false;
        this.startTimer = 6;
        this.maxPlayers = options.players;
        this.setOptions(options);
        this.players = {};
        this.drawPile = [];
        this.discardPile = [];
        this.turnNum = 0;
        this.host = null;
        this.currentVote = null;
        this.allowVoting = false;
        this.treasuresFound = 0;
        this.captain = null;
    }

    setOptions(options) {
        this.isPublic = options.public;
        this.startHP = options.startHP;
        this.maxHP = options.maxHP;
        this.rockDamage = options.rockDamage;
        this.iceDamage = options.iceDamage;
        this.leaveDamage = options.leaveDamage;
        this.treasureHeal = options.treasureHeal;
        this.boardSize = options.boardSize;
        this.revealTiles = options.revealTiles;
        this.tiles = options.tiles;
        this.treasuresNeeded = options.treasuresNeeded;
        this.topPlayed = options.topPlayed;
        this.handSize = options.handSize;
        this.minPlayed = options.minPlayed;
        this.maxPlayed = options.maxPlayed;
        this.cards = options.cards;
        this.votingAnonymity = options.votingAnonymity;
        this.mode = options.mode;
        this.names = options.names;
        this.matchUpdate();
    }

    playerInfo(fn=null) {
        return Object.keys(this.players).map(player => {
            let p = {
                id: player.slice(0,6),
                name: this.turnNum > 0 ? this.players[player].genName : this.players[player].name,
                bot: this.players[player].bot,
            };
            if (fn != null) p = {...p, ...fn(this.players[player])}
            return p;
        });
    }

    matchInfo() {
        return {
            starting: this.started,
            startTimer: this.startTimer,
            host: this.host ? this.host.slice(0, 6) : null,
            started: this.turnNum > 0,
            code: this.code,
            options: {
                public: this.isPublic,
                players: this.maxPlayers,
                startHP: this.startHP,
                maxHP: this.maxHP,
                rockDamage: this.rockDamage,
                iceDamage: this.iceDamage,
                leaveDamage: this.leaveDamage,
                treasureHeal: this.treasureHeal,
                boardSize: this.boardSize,
                revealTiles: this.revealTiles,
                tiles: this.tiles,
                treasuresNeeded: this.treasuresNeeded,
                topPlayed: this.topPlayed,
                handSize: this.handSize,
                minPlayed: this.minPlayed,
                maxPlayed: this.maxPlayed,
                cards: this.cards,
                votingAnonymity: this.votingAnonymity,
                mode: this.mode,
                names: this.names,
            },
            players: this.playerInfo()
        };
    }

    matchUpdate() {
        setTimeout(() => {
            io.to(this.code).emit('matchUpdate', this.matchInfo());
        }, 100);
    }

    join(player) {
        this.players[player] = {
            ...JSON.parse(JSON.stringify(defaultPlayer)),
            socket: io.sockets.sockets.get(player),
            name: io.sockets.sockets.get(player).username,
            bot: false,
            difficulty: 1,
        }
        if (Object.keys(this.players).length == 1)
            this.host = Object.keys(this.players)[0];
        this.matchUpdate();
    }

    leave(player) {
        if (!this.started) {
            delete this.players[player];
            
            if (Object.keys(this.players).length == 0 || !(Object.values(this.players).some(p => !p.bot))) //if there are no players left (not including bots)
                delete matches[this.code];
            else {
                if (!this.players.hasOwnProperty(this.host))
                    this.host = Object.keys(this.players)[0];
                this.matchUpdate();
            }
        } else {
            this.players[player].bot = true;
            if (!(Object.values(this.players).some(p => !p.bot))) { //if there are no non-bot players left
                if (this.turnNum > 0)
                    this.treasuresFound = Infinity;
                else
                    this.ditchGame = true;
            } else {
                //this.players[player].name += '(🤖)';
            }
        }
    }

    kick(player, kicker) {
        if (kicker == this.host && !this.started) {
            let toKick = Object.keys(this.players).find(p => p.startsWith(player));
            if (toKick != null && toKick != kicker) {
                if (this.players[toKick].bot) {
                    delete this.players[toKick];
                } else {
                    this.leave(toKick);
                    let socket = io.sockets.sockets.get(toKick);
                    socket.emit('kicked', io.sockets.sockets.get(kicker).username);
                    socket.disconnect();
                }
                this.matchUpdate();
            }
        }
    }

    promote(player, promoter) {
        if (promoter == this.host && !this.started) {
            let toPromote = Object.keys(this.players).find(p => p.startsWith(player));
            if (toPromote != null && toPromote != promoter && !this.players[toPromote].bot) {
                this.host = toPromote;
                this.matchUpdate();
            }
        }
    }

    startStartTimer(player) {
        if (player == this.host && !this.started) {
            this.started = true;
            delete this.rejoinCode;
            this.updateStartTimer();
        }
    }

    updateStartTimer() {
        this.startTimer--;
        if (this.startTimer <= 0) {
            this.start();
        } else {
            this.matchUpdate();
    
            setTimeout(this.updateStartTimer.bind(this), 1000);
        }
    }

    start() {
        this.playersPlaying = Object.keys(this.players).length;
        shuffleArray(Object.values(this.players)).forEach((player, index) => {
            player.num = index;
        });

        //shuffle tiles + set up board
        let nonWaterTiles = Object.keys(this.tiles).map(tile => Array(this.tiles[tile]).fill(tile));
        this.centre = Math.round((this.boardSize-1)/2);
        this.ship = [this.centre, this.centre];
        this.HP = this.startHP;
        let tiles = shuffleArray([].concat.apply([], [...nonWaterTiles, Array(((this.boardSize**2)-1)-nonWaterTiles.reduce((a,b)=>(typeof a == 'object' ? a.length : a)+b.length)).fill('water')]));
        tiles.splice(this.boardSize*this.centre+this.centre, 0, 'water');
        this.board = [];
        for (let y = 0; y < this.boardSize; y++) {
            let row = [];
            for (let x = 0; x < this.boardSize; x++)
                row.push(tiles[y*this.boardSize+x]);
            this.board.push(row);
        }
        this.revealed = Array(this.boardSize).fill(null).map(e => Array(this.boardSize).fill(this.revealTiles));
        this.revealed[this.centre][this.centre] = true; //boat spawn tile is revealed

        //make+shuffle deck
        this.drawPile = shuffleArray([].concat.apply([], Object.entries(this.cards).map(card => Array(card[1]).fill(card[0]))));

        //give out roles
        let roles = Array(this.playersPlaying).fill('pirate');
        switch (this.mode) {
            case 2:
                if (this.playersPlaying < 6) {
                    this.mode = 1; //set to mode 1 - sea blindness
                    //fallthrough
                } else {
                    roles[0] = 'biologist';
                    roles[1] = 'seamaster';
                    roles[2] = 'seaservant';
                    break;
                }
            
            case 0:
                if (this.playersPlaying < 6) //if there arent enough players for a second sea monster
                    this.mode = 1; //set to mode 1 - sea blindness (no need to see teammates)
                //fallthrough (same roles as mode 1)
            case 1:
                if (this.playersPlaying < 3) { //if there arent enough players for pirates
                    this.mode = 3; //set to pirate only mode
                    //fallthrough (same roles as mode 3)
                } else {
                    roles[0] = 'seamonster';
                    if (this.playersPlaying >= 6) //if there are enough players for a second sea monster
                        roles[1] = 'seamonster'; //add one
                    break;
                }

            case 3: //everyone is a pirate
                break; //so no need to change roles
        }
        shuffleArray(roles);
        Object.values(this.players).forEach((player, index) => player.role = roles[index]); //give players their roles

        //give players their names
        switch (this.names) {
            case 0: //normal
                Object.values(this.players).forEach(player => player.genName = player.name);
                break;

            case 1: //gifted
                let shuffledNames = shuffleArray(Object.values(this.players).map(player => player.name));
                Object.values(this.players).forEach((player, index) => player.genName = shuffledNames[index]);
                break;

            case 2: //random
                Object.values(this.players).forEach((player, index) => player.genName = nameWords[index]);
                break;         
        }

        //set up players
        let matchInfo = {
            players: this.playerInfo(p => ({
                dead: false,
                num: p.num,
            })),
            options: this.matchInfo().options,
            ship: this.ship,
            board: this.board.map((row, y) => row.map((tile, x) => this.revealed[y][x] ? tile : 'unknown')),
        };
        Object.values(this.players).forEach(player => {
            let startInfo = {
                ...matchInfo,
                me: matchInfo.players.find(p => p.num == player.num),
                role: player.role,
            };
            switch (player.role) {
                case 'pirate':
                    break; //no extra info needed
                case 'biologist':
                    startInfo.roles = Object.values(this.players).map(p => ({num: p.num, role: p.role})); //tell the biologist the roles of everyone
                    break;
                case 'seamaster': //fallthrough (sea master starts out the same as a sightful sea monster)
                case 'seamonster':
                    if (this.mode == 0 || this.mode == 2) //if sea monsters should be able to see teammates (or this is the sea master)
                        startInfo.teammate = startInfo.players.find(pl => pl.num == Object.values(this.players).find(p => ((p.num != player.num) && (p.role == 'seamonster' || p.role == 'seaservant'))).num);
                    break;
                case 'seaservant':
                    break; //no extra info needed
            }
            player.socket.emit('matchStart', startInfo);
        });

        if (this.ditchGame)
            this.treasuresFound = Infinity;

        setTimeout(this.startTurn.bind(this), 250);
    }

    startTurn() {
        io.to(this.code).emit('turnNum', ++this.turnNum);
        this.sendLog(`--==<<((|| Turn ${this.turnNum} ||))>>==--`);

        if (this.drawPile.length < Object.values(this.players).filter(p=>p.playIn <= 0).length*this.handSize+this.topPlayed) { //if there aren't enough cards to deal everyone a hand
            this.sendLog('There weren\'t enough cards in the draw pile to deal everyone a hand, so the discard pile was shuffled into the draw pile.');
            this.drawPile = shuffleArray([...this.drawPile, ...this.discardPile]);
            this.discardPile = []; //discard pile has moved to draw pile, so clear it
        }
        this.playPile = this.drawPile.splice(0, this.topPlayed); //play the correct amount of cards from the top of the draw pile
        if (this.topPlayed > 0)
            this.sendLog(`${this.topPlayed} card${this.topPlayed == 1 ? '' : 's'} were played from the top of the draw pile.`);

        Object.values(this.players).forEach(player => {
            player.cardsPlayed = null;
            if (player.playIn-- <= 0 && !player.dead) { //if player is allowed to play cards this turn and is alive
                player.waitStatus = 0;
                if (player.playIn < 0) player.playIn = 0;
                player.hand = this.drawPile.splice(0, this.handSize);
                player.socket.emit('cards', player.hand);
            } else {
                player.waitStatus = 2;
                player.socket.emit('err', 'You\'re either in the brig, dead, or only the captain can play cards this turn.', 'You can\'t play cards this turn.');
            }
        });
        this.waitStatuses();
    }

    chooseCards(socketID, cardsChosen) {
        let player = this.players[socketID];
        player.hand.forEach((card, index) => ((cardsChosen.includes(index) ? this.playPile : this.discardPile).push(card)));
        player.hand = [];
        player.cardsPlayed = cardsChosen.length;
        player.waitStatus = 1;
        this.waitStatuses();
        this.sendLog(`${player.name} played ${player.cardsPlayed} card${player.cardsPlayed == 1 ? '' : 's'}.`);
    }

    waitStatuses() {
        let statuses = Object.values(this.players).map(player => ({n: player.num, s: player.waitStatus}));
        let sendTo = Object.values(this.players).filter(player => player.waitStatus != 0);
        sendTo.forEach(player => player.socket.emit('wait', statuses));
        if (sendTo.length == statuses.length) { //if everyone has played their cards
            setTimeout((() => {
                shuffleArray(this.playPile);
                io.to(this.code).emit('play', 'blank', this.playPile.length);
        
                this.currentVote = null;
                io.to(this.code).emit('currentVote', this.currentVote);
                this.lookout = false;
                this.reinforced = false;
                this.HNUsed = false;
                this.hammer = false;
                this.nail = false;

                this.playCards();
            }).bind(this), 1600);
        }
    }

    playCards() {
        if (this.playPile.length > 0) {
            setTimeout((() => io.to(this.code).emit('play', 'back', this.playPile.length-1)).bind(this), 3500-1000);
            setTimeout(this.playNextCard.bind(this), 3500);
        } else {
            this.sendLog(`There ${this.drawPile.length == 1 ? 'is' : 'are'} now ${this.drawPile.length} card${this.drawPile.length == 1 ? '' : 's'} left in the draw pile.`);
            Object.values(this.players).forEach(player => {
                player.vote = null;
                io.to(this.code).emit('vote', player.num, player.vote);
            });
            this.allowVoting = true;
            setTimeout((() => io.to(this.code).emit('discuss', this.currentVote)).bind(this), 4000);
            if (this.currentVote != null) {
                this.sendLog(`You're voting for: ${this.currentVote}. At least ${Object.values(this.players).filter(p => !p.dead).length - Object.values(this.players).filter(p => p.role.startsWith('sea')).length} identical votes are needed for anything to happen.`);
            }
        }
    }

    async playNextCard() {
        let card = this.playPile.splice(0, 1)[0];
        let saveCard = card;
        let discard = true;

        io.to(this.code).emit('play', card, this.playPile.length);

        switch (true) {
            //movement cards
            case 'persist' == card:
                if (this.lastMovement == null)
                    break;
                else {
                    this.discardPile.push(card);
                    discard = false;
                    card = this.lastMovement;
                }
            case /\b[nsew]{1}[1234]{1}\b/.test(card):
                this.lastMovement = card;
                for (let i = 0; i < Number(card[1]); i++)
                    if (!(await this.moveShip({
                        s: [1, 0],
                        n: [-1, 0],
                        e: [0, 1],
                        w: [0, -1]
                    }[card[0]]))) return;
                break;
            case 'relocate' == card:
                this.ship = [this.centre, this.centre];
                if (!(await this.moveShip([0,0], 1))) return;
                break;
            
            //compass cards
            case /compass[12]{1}/.test(card):
                [
                    [[-1, 0], [1, 0], [0, -1], [0, 1]],
                    [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]],
                ][Number(card[card.length-1]-1)].forEach(location => this.revealTile(this.ship[0]+location[0], this.ship[1]+location[1]));
                break;

            
            //healing cards
            case 'hammer' == card:
                this.hammer = true;
                if (!this.HNUsed && this.nail) {
                    this.HNUsed = true;
                    this.healShip(1);
                }
                break;
            case 'nail' == card:
                this.nail = true;
                if (!this.HNUsed && this.hammer) {
                    this.HNUsed = true;
                    this.healShip(1);
                }
                break;
            case 'hammernail' == card:
                this.healShip(1);
                discard = false;
                break;
            case 'lookout' == card:
                this.lookout = true;
                break;
            case 'reinforce' == card:
                this.reinforced = true;
                break;
            
            //detriment cards
            case 'matchstick' == card:
                this.damageShip(1);
                break;

            //vote cards
            case voteOrder.includes(card):
                if (this.currentVote == null) {
                    this.currentVote = card;
                    discard = false; //this card is saved as this turn's voting card, so it will be discarded later
                    io.to(this.code).emit('currentVote', this.currentVote);
                } else if (voteOrder.indexOf(card) > voteOrder.indexOf(this.currentVote)) {
                    card = this.currentVote; //the old voting card is discarded instead
                    this.currentVote = saveCard;
                    io.to(this.code).emit('currentVote', this.currentVote);
                }
                break;
        }

        if (discard)
            this.discardPile.push(card);

        this.playCards();
    }

    moveShip(direction) {
        return new Promise(res => {
            //move ship
            this.ship[0] += direction[0];
            this.ship[1] += direction[1];

            //if ship tried to leave board
            if (this.ship[0] >= this.boardSize || this.ship[0] < 0 || this.ship[1] >= this.boardSize || this.ship[1] < 0) { //if ship is out of bounds
                this.ship = this.ship.map(c => Math.min(Math.max(c, 0), this.boardSize - 1)); //put it back in bounds
                this.damageShip(this.leaveDamage);
            } else {
                io.to(this.code).emit('move', this.ship);
                this.revealTile(this.ship[0], this.ship[1]);

                switch (this.board[this.ship[0]][this.ship[1]]) {
                    case 'water':
                        break;
                    case 'treasure':
                        this.treasuresFound++;
                        io.to(this.code).emit('treasure');
                        this.healShip(this.treasureHeal, false);
                        this.changeTile(this.ship[0], this.ship[1], 'water');
                        if (this.treasuresFound >= this.treasuresNeeded) {
                            this.endMatch('treasure');
                            return res(false);
                        }
                        break;
                    case 'rock':
                        this.damageShip(this.rockDamage);
                        break;
                    case 'iceberg':
                        this.damageShip(this.iceDamage);
                        this.changeTile(this.ship[0], this.ship[1], 'water');
                        break;
                }
            }
            

            if (this.HP <= 0) {
                this.endMatch('sink');
                return res(false);
            }

            setTimeout(() => res(true), 1000);
        })
    }

    revealTile(y, x) {
        if (!(this.revealed.hasOwnProperty(y) && this.revealed[y].hasOwnProperty(x))) return;
        let revealed = this.revealed[y][x];
        if (!revealed) {
            this.revealed[y][x] = true;
            io.to(this.code).emit('reveal', [y, x], this.board[y][x]);
        }
    }

    changeTile(y, x, newTile) {
        this.board[y][x] = newTile;
        setTimeout((() => io.to(this.code).emit('changeTile', [y, x], newTile)).bind(this), 500);
    }

    damageShip(amount) {
        if (this.lookout || this.reinforced) {
            this.lookout = false;
            io.to(this.code).emit('damageBlocked', amount);
        } else {
            this.HP -= amount;
            io.to(this.code).emit('damage', amount);
        }
    }

    healShip(amount, broadcast=true) {
        this.HP += amount;
        if (this.HP > this.maxHP)
            this.HP = this.maxHP;
        if (broadcast)
            io.to(this.code).emit('heal', amount);
    }

    sendLog(logMessage) {
        io.to(this.code).emit('message', {l: logMessage});
    }

    vote(socketID, num) {
        let player = this.players[socketID];
        player.vote = num;
        io.to(this.code).emit('vote', player.num, this.votingAnonymity == 0 ? player.vote : true);
        if (this.votingAnonymity != 0)
            player.socket.emit('vote', player.num, player.vote);
        if (Object.values(this.players).filter(p => !p.dead).every(p => p.vote != null)) { //if everyone has voted
            this.allowVoting = false;
            setTimeout((() => {
                if (this.votingAnonymity == 1) {
                    Object.values(this.players).forEach(p => io.to(this.code).emit('vote', p.num, p.vote)); //reveal everyone's votes
                }
                setTimeout((() => {
                    if (this.currentVote == null) {
                        this.endTurn();
                    } else {
                        let keep = true;
                        let end = true;
                        let votes = {};
                        Object.values(this.players).forEach(p => votes[p.vote] = votes.hasOwnProperty(p.vote) ? votes[p.vote]+1 : 1);
                        let voted = Object.keys(votes).find(v => votes[v] >= Object.values(this.players).filter(p => !p.dead).length - Object.values(this.players).filter(p => p.role.startsWith('sea')).length);
                        let votedP = Object.values(this.players).find(p => p.num == voted);
                        if (voted != undefined) {
                            switch (this.currentVote) {
                                case 'brig':
                                    votedP.playIn += 2;
                                    this.sendLog(`${votedP.name} was sent to the brig. They will not be able to play cards for the next 2 turns.`);
                                    break;
                                case 'captain':
                                    this.sendLog(`${votedP.name} was elected as captain. No one but them will play cards next turn.`);
                                    Object.values(this.players).forEach(player => {
                                        if (player.num == voted)
                                            player.playIn = 0;
                                        else
                                            player.playIn++;
                                    });
                                    break;
                                case 'investigate':
                                    this.sendLog(`${votedP.name} was elected as investigator. This investigate card has been discarded permanently, and the newly elected investigator will now choose someone to discover the role of.`);
                                    this.chooseOccasion = 'investigate';
                                    this.investigator = voted;
                                    votedP.socket.emit('choosePlayer', 'Who would you like to learn the role of?');
                                    keep = false;
                                    end = false;
                                    break;
                                case 'mutiny':
                                    this.sendLog(`${votedP.name} was killed. They were a ${votedP.role}. This mutiny card will now be discarded permanently.`);
                                    votedP.dead = true;
                                    votedP.playIn = Infinity;
                                    io.to(this.code).emit('die', voted);
                                    if (votedP.role.startsWith('sea'))
                                        return this.endMatch('kill');
                                    if (Object.values(this.players).filter(p => !p.dead).length == 0)
                                        return this.endMatch('sink');
                                    keep = false;
                                    break;
                            }
                        } else this.sendLog(`Not enough players voted identically for the vote to go through.`);
                        if (keep)
                            this.discardPile.push(this.currentVote);
                        if (end)
                            setTimeout(this.endTurn.bind(this), [5000, 10000, 3000][this.votingAnonymity]);
                    }
                }).bind(this), 2000);
            }).bind(this), 1000);
        }
    }

    playerChosen(chooser, player) {
        if (this.chooseOccasion != null && !player.dead) {
            switch (this.chooseOccasion) {
                case 'alliedTraitor':
                    if (chooser.role != 'seamaster') return;
                    this.sendLog(`${chooser.name} chose ${player.name} as who they thought was the biologist.`);
                    if (player.role == 'biologist')
                        this.endMatch('snitch');
                    else
                        this.endMatch(this.previousCause);
                    break;

                case 'investigate':
                    if (chooser.num != this.investigator) return;
                    this.sendLog(`${chooser.name} investigated ${player.name}, and has been sent their role. You now have ${Math.round(20000/1000)} seconds to discuss before the next turn starts.`);
                    chooser.socket.emit('message', {l: `(ONLY YOU CAN SEE THIS) ${player.name}'s role is: ${player.role}`});
                    setTimeout(this.endTurn.bind(this), 20000);
                    break;
            }
            io.to(this.code).emit('discuss', null);
            this.chooseOccasion = null;
        }
    }

    endTurn() {
        this.discardPile = [...this.discardPile, ...this.playPile];
        this.playPile = [];

        this.startTurn();
    }

    endMatch(cause) {
        setTimeout((() => {
            if (this.mode == 2 && ['treasure', 'kill'].includes(cause) && !this.snitchAttempted) {
                this.snitchAttempted = true;
                this.previousCause = cause;
                io.to(this.code).emit('discuss', null);
                let sm = Object.values(this.players).find(p => p.role == 'seamaster');
                this.chooseOccasion = 'alliedTraitor';
                sm.socket.emit('choosePlayer', 'Who do you think is the biologist?');
                this.sendLog(`The pirates have achieved their win condition, but the Sea Master (${sm.name}) is now guessing who the biologist is, and if they guess correctly, the sea monsters will win instead of the pirates.`)
            } else {
                let results = {
                    cause,
                    roles: Object.values(this.players).map(p => ({role: p.role, num: p.num})),
                    board: this.board,
                };
                io.to(this.code).emit('endMatch', results, String(Math.random()).slice(2));
                Object.values(this.players).forEach(p => {
                    p.socket.leave(this.code);
                    p.socket.ingame = false;
                });
                delete matches[this.code];
            }
        }).bind(this), 5000);
    }
}

module.exports = Match;