import React from 'react';
import ReactDOM, { render } from 'react-dom';
import theme from '../theme';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import Match from './';
import Results from '../Results';
import shuffleString from './shuffleString';
import images from './images';

const boxSize = 200;
const gridlineSize = 6;
const borderSize = 20;
const boardFPS = 30;
var renderInterval;
const gameNameChars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const placeAudio = new Audio('/place.mp3');
const otherPlaceAudio = new Audio('/otherPlace.mp3');
const gameEndAudio = new Audio('/endGame.mp3');
const startTurnAudio = new Audio('/startTurn.mp3');


var matchInfo;
var myId;
var intervals = [];
var turnNumber = 0;
var HP;

var tilesChanging = [];
var movement = null;
var direction = null;
var textNotifs = [];

var canvas;
var ctx;

function renderBoard() {
    //let canvas = document.getElementById('gameBoard');
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
    //horizontal gridlines
    ctx.fillStyle = 'black';
    for (let x = 1; x < matchInfo.options.boardSize[0]; x++)
        ctx.fillRect(borderSize, (gridlineSize+boxSize)*x-gridlineSize+borderSize, ((gridlineSize+boxSize)*matchInfo.options.boardSize[1])-gridlineSize, gridlineSize);
    //vertical gridlines
    for (let y = 1; y < matchInfo.options.boardSize[1]; y++)
        ctx.fillRect((gridlineSize+boxSize)*y-gridlineSize+borderSize, borderSize, gridlineSize, ((gridlineSize+boxSize)*matchInfo.options.boardSize[0])-gridlineSize);
    
    //left (blue) border
    ctx.fillStyle = '#0100fc';
    ctx.fillRect(0, 0, borderSize, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize*2);
    //right (green) border
    ctx.fillStyle = '#02fe01';
    ctx.fillRect((gridlineSize+boxSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize, 0, borderSize, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize*2);
    //top (red) border
    ctx.fillStyle = '#fe0000';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(borderSize, borderSize);
    ctx.lineTo((gridlineSize+boxSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize, borderSize);
    ctx.lineTo((gridlineSize+boxSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize*2, 0);
    ctx.fill();
    //bottom (yellow) border
    ctx.fillStyle = '#fdff06';
    ctx.beginPath();
    ctx.moveTo(0, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize*2);
    ctx.lineTo((gridlineSize+boxSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize*2, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize*2);
    ctx.lineTo((gridlineSize+boxSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize);
    ctx.lineTo(borderSize, (gridlineSize+boxSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize);
    ctx.fill();

    //draw tiles
    for (let y = 0; y < matchInfo.options.boardSize[0]; y++)
        for (let x = 0; x < matchInfo.options.boardSize[1]; x++) {
            let img = images.tiles[matchInfo.board[y][x]]; //get image of tile
            if (img.complete) //if the image has loaded
                ctx.drawImage(img, (gridlineSize+boxSize)*x+borderSize, (gridlineSize+boxSize)*y+borderSize, boxSize, boxSize); //draw it
        }
    
    //draw tiles which are changing
    let cttd = [];
    tilesChanging.forEach((tile, index) => {
        if (tile.progress == 1) cttd.push(index);
        else tile.progress = Math.min(1, tile.progress+((1000/boardFPS)/tile.time));

        ctx.globalAlpha = 1 - tile.progress;
        if (images.tiles[tile.before].complete)
            ctx.drawImage(images.tiles[tile.before], (gridlineSize+boxSize)*tile.location[1]+borderSize, (gridlineSize+boxSize)*tile.location[0]+borderSize, boxSize, boxSize);
    });
    cttd.reverse();
    cttd.forEach(i => tilesChanging.splice(i, 1));
    
    //draw ship
    if (movement != null) { //move ship
        if (movement.progress == 1) movement = null;
        else {
            movement.progress = Math.min(1, movement.progress+((1000/boardFPS)/movement.time));
            matchInfo.ship = movement.from.map((a, index) => a+((movement.to[index]-a)*movement.progress));
        }
    }
    if (direction != null) { //turn ship
        if (direction.progress == 1) direction = null;
        else {
            direction.progress = Math.min(1, direction.progress+((1000/boardFPS)/direction.time));
            matchInfo.dir = ((direction.from + (direction.diff * direction.progress)) + 8) % 8;
        }
    }
    ctx.globalAlpha = 1;
    let shipImg = images.ship[(Math.round(matchInfo.dir * 4.5)+36)%36];
    if (shipImg.complete)
        ctx.drawImage(shipImg, (gridlineSize+boxSize)*matchInfo.ship[1]+borderSize, (gridlineSize+boxSize)*matchInfo.ship[0]+borderSize, boxSize, boxSize);

    //draw text notifications
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${boxSize*0.8}px sans-serif`;
    let ntd = [];
    textNotifs.forEach((notif, index) => {
        if (notif.progress == 1) ntd.push(index);
        else notif.progress = Math.min(1, notif.progress+((1000/boardFPS)/notif.time));

        ctx.globalAlpha = Math.sin(notif.progress*Math.PI);;
        ctx.fillStyle = notif.color;
        ctx.fillText(notif.text, (gridlineSize+boxSize)*notif.at[1]+borderSize+(boxSize/2), (gridlineSize+boxSize)*notif.at[0]+borderSize+(boxSize/2)-(notif.height*notif.progress));
    });
    ntd.reverse();
    ntd.forEach(i => textNotifs.splice(i, 1));
}

function playMatch(startingMatchInfo, sentId) {
    myId = sentId;
    matchInfo = startingMatchInfo;
    turnNumber = 0;
    ReactDOM.render(<ThemeProvider theme={theme}><CssBaseline /><Match matchInfo={matchInfo} players={startingMatchInfo.players} myId={myId} /></ThemeProvider>, document.getElementById('root'), () => {
        canvas = document.getElementById('gameBoard');
        ctx = canvas.getContext('2d');
        canvas.width = (boxSize+gridlineSize)*matchInfo.options.boardSize[1]-gridlineSize+borderSize*2;
        canvas.height = (boxSize+gridlineSize)*matchInfo.options.boardSize[0]-gridlineSize+borderSize*2;

        document.getElementById('treasuresNeeded').innerHTML = matchInfo.options.treasuresNeeded;
        document.getElementById('treasuresTotal').innerHTML = matchInfo.options.tiles.treasure;
        HP = matchInfo.options.startHP;
        document.getElementById('shipHP').innerHTML = HP;
        document.getElementById('maxShipHP').innerHTML = matchInfo.options.maxHP;

        renderInterval = setInterval(renderBoard, Math.ceil(1000/boardFPS));
        
        (new Audio('/startMatch.mp3')).play();
    });
}

function move(location) {
    movement = {
        from: matchInfo.ship,
        to: location,
        progress: 0,
        time: 750,
    };
}

function turn(to) {
    direction = {
        from: matchInfo.dir,
        diff: (4 - Math.abs(Math.abs(to - matchInfo.dir) - 4)) * (((to - matchInfo.dir + 8) % 8) > 4 ? -1 : 1), 
        progress: 0,
        time: 400,
    };
}

function changeTile(location, tile, progress=0) {
    tilesChanging.push({
        location: location,
        before: matchInfo.board[location[0]][location[1]],
        progress: progress,
        time: 200,
    });
    matchInfo.board[location[0]][location[1]] = tile;
}

function newNotif(text, color) {
    textNotifs.push({
        text,
        color,
        at: [...matchInfo.ship],
        height: boxSize*0.5,
        progress: 0,
        time: 2000,
    });
}

function changeHP(change) {
    if (change != 0) {
        newNotif(`${change > 0 ? '+' : '-'}${Math.abs(change)}`, change > 0 ? '#2eff70' : '#ff2e2e');
        HP += change;
        if (HP > matchInfo.options.maxHP)
            HP = matchInfo.options.maxHP;
        document.getElementById('shipHP').innerHTML = HP;
    }
}

function treasureFound() {
    newNotif('+T', '#d69d00');
    document.getElementById('treasuresFound').innerHTML = Number(document.getElementById('treasuresFound').innerHTML)+1;
}

function turnNum(n) {
    document.getElementById('turnNumber').innerHTML = n;
}

function die(num) {
    matchInfo.players.find(p => p.num == num).dead = true;
}

function endMatch(results, rjCode) {
    clearInterval(renderInterval);
    renderInterval = null;

    /*
    tilesChanging = [];
    matchInfo.board.forEach((row, y) => row.forEach((tile, x) => {
        if (tile == 'unknown')
            changeTile([y, x], tile, 0.4);
    }));
    matchInfo.board = results.board;
    renderBoard();
    */
    tilesChanging = [];
    matchInfo.board.forEach((row, y) => row.forEach((tile, x) => {
        if (tile == 'unknown') {
            matchInfo.board[y][x] = results.board[y][x];
            changeTile([y, x], 'blank', 0.2);
            matchInfo.board[y][x] = 'blank';
        }
    }));
    renderBoard();

    ReactDOM.render(<ThemeProvider theme={theme}><CssBaseline /><Results myId={myId} results={results} matchInfo={matchInfo} rjCode={rjCode} finalBoard={canvas.toDataURL()} /></ThemeProvider>, document.getElementById('root'));

    matchInfo = null;
}

export {
    playMatch,
    move,
    turn,
    changeTile,
    changeHP,
    treasureFound,
    turnNum,
    die,
    endMatch,
};