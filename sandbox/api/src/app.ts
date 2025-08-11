import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

const PORT = 7008;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
