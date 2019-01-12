
class GameButton {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.isMine = false;
      this.marked = false;
      this.revealed = false;
    }
  
    makeMine(){
      this.isMine = true;
    }
  
    flagMarked() {
      if(this.marked) {
        this.marked = false;
      } else {
        this.marked = true;
      }
    }
  
    reveal() {
      this.revealed = true;
    }
  }
  
  $(document).ready(()=> {
  
    let row;
    let col;
    let mines;
    let minesLeft;
    let time = 0;
    let mineField = [];
    let timer;
    let endGame;
    let revealedTilesLeft;
    let best_score = [];
  
    function getRandomInteger(max) {
        return Math.floor(Math.random() * max) + 1;
    }
  
    function setMines() {
      let minesInField=0;
      let x,y;
      while (minesInField < mines) {
        x=getRandomInteger(col);
        y=getRandomInteger(row);
        if (!mineField[x][y].isMine){
          mineField[x][y].makeMine();
          minesInField++;
        }
      }
    }
  
    function newGame() {
      if(timer){
        stopTimer();
        time=0;
        timer="";
      }
     
        let rowsI = document.getElementById('height').value;
        let colsI = document.getElementById('width').value;
        let minesI = document.getElementById('mines').value;
        if(rowsI < 8 || rowsI > 30) {
          alert("Height should be more than 8, less than 30");
        } else if(colsI < 8 || colsI > 40) {
          alert("Width should be more than 8, less than 40");
        } else if (minesI < 1 || minesI > colsI*rowsI-1) {
          alert("Mine should be more than 1, less than (height * width -1)");
        } else {
          row=rowsI;
          col=colsI;
          mines=minesI;
        }
        displayTimes(best_score);
      
      document.getElementById('grid-container').style.setProperty("--rowNum", row);
      document.getElementById('grid-container').style.setProperty("--colNum", col);
      minesLeft = mines;

      for(let i = 1; i <= row; i++){
        for(let j = 1; j <= col; j++){
          if(i==1){
            mineField[j]=[];
          }
          let id = j + '_' + i;
          let button = $("<button type='button' class='game-button'></button>");
          button.attr('id', id);
          $('#grid-container').append(button);
          mineField[j][i]= new GameButton(j, i);
        }
      }

      setMines();
      $('#remaining').html("Mines Remaining: " + minesLeft);
      $('#time').html("Time: " + time);
      endGame = false;
      revealedTilesLeft = row*col;
    }
  
    function numOfMines(x,y) {
      let numOfMines = 0;
      for(let i = x-1; i <= x+1; i++) {
        for(let j = y-1; j <= y+1; j++ ) {
            if (i < 1 || j < 1 || i > col || j > row || (i == x && j == y)) {
              continue;
            } else if (mineField[i][j].isMine) {
              numOfMines++;
            }
          }
        }
      return numOfMines;
    }
  
    newGame();
  
    $('#new-game').click(() =>{
      $('#grid-container').empty();
      newGame();
    });
  
    $('body').on('click', '.game-button', function(e) {
      if(!timer){
        timer = setInterval(startTimer, 1000);
      }
      let location = $(this).attr('id').split('_');


      if(e.shiftKey) {
        if(!$(this).html()){
          $(this).append($("<div class='flag'> &#9971 </div>"));
          minesLeft--;
        } else {
          $(this).html("");
          minesLeft++;
        }
        $('#remaining').html("Mines Remaining: " + minesLeft);
        mineField[location[0]][location[1]].flagMarked();
      } else {
        if ($(this).html()){
        } else {
          if (mineField[location[0]][location[1]].isMine){
            stopTimer();
            show(Number(location[0]), Number(location[1]));
            alert("Try Again :( ");
          } else {
            revealSurrounding($(this), Number(location[0]),Number(location[1]));
            if (revealedTilesLeft == mines) {
              endGame = wonGame();
            }
            if(endGame) {
              stopTimer();
              winShow();
              alert("Good Job :) ");
              HighScore();
            }
          }
        }
      }
    });
  
    $('body').on('click', '.box', function(e) {
      if (!endGame){
        if ($(this).text()){
          let location = $(this).attr('id').split('_');
          if (Number($(this).text()) == getNumMarked(Number(location[0]),Number(location[1]))) {
            fakeClick(Number(location[0]),Number(location[1]));
          }
        }
      }
    });
  
    function fakeClick(x,y) {
      for(let i = x-1; i <= x+1; i++) {
        for(let j = y-1; j <= y+1; j++ ) {
            if (i < 1 || j < 1 || i > col || j > row || (i == x && j == y)) {
              continue;
            } else if (!mineField[i][j].revealed) {
              let id = "#" + i + "_" + j;
              $(id).trigger("click");
            }
          }
        }
    }
  
    function startTimer() {
        time++;
        $('#time').html("Time: " + time);
    }
  
    function stopTimer() {
        clearInterval(timer);
    }
  
    function show(x,y) {
      endGame = true;
      for(let i = 1; i <= col; i++) {
        for (let j = 1; j <= row; j++) {
          let id = "#" + i + "_" + j;
          if (mineField[i][j].isMine){
            let html;
            if (i==x && j==y){
              html = "<div class='bombclick'>&#9760</div>";
            } else {
              html = "<div class='bomb'>&#9760</div>";
            }
            $(id).replaceWith(html);
         }
        }
      }
    }
  
    function wonGame(){
      for(let i = 1; i <= col; i++) {
        for (let j = 1; j <= row; j++) {
          if (!mineField[i][j].isMine && !mineField[i][j].revealed) {
            return false;
          }
        }
      }
      return true;
    }
  
    function winShow() {
      for(let i = 1; i <= col; i++) {
        for (let j = 1; j <= row; j++) {
          if (mineField[i][j].isMine && !mineField[i][j].marked){
            mineField[i][j].flagMarked();
            let id = "#" + i + "_" + j;
            $(id).append($("<span class=flag>&#9971</span>"));
            $(id).prop("disabled",true);
          }
        }
      }
      minesLeft = 0;
      $('#remaining').html("Mines Remaining: " + minesLeft);
    }
  
    function getNumMarked(x,y) {
      let numMarked = 0;
      for(let i = x-1; i <= x+1; i++) {
        for(let j = y-1; j <= y+1; j++ ) {
          if (i < 1 || j < 1 || i > col || j > row || (i == x && j == y)) {
            continue;
          } else if (mineField[i][j].marked) {
            numMarked++;
          }
        }
      }
      return numMarked;
    }
  
    function HighScore() {
        sortArray(best_score);
        displayTimes(best_score);
      }
    
  
    function sortArray(a) {
      if (a.length < 10){
        a.push([time, col, row, mines]);
        a.sort(sortFunction);
      } else {
        a.push([time, col, row, mines]);
        a.sort(sortFunction);
        a.splice(10,1);
      }
    }
  
    function displayTimes(a){
      $('.high-scores').empty();
      if (a.length == 0) {
        $(".high-scores").append("<div>0</div>");
      } else {
        $('.high-scores').append("<div class='highest-score'></div>");
        for (let i = 0; i < a.length; i++) {
          $('.highest-score').append("<div>" + "Ranking: "+ (i+1) + "</div>");
          $('.highest-score').append("<div>" + "Time: " + a[i][0] + " </div>");
          $('.highest-score').append("<div>" + a[i][1] + " rows * " + a[i][2] +" columns  with " + a[i][3] + " mines</div>");
        }
      }
    }
  
    function revealSurrounding(clicked, x, y) {
      mineField[x][y].reveal();
      revealedTilesLeft--;
      let numberOfMines = numOfMines(Number(x), Number(y));
      if(numberOfMines == 0) {
        clicked.replaceWith("<div class=box id='" + clicked.attr('id')+ "'></div>");
        for(let i = x-1; i <= x+1; i++) {
          for(let j = y-1; j <= y+1; j++ ) {
              if (i < 1 || j < 1 || i > col || j > row || (i == x && j == y)) {
                continue;
              } else if (!mineField[i][j].revealed && !mineField[i][j].isMine &&!mineField[i][j].marked) {
                let id = "#" + i + "_" + j;
                revealSurrounding($(id), i, j);
              }
            }
          }
      } else {
        let html = "<div class='box' id='" + clicked.attr('id')+ "'>" + numberOfMines + "</div>";
        clicked.replaceWith(html);
      }
    }
  
    function sortFunction(a, b) {
      if (a[0] > b[0]) {
          return 1;
      } else if (a[0] < b[0]) {
        return -1;
      } else {
        return 0;
      }
    }
      
  });