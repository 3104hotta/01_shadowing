const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const router = require('./routes/router.js');

app.use('/', express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

server = http.createServer(app).listen(3000, function() {
    console.log('Example app listening on port 3000')
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
        console.log(`Sample Rate: ${sampleRate}`)
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
        const filename = `public/wav/${String(dateFormat(new Date(),'YYYYMMDDSS'))}.wav`
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
                console.log(e)
            } else {
                console.log(`Successfully saved ${filename}`)
            }
        })
    })
}

function dateFormat(date, format) {
    yyyy = toDoubleDigits(date.getFullYear());
    mm = toDoubleDigits(date.getMonth() + 1);
    dd = toDoubleDigits(date.getDate());
    hh = toDoubleDigits(date.getHours());
    mi = toDoubleDigits(date.getMinutes());
    ss = toDoubleDigits(date.getSeconds());
    format = yyyy + mm + dd + '_' + hh + mi + ss;
    console.log(format);
    return format;
}

var toDoubleDigits = function(num) {
    num += "";
    if (num.length === 1) {
      num = "0" + num;
    }
   return num;     
  };

app.get('/', router);
app.get('/upload', router);