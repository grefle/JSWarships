const PlayerType = {
  Player2: 0,
  Player1: 1,
};

const GameState = {
  FillingGrid: 0,
  Fighting: 1,
};

//const config = ConfigManager.getConfig();
const SHIP_ALIVE_COLOR = 'DeepSkyBlue'; //config.ShipAliveColor;
const MAX_SHIP_DECKS = 4; //config.MaxShipDecks;
//const PLAYER = GameEnviroment.Player;

const GridSettings = {
  OneDeck: {
    numberOfShips: 4,
    shipSize: 1,
  },

  TwoDeck: {
    numberOfShips: 2,
    shipSize: 2,
  },

  ThreeDeck: {
    numberOfShips: 2,
    shipSize: 3,
  },

  FourDeck: {
    numberOfShips: 1,
    shipSize: 4,
  },

  getShip: (index) => {
    let i = 0;
    for (const shipSettings in GridSettings) {
      if (index === i) return GridSettings[shipSettings];
      i++;
    }
  },
};

const fillByPlayer = (cell) => {
  const playerShip = player.currentShip;
  if (player.isFillingByPlayer) {
    const currShipType = GridSettings.getShip(player.currentShipIndex);

    if (!currShipType.shipSize) {
      player.finishFillingGrid();
      return;
    }

    if (cell.cellType === CellType.Occupied) {
      console.warn('Occupied');
      return;
    }

    const addCellToEnviroment = (lastCellPosition) => {
      player.currentShip.addCell(cell);
      GameEnviroment.addShipCell(cell, player.playerType, lastCellPosition);
      GameEnviroment.drawRectangle(
        cell.localPosition,
        player.playerType,
        SHIP_ALIVE_COLOR
      );
    };

    if (!player.currentShip) {
      if (cell.cellType === CellType.Empty) {
        player.currentShip = new Ship(currShipType.shipSize);
        addCellToEnviroment(null);
      } else return;
    }

    if (cell.cellType === CellType.Potential) {
      const celsInShip = playerShip.cells.length;
      addCellToEnviroment(playerShip.cells[celsInShip - 1].localPosition);
    }

    if (player.currentShip.cells.length === currShipType.shipSize) {
      player.currentShipNumber++;
      GameEnviroment.addShip(PlayerType.Player1, player.currentShip);
      GameEnviroment.refreshSea(player.playerType);
      console.log('refreshed');
      player.currentShip = null;
    }

    if (player.currentShipNumber === currShipType.numberOfShips) {
      if (player.currentShipIndex === MAX_SHIP_DECKS - 1) {
        player.finishFillingGrid();
        return;
      }
      player.currentShipIndex++;
      player.currentShipNumber = 0;
      GameUI.placeShipChange(player.currentShipIndex);
    }
  }
};

const fillRandom = () => {
  RandomPlacer.fillGridRandom(PlayerType.Player1);
  player.finishFillingGrid();
};

const onPlayerClick = (mousePos) => {
  let cell = GameEnviroment.findClickedCell(
    mousePos.pageX,
    mousePos.pageY,
    PlayerType.Player1
  );

  //here is some kind of attack we don't have
  switch (GameEnviroment.GameState) {
    case GameState.FillingGrid:
      if (player.isFillingByPlayer) {
        if (!cell) return;
        fillByPlayer(cell);
      } else {
        fillRandom();
      }
      break;
    case GameState.Fighting:
      cell = GameEnviroment.findClickedCell(
        mousePos.pageX,
        mousePos.pageY,
        PlayerType.Player2
      );
      if (!cell) return;
      player.attackCell(cell.localPosition);
      break;
  }
};

class Player {
  constructor(emiter, playerType) {
    this.emiter = emiter;
    this.isFillingByPlayer = true;
    this.currentShipIndex = 0;
    this.currentShipNumber = 0;
    this.currentShip = null;
    this.playerType = playerType;
  }

  start() {
    this.emiter.on('BotAttacked', this.onBotAttacked);
    window.addEventListener('click', onPlayerClick, false);
    this.isFillingByPlayer = false;
    console.log('Player initiated!');
    GameUI.textDrawer('Player, place your ships!');
    GameUI.placeShipInit();
    //this.fillGridByPlayer( );
  }

  attackCell(cellPosition) {
    GameEnviroment.shot(cellPosition.x, cellPosition.y, PlayerType.Player2);
  }

  fillGridByPlayer() {
    this.isFillingByPlayer = true;
  }

  finishFillingGrid() {
    console.log('Filling is finished, starting the game...');
    GameUI.textDrawer('Starting the game...');
    GameUI.placeShipHide();
    GameEnviroment.GameState = GameState.Fighting;
    this.isFillingByPlayer = false;
    GameEnviroment.Bot.onPlayerAttacked();
  }

  onBotAttacked() {
    console.log('Bot attacked!');
  }
}
