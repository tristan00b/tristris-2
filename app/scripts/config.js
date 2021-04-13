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
    "audio/skipSong":    83,
    "audio/toggleMusic": 77,
    "game/exitToTitle":  27,
    "game/pause":        80,
    "game/start":        13,
    "player/hold":       16,
    "player/down":       40,
    "player/left":       37,
    "player/tight":      39,
    "player/rotate":     38,
    "player/slam":       32,
  },

  sound: {
    tracks: [],
    effects : []
  }
}

export default Object.freeze(config);
