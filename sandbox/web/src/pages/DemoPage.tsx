import { FC } from "react";
import { ThemeToggleButton } from "../components/Theme.tsx";
import { Button } from "@mui/material";
import { echoBridgeWidget, useAction, WidgetCustomMessage } from "@echobridge/react";
import { $openProject, $getSavedProjectPath, $setSavedProjectPath, $cloneProject } from "@echobridge/core";
import { DisplayableError } from "@echobridge/core";

export const DemoPage: FC = () => {

    const openProject = useAction($openProject);
    const getSavedProjectPath = useAction($getSavedProjectPath);
    const setSavedProjectPath = useAction($setSavedProjectPath);

    const cloneProject = useAction($cloneProject);

    const demo = async () => {
        // try {
            const { outputPath } = await cloneProject({
                url: `https://github.com/kutia-software-company/express-typescript-starter.git`,
                //path: '/my/custom/path'
            });
            console.log({ outputPath });
        // } catch (e) {
        //     if (e instanceof DisplayableError) {
        //         echoBridgeWidget.showMessage({ message: e.message, variant: 'error' })
        //     } else {
        //         console.log(e);
        //         echoBridgeWidget.showMessage({ message: 'Could not clone project. See logs for more information.', variant: 'error' })
        //     }
        // }

        //await setSavedProjectPath({ name: 'demo', path: outputPath });
    }

    const customContent = async () => {
        echoBridgeWidget.showContent(
            <img alt={''} style={{ width: '100%', height: '100%', }} src={'https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif'} />
        )
    }

    const clearContent = async () => {
        echoBridgeWidget.clear();
    }

    const testMessage = (variant: WidgetCustomMessage['variant'], message: string) => () => {
        echoBridgeWidget.showMessage({ message, variant })
    }


    const demo2 = async () => {

        const { outputPath } = await cloneProject({
            url: `https://github.com/kutia-software-company/express-typescript-starter.git`
        });
        console.log({ outputPath });

        //
        // const projectName = 'demo';
        // const getProjectPath = async () => {
        //     const savedProjectPath = await getSavedProjectPath({ name: projectName });
        //     if (savedProjectPath) return savedProjectPath;
        //     const fileExplorerPath = await fileExplorer.launch();
        //     if (!fileExplorerPath) return;
        //     await setSavedProjectPath({ name: projectName, path: fileExplorerPath });
        //     return fileExplorerPath;
        // }
        // const projectPath = await getProjectPath();
        // if (!projectPath) return;
        //
        // await openProject({
        //     projectPath,
        //     activeRelativePath: './src/App.jsx'
        // });
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ThemeToggleButton />
            <Button onClick={demo}>Demo</Button>
            <Button onClick={customContent} variant={'outlined'}>Custom Content</Button>
            <Button onClick={clearContent} variant={'outlined'}>Clear Content</Button>
            <Button onClick={testMessage('loading', 'Loading something...')} variant={'contained'}>Loading</Button>
            <Button onClick={testMessage('success', 'Job completed, nice. Loremipsum Lorem ipsum, Lorem ipsumLorem ipsum, Loremipsum Lorem ipsum ,Lorem ipsum!')} variant={'contained'}>Success</Button>
            <Button onClick={testMessage('warning', `Here's a warning.`)} variant={'contained'}>Warning</Button>
            <Button onClick={testMessage('error', 'Something went wrong!')} variant={'contained'}>Error</Button>
            <Button onClick={testMessage('info', 'Did you know this?')} variant={'contained'}>Info</Button>
            <Button onClick={testMessage('question', 'Not sure why, but question!?')} variant={'outlined'}>Question</Button>

        </div>
    )

}