import {Txt, withDefaults} from '@motion-canvas/2d';

export const NanoTxt = withDefaults(Txt, {
  fill: 'rgba(255, 255, 255, 0.6)',
  fontFamily: 'JetBrains Mono',
  fontWeight: 600,
  height: null,
  lineHeight: 48,
  fontSize: 32,
});

export const HeaderTxt = withDefaults(Txt, {
  fill: 'rgba(255, 255, 255, 0.6)',
  fontFamily: 'Inter, JetBrains Mono',
  fontWeight: 700,
  height: null,
  lineHeight: 54,
  fontSize: 50,
});