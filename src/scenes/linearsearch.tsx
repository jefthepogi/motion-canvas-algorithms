import {makeScene2D, Node, Rect, Txt, Layout, Code, CODE, LezerHighlighter, lines, word, is, Polygon} from '@motion-canvas/2d';
import {createRef, delay, range, chain, sequence, Vector2, waitFor, all} from '@motion-canvas/core';
import {Theme} from '../styles';
import {NanoTxt, HeaderTxt} from '../nodes/Txt';
import {Window} from '../nodes/Windows';
import {parser} from '@lezer/python';

export default makeScene2D(function* (view) {

  const theme = {
    ...Theme,
    window: Theme.stroke,
    game: '#023348',
    event: '#cc2b2b',
    music: '#0880b4',
    component: '#45811b',
    buttons: '#0f0e0c',
    selection: '#0d7eae',
  };  

  view.fill(theme.bgDark)
  Code.defaultHighlighter = new LezerHighlighter(parser)

  const data = [17, 2, 8, 6, 24, 7, 15, 21]
  const searched_data = [7, 3]
  const rects: Rect[] = []
  const indexNumbers: Txt[] = []

  const pointer = createRef<Polygon>(); 
  const title = createRef<Txt>();
  const container = createRef<Layout>();
  const console = createRef<Window>();
  const code = createRef<Code>();
  const consoleCode = createRef<Code>();
  const consoleOut = createRef<Rect>();

  view.add(
    <Node>
      <HeaderTxt ref={title} opacity={0}>Linear Search</HeaderTxt>
      <Polygon
        ref={pointer}
        sides={3}
        size={20}
        fill={'white'}
        rotation={180}
        opacity={0}
      >
      </Polygon>
      <Layout
        ref={container}
        layout
        paddingTop={230}
        direction={'row'}
        size={'100%'}
        justifyContent={'center'}
      >
        <Layout
          layout
          direction={'column'}
          alignItems={'center'}
          justifyContent={'start'}
          gap={15}
          padding={4}
        >
          <Layout
            layout
            direction={'row'}
            gap={1}
            padding={10}
          >
            {
              data.map((item, index) => (
                <Rect
                  layout
                  direction={'column'}
                  ref={e => (rects[index] = e)}
                  opacity={0}
                  paddingTop={50}
                  gap={20}
                  alignItems={'center'} 
                >
                  <Rect
                    size={[100, 100]}
                    alignItems={'center'}
                    justifyContent={'center'}
                    lineWidth={2}
                    stroke={'white'}
                  >
                    <NanoTxt text={item.toString()} fill={'white'}> </NanoTxt>
                  </Rect>
                  <NanoTxt ref={e => (indexNumbers[index] = e)} fontSize={26} opacity={0} text={`${index}`}></NanoTxt>
                </Rect>
              ))
            }
          </Layout>
          <Code ref={code} fontSize={44} />
        </Layout>
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
arr = [${(data.join(", "))}]
`);
  code().selection([])
  yield* code().selection(lines(1), .3)

  // 4. A bunch of rectangles consisting the elements of a simple array fades-in upwards to their respective positions
  yield* sequence(.2, 
    ...rects.map((rect, i) =>
      all(
        rect.opacity(1, .5),
        rect.padding.top(0, .5),
        indexNumbers[i].opacity(1, .6)
      )
    )
  );
  yield* waitFor(1);

  // 5. Append the function code for linear search
  // append main code
  yield* code().code.append(.3)`
def search(n):
  for i in range(len(arr)):
    if arr[i] == n:
      return i
  return None`;

  // Highlight whole main block of code
  yield* code().selection(lines(3, 7), 1);

  // 6. Reveal the console window
  container().add(
    <Layout>
      <Window ref={console} theme={theme} direction={'column'} width={0} height={'80%'} opacity={0}>
        <Rect fill={theme.bg} padding={20} height={'60%'}>
          <Code ref={consoleCode}></Code>
        </Rect>
        <Rect ref={consoleOut} direction={'column'} fill={theme.bgDarker} padding={50} paddingTop={60} height={'100%'}>
        </Rect>
      </Window> 
    </Layout>
  );
  yield* chain(
    all(
      console().margin.left(100, .6),
      console().width(600, .6)
    ),
    console().opacity(1, 1),
    waitFor(1),
  );

  // 7. Calling each searched data (e.g., Search(7), Search(5))
  for (let n: number = 0; n < searched_data.length; n++)
  {
    yield* chain(
      consoleCode().selection(lines(n), .5),
      consoleCode().code.append(CODE`\
search()\n`, .5),
      code().selection(lines(2, Infinity), .5),
      waitFor(.5),
      consoleCode().code.insert([0 + n, 7], `${searched_data[n]}`, .3),
      all(
        code().selection(lines(3, 7), 1),
        code().code.replace(word(3, 11, 1), `${searched_data[n]}`, .8),
        code().code.replace(word(5, 17, 1), `${searched_data[n]}`, .8))
    );
    yield* code().selection(lines(3), 1); // Highlight function name in the codeblock
    
    const targetIndex = data.indexOf(searched_data[n]);
    const target = targetIndex == -1 ? "None" : targetIndex.toString();


    pointer().absolutePosition(rects[0].absolutePosition().addY(-120))

    yield* chain( // Showcases each iteration while traversing the array
      ...rects
      .slice(0, targetIndex !== -1 ? targetIndex + 1 : data.length + 1) // Filters the array, reducing elements up to the searched data
      .map((rect, i) => {
          const square = rect.children().find(is(Rect));
  
          return chain(
            code().selection(lines(4), .3),
            all(
              square.fill('gray', .3), 
              pointer().absolutePosition(rect.absolutePosition().addY(-120), .3),
              ...(i == 0 ? [pointer().opacity(1, .5)] : [])), 
            square.fill(null, .3),
            code().selection(lines(5), .3),
            ...(data[i] == searched_data[n] ? [square.fill('green', .6), code().selection(lines(6), .3)]  : [square.fill('red', .6)]),
            square.fill(null, .3),
            ...(target == "None" && i == data.length - 1 ? [waitFor(.8), code().selection(lines(7), 1)] : [])
          )
        }
      ),
      // TODO: Make insertion of the Txt Component go smoothly
      waitFor(.5),
      pointer().opacity(0, .5),
      (function * () {
        const output = createRef<Txt>();
        consoleOut().add(
          <HeaderTxt ref={output} text={target} opacity={0}></HeaderTxt>
        );
        yield* chain(
          output().opacity(1, .5),
          waitFor(1),
          all(
            output().opacity(.4, .5),
            code().selection([], .5)
          )
        )
      })(),

    );
  }

  yield* all(
    code().selection(lines(0, Infinity), .5),
    consoleCode().selection(lines(0, Infinity), .5)

  ),
  yield* all(
    code().code.replace(word(3, 11, 1), `n`, .8),
    code().code.replace(word(5, 17, 1), `n`, .8)
  ),
  yield* waitFor(3);
  

});
