/* Parallax 3D da gaveta (inclinação seguindo o cursor).
 *
 * Corrigido — ver ANALISE-DESIGN.md, achados M1/M2/M3. Resumo do que
 * estava quebrado e como foi resolvido:
 *
 *  - M1: `.real-drawer` tinha `animation: drawerIn ... both` no mesmo
 *    elemento que este arquivo tenta girar. `fill-mode: both` mantém o
 *    transform do animation aplicado pra sempre, e na cascata do CSS um
 *    valor de animation sempre vence um transform escrito via style
 *    inline — então o tilt nunca aparecia. A entrada (`drawerIn`) foi
 *    movida para um wrapper novo (`.drawer-stage`, em index.html/
 *    css/04-drawer.css); `.real-drawer` ficou livre para o JS.
 *  - M2: `.real-drawer` também tinha `transition: transform .5s` no CSS
 *    (css/11-motion.css). Cada frame do mousemove reiniciava uma
 *    transição de 500ms rumo a um alvo novo — a gaveta ficava sempre
 *    ~300ms atrás do cursor. Essa transition foi removida; só sobrou a
 *    de `filter`.
 *  - M3: em vez de escrever a rotação bruta a cada evento, este arquivo
 *    roda um loop contínuo de requestAnimationFrame que interpola
 *    (lerp) a rotação atual até um alvo — é isso que dá peso/inércia ao
 *    movimento em vez do salto seco de antes.
 */

const realDrawer = document.querySelector('.real-drawer');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MAX_ROTATE_X = 3.4; // graus, eixo X (resposta ao movimento vertical do mouse)
const MAX_ROTATE_Y = 4;   // graus, eixo Y (resposta ao movimento horizontal do mouse)
const LIFT_PX = 4;        // leve elevação enquanto o mouse está sobre a gaveta
const LERP = 0.18;        // fração da distância até o alvo percorrida por frame — a "inércia"
const SETTLE_EPSILON = 0.01;

export function initDrawerParallax() {
  if (!realDrawer || reduceMotion) return;

  let targetRX = 0, targetRY = 0, targetLift = 0;
  let curRX = 0, curRY = 0, curLift = 0;
  let hovering = false;
  let rafId = null;

  function tick() {
    curRX += (targetRX - curRX) * LERP;
    curRY += (targetRY - curRY) * LERP;
    curLift += (targetLift - curLift) * LERP;

    realDrawer.style.transform =
      `rotateX(${curRX.toFixed(3)}deg) rotateY(${curRY.toFixed(3)}deg) translateY(${curLift.toFixed(2)}px)`;

    const settled = !hovering
      && Math.abs(targetRX - curRX) < SETTLE_EPSILON
      && Math.abs(targetRY - curRY) < SETTLE_EPSILON
      && Math.abs(targetLift - curLift) < SETTLE_EPSILON;

    if (settled) {
      realDrawer.style.transform = '';
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function ensureLoopRunning() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  realDrawer.addEventListener('mousemove', (event) => {
    hovering = true;
    const rect = realDrawer.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetRX = -y * MAX_ROTATE_X;
    targetRY = x * MAX_ROTATE_Y;
    targetLift = -LIFT_PX;
    ensureLoopRunning();
  });

  realDrawer.addEventListener('mouseleave', () => {
    hovering = false;
    targetRX = 0;
    targetRY = 0;
    targetLift = 0;
    realDrawer.classList.remove('drawer-touch');
    ensureLoopRunning();
  });
}
