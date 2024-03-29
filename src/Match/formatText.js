import React from 'react';
import publicDir from '../public.json';
import { Tooltip, Link } from '@material-ui/core';
import playerColours from './playerColours.json';

const typeNames = {
    'cards': 'Card',
    'roles': 'Role',
    'tiles': 'Tile',
    'directions': 'Direction',
    'terms': 'Term'
};
const types = Object.keys(typeNames);
const colourOverrides = [
    [/^north$/, '#fe0000'],
    [/^n\d+$/, '#fe0000'],
    [/^east$/, '#02fe01'],
    [/^e\d+$/, '#02fe01'],
    [/^south$/, '#bbb500'],
    [/^s\d+$/, '#bbb500'],
    [/^west$/, '#0100fc'],
    [/^w\d+$/, '#0100fc'],
    [/pirate/, '#00ff00'],
    [/biologist/, '#00ff00'],
    [/monster/, '#ff0000'],
    [/master/, '#ff0000'],
    [/servant/, '#ff0000'],
    [/compass/, '#5b5b5b'],
];

function PlayerName(playerNames, num, space) {
    return (
        <Tooltip title={`p${num}`}>
            <span style={{color: playerColours[num]}}>
                {space}{playerNames[num]}
            </span>
        </Tooltip>
    );
}

export default function formatText(text, playerNames) {
    let words = text.split(' ');
    return (
        <span>{words.map((word, index) => {
            let space = index == 0 ? '' : ' ';
            //if (word.startsWith('#')) {
                let hashtag = word.replace(/\W/g,'').toLowerCase();

                let typeFound = false;
                let colourOverride = '#03a1fc';
                for (let type of types) {
                    if (publicDir[type].hasOwnProperty(hashtag)) {
                        typeFound = type;
                        for (let i of colourOverrides) {
                            if (i[0].test(hashtag)) {
                                colourOverride = i[1];
                                break;
                            }
                        }
                        break;
                    }
                }

                if (typeFound)
                    return (<Tooltip enterTouchDelay={0} title={<span>
                        <h4 style={{textAlign: 'center'}}>{typeNames[typeFound]}</h4>
                        <img src={`/${typeFound}/${hashtag}.${publicDir[typeFound][hashtag]}`} width={80} style={{borderRadius:4}} />
                    </span>} PopperProps={{style: {zIndex: 100000}}}>
                        <span>{space}<Link style={{color: colourOverride}}>{word}</Link></span>
                    </Tooltip>);
                

                if (/^p\d+$/.test(hashtag)) {
                    let num = Number(hashtag.slice(1));
                    console.log(playerNames);
                    if (playerNames[num] != null) {
                        return PlayerName(playerNames, num, space);
                    }
                }

                for (let i in playerNames) {
                    if (playerNames[i] != null && playerNames[i].toLowerCase() == hashtag) {
                        return PlayerName(playerNames, i, space);
                    }
                }
            //}
            return `${space}${word}`;
        })}</span>
    );
}