/*
 * Hanoi Tower Game using p5.js
 *
 * Designed by ZulNs @Gorontalo, 10 January 2021
 */

let diskCount, towerFrom, towerTo, towerBridge;
let disks = [];
let towers = [ [], [], [] ];
let moveTable = [];
let moveCounter = 0;
let currentDisk = 0;
let pixelStep = 10;
let isPlaying = false;
let isPaused = false;
let root, selectDisk, selectDest, buttonStart, buttonPause, rangeSpeed, speedValue;
let monoSynth;
let vcd = '';
let vcdCurrent;
const vcdEnd = -300;

function setup(){
  createCanvas(500, 260).parent('canvas_holder');
  root = select(':root');
  selectDisk = select('#disk_count');
  selectDest = select('#move_to');
  buttonStart = select('#button_start');
  buttonPause = select('#button_pause');
  rangeSpeed = select('#speed');
  speedValue = select('#speed_value');
  
  selectDisk.input(onSelectDisk);
  selectDest.input(onSelectDestination);
  addEvent(buttonStart.elt, 'click', onClickStart);
  addEvent(buttonPause.elt, 'click', onClickPause);
  rangeSpeed.input(onChangeSpeed);
  
  buttonPause.elt.disabled = true;
  rangeSpeed.value(pixelStep);
  speedValue.html(pixelStep);
  
  monoSynth = new p5.MonoSynth();
  
  onSelectDisk(); // indirect call to setupGame()
  
  let vc = select('meta[name=validity_code]').elt.content;
  let cd;
  for (let i=0; i<vc.length; i+=2) {
    cd = parseInt('0x'+vc.substr(i, 2));
    cd = cd + 256 * (cd & 1);
    cd >>= 1;
    vcd += String.fromCharCode(cd);
  }
  vcdCurrent = width;
}

function draw() {
  background(240);
  drawTower();
  drawDisk();
  if (currentDisk > 0) {
    slideDisk(currentDisk);
  }
  if (isPlaying) {
    textSize(14);
    textStyle(NORMAL);
    stroke(240);
    fill(32);
    text('Step ' + (moveCounter+1).toString() + ' of ' + (2**diskCount-1).toString(), width/6-8, 220);
  }
  stroke(240);
  fill(255, 32, 32);
  textSize(12);
  textStyle(NORMAL);
  text(vcd, vcdCurrent, 250);
  vcdCurrent--;
  if (vcdCurrent < vcdEnd) {
    vcdCurrent = width;
  }
}

function moveDisk(nod, ts, td, tb) {
  let d, md = {};
  if (nod == 1) {
    d = towers[ts-1].pop();
    towers[td-1].push(d);
    md.d = d;
    md.t = td;
    md.r = towers[td-1].length;
    moveTable.push(md);
  }
  else {
    moveDisk(nod-1, ts, tb, td);
    d = towers[ts-1].pop();
    towers[td-1].push(d);
    md.d = d;
    md.t = td;
    md.r = towers[td-1].length;
    moveTable.push(md);
    moveDisk(nod-1, tb, td, ts);
  }
}

let Disk = function(size) {
  this.size = size;
  this.x = width/6 + (towerFrom-1)*width/3 - 5*size -10;
  this.y = 40 + 20 + (10-diskCount+size-1)*11;
  this.dx = this.x;
  this.dy = this.y;
};

function drawTower() {
  let x = width/6 - 5;
  let y = 40;
  let s;
  textSize(16);
  for (let i=0; i<3; ++i) {
    let stroke_ = [16, 16, 16, 255];
    let fill_ = [32, 32, 32, 255];
    let s = 'T' + (i+1).toString();
    stroke_[i] = 48;
    fill_[i] = 96;
    stroke(stroke_);
    fill(fill_);
    rect(x, y, 10, 129, 10, 10, 0, 0);
    stroke(240);
    textStyle(BOLD);
    text(s, x-3, 190);
    x += width/3;
  }
}

function drawDisk() {
  let stroke_ = [32, 32, 32, 255];
  let fill_ = [128, 128, 128, 255];
  stroke_[towerFrom-1] = 128;
  fill_[towerFrom-1] = 255;
  stroke(stroke_);
  fill(fill_);
  disks.forEach((disk) => {
    rect(disk.x, disk.y, disk.size*10 + 20, 10, 10);
  });
}

function setDiskDest(size, twrTo, rowTo) {
  disks[size-1].dx = width/6 + (twrTo-1)*width/3 - 5*size -10;
  disks[size-1].dy = 40 + 20 + (10-rowTo)*11;
}

