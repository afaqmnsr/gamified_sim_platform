import React, { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

export default function ThemeContextProvider({ children }) {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        }
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    background: {
                        default: '#f5f5f5',
                        paper: '#ffffff'
                    },
                    text: {
                        primary: '#000'
                    }
                }
                : {
                    background: {
                        default: '#121212',
                        paper: '#1e1e1e'
                    },
                    text: {
                        primary: '#fff'
                    }
                })
        },
        typography: {
            fontFamily: 'Roboto, sans-serif'
        }
    }), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}