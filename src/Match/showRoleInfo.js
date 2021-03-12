import React from 'react';
import { Typography, Divider, Tooltip, IconButton } from '@material-ui/core';
import showDialog from '../Dialog/show';
import playerColours from './playerColours.json';

function RoleInfo(props) {
    return (
        <div>
            <div style={{textAlign: 'center'}}>
                <img src={`/roles/${props.matchInfo.role}.png`} width={100} />
                <Typography variant="h5" style={{color: playerColours[props.matchInfo.me.num]}}>{props.matchInfo.me.name}</Typography>
            </div>
            <Typography variant="h6">{(() => {
                switch (props.matchInfo.role) {
                    case 'pirate':
                        switch (props.matchInfo.options.mode) {
                            case 0:
                            case 1:
                                let seamonsters = props.matchInfo.players.length >= 6 ? 2 : 1;
                                return `There ${seamonsters == 2 ? 'are' : 'is'} ${seamonsters} sea monster${seamonsters == 2 ? 's' : ''} in this match, everyone else is a pirate.`;
                                break;
                            case 2:
                                let pirates = props.matchInfo.players.length - 2;
                                return `There are ${pirates-1} other pirates on your team, one of whom is a biologist who knows the identity of the sea monsters. There's 1 Sea Master and 1 Sea Servant.`;
                                break;
                            case 3:
                                return 'Everyone is a pirate in this match! There are no sea monsters.';
                                break;
                        }
                        break;
                    
                    case 'seamonster':
                        if (props.matchInfo.options.mode == 0) {
                            return <span><span style={{color: playerColours[props.matchInfo.teammate.num]}}>{props.matchInfo.teammate.name}</span> is also a sea monster, everyone else is a pirate.</span>;
                        } else {
                            if (props.matchInfo.players.length >= 6) {
                                return 'There\'s 1 other sea monster who is on your team, everyone else is a pirate.';
                            } else {
                                return 'You\'re the only sea monster. Everyone else is a pirate.';
                            }
                        }
                    
                    case 'seaservant':
                        return 'The Sea Master knows who you are and is with you. Everyone else is a pirate, 1 of whom is a biologist, who knows who you and the Sea Master are.';
                    
                    case 'seamaster':
                        return <span><span style={{color: playerColours[props.matchInfo.teammate.num]}}>{props.matchInfo.teammate.name}</span> is the sea servant, everyone else is a pirate, 1 of whom is a biologist, who knows who you and the Sea Servant are.</span>;
                    
                    case 'biologist':
                        return <div>
                            {props.matchInfo.roles.map(p => {
                                if (p.role == 'biologist') return '';
                                let player = props.matchInfo.players.find(pl => pl.num == p.num);

                                return <span style={{color: playerColours[player.num], display: 'inline-block', marginRight: 15}}>{player.name}: <img src={`/roles/${p.role}.png`} width={50} /><br /></span>;
                            })}
                        </div>;
                }
            })()}</Typography>
            <Typography>Check the rulebook to see what you have to do.</Typography>
        </div>
    );
}

function showRoleInfo(matchInfo) {
    showDialog({
        title: 'Your role info',
    }, <RoleInfo matchInfo={matchInfo} />);
}

export default showRoleInfo;