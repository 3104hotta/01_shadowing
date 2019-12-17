const express = require('express')
const http = require('http')
const reqest = require('request');
const app = express()
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';
const router = require('./routes/router.js');
require('date-utils');
const dt = new Date();
const dateFormatFileName =  dt.toFormat("YYYYMMDDHH24MISS");
require('dotenv').config();

app.use(express.static(__dirname));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

server = http.createServer(app).listen(3000, function() {
    logger.info('[app.js] Example app listening on port 3000')
})

// WebSocket サーバを起動
const socketio = require('socket.io')
const io = socketio.listen(server)

// クライアントが接続したときの処理
io.on('connection', (socket) => {
    let sampleRate = 48000
    let buffer = []

    // 録音開始の合図を受け取ったときの処理
    socket.on('start', (data) => {
        sampleRate = data.sampleRate
        logger.info(`[app.js] Sample Rate: ${sampleRate}`)
    })

    // PCM データを受信したときの処理
    socket.on('send_pcm', (data) => {
        // data: { "1": 11, "2": 29, "3": 33, ... }
        const itr = data.values()
        const buf = new Array(data.length)
        for (var i = 0; i < buf.length; i++) {
            buf[i] = itr.next().value
        }
        buffer = buffer.concat(buf)
    })

    // 録音停止の合図を受け取ったときの処理
    socket.on('stop', (data, ack) => {
        const f32array = toF32Array(buffer)
        const filename = 'public/wav/' + dateFormatFileName  + '.wav'
        exportWAV(f32array, sampleRate, filename)
        ack({ filename: filename })
    })
})

// Convert byte array to Float32Array
const toF32Array = (buf) => {
    const buffer = new ArrayBuffer(buf.length)
    const view = new Uint8Array(buffer)
    for (var i = 0; i < buf.length; i++) {
        view[i] = buf[i]
    }
    return new Float32Array(buffer)
}

const WavEncoder = require('wav-encoder')
const fs = require('fs')

// data: Float32Array
// sampleRate: number
// filename: string
const exportWAV = (data, sampleRate, filename) => {
    const audioData = {
        sampleRate: sampleRate,
        channelData: [data]
    }
    WavEncoder.encode(audioData).then((buffer) => {
        fs.writeFile(filename, Buffer.from(buffer), (e) => {
            if (e) {
                logger.error("[transcribe.js] ", e)
            } else {
                logger.info(`[app.js] Successfully saved ${filename}`)
            }
        })
    })
}

app.get('/', function(){reqest.get('/shadowing/')});
app.use('/shadowing/', router);
app.use('/shadowing/', router);
app.use('/shadowing/', router);