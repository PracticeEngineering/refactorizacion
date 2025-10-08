import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
} catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
}