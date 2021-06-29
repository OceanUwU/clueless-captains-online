import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Draggable } from 'react-smooth-dnd';
import arrayMove from 'array-move';
import { IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, ButtonGroup, Button, Divider, Tooltip, Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import showDialog from '../Dialog/show';
import copy from 'clipboard-copy';
import defaultPresets from './defaultPresets.json';
import defaultMatchOptions from './defaultMatchOptions.json';

const copyHelp = 'Copy the preset code of the selected preset to the clipboard';
const saveHelp = 'Save the current match options to the selected preset';
const useStyles = makeStyles((theme) => ({
    list: {
        height: 300,
        width: '100%',
        overflowY: 'scroll',
        border: '1px solid #00000030',
        borderRadius: 5,
    },
    actions: {
        width: '100%',
        display: 'flex',
        '& > *': {
            flex: 1,
        },
    },
}));

function PresetMenu(props) {
    const classes = useStyles();

    if (!localStorage.hasOwnProperty('ccpresets'))
        localStorage.ccpresets = JSON.stringify(defaultPresets);

    const [enteredPresetCode, setEnteredPresetCode] = React.useState('');
    const [selected, setSelected] = React.useState(localStorage.ccpreset == 'null' ? null : localStorage.ccpreset);
    const [items, setItems] = React.useState(JSON.parse(localStorage.ccpresets));
    const [copyTitle, setCopyTitle] = React.useState(copyHelp);
    const [saveTitle, setSaveTitle] = React.useState(saveHelp);

    const onDrop = ({ removedIndex, addedIndex }) => {
        localStorage.ccpresets = JSON.stringify(arrayMove(items, removedIndex, addedIndex));
        loadPresets();
    };

    let loadPresets = () => setItems(JSON.parse(localStorage.ccpresets));

    React.useEffect(() => {
        if (!items.find(item => item.id == selected)) {
            setSelected(null);
            localStorage.ccpreset = null;
        }
    }, []);

    return (
        <div>
            <List className={classes.list}>
                <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
                    {items.map(({ id, name }) => (
                        <Draggable key={id}>
                            <ListItem button className="drag-handle" onClick={() => setSelected(selected == id ? null : id)} selected={selected == id}>
                                <ListItemText primary={name} />
                            </ListItem>
                        </Draggable>
                    ))}
                </Container>
            </List>
            <ButtonGroup variant="contained" color="primary" className={classes.actions}>
                <Tooltip title="Create a new empty preset">
                    <Button onClick={async () => {
                        let dialog = await showDialog({
                            title: 'Naming new preset...',
                            description: 'What should the new preset be called?',
                            buttonText: 'Create',
                            layer: 1,
                            buttonAction: () => {
                                let presets = JSON.parse(localStorage.ccpresets);
                                presets.push({
                                    id: String(Math.random()).slice(2),
                                    name: document.getElementById('presetName').value,
                                    options: props.options,
                                });
                                localStorage.ccpresets = JSON.stringify(presets);
                                loadPresets();
                                dialog.handleClose();
                            },
                        }, <TextField
                            label="Preset name"
                            id="presetName"
                            defaultValue=""
                            variant="outlined"
                        />);
                    }}>New</Button>
                </Tooltip>
                <Tooltip title="Use the match options saved in this preset">
                    <Button disabled={!props.editable || selected == null} onClick={() => {
                        props.showMatchOptions({...props, options: items.find(item => item.id == selected).options});
                        localStorage.ccpreset = selected;
                    }}>Load</Button>
                </Tooltip>
                <Tooltip title={saveTitle}>
                    <Button disabled={selected == null} onClick={() => {
                        let presets = JSON.parse(localStorage.ccpresets);
                        presets.find(preset => preset.id == selected).options = props.options;
                        localStorage.ccpresets = JSON.stringify(presets);
                        loadPresets();
                        setSaveTitle('Saved preset!');
                        setTimeout(() => {
                            setSaveTitle(saveHelp);
                        }, 3000);
                    }}>Save</Button>
                </Tooltip>
                <Tooltip title={copyTitle}>
                    <Button disabled={selected == null} onClick={() => {
                        copy(btoa(JSON.stringify(items.find(item => item.id == selected).options)));
                        setCopyTitle('Copied preset code to clipboard!');
                        setTimeout(() => {
                            setCopyTitle(copyHelp);
                        }, 3000);
                    }}>Export</Button>
                </Tooltip>
                <Tooltip title="Delete the selected preset">
                    <Button disabled={selected == null} onClick={async () => {
                        let dialog = await showDialog({
                            title: 'Really delete preset?',
                            description: 'Are you sure you want to delete this preset?',
                            buttonText: 'Delete',
                            closeText: 'Cancel',
                            layer: 1,
                            buttonAction: () => {
                                localStorage.ccpresets = JSON.stringify(JSON.parse(localStorage.ccpresets).filter(preset => preset.id != selected));
                                loadPresets();
                                if (localStorage.ccpreset == selected)
                                    localStorage.ccpreset = null;
                                setSelected(null);
                                dialog.handleClose();
                            },
                        });
                    }}>Delete</Button>
                </Tooltip>
            </ButtonGroup>

            <Divider style={{marginTop: 32, marginBottom: 24}} />

            {/*<Typography variant="h6">Preset code loader</Typography>*/}
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <TextField
                    label="Preset code loader"
                    defaultValue=""
                    value={enteredPresetCode}
                    onChange={e => setEnteredPresetCode(e.target.value)}
                    helperText="Paste your preset code here and click Load to load it"
                    variant="outlined"
                    disabled={!props.editable}
                />
                <Button color={props.editable ? 'primary' : 'default'} disabled={!props.editable} onClick={() => {
                    try {
                        props.showMatchOptions({...props, options: {...props.options, ...JSON.parse(atob(enteredPresetCode))}});
                    } catch(e) {
                        alert(e);
                    }
                }}>Load</Button>
            </div>
        </div>
    );
}

export default PresetMenu;