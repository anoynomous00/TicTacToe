package com.example.tictactoe; 

import org.springframework.web.bind.annotation.*;

@RestController 
@RequestMapping("/api/game") 
public class TicTacToeController {

    private TicTacToeGame game = new TicTacToeGame();

    // GET /api/game/state
    @GetMapping("/state")
    public GameState getState() {
        return new GameState(game.getBoard(), game.getCurrentPlayer(), game.isGameOver());
    }

    // POST /api/game/move/{index}
    @PostMapping("/move/{index}")
    public String makeMove(@PathVariable int index) {
        return game.makeMove(index);
    }

    // POST /api/game/reset
    @PostMapping("/reset")
    public String resetGame() {
        game.reset();
        return "Game reset. New game started.";
    }

    // NEW: Endpoint to set the difficulty level
    @GetMapping("/difficulty/{level}")
    public String setDifficulty(@PathVariable String level) {
        game.setDifficulty(level);
        return "Difficulty set to " + level;
    }

    // NEW: Endpoint for the AI to make its move
    @PostMapping("/aimove")
    public MoveResult makeAIMove() {
        int moveIndex = game.getAIMove();
        String status = "";
        
        if (moveIndex != -1) {
            status = game.makeMove(moveIndex); 
        }
        
        return new MoveResult(moveIndex, status);
    }

    // Class to structure the JSON response for the frontend
    public static class GameState {
        public char[] board;
        public char currentPlayer;
        public boolean gameOver;

        public GameState(char[] board, char currentPlayer, boolean gameOver) {
            this.board = board;
            this.currentPlayer = currentPlayer;
            this.gameOver = gameOver;
        }

        public char[] getBoard() { return board; }
        public char getCurrentPlayer() { return currentPlayer; }
        public boolean isGameOver() { return gameOver; }
    }

    // NEW: Class to return the AI's move index and the resulting status
    public static class MoveResult {
        public int moveIndex;
        public String status;

        public MoveResult(int moveIndex, String status) {
            this.moveIndex = moveIndex;
            this.status = status;
        }
        public int getMoveIndex() { return moveIndex; }
        public String getStatus() { return status; }
    }
}