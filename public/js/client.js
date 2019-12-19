
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
            submitToUpload(res.filename);
        })
    }

    function submitToUpload(filename){

      dispLoading('Please wait...');

      // 非同期処理
      $.ajax({
        url : '/shadowing/upload',
        type : "post",
        dataType :"json",
        data : { filename : filename.slice(11,25) },
      }).then(
        data => {
          $('#shadowing-filename').text(data.filename);
          console.log('success upload. filename is ' + $('#shadowing-filename').text() );
        },
        error => { console.log('fail upload') }
      ).then( removeLoading() )
   }

   function submitToStartTranscribe(){

    const filename = $('#shadowing-filename').text();
    console.log(`Pushed start transcribe for ${filename}`);
    
    // 非同期処理
    $.ajax({
      url : `/shadowing/transcribe/${filename}`,
      type : "get"
    }).then(
      data => { console.log('success start transcribe') },
      error => { console.log('fail start transcribe') }
    ).then( removeLoading() )

 }

 function submitToGetTranscribe(){

  dispLoading("Please wait...");
  const filename = $('#shadowing-filename').text();

  timer = setInterval(function() {

  var form = $('<form/>', {action:'/shadowing', method:'get'});
  form.appendTo(document.body);
  
  // 非同期処理
  $.ajax({
    url : `/shadowing/getResult/${filename}`,
    type : "get"
  }).then(
    data => { 
      console.log('not complete yet')
      if( data.status == 'COMPLETED' ) { 
        removeLoading();
        clearInterval(timer);
        form.submit();
      }
    },
    error => { 
      console.log('fail get transcribe');
      removeLoading();
    }
  )}, 2000);

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

    $('#toggle-textarea').click(function() {
      $('#input-form').fadeToggle('slow');
    })
  
    $('#toggle-shadowing').click(function() {
      $('#shadowing-form').fadeToggle('slow');
    })

});


