/**
 * Tristris 2 Config
 *
 * @todo document config structure
 */

const config = {
  canvas: {
    id: "game-canvas",
  },

  input: {
    mouse: {
      0: 'lmb'
    },

    keyboard: {
      'w': 'player/fwd',
      'a': 'player/lft',
      's': 'player/bck',
      'd': 'player/rgt',
    },
  },
}

export default Object.freeze(config);
