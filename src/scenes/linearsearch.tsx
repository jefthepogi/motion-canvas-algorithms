import {makeScene2D, Node, Rect, Txt, Layout, Code, CODE, LezerHighlighter, lines, insert} from '@motion-canvas/2d';
import {createRef, delay, range, chain, sequence, Vector2, waitFor, all} from '@motion-canvas/core';
import {Theme} from '../styles';
import {NanoTxt, HeaderTxt} from '../nodes/Txt';
import {parser} from '@lezer/python';

export default makeScene2D(function* (view) {

  view.fill(Theme.bgDark)
  Code.defaultHighlighter = new LezerHighlighter(parser)

  const title = createRef<Txt>();
  const data = [0, 2, 8, 6, 9, 7, 15, 21]
  const searched_data = 15
  const rects: Rect[] = []
  const code = createRef<Code>();

  view.add(
    <Node>
      <HeaderTxt ref={title} opacity={0}>Linear Search</HeaderTxt>
      <Layout
        layout
        direction={'column'}
        size={'100%'}
        alignItems={'center'}
        justifyContent={'start'}
        gap={40}
        paddingTop={240}
      >
        <Layout
          layout // FIXED: Make the position & spacing anchored to container size instead of using magic numbers.
          direction={'row'}
          gap={1}
          padding={10}
        >
          {
            data.map((item, index) => (
              <Rect
                ref={e => (rects[index] = e)}
                size={[100, 100]}
                alignItems={'center'}
                justifyContent={'center'}
                paddingTop={50} 
                lineWidth={2}
                stroke={'white'}
                opacity={0}
              >
                <NanoTxt text={item.toString()} fill={'white'}> </NanoTxt>
              </Rect>
            ))
          }
        </Layout>
        <Code ref={code} fontSize={44} />
      </Layout>
    </Node>
  );


  // 1. Title fades in
  yield* title().opacity(1, .3);
  yield* waitFor(1);

  // 2. Title slides up
  yield* title().top(new Vector2(0, -450), 1);
  yield* waitFor(1);

  // 3. Code block appears, highlighting array initialization process
  // const mainCode = code().createSignal(CODE`arr = [0, 2, 8, 6, 9, 7, 15, 21]`)
  code().code(CODE`
arr = [0, 2, 8, 6, 9, 7, 15, 21]
`);
  code().selection([])
  yield* code().selection(lines(1), .3)

  // 4. A bunch of rectangles consisting the elements of a simple array fades-in upwards to their respective positions
  yield* sequence(.2, 
    ...rects.map(rect =>
      all(
        rect.opacity(1, .3),
        rect.padding.top(0, .3)
      )
    )
  );
  yield* waitFor(1);

  // 5. Append the function code for linear search

  // append main code
  yield* code().code.append(.3)`
def search(n):
  for i in arr:
    if i == n:
      return True
  return False`;

  // Highlight whole main block of code
  yield* code().selection(lines(3, 7), 1);

  // 6. Reveal the console window


  // 7. Traverse the array

  // Highlight function name
  yield* code().selection(lines(3), 1);
  // Display each iteration
  yield* chain(
    ...rects
    .filter((_, i) => i <= data.indexOf(searched_data)) // Filters the array, reducing elements up to the searched data
    .map((rect, i) => sequence(.6,
        all(
          code().selection(lines(4), .3),
          rect.fill('gray', .3)),
        sequence(.5,
          code().selection(lines(5), .3),
          sequence(.5,
            ...(data[i] == 15 ? [code().selection(lines(6), .3), rect.fill('green', .3)] : [rect.fill('red', .3), rect.fill(null, .3)])
          )
        )
      )
    )
  );

  yield* waitFor(1)




});
