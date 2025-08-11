import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import { FC, useState } from "react";
import { Box, CircularProgress, Fab, IconButton, Typography } from "@mui/material";
import { fileExplorer } from "@echobridge/react";
import { useActionCallback } from "@echobridge/react";
import { $expressApiWorkflow, $openVSCode } from "@sandbox/actions";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
    ({ theme, ownerState }) => ({
        color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && {
            color: theme.palette.primary.main,
        }),
        '& .QontoStepIcon-completedIcon': {
            color: theme.palette.primary.main,
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    }),
);

function QontoStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    return (
        <QontoStepIconRoot ownerState={{ active }} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon" />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

const steps = ['Select Directory', 'Scaffold Files', 'Open Project'];

export const WorkflowDialog: FC = () => {
    const [step, setStep] = useState(0);

    const [path, setPath] = useState<string>();

    const [inProgress, setInProgress] = useState(false);

    const openFileExplorer = async () => {
        const path = await fileExplorer.launch();
        if (!path) return;
        setPath(path);
        setStep(1);
    }

    const [sendScaffoldCommand] = useActionCallback($expressApiWorkflow, () => {
        setInProgress(false);
        setStep(2);
    });

    const [openVSCode] = useActionCallback($openVSCode, () => {
        setStep(4);
    });

    const scaffoldFiles = async () => {
        if (!path) {
            setStep(0);
            return;
        }
        sendScaffoldCommand({ path: path + '/express-api' });
        setInProgress(true);
    }

    const openProject = () => {
        if (!path) return;
        openVSCode({ path: path + '/express-api' });
    }

    return (
        <div style={{ width: 600 }}>
            <Stepper alternativeLabel activeStep={step} connector={<QontoConnector />}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>

                {step === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Fab color={'primary'} onClick={openFileExplorer}>
                        <FolderOpenIcon />
                    </Fab>
                    <Typography sx={{ mt: 1 }}>Open File Explorer</Typography>
                </div>}

                {step === 1 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {!inProgress && <>
                        <Fab color={'primary'} onClick={scaffoldFiles}>
                            <PlayCircleOutlineIcon />
                        </Fab>
                        <Typography sx={{ mt: 1 }}>Scaffold Files</Typography>
                        {path && <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{path}</Typography>}
                    </>}

                    {inProgress && <>
                        <CircularProgress size={30} />
                        <Typography sx={{ mt: 1 }}>Scaffolding files...</Typography>

                    </>}

                </div>}

                {step === 2 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Fab color={'primary'} onClick={openProject}>
                        <RocketLaunchIcon />
                    </Fab>
                    <Typography sx={{ mt: 1 }}>Open Project</Typography>
                </div>}


            </Box>
        </div>

    );
}