import { NProgressOptions } from './types';
import {
  clamp,
  toBarPerc,
  css,
  addClass,
  removeClass,
  removeElement,
} from './utils';

export class NProgress {
  static settings: Required<NProgressOptions> = {
    minimum: 0.08,
    maximum: 1,
    template: `<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>`,
    easing: 'linear',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleSpeed: 200,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: 'body',
    direction: 'ltr',
  };
  static status: number | null = null;

  // Queue for animation functions
  private static pending: Array<(next: () => void) => void> = [];
  private static isPaused: boolean = false;

  // Configure NProgress with new options
  static configure(options: Partial<NProgressOptions>): typeof NProgress {
    Object.assign(this.settings, options);
    return this;
  }

  // Check if NProgress has started
  static isStarted(): boolean {
    return typeof this.status === 'number';
  }

  // Set the progress status
  static set(n: number): typeof NProgress {
    if (this.isPaused) return this;

    const started = this.isStarted();

    // Limiter `n` entre `minimum` et `maximum`
    n = clamp(n, this.settings.minimum, this.settings.maximum);
    this.status = n === this.settings.maximum ? null : n;

    const progress = this.render(!started);
    const bar = progress.querySelector(
      this.settings.barSelector,
    ) as HTMLElement;
    const speed = this.settings.speed;
    const ease = this.settings.easing;

    progress.offsetWidth; // Repaint

    this.queue((next: () => void) => {
      // Determine the CSS positioning to use
      if (this.settings.positionUsing === '') {
        this.settings.positionUsing = this.getPositioningCSS();
      }

      // Apply styles to animate the bar
      css(bar, this.barPositionCSS(n, speed, ease));

      if (n === this.settings.maximum) {
        // Si la barre atteint `maximum`, la rendre semi-transparente pour indiquer la limite atteinte
        css(progress, { transition: 'none', opacity: '1' });
        progress.offsetWidth; // Repaint

        setTimeout(() => {
          css(progress, {
            transition: `all ${speed}ms linear`,
            opacity: '0.5',
          });
          setTimeout(() => {
            this.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  }

  // Start the progress
  static start(): typeof NProgress {
    if (!this.status) this.set(0);

    const work = () => {
      if (this.isPaused) return;

      setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.settings.trickleSpeed);
    };

    if (this.settings.trickle) work();

    return this;
  }

  // Complete the progress
  static done(force?: boolean): typeof NProgress {
    if (!force && !this.status) return this;

    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  // Increment the progress
  static inc(amount?: number): typeof NProgress {
    if (this.isPaused) return this;

    let n = this.status;

    if (!n) {
      return this.start();
    } else if (n > 1) {
      return this;
    } else {
      if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) {
          amount = 0.1;
        } else if (n >= 0.2 && n < 0.5) {
          amount = 0.04;
        } else if (n >= 0.5 && n < 0.8) {
          amount = 0.02;
        } else if (n >= 0.8 && n < 0.99) {
          amount = 0.005;
        } else {
          amount = 0;
        }
      }

      n = clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  }

  // Advance the progress
  static trickle(): typeof NProgress {
    if (this.isPaused) return this;

    return this.inc();
  }

  // Handle jQuery promises (for compatibility)
  static promise($promise: any): typeof NProgress {
    if (!$promise || $promise.state() === 'resolved') {
      return this;
    }

    let initial = 0,
      current = 0;

    if (current === 0) {
      this.start();
    }

    initial++;
    current++;

    $promise.always(() => {
      current--;
      if (current === 0) {
        initial = 0;
        this.done();
      } else {
        this.set((initial - current) / initial);
      }
    });

    return this;
  }

  // Render the NProgress component
  static render(fromStart: boolean = false): HTMLElement {
    if (this.isRendered()) {
      return document.getElementById('nprogress') as HTMLElement;
    }

    addClass(document.documentElement, 'nprogress-busy');

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = this.settings.template;

    const bar = progress.querySelector(
      this.settings.barSelector,
    ) as HTMLElement;
    const perc = fromStart
      ? toBarPerc(0, this.settings.direction)
      : `${toBarPerc(this.status || 0, this.settings.direction)}`;
    const parent =
      typeof this.settings.parent === 'string'
        ? document.querySelector(this.settings.parent)
        : this.settings.parent;

    css(bar, {
      transition: 'all 0 linear',
      transform: `translate3d(${perc}%,0,0)`,
    });

    if (!this.settings.showSpinner) {
      const spinner = progress.querySelector(
        this.settings.spinnerSelector,
      ) as HTMLElement;
      spinner && removeElement(spinner);
    }

    if (parent !== document.body) {
      addClass(parent as HTMLElement, 'nprogress-custom-parent');
    }

    (parent as HTMLElement).appendChild(progress);
    return progress;
  }

  // Remove NProgress from the DOM
  static remove(): void {
    removeClass(document.documentElement, 'nprogress-busy');
    const parent =
      typeof this.settings.parent === 'string'
        ? document.querySelector(this.settings.parent)
        : this.settings.parent;
    removeClass(parent as HTMLElement, 'nprogress-custom-parent');

    const progress = document.getElementById('nprogress');
    progress && removeElement(progress);
  }

  // Pause the progress
  static pause(): typeof NProgress {
    this.isPaused = true;
    return this;
  }

  // Resume the progress
  static resume(): typeof NProgress {
    this.isPaused = false;
    return this;
  }

  // Check if NProgress is rendered in the DOM
  static isRendered(): boolean {
    return !!document.getElementById('nprogress');
  }

  // Determine the CSS positioning method to use
  static getPositioningCSS(): string {
    const bodyStyle = document.body.style;

    const vendorPrefix =
      'WebkitTransform' in bodyStyle
        ? 'Webkit'
        : 'MozTransform' in bodyStyle
        ? 'Moz'
        : 'msTransform' in bodyStyle
        ? 'ms'
        : 'OTransform' in bodyStyle
        ? 'O'
        : '';

    if (`${vendorPrefix}Perspective` in bodyStyle) {
      return 'translate3d';
    } else if (`${vendorPrefix}Transform` in bodyStyle) {
      return 'translate';
    } else {
      return 'margin';
    }
  }

  // Queue function for animations
  private static queue(fn: (next: () => void) => void): void {
    this.pending.push(fn);
    if (this.pending.length === 1) this.next();
  }

  private static next(): void {
    const fn = this.pending.shift();
    if (fn) fn(this.next.bind(this));
  }

  // Compute the CSS for positioning the bar
  private static barPositionCSS(
    n: number,
    speed: number,
    ease: string,
  ): { [key: string]: string } {
    let barCSS: { [key: string]: string } = {};

    if (this.settings.positionUsing === 'translate3d') {
      barCSS = {
        transform: `translate3d(${toBarPerc(n, this.settings.direction)}%,0,0)`,
      };
    } else if (this.settings.positionUsing === 'translate') {
      barCSS = {
        transform: `translate(${toBarPerc(n, this.settings.direction)}%,0)`,
      };
    } else {
      barCSS = { 'margin-left': `${toBarPerc(n, this.settings.direction)}%` };
    }

    barCSS.transition = `all ${speed}ms ${ease}`;

    return barCSS;
  }
}
