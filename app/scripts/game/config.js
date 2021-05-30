/**
 * Tristris 2 Config
 *
 * @todo document config structure
 */

const config = {
  tetromino: {
    I: {
      mat: [[0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]],
      center: {x: 1.5, y: 2}
    },
    O: {
      mat: [[1, 1],
            [1, 1]],
      center: {x: 1, y: 1}
      },
    T: {
      mat: [[0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]],
      center: {x: 1.5, y: 2}
    },
    J: {
      mat: [[0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]],
      center: {x: 1, y: 1.5}
    },
    L: {
      mat: [[0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]],
      center: {x: 2, y: 1.5}
    },
    S: {
      mat: [[0, 1, 1],
            [1, 1, 0]],
      center: {x: 0.5, y: 2}
    },
    Z: {
      mat: [[1, 1, 0],
            [0, 1, 1]],
      center: {x: 0.5, y: 2}
    },
    frequencies: "IIJLOSTZ",
  },

  canvas: {
    id: "game-canvas",
    relativeSize: { w: 0.75, h: 0.90 },
  },

  grid: {
    scale: 36,
    main: { w: 10, h: 20 },
    held: { w: 5,  h: 5  },
    next: { w: 5,  h: 5  }
  },

  input: {
    83: "audio/skipSong",
    77: "audio/toggleMusic",
    27: "game/exitToTitle",
    80: "game/pause",
    13: "game/start",
    16: "player/hold",
    40: "player/down",
    37: "player/left",
    39: "player/tight",
    38: "player/rotate",
    32: "player/slam",
  },

  sound: {
    tracks: [],
    effects : []
  }
}

export default Object.freeze(config);
