var DEFAULT_INTERVAL = 500;
var MIN_INTERVAL = 10;
var timerInterval = DEFAULT_INTERVAL;
var timer = 0;
var BOT_INIT_LOC_X = 2;
var BOT_INIT_LOC_Y = 2;
var botLocX = BOT_INIT_LOC_X;
var botLocY = BOT_INIT_LOC_Y;
var FACE_LEFT = "left";
var FACE_RIGHT = "right";
var FACE_UP = "up";
var FACE_DOWN = "down";
var botFacing = FACE_LEFT;
var COORD_BASE_ID = "Coord";
var COORD_MAX = 4;

var motionQueue = [];
var MOTION_MOVE_FORWARD = "moveForward";
var MOTION_TURN_LEFT = "turnLeft";
var MOTION_INCREASE_SPEED = "increaseSpeed";
var intervalIdentifier;

var POSITION_RADIO = "startPos";
var POSITION_RADIO_TOPLEFT = "pos_topleft";
var POSITION_RADIO_CENTER = "pos_center";
var ERROR_POSITION = "nubot fell off the grid";
var ERROR_POSITION_UNEXPECTED = "nubot encountered an unexpected move error";

var ERROR_PLACEHOLDER = "error_placeholder";
var STATUS_READY = "nubot ready";
var STATUS_INCREASE_SPEED = "increasing speed";

function Init()
{
  LoadCode();  
  LoadPos();
  LoadSpeed();
}

function LoadSpeed()
{
  document.getElementById("speed").value = localStorage.getItem("nubot_speed");   
}

function StoreSpeed()
{
  localStorage.setItem("nubot_speed", document.getElementById("speed").value);
}

function LoadCode()
{
  document.getElementById("code").value = localStorage.getItem("nubot_code"); 
}

function moveBot(locX, locY)
{
  var coordIdCurrent = buildCoordId(botLocX, botLocY);
  var coordIdNew = buildCoordId(locX, locY);
  var botImage = getImage(botLocX, botLocY, locX, locY);
  botLocX = locX;
  botLocY = locY;

  var currentCell = document.getElementById(coordIdCurrent);
  if (botLocX > COORD_MAX || botLocY > COORD_MAX || botLocX < 0 || botLocY < 0)
  {
    EndWithError(ERROR_POSITION);
    if (currentCell)
    {
      currentCell.style.backgroundImage = '';
    }

    return;
  }

  var newCell = document.getElementById(coordIdNew);
  if (!newCell)
  {
    EndWithError(ERROR_POSITION_UNEXPECTED);
  }
  else
  {
    if (currentCell)
    {
      currentCell.style.backgroundImage = '';
    }

    newCell.style.backgroundImage = botImage;
  }
}

function rotateBot(newFacing)
{
  botFacing = newFacing;
  var coordIdCurrent = buildCoordId(botLocX, botLocY);
  var newImage;
  if (botFacing == FACE_LEFT)
  {
    newImage = 'url("bot_left.png")';
  }
  else if (botFacing == FACE_RIGHT)
  {
    newImage = 'url("bot_right.png")';
  }
  else if (botFacing == FACE_DOWN)
  {
    newImage = 'url("bot_down.png")';
  }
  else if (botFacing == FACE_UP)
  {
    newImage = 'url("bot_up.png")';
  }

  document.getElementById(coordIdCurrent).style.backgroundImage = newImage;
}

function getImage(currentX, currentY, newX, newY)
{
  if (currentX < newX)
  {
    return 'url("bot_right.png")';
  }
  else if (currentX > newX)
  {
    return 'url("bot_left.png")';
  }
  else if (currentY < newY)
  {
    return 'url("bot_down.png")';
  } 
  else if (currentY > newY)
  {
    return 'url("bot_up.png")';
  }
  else
  {
    return 'url("bot_left.png")';
  }
}

