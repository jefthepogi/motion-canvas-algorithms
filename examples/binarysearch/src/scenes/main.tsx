import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef} from '@motion-canvas/core';
import {Theme} from '../styles';

export default makeScene2D(function* (view) {
  view.fill(Theme.bgDark);

  const textRef = createRef<Txt>();

  view.add(
    <Txt
      ref={textRef}
      text="Hello, Motion Canvas!"
      fill="#fff"
      fontFamily="Consolas, monospace"
    />
  );

  yield* textRef().scale(1.5, 1).to(1, 1);
});
