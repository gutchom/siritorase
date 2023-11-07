import type { Options } from 'vis-network';

export default {
  nodes: {
    borderWidth: 2,
    borderWidthSelected: 4,
    color: {
      border: '#ea6',
      background: '#fff',
      highlight: {
        border: '#2bf',
        background: '#fff',
      },
    },
    font: { color: '#555' },
    shapeProperties: {
      useBorderWithImage: true,
    },
  },
  edges: {
    arrows: {
      to: true,
    },
    color: {
      color: '#ea6',
      highlight: '#2bf',
    },
    width: 2,
  },
} as Options;
