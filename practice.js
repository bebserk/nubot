var LAST_ROW = 4;
var LAST_COLUMN = 4;
var MAX_ROWS = 5;
var MAX_COLUMNS = 5;

function TurnRight()
{
  Turn(3);
}

function Turn180()
{
  Turn(2);
}

function Turn(times)
{
  for (var i = 0; i < times; i++)
  {
    TurnLeft();
  }

}

function DoStuff()
{
  MoveForward();
  MoveForward();
  TurnLeft();
  MoveForward();
  TurnLeft();
  MoveForward();
  TurnLeft();
  MoveForward();
  TurnRight();
}

function CircleDance(numOfCircles)
{
  for (var x = 0; x < numOfCircles; x++)
  {
    for (var i = 0; i < 4; i++)
    {
      MoveForward();
      TurnLeft();
    }
  }
}

function MoveTopLeft()
{
  MoveForward();
  MoveForward();
  TurnRight();
  MoveForward();
  MoveForward();
  TurnRight();
}

function ClimbDownTheStairs()
{
  //MoveTopLeft();
  var x = 0;
  var y = 0;
  while (x < 4 && y < 4)
  {
    ClimbDownOneStair();
    x += 1;
    y += 1;    
  }
}

function ClimbDownOneStair()
{
  MoveForward();
  TurnRight();
  MoveForward();
  TurnLeft();
}

function WalkFullLine()
{
  for (var i = 0; i < LAST_COLUMN; i++)
  {
    MoveForward();
  }
}

function WalkFullLineRight(turnOnEnd)
{
  WalkFullLine();
  if (turnOnEnd)
  {
    TurnRight();
    MoveForward();
    TurnRight();
  }
}

function WalkFullLineLeft(turnOnEnd)
{
  WalkFullLine();
  TurnLeft();
  MoveForward();
  TurnLeft();
}

function Snake()
{
  MoveTopLeft();
  var row = 0;
  var walkRight = true;
  while (row < MAX_ROWS)
  {

    if (walkRight)
    {
      var turnOnEnd = true;
      if (row == (MAX_ROWS - 1))
      {
              turnOnEnd = false;
      }
  
      WalkFullLineRight(turnOnEnd);
    }
    else
    {
      WalkFullLineLeft();
    }

    walkRight = !walkRight;
    row += 1;
  }
}

//CircleDance(3);//Start at center
//ClimbDownTheStairs();//Start at top/left
Snake();//Start at center




