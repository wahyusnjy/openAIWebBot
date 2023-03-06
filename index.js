const {Confirguration , OpenAIApi, Configuration} = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server)

const config = new Configuration({
    apiKey: process.env.API_TOKEN
})

const openai = new OpenAIApi(config);

app.use(express.static(path.join(__dirname+"/public")));
app.use(bodyParser.json());
app.use(cors());

io.on('connection', function(socket){
    socket.on('newuser', function(username){
        console.log(username);
    });

    socket.on('prompt',function(data){
        console.log(data);
        const response = openai.createCompletion({
            model               : "text-davinci-003",
            prompt              : data.text,
            temperature         : 0.1,
            top_p               : 1,
            frequency_penalty   : 0,
            presence_penalty    : 0,
            max_tokens          : 256,
            stop                :["Human:","AI:","Human:","AI:"]
        });

        response.then((incomingData) => {
            const message = incomingData.data.choices[0].text;
            
            socket.emit("chatbot", {
                username:"bot",
                text:message
            })
            }).catch((err) => {
                console.log(err);
        });
    });
});

server.listen(2312, () => console.log("Server sudah berjalan di port 2312"));
