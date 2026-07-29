/* Posição vertical de cada ficha DENTRO da arte da gaveta (gaveta.png).
 *
 * São os 7 slots físicos desenhados na foto, medidos pixel a pixel contra
 * o PNG original (1269×1240) — ver ANALISE-DESIGN.md, achado B11. Cada
 * valor é o centro da faixa de papel daquela ficha, em % da altura da
 * imagem. Como `.real-drawer` agora usa `aspect-ratio: 1269/1240` (sem
 * letterbox), essa % bate direto com `top` do elemento.
 *
 * Se a arte da gaveta for trocada por outra foto, esses números precisam
 * ser remedidos — eles descrevem a imagem, não o conteúdo dos contos.
 * A ordem aqui é a ordem física das fichas na gaveta, de cima para baixo;
 * só os 7 primeiros contos de storyOrder ocupam um slot na imagem. Contos
 * além do 7º (ou em telas sem mouse) aparecem só na .drawer-list e no
 * modal "Todos os contos" — ver js/home.js.
 */
export const DRAWER_SLOTS = [
  { key: 'ultimo',   rowTop: 17.10 },
  { key: 'espelho',  rowTop: 25.65 },
  { key: 'menina',   rowTop: 32.90 },
  { key: 'jardim',   rowTop: 39.76 },
  { key: 'reis',     rowTop: 46.61 },
  { key: 'samurai',  rowTop: 53.87 },
  { key: 'joe',      rowTop: 60.73 },
];
