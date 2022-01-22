var canvas = document.getElementById('Gomuko');
var ctx =  canvas.getContext("2d");
var player1Score, player2Score = 0;
var Number_Of_Rows = 15;
var Number_Of_Cols = 15;
var playerTracker = 0;
var playerColor = ["white","black"]

// Creating a 2-dimensional array "grid"


var grid = new Array(15);
for (i = 0; i < grid.length;i++){
    grid[i] = new Array(15);
}

function DeclareWinner(ID){
    z = (ID == 0)? "player 1":"player 2";

	window.alert("Winner: " + z +"!!!");
    window.alert("Please reload the page for a new game !")
}


//console.log(grid[0][1])
//calculating block size in a board
BLOCK_SIZE = canvas.height/Number_Of_Rows;

function drawBoard()
{
    for(rCounter = 0; rCounter < Number_Of_Rows; rCounter++)
    {
        for(colCounter = 0; colCounter < Number_Of_Cols; colCounter++)
        {
            drawBlock(rCounter, colCounter);
            // drawBlock(colCounter)
        }
    }
}

function drawBlock(rowCounter,colmCounter)
{
    ctx.strokeStyke = 'Black';
    ctx.strokeRect(rowCounter*BLOCK_SIZE, colmCounter*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
    ctx.stroke();

}

// drawBoard(); important

function winCheck(x,y,playerID){
    // player = playerID;
    currentPlayerID = playerID;
    // if (player == 'Player 1'){
    //     currentPlayerID = 1;
    // } 
    // else {
    //   currentPlayerID = 2;
    // }
    currentScore = 1;
    // Vertical Case
    for( var v = 1; v < 5; v++){
        if(y+v >14 || grid[x][y+v]!= currentPlayerID){
            break;
        }
        else{
            currentScore++;
        }
    }    
    for(var v = -1; v > -5; v--){
        if(y+v < 0 || grid[x][y+v]!= currentPlayerID){
            break;
        }
        else {
            currentScore++;
        }
    }
    if(currentScore >=5){
        DeclareWinner(playerID);
    }
    // Horizontal Case
    currentScore = 1;
    for( var v = 1; v <5; v++){
        if(x+v>14 || grid[x+v][y]!= currentPlayerID){
            break;
        }
        else{
            currentScore++;
        }
    }
    for(var v = -1; v > -5; v--){
        if(x+v < 0 || grid[x+v][y]!= currentPlayerID){
            break;
        }
        else{
            currentScore++;
        }
    }
    if(currentScore >=5){
        DeclareWinner(playerID);
    }
    // Diagonal Case
    currentScore = 1;
    for(var v =1; v < 5;v++){
        if(x+v>14 || y+ v > 14 || grid[x+v][y+v]!= currentPlayerID){
            break;
        }
    else{
        currentScore++;
    }
    }
    for(var v = -1; v > -5;v--){
        if(x+v < 0 || y+v <0 ||grid[x+v][y+v] != currentPlayerID){
            break;
        }
    else{
        currentScore++
    }
    }
    if(currentScore >= 5){
        DeclareWinner(playerID);
    }

    currentScore = 1;
    for(var v =1; v < 5; v++){
        if(x+v > 14|| y-v < 0 || grid[x+v][y-v]!= currentPlayerID){
            break;
        }
        else{
            currentScore++;
        }
    }
    for(var v = -1; v >-5;v--){
        if(x+v < 0||y-v > 14||grid[x+v][y-v]!=currentPlayerID){
            break;
        } 
    else{
        currentScore++;
    }
    }
    if(currentScore >= 5){
        DeclareWinner(playerID);
    }

}


//This function should keep track of moves' validity and player's turn?
function moveJudge(x,y,playeNumber){
    if (grid[x][y] == undefined) {
        grid[x][y] = playeNumber;
        ctx.strokeStyle = 'black';
            // console.log(playNumber)
            ctx.fillStyle = playerColor[playeNumber];
            ctx.beginPath();
            ctx.arc((BLOCK_SIZE*x)+(BLOCK_SIZE/2),(BLOCK_SIZE*y)+(BLOCK_SIZE/2),15,0,2*Math.PI)
            ctx.stroke();
            ctx.fill();
        
    }
    else {
        window.alert("This move cannot be played!")
        return false
    }
    return true
}





function LocalPlayMode(){
    drawBoard()
    playerTracker = 0

    canvas.onclick = function(event){
            
        var boardParameter = canvas.getBoundingClientRect();
        //Coordinates collected here will be marked in array as filled.
        var cordX = Math.floor((event.clientX - boardParameter.left) / boardParameter.width * 15);
        var cordY = Math.floor((event.clientY - boardParameter.top) / boardParameter.height * 15);
        playerTracker = playerTracker%2;
        if (playerTracker == 0){
            playNumber = 0;
        }
        else{
            playNumber = 1;
        }
        if (moveJudge(cordX,cordY,playNumber)) {
           
            winCheck(cordX,cordY,playNumber);
            playerTracker++;    
    }    
    
    }
    
}

function OnlinePlayMode(){
    drawBoard();
    var socket = new WebSocket("ws://localhost:7777/")
    var thisID = -1;
    var currentPlayer = -1;
    var newplayerColor = ["white","black"]
    
    socket.onmessage = function(event) {
        var incomingConnection = JSON.parse(event.data);
        console.log(incomingConnection)
        switch(incomingConnection.Status){
            case "Error":
				window.alert(incomingConnection.Error)
                break;
            case "Connected":
                thisID = incomingConnection.ID;
                if (thisID == 0){
                    window.alert("Waiting for another player")
                }
                break;
            case "Chance":
                currentPlayer = incomingConnection.PLAYER
                if (incomingConnection.PLAYER == thisID){
                    console.log("Your Turn")
                } else {
                    console.log("Not Your Turn")
                }
                break;
            case "Move":  
                grid[incomingConnection.cordX][incomingConnection.cordY] = incomingConnection.ID;
                ctx.strokeStyle = 'black';
                // console.log(playNumber)
                ctx.fillStyle = newplayerColor[incomingConnection.ID];
                ctx.beginPath();
                ctx.arc((BLOCK_SIZE*incomingConnection.cordX)+(BLOCK_SIZE/2),(BLOCK_SIZE*incomingConnection.cordY)+(BLOCK_SIZE/2),15,0,2*Math.PI)
                ctx.stroke();
                ctx.fill();
                break;
            
            case "Winner":
                // console.log("Winner")
                DeclareWinner(incomingConnection.ID)
                // setTimeout("location.reload(true);", 5);
                break;
        }
    }
    canvas.addEventListener("click", function(event){
		var boundingRect = canvas.getBoundingClientRect();
		
		var posX = Math.floor((event.clientX - boundingRect.left) / boundingRect.width * 15);
		var posY = Math.floor((event.clientY - boundingRect.top) / boundingRect.height * 15);
		if(socket.readyState == 1 && currentPlayer == thisID)
			console.log('{"Status": "Move", "cordX": "'+posX+'", "cordY": "'+posY+'", "ID": "'+thisID+'"}');
			socket.send('{"Status": "Move", "cordX": "'+posX+'", "cordY": "'+posY+'", "ID": "'+thisID+'"}');
            // thisID += 1;
	})


}



document.getElementById("Local").onclick = LocalPlayMode;
document.getElementById("Online").onclick = OnlinePlayMode;

