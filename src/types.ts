import type NProgress from './progress';

export type NProgressDirection = 'ltr' | 'rtl';

export interface NProgressOptions {
  minimum?: number;
  maximum?: number;
  template?: string | null;
  easing?: string;
  speed?: number;
  trickle?: boolean;
  trickleSpeed?: number;
  showSpinner?: boolean;
  parent?: HTMLElement | string;
  positionUsing?: string;
  barSelector?: string;
  spinnerSelector?: string;
  direction?: NProgressDirection;
}

declare global {
  interface Window {
    NProgress: NProgress;
  }
}
