let audioIsPlaying = false
let audio = document.getElementById("bird-audio");
let audioDuration = 100

let button = document.querySelector(".record-button")
let canvas = document.getElementById("record-button-canvas");

let buttonColors = {"outer" : "#00660f", 
                    "inner" : "white"}

audio.addEventListener("emptied", function(event){
  document.getElementById("current-time").innerHTML = ''
  document.getElementById("end-time").innerHTML = ''
  clearCanvas( canvas.getContext("2d") )
  button.disabled = true
})

audio.addEventListener("loadedmetadata", function(event){
  audioIsPlaying = false
  button.disabled = false
  audioDuration = audio.duration ;
  document.getElementById("current-time").innerHTML = toTimeString(0)
  document.getElementById("end-time").innerHTML = toTimeString(audioDuration)
  drawButton()
});

function playAudio() { 
  audio.play(); 
} 

function pauseAudio() {
  audio.pause();
}


function clearCanvas(ctx){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(ctx, fillcolor) {
  h = canvas.height
  w = canvas.width 
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, Math.min(h/2, w/2) * 0.9, 0, 2 * Math.PI);
  ctx.fillStyle = fillcolor;
  ctx.fill();
}

function drawTriangle(ctx, fillcolor){
  h = canvas.height
  w = canvas.width 
  ctx.beginPath();
  halfradius = Math.min(h/2, w/2) * 0.9 * 0.5 ;
  midw = w / 2 ;
  midh = h / 2 ;
  ctx.moveTo(midw + (halfradius * 1.1), midh);
  ctx.lineTo(midw - (halfradius * 0.8), midh + halfradius);
  ctx.lineTo(midw - (halfradius * 0.8), midh - halfradius);
  ctx.fillStyle = fillcolor;
  ctx.fill()
}

function drawPauseBars(ctx, fillcolor){
  h = canvas.height
  w = canvas.width
  radius = Math.min(h/2, w/2) * 0.9 ;
  midw = w / 2 ;
  midh = h / 2 ;
  ctx.fillStyle = fillcolor
  ctx.fillRect(midw - (radius * 0.4), midh - (radius * 0.5), radius * 0.3, radius );
  ctx.fillRect(midw + (radius * 0.4), midh - (radius * 0.5), -radius * 0.3, radius );
}

function drawPlay(){
  const ctx = canvas.getContext("2d");
  clearCanvas(ctx)
  drawCircle(ctx, buttonColors["outer"])
  drawTriangle(ctx, buttonColors["inner"])
}

function drawPause(){
  const ctx = canvas.getContext("2d");
  clearCanvas(ctx)
  drawCircle(ctx, buttonColors["outer"])
  drawPauseBars(ctx, buttonColors["inner"])
}

function drawButton(){
  if(audioIsPlaying){
    drawPause() ;
  }
  else{
    drawPlay() ;
  }
}

function toTimeString(time){
  time = time.toFixed();
  let seconds = time % 60;
  let minutes = Math.floor(time  / 60);
  if (seconds < 10){
    seconds = '0' + seconds ;
  } 
  if (minutes < 10){
    minutes = '0' + minutes ;
  } 
  return minutes + ":" + seconds ;
}

function updateAudioBar(){
  let audioCurrent = audio.currentTime ;
  let progressBar = document.querySelector(".progress-slider");
  let newvalue = audioCurrent * 100 / audioDuration ;
  progressBar.value = newvalue.toFixed(3) ;
  document.getElementById("current-time").innerHTML = toTimeString(audioCurrent) ;
}

function audioButtonFunction(){
  if (audioIsPlaying){
    pauseAudio(audio) ;
  }
  else{
    if(audio.currentTime == audioDuration){
      audio.currentTime = 0
    }
    playAudio(audio) ;
  }
  audioIsPlaying = ! audioIsPlaying ;
  drawButton()
}


document.querySelector(".progress-slider").addEventListener("click", function(event){
    let percent = event.offsetX / event.target.offsetWidth;
    console.log(percent)
    audio.currentTime = audioDuration * percent;
    if (! audioIsPlaying) {
      audioIsPlaying = true ;
      playAudio()
      drawButton()
    }
  })
