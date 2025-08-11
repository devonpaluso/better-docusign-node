import { FC, PropsWithChildren, useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, IconButton, useTheme } from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const lightTheme = createTheme({
    palette: {
        mode: 'light'
    }
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark'
    }
});

const CHANGE_THEME_EVENT = 'change-theme';

export const changeTheme = (mode: 'light' | 'dark') => {
    const event = new CustomEvent(CHANGE_THEME_EVENT, { detail: { mode } });
    dispatchEvent(event);
}

export const ThemeToggleButton: FC = () => {
    const { palette } = useTheme()
    return (
        <IconButton sx={{backgroundColor: '#4c808e'}} onClick={() => changeTheme(palette.mode === 'light' ? 'dark' : 'light')}>
            {palette.mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    )
}

export const Theme: FC<PropsWithChildren> = ({ children }) => {
    const [mode, setMode] = useState('light');
    useEffect(() => {

        const changeModeHandler = ((event: CustomEvent) => {
            setMode(event.detail.mode);
        }) as EventListener

        addEventListener(CHANGE_THEME_EVENT, changeModeHandler);

        return () => {
            removeEventListener(CHANGE_THEME_EVENT, changeModeHandler);
        }

    }, []);

    return (
        <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
            {children}
            <CssBaseline />
        </ThemeProvider>
    );
}