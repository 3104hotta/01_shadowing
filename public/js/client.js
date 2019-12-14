const socket = io.connect()
    let processor = null
    let localstream = null

    function startRecording() {
        // displayRecordingMessage();
        console.log('start recording')
        context = new window.AudioContext()
        socket.emit('start', { 'sampleRate': context.sampleRate })

        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
            localstream = stream
            const input = this.context.createMediaStreamSource(stream)
            processor = context.createScriptProcessor(4096, 1, 1)

            input.connect(processor)
            processor.connect(context.destination)

            processor.onaudioprocess = (e) => {
                const voice = e.inputBuffer.getChannelData(0)
                socket.emit('send_pcm', voice.buffer)
            }
        }).catch((e) => {
            // "DOMException: Rrequested device not found" will be caught if no mic is available
            console.log(e)
        })
    }

    function stopRecording() {
        console.log('stop recording')
        processor.disconnect()
        processor.onaudioprocess = null
        processor = null
        localstream.getTracks().forEach((track) => {
            track.stop()
        })
        socket.emit('stop', '', (res) => {
            console.log(`Audio data is saved as ${res.filename}`)
            submit(res.filename);
        })
    }

    function submit(filename){

      dispLoading("Please wait...");

      // 非同期処理
      $.ajax({
        url : '/shadowing/upload',
        type : "post",
        dataType :"json",
        data : {filename : filename.slice(11,25) }
      })
      // 通信成功時
      .done( function(data) {
        console.log("成功しました");
      })
      // 通信失敗時
      .fail( function(data) {
        console.log("失敗しました");
      })
      // 処理終了時
      .always( function(data) {
        // Lading 画像を消す
        removeLoading();
      });

    }

  function dispLoading(msg){
    // 引数なし（メッセージなし）を許容
    if( msg == undefined ){
      msg = "";
    }
    // 画面表示メッセージ
    var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
    // ローディング画像が表示されていない場合のみ出力
    if($("#loading").length == 0){
      $("body").append("<div id='loading'>" + dispMsg + "</div>");
    }
  }
  
  function removeLoading(){
    $("#loading").remove();
  }

$(function() {

    const recordMessage = $('#record-message');

    const startButton = $('#start-button');
    $(startButton).click(function(e){
      console.log(recordMessage.text('Recording Now.'));
    })

    const stopButton = $('#stop-button');
    $(stopButton).click(function(e){
      console.log(recordMessage.text('Recording Stop.'));
    })

});