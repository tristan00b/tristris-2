/**
 * Tristris 2 Config
 *
 * @todo document config structure
 */

const config = {
  canvas: {
    id    : 'game-canvas',
  },

  input: {
    mouse: {
      0   : 'lmb',
      1   : 'mmb',
      2   : 'rmb',
    },

    keyboard: {
      'w' : 'player/fwd',
      'a' : 'player/lft',
      's' : 'player/bck',
      'd' : 'player/rgt',
      'e' : 'player/up',
      'q' : 'player/dn',
    },
  },
}

export default Object.freeze(config);
