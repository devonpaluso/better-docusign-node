import angularLogo from '../assets/logos/angular.png';
import awsCliLogo from '../assets/logos/aws-cli.png';
import dockerLogo from '../assets/logos/docker.webp';
import gitLogo from '../assets/logos/git.png';
import githubDesktopLogo from '../assets/logos/github-desktop.png';
import goLogo from '../assets/logos/go.png';
import javaLogo from '../assets/logos/java.png';
import mongoLogo from '../assets/logos/mongo.png';
import nodeLogo from '../assets/logos/node.png';
import nvmLogo from '../assets/logos/nvm.png';
import postmanLogo from '../assets/logos/postman.webp';
import postgresqlLogo from '../assets/logos/postresql.png';
import pythonLogo from '../assets/logos/python.svg';
import reactLogo from '../assets/logos/react.png';
import vscodeLogo from '../assets/logos/vscode.png';
import vueLogo from '../assets/logos/vue.png';
import chromeLogo from '../assets/logos/chrome.png';
import golandLogo from '../assets/logos/goland.png';
import ginLogo from '../assets/logos/gin.png';
import nodeExpressImage from '../assets/images/node_express.webp'
import { CSSProperties } from 'react';

export type Item = {
    name: string,
    image: any,
    dependencies?: Item[],
    imageSize?: number,
    description?: string
}

const node: Item = {
    name: 'Node.JS',
    image: nodeLogo
};
export const angular: Item = {
    name: 'Angular',
    image: angularLogo,
    dependencies: [node],
    description: 'A platform and framework for building single-page client applications using HTML and TypeScript.'
};
const awsCli: Item = {
    name: 'AWS CLI',
    image: awsCliLogo,
    imageSize: 120
};
const chrome: Item = {
    name: 'Chrome',
    image: chromeLogo,
    imageSize: 70
}
const docker: Item = {
    name: 'Docker',
    image: dockerLogo
};
const git: Item = {
    name: 'Git',
    image: gitLogo
};
const githubDesktop: Item = {
    name: 'GitHub Desktop',
    image: githubDesktopLogo
};
const go: Item = {
    name: 'Go',
    image: goLogo
};
const goland: Item = {
    name: 'GoLand IDE',
    image: golandLogo
};
const gin: Item = {
    name: 'Gin',
    image: ginLogo,
    imageSize: 150
};
const java: Item = {
    name: 'Java',
    image: javaLogo
};
const mongoDB: Item = {
    name: 'MongoDB',
    image: mongoLogo,
    imageSize: 100
};
const nvm: Item = {
    name: 'NVM',
    image: nvmLogo
};
const postman: Item = {
    name: 'Postman',
    image: postmanLogo,
    imageSize: 70
};
const postgresql: Item = {
    name: 'PostgreSQL',
    image: postgresqlLogo,
    imageSize: 70
};
const python: Item = {
    name: 'Python',
    image: pythonLogo,
    imageSize: 100
};
const react: Item = {
    name: 'React',
    image: reactLogo,
    dependencies: [node]
};
const vscode: Item = {
    name: 'VSCode',
    image: vscodeLogo,
    imageSize: 70
};
const vue: Item = {
    name: 'Vue',
    image: vueLogo,
    dependencies: [node],
    imageSize: 70
}

export const items: Item[] = [
    node,
    angular,
    awsCli,
    docker,
    git,
    githubDesktop,
    go,
    java,
    mongoDB,
    nvm,
    postman,
    postgresql,
    python,
    react,
    vscode,
    goland,
    vue,
    chrome
];


export type Collection = {
    name: string,
    items: Item[]
}

const onboardingCollection: Collection = {
    name: 'Onboarding Basics',
    items: [python, nvm, node, vscode, git, githubDesktop, chrome]
}
const webDevCollection: Collection = {
    name: 'Web Development',
    items: [node, react, vscode, chrome, postman]
}
const goDevCollection: Collection = {
    name: 'Go Development',
    items: [go, goland, gin, chrome, postman]
}

export const collections: Collection[] = [
    onboardingCollection,
    webDevCollection,
    goDevCollection
]

export type Workflow = {
    name: string,
    description: string,
    subtitle?: string,
    image: any,
    imageSize?: number,
    imageStyle?: CSSProperties
}

const nodeExpressApiWorkflow: Workflow = {
    name: 'Express API',
    subtitle: 'Node.js',
    description: 'A starter Node.js API using Express. Prebuild using common middleware such as Morgan, CORS, and Helmet.',
    image: nodeExpressImage,
    imageSize: 180
};

const reactAppWorkflow: Workflow = {
    name: 'React App',
    subtitle: 'React',
    description: 'A starter React app with a few components and a basic routing setup. Includes Okta authentication, and MUI, and a default theme.',
    image: 'https://blog.logrocket.com/wp-content/uploads/2021/04/mui-react.png',
    imageSize: 160,
    imageStyle: {
        borderRadius: 4,
        objectFit: 'cover'
    }
};

export const workflows: Workflow[] = [
    nodeExpressApiWorkflow,
    reactAppWorkflow
];
