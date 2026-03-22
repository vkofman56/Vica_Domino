/**
 * Unit tests for js/publish-game.js — Publish Game SVG serialization.
 *
 * Verifies that SVG card faces survive the serialize → deserialize round-trip
 * used when generating a standalone published HTML file.
 */
const { loadDominoModule } = require('../setup');

beforeAll(() => {
  loadDominoModule();
});

// ---------------------------------------------------------------------------
// SVG round-trip through publish serialization
// ---------------------------------------------------------------------------
describe('publish SVG round-trip', () => {
  /**
   * Helper: simulate the publish serialization exactly as publishGame() does,
   * then simulate the deserialization that runs in the published HTML.
   *
   * Serialization stores innerHTML (content without <svg> wrapper).
   * Deserialization reconstructs via createElementNS to ensure correct
   * SVG namespace, matching the pattern in game-creator.js.
   */
  function roundTripSVGs(svgMap) {
    // --- Serialize (publish-game.js) ---
    var svgMapData = {};
    for (var key in svgMap) {
      if (svgMap.hasOwnProperty(key)) {
        var el = svgMap[key];
        if (el) {
          svgMapData[key] = el.innerHTML;
        }
      }
    }
    var svgMapJson = JSON.stringify(svgMapData);

    // --- Deserialize (published HTML script block) ---
    var parsed = JSON.parse(svgMapJson);
    var result = {};
    for (var k in parsed) {
      try {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 60 60');
        svg.innerHTML = parsed[k];
        result[k] = svg;
      } catch (e) {}
    }
    return result;
  }

  function makeSVGWithText(fill, fontSize, fontFamily, text) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', '30');
    textEl.setAttribute('y', '46');
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-size', fontSize);
    textEl.setAttribute('font-weight', 'bold');
    textEl.setAttribute('fill', fill);
    if (fontFamily) textEl.setAttribute('font-family', fontFamily);
    textEl.textContent = text;
    svg.appendChild(textEl);
    return svg;
  }

  test('preserves viewBox attribute', () => {
    var svg = makeSVGWithText('#336', '48', null, 'A');
    var map = roundTripSVGs({ 'A1_d1L': svg });
    var result = map['A1_d1L'];
    expect(result).toBeDefined();
    expect(result.getAttribute('viewBox')).toBe('0 0 60 60');
  });

  test('preserves fill color on text elements', () => {
    var svg = makeSVGWithText('#FF5733', '48', null, 'B');
    var map = roundTripSVGs({ 'B1_d1L': svg });
    var textEl = map['B1_d1L'].querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.getAttribute('fill')).toBe('#FF5733');
  });

  test('preserves font-size on text elements', () => {
    var svg = makeSVGWithText('#333', '48', null, 'C');
    var map = roundTripSVGs({ 'C1_d1L': svg });
    var textEl = map['C1_d1L'].querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.getAttribute('font-size')).toBe('48');
  });

  test('preserves font-family on text elements', () => {
    var svg = makeSVGWithText('#333', '48', 'Comic Sans MS, cursive', 'D');
    var map = roundTripSVGs({ 'D1_d1L': svg });
    var textEl = map['D1_d1L'].querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.getAttribute('font-family')).toBe('Comic Sans MS, cursive');
  });

  test('preserves text-anchor on text elements', () => {
    var svg = makeSVGWithText('#333', '48', null, 'E');
    var map = roundTripSVGs({ 'E1_d1L': svg });
    var textEl = map['E1_d1L'].querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.getAttribute('text-anchor')).toBe('middle');
  });

  test('preserves text content', () => {
    var svg = makeSVGWithText('#333', '48', null, 'Hello');
    var map = roundTripSVGs({ 'A1_d1L': svg });
    var textEl = map['A1_d1L'].querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.textContent).toBe('Hello');
  });

  test('preserves circle elements with fill', () => {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '30');
    circle.setAttribute('cy', '30');
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', '#E74C3C');
    svg.appendChild(circle);

    var map = roundTripSVGs({ 'A1_d1L': svg });
    var circleEl = map['A1_d1L'].querySelector('circle');
    expect(circleEl).not.toBeNull();
    expect(circleEl.getAttribute('fill')).toBe('#E74C3C');
    expect(circleEl.getAttribute('r')).toBe('20');
  });

  test('handles multiple SVG entries', () => {
    var svg1 = makeSVGWithText('#FF0000', '48', null, 'A');
    var svg2 = makeSVGWithText('#00FF00', '36', 'Arial', 'B');
    var map = roundTripSVGs({ 'A1_d1L': svg1, 'B1_d1R': svg2 });

    var text1 = map['A1_d1L'].querySelector('text');
    var text2 = map['B1_d1R'].querySelector('text');
    expect(text1.getAttribute('fill')).toBe('#FF0000');
    expect(text1.getAttribute('font-size')).toBe('48');
    expect(text2.getAttribute('fill')).toBe('#00FF00');
    expect(text2.getAttribute('font-size')).toBe('36');
    expect(text2.getAttribute('font-family')).toBe('Arial');
  });

  test('round-tripped SVGs work with createDominoElement', () => {
    var svg = makeSVGWithText('#336', '48', null, 'A');
    var map = roundTripSVGs({ 'A1_d1L': svg, 'A2_d1R': svg.cloneNode(true) });
    window.customGameSVGs = map;

    var card = { id: 1, left: 'A1_d1L', right: 'A2_d1R', leftValue: 'A', rightValue: 'A' };
    var domino = createDominoElement(card);
    var halves = domino.querySelectorAll('.domino-half');

    // Each half should contain an SVG with custom-face class
    var leftSvg = halves[0].querySelector('svg.custom-face');
    var rightSvg = halves[1].querySelector('svg.custom-face');
    expect(leftSvg).not.toBeNull();
    expect(rightSvg).not.toBeNull();

    // SVG text should preserve attributes
    var leftText = leftSvg.querySelector('text');
    expect(leftText).not.toBeNull();
    expect(leftText.getAttribute('fill')).toBe('#336');
    expect(leftText.getAttribute('font-size')).toBe('48');

    delete window.customGameSVGs;
  });
});

