'use strict';

const PlayerType = 
{
    Player2: 0,
    Player1: 1
};

const GameState = 
{
    FillingGrid: 0,
    Fighting: 1
};

const ship_alive_color = "DeepSkyBlue";
const max_ship_decks = 4;

const GridSettings = 
{
    OneDeck: {
        numberOfShips: 4,
        shipSize: 1
    },
    
    TwoDeck:{
        numberOfShips: 2,
        shipSize: 2
    },
    
    ThreeDeck:{
        numberOfShips: 2,
        shipSize: 3
    },
    
    FourDeck:{
        numberOfShips: 1,
        shipSize: 4
    },
    
    getShip: ( index ) =>
    {
        let i = 0;
        for ( let shipSettings in GridSettings )
        {
            if ( index == i ) return GridSettings [ shipSettings ];
            i++;
        };
    }
};

const fill_by_player = ( cell ) =>
{
    const player_ship = player1.currentShip;
    if( player1.isFillingByPlayer )
    {
        const currShipType = GridSettings.getShip ( player1.currentShipIndex );
        
        if( !currShipType.shipSize )
        {
            player1.finish_filling_grid( );
            return;
        };

        if( cell.cell_type == CellType.Occupied )
        {
            console.warn ( "Occupied" );
            return;
        };
        
        const add_cell_to_enviroment = ( last_cell_position ) => 
        {
            player1.currentShip.add_cell ( cell );
            GameEnviroment.add_ship_cell ( cell, player1.player_type, last_cell_position );
            GameEnviroment.drawRectangleWithPosition ( cell.local_position, player1.player_type, ship_alive_color );
        };

        if( !player1.currentShip )
        {
            if( cell.cell_type == CellType.Empty )
            {
                player1.currentShip = new Ship ( currShipType.shipSize );
                add_cell_to_enviroment ( null );
            }
            else return;
        };
        
        if ( cell.cell_type == CellType.Potential )
        {
            const cels_in_ship = player_ship.cells.length;
            add_cell_to_enviroment ( player_ship.cells [cels_in_ship - 1].local_position );
        };
        
        if ( player1.currentShip.cells.length == currShipType.shipSize )
        {
            player1.currentShipNumber++;
            GameEnviroment.add_ship(PlayerType.Player1, player1.currentShip);
            GameEnviroment.refresh_sea ( player1.player_type );
            console.log ( "refreshed" );
            player1.currentShip = null;
        };
        
        if ( player1.currentShipNumber == currShipType.numberOfShips )
        {
            if ( player1.currentShipIndex == max_ship_decks - 1 )
            {
                player1.finish_filling_grid ( );
                return;
            }
            player1.currentShipIndex++;
            player1.currentShipNumber = 0;
            GameUI.placeShipChange (  player1.currentShipIndex );
        };
    };
};

const fill_random = ( ) =>
{
    //fill random
    finish_filling_grid( );
}

const onPlayerClick = ( mouse_pos ) =>
{
        let cell = GameEnviroment.findClickedCell ( mouse_pos.pageX, mouse_pos.pageY, PlayerType.Player1 );

        if ( !cell ) return;
        if ( player1.isFillingByPlayer )
        {
            fill_by_player ( cell );
        }
        else
        {
            //here is some kind of attack we don't have
        switch (game_state)
        {
            case GameState.FillingGrid:
                if ( !cell ) return;
                if( player1.isFillingByPlayer )
                {
                    fill_by_player ( cell );
                }
                else 
                {
                    fill_random ( );
                }
                break;
            case GameState.Fighting:
                cell = GameEnviroment.findClickedCell ( mouse_pos.pageX, mouse_pos.pageY, PlayerType.Player2 );
                if ( !cell ) return;
                player1.attack_cell ( cell.local_position );
                break;

        }
        };
        //this.grid.add_ship ( new Ship ( cell.local_position, ) );
        //GameEnviroment.drawPoint ( cell.local_position.x, cell.local_position.y, PlayerType.Player2, 'black' );

};
class Player
{
    constructor ( emiter, player_type )
    {
        this.emiter = emiter;
        this.isFillingByPlayer = true;
        this.currentShipIndex = 0;
        this.currentShipNumber = 0;
        this.currentShip = null;
        this.player_type = player_type;
    };

    start ( )
    {
        this.emiter.on ( "BotAttacked", this.onBotAttacked );
        window.addEventListener ( 'click', onPlayerClick, false );
        this.grid = new ShipGrid ( );
        console.log ( "Player initiated!" );
        GameUI.textDrawer ( "Player, place your ships!" ); 
        GameUI.placeShipInit ( );
        this.fillGridByPlayer( );
    };

    attack_cell ( cell_position )
    {
        this.emiter.emit ( "PlayerAttacked", cell_position );
    }

    fillGridByPlayer ( )
    {
        this.isFillingByPlayer = true;
    };

    finish_filling_grid( )
    {
        console.log ( "Filling is finished, starting the game..." );
        GameUI.textDrawer ( "Starting the game..." );
        GameUI.placeShipHide ( );
        game_state = GameState.Fighting;
        this.isFillingByPlayer = false;
        bot.onPlayerAttacked();
    };

    onBotAttacked( ) 
    {
        console.log ( "Bot attacked!" );
    };

    
};

//Pomenyat onClick dlya dwoih sostoyaniy