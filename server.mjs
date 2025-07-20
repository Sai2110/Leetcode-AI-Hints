// // server.mjs
// import express from 'express';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// // ES Module fixes
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Load environment variables
// dotenv.config();

// const app = express();
// const port = 3000;

// // Verify API key is present
// if (!process.env.GEMINI_API_KEY) {
//     console.error('GEMINI_API_KEY is not set in .env file');
//     process.exit(1);
// }

// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.use(cors());
// app.use(express.json());

// app.post('/get-hint', async (req, res) => {
//     const { questionName } = req.body;
//     console.log('Received Question Name:', questionName);

//     if (!questionName) {
//         return res.status(400).json({ error: 'No question name provided' });
//     }

//     try {
//         // Format question name
//         const formattedQuestion = questionName.split('-').join(' ');
        
//         // Initialize the model
//         const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });
        


//         // Generate content
//         const prompt = `Give a concise hint for solving the LeetCode question in 6 words "${formattedQuestion}". 
//                        hint should be a very short line and should not be complete intiution or answer.`;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();

//         console.log('Successfully generated hint:', text);
//         res.json({ hint: text });
//     } catch (error) {
//         console.error('Error details:', error);
//         res.status(500).json({ 
//             error: 'Error generating hint', 
//             details: error.message 
//         });
//     }
// });

// // Add a basic health check endpoint
// app.get('/health', (req, res) => {
//     res.json({ status: 'ok' });
// });

// const server = app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });


//----------------------
// server.mjs
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/get-hint', async (req, res) => {
    const { questionName, step } = req.body;
    console.log('Received:', questionName, 'Step:', step);

    if (!questionName) {
        return res.status(400).json({ error: 'No question name provided' });
    }

    try {
        const formattedQuestion = questionName.split('-').join(' ');
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });

        let prompt;
        if (step === 1) {
            prompt = `Step ${step}: Give a short, cryptic 10-word hint to start solving the LeetCode question "${formattedQuestion}". Avoid solution.`;
        } else if (step >= 2 && step < 5) {
            prompt = `Step ${step}: Provide a progressively more helpful but partial hint for the LeetCode problem "${formattedQuestion}". Avoid giving a full solution.`;
        } else {
            prompt = `Final Step: Now provide the complete detailed explanation and final solution approach for the LeetCode problem "${formattedQuestion}".`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`Hint for step ${step}:`, text);
        res.json({ hint: text });
    } catch (error) {
        console.error('Error generating hint:', error);
        res.status(500).json({
            error: 'Error generating hint',
            details: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
