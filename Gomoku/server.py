url = 'localhost'
port = 7777

from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json
import traceback

class Gomuko:
    def __init__(self):
        self.players = []
        self.playertracker = 1
        self.grid = [[None for y in range(15)]
                    for x in range(15)]

    def connectPlayer(self,player):
        if len(self.players) < 2:
            player.ID = len(self.players)
            self.players.append(player)
            player.sendMessage('{"Status": "Connected", "ID": %s}' %(player.ID))
        if len(self.players) == 2:
            self.players[0].sendMessage('{"Status": "Begin"}')
            self.playTracker()

        elif len(self.players) > 2:
            player.sendMessage('{"Status": "Error", "Error": "No more Players can be added"}')

    def playTracker(self):
        self.playertracker = (self.playertracker + 1) % 2
        for player in self.players:
            player.sendMessage('{"Status": "Chance", "PLAYER": "%s"}' % (self.playertracker))

    def playMove(self, posX, posY, ID):

        self.grid[posX][posY] = ID
        for player in self.players:
            player.sendMessage('{"Status": "Move", "cordX": "%s", "cordY": "%s", "ID": "%s"}' %(posX, posY, ID))
        #vertical cases
        highest = 1
        for i in range(1, 5):
            if posY + i > 14:
                break
            elif self.grid[posX][posY + i] != ID:
                break
            else:
                highest += 1
        for i in range(-4, 0):
            if posY + i < 0:
                break
            elif self.grid[posX][posY + i] != ID:
                break
            else:
                highest += 1
        if highest >= 5:
            self.declareWinner(ID)
            return

        highest = 1
        for i in range(1, 5):
            if posX + i > 14:
                break
            elif self.grid[posX + i][posY] != ID:
                break
            else:
                highest += 1

        for i in range(-4, 0):
            if posX + i < 0:
                break
            elif self.grid[posX + i][posY] != ID:
                break
            else:
                highest += 1

        if highest >= 5:
            self.declareWinner(ID)

        # Diagonal Cases
        highest = 1
        for i in range(1,5):
            if posX + i > 14 or posY + i > 14:
                break
            elif self.grid[posX+i][posY+i] != ID:
                break
            else:
                highest += 1
        for i in range(-4,0):
            if posX+i < 0 or posY + i < 0:
                break
            elif self.grid[posX+i][posY+i] != ID:
                break
            else:
                highest += 1

        if highest >= 5:
            self.declareWinner(ID)

        highest = 1
        for i in range(1,5):
            if posX+i > 14 or posY - i < 0:
                break
            elif self.grid[posX+i][posY-i] != ID:
                break
            else:
                highest += 1
        for i in range(-4,0):
            if posX + i < 0 or posY - i > 14:
                break
            elif self.grid[posX+i][posY-i] != ID:
                break
            else:
                highest += 1

        if highest >=5:
            self.declareWinner(ID)
        GomukoServer.playTracker()

    def judgeMove(self, cordX, cordY, ID, player):
        if GomukoServer.players[ID] is player and self.grid[cordX][cordY] == None:
            if GomukoServer.playertracker == ID:
                self.playMove(cordX,cordY,ID)

    def declareWinner(self, ID):
        for player in self.players:
            player.sendMessage('{"Status": "Winner", "ID": "%s"}'%(ID))
        self.reset()

    def reset(self):
        for player in self.players:
            player.close()
        self.players = []
        self.playertracker = -1
        self.grid = [[None for y in range(15)]
                     for x in range(15)]



GomukoServer = Gomuko()

class IncomingConnection(WebSocket):
    def handleConnected(self):
        try:
            GomukoServer.connectPlayer(self)
        except Exception as e:
            print(e)
    def handleMessage(self):
        try:
            request = json.loads(self.data)
            print(request)

            if request["Status"] == "Move":
                # print(type(int(request["cordX"])))
                GomukoServer.judgeMove(int(request["cordX"]),int(request["cordY"]), int(request["ID"]), self)
        except Exception as e:
            print(e)
            print(traceback.format_exc())

WebSocketServer = SimpleWebSocketServer(url, port, IncomingConnection)
print("Game Server is running at %s:%s" % (url, port))
WebSocketServer.serveforever()


