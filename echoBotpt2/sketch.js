let rm;
let response = '';

let narcLines, allegoryLines;

let input;
let send;
let sentText;
let userLines = [];
let sound;
let whisperSounds = [];
let whis1,whis2,whis3;
let userTextArr = [];
let otherUserLines  = [];

let startFlag = false;

let promptCount = 0;

let forward;
let backwards;

let isFore = false;
let isBack = false;



//firebase Stuff
let database, ref;
let disclaim = "when you press ''send to database'' your input text will be saved on a public database.";

let shareLines;

class UserText{
  constructor(text,x,y, frame_0){
    this.text = text;
    this.x = x;
    this.y = y;
    this.colorFade = 255;
    this.frame_0 = frame_0;
  }
  display(){
    if (promptCount >12){
      if(isFore == true){
        fill(255,255,255,this.colorFade-(0.1*(frameCount - this.frame_0)));
      }
      if(isBack == true){
        fill(50,50,50,this.colorFade-(0.1*(frameCount - this.frame_0)));
      }
    }else{
      fill(150,150,150,this.colorFade-(0.1*(frameCount - this.frame_0)));
    }
    fill(150,150,150,this.colorFade-(0.1*(frameCount - this.frame_0)));
    text(this.text, this.x,this.y);
  }
}

//having weird error with sound

function preload(){
  sound = loadSound("caveSounds.mp3");
  whis1 = loadSound('whisper1.wav');
  whis2 = loadSound('whisper2.wav');
  whis3 = loadSound('whisper3.wav');
  whisperSounds.push(whis1);
  whisperSounds.push(whis2);
  whisperSounds.push(whis3);
  allegoryLines = loadStrings('allegory.txt');
  narcLines = loadStrings('narcissusAndEcho.txt');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  input = createInput("hello ..?");
  input.position(width/2 - input.width/2, height/2-input.height/2);
  input.style('background-color', color(50,50,50));
  input.style('color', color(200));
  send = createButton("send");
  send.position(width/2 - send.width/2, height/2 + 20);
  send.style('background-color', color(50,50,50));
  send.style('color', color(200));
  send.mousePressed(talk);

  shareLines = createButton("send to database");
  shareLines.position(width/2 - shareLines.width/2, height-100);
  shareLines.style('background-color', color(50,50,50));
  shareLines.style('color', color(200));
  shareLines.mousePressed(sendData);

  //move further in or out of cavern
  forward = createButton("move forwards");
  forward.position(width/2 +10, height/2+50);
  forward.style('background-color', color(50,50,50));
  forward.style('color', color(200));
  forward.mousePressed(moveF);

  backwards = createButton("move backwards");
  backwards.position(width/2-110, height/2+50);
  backwards.style('background-color', color(50,50,50));
  backwards.style('color', color(200));
  backwards.mousePressed(moveB);

  //configure firebase
  fireConfig();
  database = firebase.database();
  ref = database.ref("userLine");
  ref.on("value", gotData);

  //rita
  //what is an n-factor

  rm = RiTa.markov(2);
  sound.play();
  sound.loop();
}

