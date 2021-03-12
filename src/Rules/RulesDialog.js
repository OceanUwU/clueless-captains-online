import React from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogCentre from './DialogCentre.js';

const useStyles = makeStyles((theme) => ({
    centre: {
        padding: 0
    }
}));

function RulesDialog() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    exp.openRules = handleClickOpen;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            disablePortal
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Rules</DialogTitle>
            <DialogContent classes={{root: classes.centre}} dividers>
                <DialogCentre />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const exp = {};
ReactDOM.render(<ThemeProvider theme={theme}><CssBaseline /><RulesDialog /></ThemeProvider>, document.getElementById('rules'));

export default exp;