import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        type: 'light',

        background: {
            default: '#feffc7',
        },

        primary: {
            main: '#d49a3d',
        },
    },

    overrides: {
        MuiButton: {
            textPrimary: {
                background: 'linear-gradient(45deg, #6b65cd 0%, #00d4ff 100%)',
                borderRadius: 3,
                border: 0,
                color: 'white !important',
                padding: '0 30px',
                boxShadow: '0 3px 5px 2px #00d4ff4D',
            },

            textSecondary: {
                background: 'linear-gradient(45deg, #00ffaf 0%, #3956c7 100%)',
                borderRadius: 3,
                border: 0,
                color: 'white !important',
                padding: '0 30px',
                boxShadow: '0 3px 5px 2px #00ffaf4D',
            }
        },
    },
});

export default theme;