function draw() {
  blendMode(BLEND);
  //noLoop();
  forward.hide();
  backwards.hide();

  let caveCenterX = width/2 + mouseX/100;
  let caveCenterY = height/2+ mouseY/100;

  //cave effect
  background(50);

  for (let i = 50; i>0; i--){
    noStroke();
    fill(i)
    //stroke(255);
    rectMode(CENTER);
    let rectHeight = height-10*(50-i)
    ellipse(caveCenterX, caveCenterY, width-10*(50-i), rectHeight);
    if (rectHeight < 10){
      break
    }
  }
  fill(100);
  text(disclaim, width/2, height-50, width, 50)
  //hide for

  welcome();

  if (isBack){
    background(80);
    for (let i = 80; i>30; i--){
      noStroke();
      fill(i)
      //stroke(255);
      rectMode(CENTER);
      let rectHeight = height-10*(50-i)
      ellipse(width/2, height/2, width-10*(50-i), rectHeight);
      if (rectHeight < 10){
        break
      }
    }
  }
  if (isFore){
    background(20)
    for (let i = 20; i>0; i--){
      noStroke();
      fill(i)
      //stroke(255);
      rectMode(CENTER);
      let rectHeight = height-10*(50-i)
      ellipse(width/2, height/2, width-10*(50-i), rectHeight);
      if (rectHeight < 10){
        break
      }
    }
  }

  if (userTextArr.length>0){
    for (let i = 0; i<userTextArr.length; i++){
      userTextArr[i].display();
    }
  }

  //trigger next window
  if (promptCount==12){
    input.hide();
    send.hide();
    shareLines.hide();
    forward.show();
    backwards.show();
    //whis1.play();
    fill(0);
    strokeWeight(1);
    stroke(50);
    let wind0w = rect(width/2, height/2, width/3, height/3, 20);
    noStroke();
    fill(150);
    textAlign(CENTER);
    let str = "you now hear muffled voices in front of and behind you. are you moving forward or backwards?"
    text(str, width/2, height/2, width/3 - 50, height/3 - 100);
  }


}


// function drawBackground(){
//
// }

function welcome(){
  if (startFlag == false){
    input.hide();
    send.hide();
    shareLines.hide();

    //move back to draw


    fill(0);
    strokeWeight(1);
    stroke(50);
    let wind0w = rect(width/2, height/2, width/3, height/3, 20);
    noStroke();
    fill(150);
    textAlign(CENTER);
    let str = "you have woken up in a dark cave. you don't know how you got here. you cannot see a thing. are you alone in here?\n\n send text to get clues to leaving \n\n press anywhere to begin"
    text(str, width/2, height/2, width/3 - 30, height/3 - 50);
  }
}





function talk(){
  if (input.value()){
    if (!otherUserLines.includes(input.value())){

      otherUserLines.push(input.value());
    }
    userLines.push(input.value());

    //fill(200);
    print(userLines);
    rm.addText(userLines)
    rm.addText(otherUserLines)

    input.value('')
    //userTextArr[userTextArr.length - 1].display();
  }
  response = rm.generate(1, {temperature: 100}, {minLength: 3});
  promptCount++;
  userTextArr.push(new UserText(
    response,
    random(width - 100), random(height-100),
    frameCount));
}

function keyTyped(){
  if (keyCode == ENTER){
    talk();
    input.value('')
  }
}

//can it be the same function?
function moveF(){

  isFore = true;
  //adds more from other people data
  promptCount =16;
  input.show();
  send.show();
  shareLines.show();

  rm.addText(otherUserLines);
  rm.addText(narcLines);
  console.log(otherUserLines);
  blendMode(EXCLUSION);
  fill(200);
  rect(width/2, height/2, width,height);
}
function moveB(){
  isBack = true;
  //adds from truth and narcissus
  promptCount =16;
  input.show();
  send.show();
  shareLines.show();

  rm.addText(allegoryLines);
  rm.addText(otherUserLines);
}


function mousePressed(){
  if (startFlag == false){
    startFlag = true;
    input.show();
    send.show();
    shareLines.show();
  }
}

function sendData(){
  ref.push(otherUserLines);
  // console.log(userLines);
}

function gotData(data){
  let incomingData = data.val();
  //console.log(incomingData);
  let keys = Object.keys(incomingData);
  let lastKey = keys[keys.length - 1];
  otherUserLines1 = incomingData[lastKey];
  for (let i = 0; i<otherUserLines1.length; i++){
    otherUserLines = otherUserLines1.filter(element =>{
      return element!== '';
    });
  }
  console.log("other user lines");
  console.log(otherUserLines);
}

function fireConfig(){
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAysA-bLDaLRtlS9V7N0Hx-L_Xuw8juz28",
    authDomain: "echobase-d6bb5.firebaseapp.com",
    databaseURL: "https://echobase-d6bb5-default-rtdb.firebaseio.com",
    projectId: "echobase-d6bb5",
    storageBucket: "echobase-d6bb5.appspot.com",
    messagingSenderId: "687846702343",
    appId: "1:687846702343:web:11d803f77ebe9bb123d9a2"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
}