function IsFacingWall()
{
  if ((botLocX == 0 && botFacing == FACE_LEFT) || 
      (botLocY == 0 && botFacing == FACE_UP) || 
      (botLocY == COORD_MAX && botFacing == FACE_DOWN) || 
      (botLocX == COORD_MAX && botFacing == FACE_RIGHT))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function IncreaseSpeed()
{
  motionQueue.push(MOTION_INCREASE_SPEED);
}

function buildCoordId(locX, locY)
{
  var coordId = COORD_BASE_ID + locX.toString() + locY.toString();

  return coordId;
}

function StorePos()
{
  var selected = GetSelectedRadio(POSITION_RADIO);
  localStorage.setItem("nubot_start_pos", selected);
}

function LoadPos()
{
  var posValue = localStorage.getItem("nubot_start_pos");
  var radios = document.getElementsByName(POSITION_RADIO);
  for(var i = 0; i < radios.length; i++)
  {
      if(radios[i].value == posValue)
      {
          radios[i].checked = true;
          break;
      }
  }

  ResetPosition();
}

function Run()
{
  Start();
  var code = document.getElementById("code").value;
  localStorage.setItem("nubot_code", code);
  ResetStatus();
  
  try
  {
    eval(code);
  }
  catch (err)
  {
    EndWithError(err.message);
  }
}

function EndWithError(errorMessage)
{
  clearInterval(intervalIdentifier); 
  clearQueue(); 
  AddError(errorMessage);
  End();
}

function AddError(error)
{
  var errorFormat = document.getElementById("errorTemplate").innerHTML;
  var errorText = errorFormat.replace(ERROR_PLACEHOLDER, error);
  AddStatus(errorText);
}

function End()
{
  document.getElementById("Run").disabled = false;
  document.getElementById("ResetPosition").disabled = false;
}

function Start()
{
  document.getElementById("Run").disabled = true;
  document.getElementById("ResetPosition").disabled = true;
  if (intervalIdentifier)
  {
    clearInterval(intervalIdentifier); 
    clearQueue();  
  }
  
  ResetPosition();  
  timerInterval = GetInterval();
  intervalIdentifier = setInterval(processQueue, timerInterval)
}

function GetInterval()
{
  var multiplier = document.getElementById("speed").value;
  var timerInterval = DEFAULT_INTERVAL;
  if (!isNaN(multiplier))
  {
    var divider = parseFloat(multiplier) / 100;
    timerInterval = (timerInterval  / divider);
  }

  return timerInterval;
}

function ResetPosition()
{
  var selected = GetSelectedRadio(POSITION_RADIO);
  if (selected == POSITION_RADIO_CENTER)
  {
    moveBot(BOT_INIT_LOC_X, BOT_INIT_LOC_Y);
    rotateBot(FACE_LEFT);
  }
  else if (selected == POSITION_RADIO_TOPLEFT)
  {
    moveBot(0, 0);
    rotateBot(FACE_RIGHT); 
  }
}

function GetSelectedRadio(inputName)
{
  var radios = document.getElementsByName(inputName);
  var selectedValue;
  for(var i = 0; i < radios.length; i++)
  {
      if(radios[i].checked)
      {
          selectedValue = radios[i].value;
          break;
      }
  }

  return selectedValue;
}

function TopLeftPosition()
{
  moveBot(0, 0);
  rotateBot(FACE_RIGHT);
}

function clearQueue()
{
  while (motionQueue.length > 0)
  {
    motionQueue.shift();
  }
}

function processQueue()
{
  if (motionQueue.length == 0)
  {
    End();
    return;
  }

  try
  {
    var motionAction = motionQueue.shift();
    if (motionAction == MOTION_MOVE_FORWARD)
    {
      realMoveForward();
    }
    else if (motionAction == MOTION_TURN_LEFT)
    {
      realTurnLeft();
    }
    else if (motionAction == MOTION_INCREASE_SPEED)
    {
      realIncreaseSpeed();
    }
  }
  catch (err)
  {
    EndWithError(err.message);
  }
}

function realIncreaseSpeed()
{
  timerInterval = Math.max(timerInterval * 0.8, MIN_INTERVAL);
  clearInterval(intervalIdentifier);
  intervalIdentifier = setInterval(processQueue, timerInterval);
  AddStatus(STATUS_INCREASE_SPEED);  
}

function MoveForward()
{
  motionQueue.push(MOTION_MOVE_FORWARD);
}

function realMoveForward()
{
  AddStatus("moving forward");
  var locX = botLocX;
  var locY = botLocY;
  if (botFacing == FACE_LEFT)
  {
    locX = botLocX - 1;
  }
  else if (botFacing == FACE_RIGHT)
  {
    locX = botLocX + 1;
  }
  else if (botFacing == FACE_DOWN)
  {
    locY = botLocY + 1;
  }
  else if (botFacing == FACE_UP)
  {
    locY = botLocY - 1;
  }

  moveBot(locX, locY);
}

function TurnLeft()
{
  motionQueue.push(MOTION_TURN_LEFT);
}

function realTurnLeft()
{
  AddStatus("turning left");
  var newFacing;
  if (botFacing == FACE_LEFT)
  {
    newFacing = FACE_DOWN;
  }
  else if (botFacing == FACE_RIGHT)
  {
    newFacing = FACE_UP;
  }
  else if (botFacing == FACE_DOWN)
  {
    newFacing = FACE_RIGHT;
  }
  else if (botFacing == FACE_UP)
  {
    newFacing = FACE_LEFT;
  }

  rotateBot(newFacing);
}


function Sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) 
  {
    if ((new Date().getTime() - start) > milliseconds)
    {
      break;
    }
  }
}

function ResetStatus()
{
  SetStatus(STATUS_READY);
}

function SetStatus(status)
{
  document.getElementById("status").innerHTML = status;
}

function AddStatus(status)
{
  var currentText = document.getElementById("status").innerHTML;
  if (currentText != "")
  {
    currentText += "<BR>";
  }

  currentText += status;
  document.getElementById("status").innerHTML = currentText;
}

function SupportTab()
{
  document.querySelector("textarea").addEventListener('keydown',function(e) {
      if(e.keyCode === 9) { // tab was pressed
          // get caret position/selection
          var start = this.selectionStart;
          var end = this.selectionEnd;

          var target = e.target;
          var value = target.value;

          // set textarea value to: text before caret + tab + text after caret
          target.value = value.substring(0, start)
                      + "\t"
                      + value.substring(end);

          // put caret at right position again (add one for the tab)
          this.selectionStart = this.selectionEnd = start + 1;

          // prevent the focus lose
          e.preventDefault();
      }
  },false);
}