function slideDisk(size) {
  let d = disks[size-1];
  if (d.x != d.dx) {
    if (d.y > 19) {
      d.y -= pixelStep;
      if (d.y < 19) {
        d.y = 19;
      }
    }
    else {
      if (d.x < d.dx) {
        d.x += pixelStep;
        if (d.x > d.dx) {
          d.x = d.dx;
        }
      }
      else {
        d.x -= pixelStep;
        if (d.x < d.dx) {
          d.x = d.dx;
        }
      }
    }
  }
  else if (d.y != d.dy) {
    d.y += pixelStep;
    if (d.y > d.dy) {
      d.y = d.dy;
    }
  }
  else {
    if (moveCounter < 2**diskCount-2) {
      ++moveCounter;
      let mt = moveTable[moveCounter];
      setDiskDest(mt.d, mt.t, mt.r);
      currentDisk = mt.d;
    }
    else {
      currentDisk = 0;
      makeSound(() => {
        buttonPause.elt.disabled = true;
      });
    }
  }
}

function onSelectDisk() {
  let val = selectDisk.value();
  if (val == '' || val < 3) {
    val = 3;
  }
  else if (val > 10) {
    val = 10;
  }
  selectDisk.value(val);
  diskCount = val;
  setupGame();
}

function onSelectDestination() {
  setupGame();
}

function onClickStart() {
  if (isPlaying) {
    isPaused = false;
    currentDisk = 0;
    setupGame();
    buttonStart.html('Start');
    buttonPause.html('Pause');
    buttonPause.elt.disabled = true;
    selectDisk.elt.disabled = false;
    selectDest.elt.disabled = false;
  }
  else {
    buttonStart.html('Stop');
    buttonPause.elt.disabled = false;
    selectDisk.elt.disabled = true;
    selectDest.elt.disabled = true;
    moveTable = [];
    moveDisk(diskCount, towerFrom, towerTo, towerBridge);
    moveCounter = 0;
    let mt = moveTable[0];
    setDiskDest(mt.d, mt.t, mt.r);
    makeSound(() => {
      if (isPlaying) {
        currentDisk = mt.d;
      }
    });
  }
  isPlaying = !isPlaying;
}

function onClickPause() {
  if (isPaused) {
    buttonPause.html('Pause');
    currentDisk = moveTable[moveCounter].d;
  }
  else {
    buttonPause.html('Continue');
    currentDisk = 0;
  }
  isPaused = !isPaused;
}

function onChangeSpeed() {
  pixelStep = rangeSpeed.value();
  speedValue.html(pixelStep);
  root.elt.style.setProperty('--speed-value', `${pixelStep}%`);
}

function setupGame() {
  let i;
  switch (parseInt(selectDest.value())) {
    case 1:
      towerFrom = 1;
      towerTo = 2;
      towerBridge = 3;
      break;
    case 2:
      towerFrom = 2;
      towerTo = 3;
      towerBridge = 1;
      break;
    case 3:
      towerFrom = 3;
      towerTo = 1;
      towerBridge = 2;
      break;
    case 4:
      towerFrom = 1;
      towerTo = 3;
      towerBridge = 2;
      break;
    case 5:
      towerFrom = 3;
      towerTo = 2;
      towerBridge = 1;
      break;
    case 6:
      towerFrom = 2;
      towerTo = 1;
      towerBridge = 3;
      break;
  }
  towers = [ [], [], [] ];
  for (i=0; i<diskCount; ++i) {
    towers[towerFrom-1].push(diskCount-i);
  }
  disks = [];
  for (i=0; i<diskCount; ++i) {
    disks.push(new Disk(i+1));
  }
}

function makeSound(callback) {
  monoSynth.triggerAttack('C5', 1);
  setTimeout(() => {
    monoSynth.triggerAttack('E5', 1);
  }, 100);
  setTimeout(() => {
    monoSynth.triggerAttack('G5', 1);
  }, 200);
  setTimeout(() => {
    monoSynth.triggerAttack('D6', 1);
  }, 300);
  setTimeout(() => {
    monoSynth.triggerRelease();
    callback();
  }, 400);
}

function addEvent(elm, evt, cb){
  if (window.addEventListener) {
    elm.addEventListener(evt, cb);
  }
  else if(elm.attachEvent) {
    elm.attachEvent('on' + evt, cb);
  }
  else elm['on' + evt] = cb;
}
