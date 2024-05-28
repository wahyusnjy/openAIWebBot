// const { OpenAIApi, Configuration} = require('openai');
const { Ollama } = require('ollama-node');
// const ollama = require('ollama');
console.log(Ollama);  
const os = require('os');

const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server)

const ollama = new Ollama();


// const config = new Configuration({
//     apiKey: process.env.API_TOKEN
// })

// const openai = new OpenAIApi(config);

(async () => {
    try {
        console.log("Checking available models...");
        const models = await ollama.listModels();
        console.log('Available models:', models);

        if (models.models.includes("llama3:latest")) {
            console.log("Setting model to 'llama3'");
            await ollama.setModel("llama3:latest");
            console.log("Model 'llama3' set successfully");
        } else {
            throw new Error("Model 'llama' is not available. Available models: " + models.models.join(', '));
        }
    } catch (error) {
        console.error(`Error setting model 'llama': ${error.message}`);
    }
})();


const logSystemResources = () => {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const usedMemPercentage = (usedMem / totalMem) * 100;

    console.log(`Memory Usage: ${usedMemPercentage.toFixed(2)}%`);
    console.log(`CPU Load: ${os.loadavg()}`);
};

app.use(express.static(path.join(__dirname+"/public")));
app.use(bodyParser.json());
app.use(cors());

io.on('connection', function(socket){
    socket.on('newuser', function(username){
        console.log(username);
    });

    socket.on('prompt', async function(data){
        console.log(data);
        const startTime = Date.now();
        try {
            logSystemResources();
            console.log('Generating Answers!');
            const output = await ollama.generate(data.text);
            console.log(output);
            socket.emit("chatbot", {
                username: "llama3",
                text: output.output,
            });
            // await ollama.streamingGenerate(data.text, print);
            const endTime = Date.now();
            console.log(`Response generated in ${endTime - startTime} ms`);
            logSystemResources();
        } catch (err) {
            console.log(err);
            socket.emit("error", "An error occurred while processing your request.");
        }
    });
});


// io.on('connection', function(socket){
//     socket.on('newuser', function(username){
//         console.log(username);
//     });

//     socket.on('prompt',async function(data){
//         console.log(data);
//         try{
//             console.log(OllamaApi);
//             const response = await OllamaApi.chat({
//                 model              :'llama2',
//                 messages: [{ role: 'user', content: data.text }],
//             })
//             console.log(response);
//             const message = response.message.content;  // Assuming the response has a data object with the needed info
//             socket.emit("chatbot", {
//                 username: "llama",
//                 text: message
//             });
//         }
//         catch (err) {
//             console.log(err);
//             socket.emit("error", "An error occurred while processing your request.");
//         }
       
//         // const response = openai.createCompletion({
//         //     model               : "text-davinci-003",
//         //     prompt              : data.text,
//         //     temperature         : 0.1,
//         //     top_p               : 1,
//         //     frequency_penalty   : 0,
//         //     presence_penalty    : 0,
//         //     max_tokens          : 256,
//         //     stop                :["Human:","AI:","Human:","AI:"]
//         // });

//         // response.then((incomingData) => {
//         //     const message = incomingData.data.choices[0].text;
            
//         //     socket.emit("chatbot", {
//         //         username:"bot",
//         //         text:message
//         //     })
//         //     }).catch((err) => {
//         //         console.log(err);
//         // });
//     });
// });

server.listen(2312, () => console.log("Server sudah berjalan di port 2312"));
