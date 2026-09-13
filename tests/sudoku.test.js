import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIFFICULTY,
  EMPTY,
  SIZE,
  cloneBoard,
  conflictCells,
  countSolutions,
  generatePuzzle,
  isSolved,
  isValidPlacement,
  isValidSudoku,
  solve,
} from "../src/sudoku.js";

describe("isValidSudoku / isSolved", () => {
  it("rejects duplicate values in a row", () => {
    const board = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      ...Array.from({ length: 8 }, () => Array(9).fill(0)),
    ];
    assert.equal(isValidSudoku(board), false);
  });

  it("accepts a partial valid board", () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    board[0][0] = 5;
    board[0][1] = 3;
    board[1][0] = 6;
    assert.equal(isValidSudoku(board), true);
    assert.equal(isSolved(board), false);
  });

  it("isValidPlacement blocks peers", () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    board[0][0] = 5;
    assert.equal(isValidPlacement(board, 0, 1, 5), false);
    assert.equal(isValidPlacement(board, 1, 0, 5), false);
    assert.equal(isValidPlacement(board, 1, 1, 5), false);
    assert.equal(isValidPlacement(board, 0, 1, 3), true);
  });
});

describe("conflictCells", () => {
  it("marks both cells of a row duplicate", () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    board[0][0] = 4;
    board[0][8] = 4;
    const bad = conflictCells(board);
    assert.equal(bad[0][0], true);
    assert.equal(bad[0][8], true);
    assert.equal(bad[1][0], false);
  });
});

describe("generatePuzzle", () => {
  it("easy puzzle is valid, unique, and has enough clues", () => {
    const { puzzle, solution, given, difficulty } = generatePuzzle("easy", 42);
    assert.equal(difficulty, "easy");
    assert.equal(isSolved(solution), true);
    assert.equal(isValidSudoku(puzzle), true);
    assert.equal(countSolutions(puzzle, 2), 1);
    let clues = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (puzzle[r][c] !== EMPTY) {
          clues += 1;
          assert.equal(given[r][c], true);
          assert.equal(puzzle[r][c], solution[r][c]);
        } else {
          assert.equal(given[r][c], false);
        }
      }
    }
    assert.ok(clues >= DIFFICULTY.easy.clues);
    const solved = solve(puzzle);
    assert.ok(solved);
    assert.equal(isSolved(solved), true);
  });

  it("medium puzzle is unique and solvable", () => {
    const { puzzle, solution } = generatePuzzle("medium", 99);
    assert.equal(isSolved(solution), true);
    assert.equal(countSolutions(puzzle, 2), 1);
    const solved = solve(cloneBoard(puzzle));
    assert.deepEqual(solved, solution);
  });
});
