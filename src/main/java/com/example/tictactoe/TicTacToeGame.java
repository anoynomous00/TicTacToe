package com.example.tictactoe; 

public class TicTacToeGame {
    private char[] board = new char[9];
    private char currentPlayer = 'X';
    private boolean gameOver = false;
    
    private String currentDifficulty = "Easy"; 

    public TicTacToeGame() {
        for (int i = 0; i < 9; i++) {
            board[i] = ' ';
        }
    }

    public void setDifficulty(String difficulty) {
        this.currentDifficulty = difficulty;
    }

    // --- Core Game Methods ---

    public char[] getBoard() { return board; }
    public char getCurrentPlayer() { return currentPlayer; }
    public boolean isGameOver() { return gameOver; }

    public void reset() {
        for (int i = 0; i < 9; i++) {
            board[i] = ' ';
        }
        currentPlayer = 'X';
        gameOver = false;
    }

    public String makeMove(int index) {
        if (gameOver || index < 0 || index >= 9 || board[index] != ' ') {
            return "Invalid move";
        }

        board[index] = currentPlayer;

        if (checkForWin()) {
            gameOver = true;
            return currentPlayer + " wins!";
        } 
        
        else if (isBoardFull()) { 
            gameOver = true;
            return "Draw!"; 
        }

        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
        return "Move successful. It is " + currentPlayer + "'s turn.";
    }
    
    // --- AI LOGIC METHODS ---

    public int getAIMove() {
        if (gameOver) return -1;
        
        switch (currentDifficulty.toLowerCase()) {
            case "hard":
                return findBestMove();
            case "medium":
                return findMediumMove();
            case "easy":
            default:
                return findRandomMove();
        }
    }

    // Difficulty 1: Easy (Random Move)
    private int findRandomMove() {
        java.util.List<Integer> availableMoves = new java.util.ArrayList<>();
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                availableMoves.add(i);
            }
        }
        if (availableMoves.isEmpty()) return -1;
        java.util.Random rand = new java.util.Random();
        return availableMoves.get(rand.nextInt(availableMoves.size()));
    }

    // Difficulty 2: Medium (Random + Blocking/Winning)
    private int findMediumMove() {
        // 1. Check for an immediate winning move for 'O'
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'O';
                if (checkForWin()) {
                    board[i] = ' '; 
                    return i;
                }
                board[i] = ' '; 
            }
        }

        // 2. Check for an immediate block for 'X'
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'X';
                if (checkForWin()) {
                    board[i] = ' '; 
                    return i;
                }
                board[i] = ' '; 
            }
        }

        // 3. Fallback to random move
        return findRandomMove();
    }

    // Difficulty 3: Hard (Minimax Algorithm Implementation)
    private int findBestMove() {
        int bestVal = -1000;
        int bestMove = -1;

        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'O'; 
                
                int moveVal = minimax(0, false);
                
                board[i] = ' '; 
                
                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    }

    // Helper: Evaluates the current board state (+10 for Win, -10 for Loss, 0 for Draw)
    private int evaluate() {
        if (checkLineForPlayer('O')) return +10;
        if (checkLineForPlayer('X')) return -10;
        return 0;
    }

    // Helper: Checks for a win by a specific player ('X' or 'O')
    private boolean checkLineForPlayer(char player) {
        // Check Rows
        for (int i = 0; i < 9; i += 3) {
            if (board[i] == player && board[i+1] == player && board[i+2] == player) return true;
        }
        // Check Columns
        for (int i = 0; i < 3; i++) {
            if (board[i] == player && board[i+3] == player && board[i+6] == player) return true;
        }
        // Check Diagonals
        if (board[0] == player && board[4] == player && board[8] == player) return true;
        if (board[2] == player && board[4] == player && board[6] == player) return true;
        
        return false;
    }

    // Helper: Checks if there are any moves left (Draw check for minimax)
    private boolean isMovesLeft() {
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') return true;
        }
        return false;
    }

    // The core Minimax recursive function
    private int minimax(int depth, boolean isMax) {
        int score = evaluate();

        if (score == 10) return score - depth; 
        if (score == -10) return score + depth;
        if (!isMovesLeft()) return 0;

        // Maximizer's move (AI = 'O')
        if (isMax) {
            int best = -1000;
            for (int i = 0; i < 9; i++) {
                if (board[i] == ' ') {
                    board[i] = 'O';
                    best = Math.max(best, minimax(depth + 1, !isMax));
                    board[i] = ' ';
                }
            }
            return best;
        } 
        // Minimizer's move (Player = 'X')
        else {
            int best = 1000;
            for (int i = 0; i < 9; i++) {
                if (board[i] == ' ') {
                    board[i] = 'X';
                    best = Math.min(best, minimax(depth + 1, !isMax));
                    board[i] = ' ';
                }
            }
            return best;
        }
    }
    
    // --- Private Helper Methods (from original code, kept for completeness) ---

    private boolean checkForWin() {
        return (checkRows() || checkColumns() || checkDiagonals());
    }

    private boolean checkRows() {
        for (int i = 0; i < 9; i += 3) {
            if (checkLine(board[i], board[i+1], board[i+2])) {
                return true;
            }
        }
        return false;
    }

    private boolean checkColumns() {
        for (int i = 0; i < 3; i++) {
            if (checkLine(board[i], board[i+3], board[i+6])) {
                return true;
            }
        }
        return false;
    }

    private boolean checkDiagonals() {
        return (checkLine(board[0], board[4], board[8]) || 
                checkLine(board[2], board[4], board[6])); 
    }

    private boolean checkLine(char c1, char c2, char c3) {
        return (c1 != ' ' && c1 == c2 && c2 == c3);
    }

    private boolean isBoardFull() {
        for (char cell : board) {
            if (cell == ' ') {
                return false;
            }
        }
        return true;
    }
}