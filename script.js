window.onload = function () {

  //Створення позицій на дошці
  const gameBoard = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
  ];

  //Масиви для екземплярів класів "Шашки" та "Плитки"
  const pieces = [];
  const tiles = [];

  //Формула для розрахунку відстані
  const dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));

  //Клас "Шашка"
  class Piece {
    constructor (element, position) {
    // Коли можна з'їсти шашку, звичайне переміщення не допускається
    // Оскільки в першому раунді немає можливості з'їсти, спочатку всі шашки можуть рухатися
    this.allowedtomove = true;
    //Пов'язаний елемент DOM
    this.element = element;
    //позиції в масиві gameBoard у форматі "рядок, стовпчик"
    this.position = position;
    //Шашка якого гравця в масиві
    this.player = '';
    //Встановлення гравця через id шашки
    if (this.element.attr('id') < 12)
      this.player = 1;
    else
      this.player = 2;
    }

    //Переміщення шашки
    move(tile) {
      this.element.removeClass('selected');
      if (!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;
      //Перевірка, що шашка не ходить назад
      if (this.player == 1) {
        if (tile.position[0] < this.position[0]) return false;
      } else if (this.player == 2) {
        if (tile.position[0] > this.position[0]) return false;
      }
      //Зняти відмітку шашки з масиву Board.board і перемістити її на нове місце в масиві
      Board.board[this.position[0]][this.position[1]] = 0;
      Board.board[tile.position[0]][tile.position[1]] = this.player;
      this.position = [tile.position[0], tile.position[1]];
      //Змінити css за словарем в Board
      this.element.css('top', Board.dictionary[this.position[0]]);
      this.element.css('left', Board.dictionary[this.position[1]]);
    };

    //Перевірка, що шашку можна з'їсти
    canJumpAny() {
      return (this.canOpponentJump([this.position[0] + 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] + 2, this.position[1] - 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] - 2]))
    };

    //tests if an opponent jump can be made to a specific place
    canOpponentJump(newPosition) {
      //find what the displacement is
      let dx = newPosition[1] - this.position[1];
      let dy = newPosition[0] - this.position[0];
      //make sure object doesn't go backwards if not a king
      if (this.player == 1 && this.king == false) {
        if (newPosition[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if (newPosition[0] > this.position[0]) return false;
      }
      //must be in bounds
      if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;
      //middle tile where the piece to be conquered sits
      let tileToCheckx = this.position[1] + dx / 2;
      let tileToChecky = this.position[0] + dy / 2;
      if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;
      //if there is a piece there and there is no piece in the space after that
      if (!Board.isValidPlacetoMove(tileToChecky, tileToCheckx) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
        //find which object instance is sitting there
        for (let pieceIndex in pieces) {
          if (pieces[pieceIndex].position[0] == tileToChecky && pieces[pieceIndex].position[1] == tileToCheckx) {
            if (this.player != pieces[pieceIndex].player) {
              //return the piece sitting there
              return pieces[pieceIndex];
            }
          }
        }
      }
      return false;
    };

    opponentJump(tile) {
      let pieceToRemove = this.canOpponentJump(tile.position);
      //if there is a piece to be removed, remove it
      if (pieceToRemove) {
        pieceToRemove.remove();
        return true;
      }
      return false;
    };

    remove() {
      //remove it and delete it from the gameboard
      this.element.css("display", "none");
      Board.board[this.position[0]][this.position[1]] = 0;
      //reset position so it doesn't get picked up by the for loop in the canOpponentJump method
      this.position = [];
    }
  };

  class Tile {
    constructor (element, position) {
    //linked DOM element
    this.element = element;
    //position in gameboard
    this.position = position;
    //if tile is in range from the piece
    }

    inRange(piece) {
      for (let k of pieces)
        if (k.position[0] == this.position[0] && k.position[1] == this.position[1]) return 'wrong';
      if (!piece.king && piece.player == 1 && this.position[0] < piece.position[0]) return 'wrong';
      if (!piece.king && piece.player == 2 && this.position[0] > piece.position[0]) return 'wrong';
      if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2)) {
        //regular move
        return 'regular';
      } else if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2 * Math.sqrt(2)) {
        //jump move
        return 'jump';
      }
    }
  }

  //Модель 
  const Model = {
    board: gameBoard,
    score: {
      player1: 0,
      player2: 0
    },
    playerTurn: 1,
    jumpexist: false,
    continuousjump: false,
    tilesElement: $('div.tiles'),
    //Словник для перетворення позиції в Model.board на одиниці viewport
    dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
    
    //Створення дошки 8x8
    initalize: function () {
      let countPieces = 0;
      let countTiles = 0;
      for (let row in this.board) {
        for (let column in this.board[row]) {
          //Розстановка позицій для плиток і шашок
          if (row % 2 == 1) {
            if (column % 2 == 0) {
              countTiles = this.tileRender(row, column, countTiles)
            }
          } else {
            if (column % 2 == 1) {
              countTiles = this.tileRender(row, column, countTiles)
            }
          }
          if (this.board[row][column] == 1) {
            countPieces = this.playerPiecesRender(1, row, column, countPieces)
          } else if (this.board[row][column] == 2) {
            countPieces = this.playerPiecesRender(2, row, column, countPieces)
          }
        }
      }
    },

    //Створення плитки
    tileRender: function (row, column, countTiles) {
      this.tilesElement.append(`<div class='tile' id='tile${countTiles}' style='top:${this.dictionary[row]};left:${this.dictionary[column]};'></div>`);
      tiles[countTiles] = new Tile($(`#tile${countTiles}`), [parseInt(row), parseInt(column)]);
      return countTiles + 1;
    },

    //Створення шашки
    playerPiecesRender: function (playerNumber, row, column, countPieces) {
      $(`.player${playerNumber}pieces`).append(`<div class='piece' id='${countPieces}' style='top:${this.dictionary[row]};left:${this.dictionary[column]};'></div>`);
      pieces[countPieces] = new Piece($(`#${countPieces}`), [parseInt(row), parseInt(column)]);
      return countPieces + 1;
    },

    //Перевірка, що на клітину можна перемістити
    isValidPlacetoMove: function (row, column) {
      if (row < 0 || row > 7 || column < 0 || column > 7) return false;
      if (this.board[row][column] == 0) {
        return true;
      }
      return false;
    },

    //Змінити активного гравця
    changePlayerTurn: function () {
      if (this.playerTurn == 1) {
        this.playerTurn = 2;
      } else {
        this.playerTurn = 1;
      }
      this.check_if_jump_exist();
      return;
    },

    check_if_jump_exist: function () {
      this.jumpexist = false
      this.continuousjump = false;
      for (let k of pieces) {
        k.allowedtomove = false;
        //Якщо не можна з'їсти, можна рухати лише ті шашки, які мають їсти інших
        if (k.position.length != 0 && k.player == this.playerTurn && k.canJumpAny()) {
          this.jumpexist = true
          k.allowedtomove = true;
        }
      }
      //Якщо не можна з'їсти, всі шашки можна рухати
      if (!this.jumpexist) {
        for (let k of pieces) k.allowedtomove = true;
      }
    }
  }

  //Ініціалізація дошки
  Board.initalize();

  /***Події***/

  //Обрати шашку при натисненні, якщо це черга цього гравця
  $('.piece').on("click", function () {
    let selected;
    let isPlayersTurn = $(this).parent().attr("class").split(' ')[0] == `player${Board.playerTurn}pieces`;
    if (isPlayersTurn) {
      if (!Board.continuousjump && pieces[$(this).attr("id")].allowedtomove) {
        if ($(this).hasClass('selected')) selected = true;
        $('.piece').each(function (index) {
          $('.piece').eq(index).removeClass('selected')
        });
        if (!selected) {
          $(this).addClass('selected');
        }
      } else {
        alert("Необхідно з'їсти шашку");
      }
    }
  });

  //Перемістити шашку, якщо натиснуто на плитку
  $('.tile').on("click", function () {
    //Перевірка, що шашка обрана
    if ($('.selected').length != 0) {
      //Знайти об'єкт плитки, на який було натиснуто
      let tileID = $(this).attr("id").replace(/tile/, '');
      let tile = tiles[tileID];
      //Знайти обрану шашку в масиві
      let piece = pieces[$('.selected').attr("id")];
      //Перевірити, що шашка в зоні досяжності від об'єкта плитки
      let inRange = tile.inRange(piece);
      if (inRange != 'wrong') {
        //Якщо потрібно з'їсти шашку, то перемістити її та перевірити кількість можливих ходів (два, три)
        if (inRange == 'jump') {
          if (piece.opponentJump(tile)) {
            piece.move(tile);
            if (piece.canJumpAny()) {
              piece.element.addClass('selected');
              //Можна з'їсти кілька шашок. В цей час не можна обрати іншу
              Board.continuousjump = true;
            } else {
              Board.changePlayerTurn();
            }
          }
          //Якщо це звичайний хід і немає можливості з'їсти, перемістити шашку
        } else if (inRange == 'regular' && !Board.jumpexist) {
          if (!piece.canJumpAny()) {
            piece.move(tile);
            Board.changePlayerTurn()
          } else {
            return false;
          }
        }
      }
    }
  });
}