// ---------------------------------------------------------------------------
// SVG from innerHTML (fallback path used when loading from localStorage)
// ---------------------------------------------------------------------------
describe('publish SVG round-trip with innerHTML-created SVGs', () => {
  function roundTripSVGs(svgMap) {
    var svgMapData = {};
    for (var key in svgMap) {
      if (svgMap.hasOwnProperty(key)) {
        var el = svgMap[key];
        if (el) {
          svgMapData[key] = el.innerHTML;
        }
      }
    }
    var svgMapJson = JSON.stringify(svgMapData);
    var parsed = JSON.parse(svgMapJson);
    var result = {};
    for (var k in parsed) {
      try {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 60 60');
        svg.innerHTML = parsed[k];
        result[k] = svg;
      } catch (e) {}
    }
    return result;
  }

  test('preserves colored text from innerHTML-built SVGs', () => {
    // This is how SVGs are created in the fallback path (game-creator.js line 147-150)
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.innerHTML = '<text x="30" y="46" text-anchor="middle" font-size="48" font-weight="bold" fill="#FF5733">A</text>';

    var map = roundTripSVGs({ 'A1_d1L': svg });
    var result = map['A1_d1L'];
    expect(result).toBeDefined();
    expect(result.getAttribute('viewBox')).toBe('0 0 60 60');

    var textEl = result.querySelector('text');
    expect(textEl).not.toBeNull();
    expect(textEl.getAttribute('fill')).toBe('#FF5733');
    expect(textEl.getAttribute('font-size')).toBe('48');
    expect(textEl.textContent).toBe('A');
  });

  test('preserves multiple colored letters from innerHTML', () => {
    var colors = { A: '#336', B: '#633', C: '#363', D: '#663', E: '#636' };
    var svgMap = {};
    Object.keys(colors).forEach(function(letter, i) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 60 60');
      svg.innerHTML = '<text x="30" y="46" text-anchor="middle" font-size="48" font-weight="bold" fill="' + colors[letter] + '">' + letter + '</text>';
      svgMap[letter + '1_d' + (i+1) + 'L'] = svg;
    });

    var map = roundTripSVGs(svgMap);

    Object.keys(colors).forEach(function(letter, i) {
      var key = letter + '1_d' + (i+1) + 'L';
      var textEl = map[key].querySelector('text');
      expect(textEl).not.toBeNull();
      expect(textEl.getAttribute('fill')).toBe(colors[letter]);
      expect(textEl.textContent).toBe(letter);
    });
  });
});
