window.onload = function () {
   // Creating positions on the board
   const gameBoard = [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0],
   ];

   // Arrays for instances of the "Checkers" and "Tiles" classes
   const pieces = [];
   const tiles = [];

   // The formula for calculating the distance
   const dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

   // Checkers class
   class Piece {
      constructor(element, position) {
         // If you can eat a checker, normal movement is not allowed
         // Since there is no opportunity to eat in the first round, initially all checkers can move
         this.allowedtomove = true;
         // Associated DOM element
         this.element = element;
         // Positions in the gameBoard array in the format "row, column"
         this.position = position;
         // Player's checker in the array
         this.player = "";
         // Find a player via the checker's id
         if (this.element.attr("id") < 12) this.player = 1;
         else this.player = 2;
      }
      // Moving checkers
      move(tile) {
         this.element.removeClass("selected");
         if (!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;
         //Перевірка, що шашка не ходить назад
         if (this.player === 1) {
            if (tile.position[0] < this.position[0]) return false;
         } else if (this.player === 2) {
            if (tile.position[0] > this.position[0]) return false;
         }
         // Uncheck the checker from the Board.board array and move it to a new location in the array
         Board.board[this.position[0]][this.position[1]] = 0;
         Board.board[tile.position[0]][tile.position[1]] = this.player;
         this.position = [tile.position[0], tile.position[1]];
         // Change css by dictionary in Board
         this.element.css("top", Board.dictionary[this.position[0]]);
         this.element.css("left", Board.dictionary[this.position[1]]);
      }
      // Check that the checker can be eaten
      canJumpAny() {
         return (
            this.canOpponentJump([this.position[0] + 2, this.position[1] + 2]) ||
            this.canOpponentJump([this.position[0] + 2, this.position[1] - 2]) ||
            this.canOpponentJump([this.position[0] - 2, this.position[1] + 2]) ||
            this.canOpponentJump([this.position[0] - 2, this.position[1] - 2])
         );
      }
      // Checking the possibility of "eating" for the opponent
      canOpponentJump(newPosition) {
         // Establishing a new position
         let dx = newPosition[1] - this.position[1];
         let dy = newPosition[0] - this.position[0];
         // Checking the impossibility of reversing move
         if (this.player === 1) {
            if (newPosition[0] < this.position[0]) return false;
         } else if (this.player === 2) {
            if (newPosition[0] > this.position[0]) return false;
         }
         // Check that the location is within the board
         if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0)
            return false;
         // The coordinates of the cell in which the checker is to be beaten
         let tileToCheckx = this.position[1] + dx / 2;
         let tileToChecky = this.position[0] + dy / 2;
         if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0)
            return false;
         // Check the presence of the checker in the cell and the space behind it
         if (
            !Board.isValidPlacetoMove(tileToChecky, tileToCheckx) &&
            Board.isValidPlacetoMove(newPosition[0], newPosition[1])
         ) {
            // Object type check
            for (let pieceIndex in pieces) {
               if (
                  pieces[pieceIndex].position[0] === tileToChecky &&
                  pieces[pieceIndex].position[1] === tileToCheckx
               ) {
                  if (this.player !== pieces[pieceIndex].player) {
                     return pieces[pieceIndex];
                  }
               }
            }
         }
         return false;
      }

      opponentJump(tile) {
         let pieceToRemove = this.canOpponentJump(tile.position);
         // Check the possibility of removing the checker
         if (pieceToRemove) {
            pieceToRemove.remove();
            return true;
         }
         return false;
      }

      remove() {
         // Remove the checker from the board
         this.element.css("display", "none");
         Board.board[this.position[0]][this.position[1]] = 0;
         this.position = [];
      }
   }

   class Tile {
      constructor(element, position) {
         // Associated DOM element
         this.element = element;
         // Position on the board
         this.position = position;
      }
      // Check that the tile is within reach of the checker
      inRange(piece) {
         for (let k of pieces)
            if (k.position[0] === this.position[0] && k.position[1] === this.position[1])
               return "wrong";
         if (piece.player === 1 && this.position[0] < piece.position[0]) return "wrong";
         if (piece.player === 2 && this.position[0] > piece.position[0]) return "wrong";
         if (
            dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) ===
            Math.sqrt(2)
         ) {
            // Normal movement
            return "regular";
         } else if (
            dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) ===
            2 * Math.sqrt(2)
         ) {
            // "Eating" movement
            return "jump";
         }
      }
   }

   // Data and logistics
   const Board = {
      board: gameBoard,
      score: {
         player1: 0,
         player2: 0,
      },
      playerTurn: 1,
      jumpExist: false,
      continuousJump: false,
      tilesElement: $("div.tiles"),
      // Dictionary for converting positions in Board.board to viewport units
      dictionary: [
         "0vmin",
         "10vmin",
         "20vmin",
         "30vmin",
         "40vmin",
         "50vmin",
         "60vmin",
         "70vmin",
         "80vmin",
         "90vmin",
      ],

      // Creating an 8x8 board
      initalize: function () {
         let countPieces = 0;
         let countTiles = 0;
         for (let row in this.board) {
            for (let column in this.board[row]) {
               // Arrangement of positions for tiles and checkers
               if (row % 2 === 1) {
                  if (column % 2 === 0) {
                     countTiles = this.tileRender(row, column, countTiles);
                  }
               } else {
                  if (column % 2 === 1) {
                     countTiles = this.tileRender(row, column, countTiles);
                  }
               }
               if (this.board[row][column] === 1) {
                  countPieces = this.playerPiecesRender(1, row, column, countPieces);
               } else if (this.board[row][column] === 2) {
                  countPieces = this.playerPiecesRender(2, row, column, countPieces);
               }
            }
         }
      },

      // Creating tile
      tileRender: function (row, column, countTiles) {
         this.tilesElement.append(
            `<div class='tile' id='tile${countTiles}' style='top:${this.dictionary[row]};left:${this.dictionary[column]};'></div>`
         );
         tiles[countTiles] = new Tile($(`#tile${countTiles}`), [parseInt(row), parseInt(column)]);
         return countTiles + 1;
      },

      // Creating checker
      playerPiecesRender: function (playerNumber, row, column, countPieces) {
         $(`.player${playerNumber}pieces`).append(
            `<div class='piece' id='${countPieces}' style='top:${this.dictionary[row]};left:${this.dictionary[column]};'></div>`
         );
         pieces[countPieces] = new Piece($(`#${countPieces}`), [parseInt(row), parseInt(column)]);
         return countPieces + 1;
      },

      // Check that the cell can be moved
      isValidPlacetoMove: function (row, column) {
         if (row < 0 || row > 7 || column < 0 || column > 7) return false;
         if (this.board[row][column] === 0) {
            return true;
         }
         return false;
      },

      // Change the active player
      changePlayerTurn: function () {
         if (this.playerTurn === 1) {
            this.playerTurn = 2;
         } else {
            this.playerTurn = 1;
         }
         this.checkIfJumpExist();
         return;
      },

      checkIfJumpExist: function () {
         this.jumpExist = false;
         this.continuousJump = false;
         for (let k of pieces) {
            k.allowedtomove = false;
            // If eating is not allowed, you can only move the checkers that others have to eat
            if (k.position.length !== 0 && k.player === this.playerTurn && k.canJumpAny()) {
               this.jumpExist = true;
               k.allowedtomove = true;
            }
         }
         // If eating is not allowed, all checkers can be moved
         if (!this.jumpExist) {
            for (let k of pieces) k.allowedtomove = true;
         }
      },
   };

   // Board initialization
   Board.initalize();

   /* EVENTS */

   // Select a checker when pressed, if it is the turn of this player
   $(".piece").on("click", function () {
      let selected;
      let isPlayersTurn =
         $(this).parent().attr("class").split(" ")[0] === `player${Board.playerTurn}pieces`;
      if (isPlayersTurn) {
         if (!Board.continuousJump && pieces[$(this).attr("id")].allowedtomove) {
            if ($(this).hasClass("selected")) selected = true;
            $(".piece").each(function (index) {
               $(".piece").eq(index).removeClass("selected");
            });
            if (!selected) {
               $(this).addClass("selected");
            }
         } else {
            alert("You need to eat a checker");
         }
      }
   });

   // Move the checker if you click on the tile
   $(".tile").on("click", function () {
      // Check that the checker is selected
      if ($(".selected").length !== 0) {
         // Find the tile object you clicked on
         const tileID = $(this).attr("id").replace(/tile/, "");
         const tile = tiles[tileID];
         // Find the selected checker in the array
         const piece = pieces[$(".selected").attr("id")];
         // Check that the checker is within reach of the tile object
         const inRange = tile.inRange(piece);
         if (inRange !== "wrong") {
            // If a checker should be eaten, move it and check the number of possible moves (two, three)
            if (inRange === "jump") {
               if (piece.opponentJump(tile)) {
                  piece.move(tile);
                  if (piece.canJumpAny()) {
                     piece.element.addClass("selected");
                     // Several checkers could be eaten. You cannot select another one at this time
                     Board.continuousJump = true;
                  } else {
                     Board.changePlayerTurn();
                  }
               }
               // If this is a normal move and there is no opportunity to eat, move the checker
            } else if (inRange === "regular" && !Board.jumpExist) {
               if (!piece.canJumpAny()) {
                  piece.move(tile);
                  Board.changePlayerTurn();
               } else {
                  return false;
               }
            }
         }
      }
   });
};
