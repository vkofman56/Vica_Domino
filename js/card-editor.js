// Ruler rectangle: toggle, drag from center, resize from corners
function toggleLibRuler() {
    const r = document.getElementById('lib-ruler-rect');
    r.style.display = r.style.display === 'none' ? 'block' : 'none';
}
(function() {
    const r = document.getElementById('lib-ruler-rect');
    let mode = null, sx, sy, sL, sT, sW, sH, sRatio;
    r.addEventListener('mousedown', function(e) {
        const cls = e.target.className;
        if (cls.includes('ruler-tl')) mode = 'tl';
        else if (cls.includes('ruler-tr')) mode = 'tr';
        else if (cls.includes('ruler-bl')) mode = 'bl';
        else if (cls.includes('ruler-br')) mode = 'br';
        else if (cls.includes('ruler-t')) mode = 't';
        else if (cls.includes('ruler-r')) mode = 'r';
        else if (cls.includes('ruler-b')) mode = 'b';
        else if (cls.includes('ruler-l')) mode = 'l';
        else mode = 'drag';
        sx = e.clientX; sy = e.clientY;
        sL = r.offsetLeft; sT = r.offsetTop;
        sW = r.offsetWidth; sH = r.offsetHeight;
        sRatio = sW / sH;
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (!mode) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (mode === 'drag') {
            r.style.left = (sL + dx) + 'px';
            r.style.top = (sT + dy) + 'px';
        } else if (mode === 'br') {
            const nw = Math.max(20, sW + dx);
            r.style.width = nw + 'px';
            r.style.height = (nw / sRatio) + 'px';
        } else if (mode === 'bl') {
            const nw = Math.max(20, sW - dx);
            r.style.width = nw + 'px';
            r.style.left = (sL + sW - nw) + 'px';
            r.style.height = (nw / sRatio) + 'px';
        } else if (mode === 'tr') {
            const nw = Math.max(20, sW + dx);
            const nh = nw / sRatio;
            r.style.width = nw + 'px';
            r.style.height = nh + 'px';
            r.style.top = (sT + sH - nh) + 'px';
        } else if (mode === 'tl') {
            const nw = Math.max(20, sW - dx);
            const nh = nw / sRatio;
            r.style.width = nw + 'px';
            r.style.left = (sL + sW - nw) + 'px';
            r.style.height = nh + 'px';
            r.style.top = (sT + sH - nh) + 'px';
        } else if (mode === 't') {
            const nh = Math.max(20, sH - dy);
            r.style.height = nh + 'px';
            r.style.top = (sT + sH - nh) + 'px';
        } else if (mode === 'b') {
            r.style.height = Math.max(20, sH + dy) + 'px';
        } else if (mode === 'l') {
            const nw = Math.max(20, sW - dx);
            r.style.width = nw + 'px';
            r.style.left = (sL + sW - nw) + 'px';
        } else if (mode === 'r') {
            r.style.width = Math.max(20, sW + dx) + 'px';
        }
    });
    document.addEventListener('mouseup', function() { mode = null; });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') r.style.display = 'none';
    });
})();

// Border overlay: toggle, adjustable borders on each card
// Separate values: lbx/lby for small cards, llbx/llby for loupe
let libBorderOn = false, lbx = 3, lby = 3, llbx = 20, llby = 20;
function toggleLibBorder() {
    libBorderOn = !libBorderOn;
    document.querySelectorAll('.domino-half-preview').forEach(c => c.classList.toggle('show-border', libBorderOn));
    // Also toggle on loupe card container if loupe is open
    var loupeContainer = document.getElementById('loupe-card-container');
    if (loupeContainer && document.getElementById('loupe-overlay').style.display !== 'none') {
        loupeContainer.classList.toggle('show-border', libBorderOn);
    }
    var borderBtn = document.getElementById('border-btn');
    if (borderBtn) borderBtn.classList.toggle('active', libBorderOn);
    updateLibBorderVars();
}
function updateLibBorderVars() {
    document.documentElement.style.setProperty('--bx', lbx + 'px');
    document.documentElement.style.setProperty('--by', lby + 'px');
    document.documentElement.style.setProperty('--lbx', llbx + 'px');
    document.documentElement.style.setProperty('--lby', llby + 'px');
}
(function() {
    updateLibBorderVars();
    let bMode = null, bsx, bsy, sbx, sby, bRatio, cW, cH, bIsLoupe = false;
    const TH = 8;
    document.addEventListener('mousedown', function(e) {
        if (!libBorderOn) return;
        bIsLoupe = false;
        var card = e.target.closest('.domino-half-preview');
        if (!card || !card.classList.contains('show-border')) {
            card = e.target.closest('#loupe-card-container');
            if (!card || !card.classList.contains('show-border')) return;
            bIsLoupe = true;
        }
        var curBx = bIsLoupe ? llbx : lbx;
        var curBy = bIsLoupe ? llby : lby;
        const r = card.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        cW = r.width; cH = r.height;
        var hitTH = bIsLoupe ? 16 : TH;
        const nT = Math.abs(my - curBy) < hitTH, nB = Math.abs(my - (cH - curBy)) < hitTH;
        const nL = Math.abs(mx - curBx) < hitTH, nR = Math.abs(mx - (cW - curBx)) < hitTH;
        if (nT && nL) bMode = 'tl';
        else if (nT && nR) bMode = 'tr';
        else if (nB && nL) bMode = 'bl';
        else if (nB && nR) bMode = 'br';
        else if (nT) bMode = 'top';
        else if (nB) bMode = 'bot';
        else if (nL) bMode = 'left';
        else if (nR) bMode = 'right';
        else return;
        bsx = e.clientX; bsy = e.clientY; sbx = curBx; sby = curBy;
        bRatio = (cW - 2 * sbx) / (cH - 2 * sby) || 1;
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (!bMode) return;
        const dx = e.clientX - bsx, dy = e.clientY - bsy;
        const mxB = cW / 2 - 1, myB = cH / 2 - 1;
        var newBx = bIsLoupe ? llbx : lbx;
        var newBy = bIsLoupe ? llby : lby;
        if (bMode === 'top') newBy = Math.max(0, Math.min(myB, sby + dy));
        else if (bMode === 'bot') newBy = Math.max(0, Math.min(myB, sby - dy));
        else if (bMode === 'left') newBx = Math.max(0, Math.min(mxB, sbx + dx));
        else if (bMode === 'right') newBx = Math.max(0, Math.min(mxB, sbx - dx));
        else {
            if (bMode === 'tl' || bMode === 'tr') newBy = Math.max(0, Math.min(myB, sby + dy));
            else newBy = Math.max(0, Math.min(myB, sby - dy));
            newBx = Math.max(0, Math.min(mxB, (cW - bRatio * (cH - 2 * newBy)) / 2));
        }
        if (bIsLoupe) { llbx = newBx; llby = newBy; }
        else { lbx = newBx; lby = newBy; }
        updateLibBorderVars();
    });
    document.addEventListener('mouseup', function() { bMode = null; });
})();

let libZoom = 1;
function libraryZoomIn() {
    libZoom = Math.min(3, libZoom + 0.25);
    applyLibZoom();
}
function libraryZoomOut() {
    libZoom = Math.max(0.5, libZoom - 0.25);
    applyLibZoom();
}
function libraryZoomReset() {
    libZoom = 1;
    applyLibZoom();
}

// --- Zoom panel toggle ---
function toggleZoomPanel() {
    var panel = document.getElementById('zoom-panel');
    var btn = document.getElementById('zoom-loupe-btn');
    if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        btn.style.boxShadow = '';
        // Exit loupe mode if active
        if (loupeMode) toggleLoupeMode();
    } else {
        panel.style.display = 'flex';
        btn.style.boxShadow = '0 0 0 2px #FFD700';
    }
}

// --- Loupe (++) mode ---
var loupeMode = false;
function toggleLoupeMode() {
    loupeMode = !loupeMode;
    var btn = document.getElementById('loupe-mode-btn');
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    if (loupeMode) {
        btn.classList.add('active');
        content.classList.add('loupe-cursor');
    } else {
        btn.classList.remove('active');
        content.classList.remove('loupe-cursor');
    }
}

var loupeSourceCard = null; // reference to the original card element in loupe
var loupeVariationMatrix = null; // SVGMatrix for the variation transform <g>
var loupeVariationInverse = null; // inverse SVGMatrix for coordinate conversion

function openLoupe(cardEl) {
    var svg = cardEl.querySelector('svg');
    if (!svg) return;
    loupeSourceCard = cardEl;
    var overlay = document.getElementById('loupe-overlay');
    var container = document.getElementById('loupe-card-container');
    container.innerHTML = '';

    // Raise the left toolbar above the loupe overlay
    var toolbar = document.querySelector('#domino-library-screen .library-zoom-fixed');
    if (toolbar) toolbar.classList.add('loupe-toolbar-raised');
    var zoomPanel = document.getElementById('zoom-panel');
    if (zoomPanel) zoomPanel.classList.add('loupe-toolbar-raised');

    // Raise ruler above overlay
    var ruler = document.getElementById('lib-ruler-rect');
    if (ruler) ruler.classList.add('loupe-toolbar-raised');

    // Disable buttons that shouldn't work in loupe view
    ['toggle-desc-btn', 'var-tool-btn', 'toggle-var-btn', 'new-card-btn', 'gm-btn'].forEach(function(id) {
        var b = document.getElementById(id);
        if (b) { b.classList.add('loupe-disabled'); b.disabled = true; }
    });

    // Determine size: fill most of the screen, keeping it square
    // Account for toolbar width (~60px) on the left
    var toolbarWidth = 60;
    var screenW = window.innerWidth;
    var screenH = window.innerHeight;
    var availW = screenW - toolbarWidth;
    var size = Math.min(availW, screenH) * 0.85;
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    // Shift card right to avoid toolbar overlap
    overlay.style.paddingLeft = toolbarWidth + 'px';

    // Clone SVG and enlarge
    var svgClone = svg.cloneNode(true);
    svgClone.style.width = '100%';
    svgClone.style.height = '100%';
    svgClone.removeAttribute('width');
    svgClone.removeAttribute('height');
    container.appendChild(svgClone);

    // Compute variation transform matrices for coordinate conversion
    loupeVariationMatrix = null;
    loupeVariationInverse = null;
    var varG = svgClone.querySelector('g[data-variation-transform]');
    if (varG) {
        try {
            var baseVal = varG.transform.baseVal;
            if (baseVal.numberOfItems > 0) {
                baseVal.consolidate();
                loupeVariationMatrix = baseVal.getItem(0).matrix;
                loupeVariationInverse = loupeVariationMatrix.inverse();
            }
        } catch(ex) {}
    }

    // Add grid overlay (99 lines each direction = 10000 squares)
    var gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    gridSvg.setAttribute('viewBox', '0 0 100 100');
    gridSvg.setAttribute('preserveAspectRatio', 'none');
    gridSvg.classList.add('loupe-grid');
    for (var i = 1; i < 100; i++) {
        var cls = (i % 10 === 0) ? 'loupe-grid-major' : (i % 5 === 0) ? 'loupe-grid-mid' : '';
        // Vertical line
        var vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', i);
        vLine.setAttribute('y1', 0);
        vLine.setAttribute('x2', i);
        vLine.setAttribute('y2', 100);
        if (cls) vLine.classList.add(cls);
        gridSvg.appendChild(vLine);
        // Horizontal line
        var hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', 0);
        hLine.setAttribute('y1', i);
        hLine.setAttribute('x2', 100);
        hLine.setAttribute('y2', i);
        if (cls) hLine.classList.add(cls);
        gridSvg.appendChild(hLine);
    }
    container.appendChild(gridSvg);

    overlay.style.display = 'flex';
}

function closeLoupe() {
    // Exit draw mode if active
    if (drawModeActive) toggleDrawMode();
    loupeSourceCard = null;
    loupeVariationMatrix = null;
    loupeVariationInverse = null;

    document.getElementById('loupe-overlay').style.display = 'none';
    document.getElementById('loupe-overlay').style.paddingLeft = '';
    document.getElementById('loupe-card-container').innerHTML = '';
    // Restore toolbar z-index
    var toolbar = document.querySelector('#domino-library-screen .library-zoom-fixed');
    if (toolbar) toolbar.classList.remove('loupe-toolbar-raised');
    var zoomPanel = document.getElementById('zoom-panel');
    if (zoomPanel) zoomPanel.classList.remove('loupe-toolbar-raised');
    var ruler = document.getElementById('lib-ruler-rect');
    if (ruler) ruler.classList.remove('loupe-toolbar-raised');

    // Re-enable buttons
    ['toggle-desc-btn', 'var-tool-btn', 'toggle-var-btn', 'new-card-btn', 'gm-btn'].forEach(function(id) {
        var b = document.getElementById(id);
        if (b) { b.classList.remove('loupe-disabled'); b.disabled = false; }
    });
    // Remove border from loupe container
    var container = document.getElementById('loupe-card-container');
    container.classList.remove('show-border');
}

// Loupe close button
document.getElementById('loupe-close-btn').addEventListener('click', closeLoupe);
// Close loupe with Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('loupe-overlay').style.display !== 'none') {
        closeLoupe();
    }
});

// === Draw mode: place circles and text on cards ===
var drawModeActive = false;
var drawTool = 'circle'; // 'circle', 'text', 'hollow', 'select'
// 1 grid unit = 60/100 = 0.6 SVG units (99 lines → 100 cells in a 60-unit viewBox)
var GRID_UNIT = 0.6;
function snapToGrid(svgVal) { return Math.round(svgVal / GRID_UNIT) * GRID_UNIT; }
function gridToSvg(gridVal) { return gridVal * GRID_UNIT; }
function svgToGrid(svgVal) { return svgVal / GRID_UNIT; }

var drawSizeCoarse = 30;    // Aa slider (0-90, step 10)
var drawSizeFine = 0;       // r slider (0-10, step 1)
// Combined size: 0-100 where 100 = fill card in one direction (60 SVG units)
function getEffectiveSize() { return Math.min(drawSizeCoarse + drawSizeFine, 100); }
var drawFontFamily = 'Arial, sans-serif';
var drawHistory = []; // SVG elements added, for undo
var drawOverScale = 1; // Over-scale multiplier for imported SVGs (1-10)
var cropModeActive = false; // Crop/pan drag mode for oversized imported SVGs

function onOverScaleChange(val) {
    drawOverScale = val;
    var label = document.getElementById('draw-overscale-val');
    if (label) label.textContent = '\u00d7' + val;
    // Show crop button whenever an imported stamp is active (any scale)
    var cropBtn = document.getElementById('draw-crop-btn');
    if (cropBtn) cropBtn.style.display = 'inline-flex';
    // Apply to selected element if it's an imported stamp
    if (selectedElement && selectedElement.tagName.toLowerCase() === 'g' && selectedElement.hasAttribute('data-imported-stamp')) {
        applyEffectiveSize();
    } else {
        // No element selected – apply to the last placed imported stamp (if any)
        for (var i = drawHistory.length - 1; i >= 0; i--) {
            var el = drawHistory[i];
            if (el && el.tagName && el.tagName.toLowerCase() === 'g' && el.hasAttribute('data-imported-stamp')) {
                // Temporarily select it so applyEffectiveSize works
                var prev = selectedElement;
                selectedElement = el;
                applyEffectiveSize();
                selectedElement = prev;
                break;
            }
        }
    }
}

function toggleCropMode() {
    cropModeActive = !cropModeActive;
    var btn = document.getElementById('draw-crop-btn');
    if (btn) {
        if (cropModeActive) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
    var container = document.getElementById('loupe-card-container');
    if (container) {
        container.style.cursor = cropModeActive ? 'grab' : 'crosshair';
    }
}

// Crop/pan drag state
var cropDragState = null;
function initCropDrag(container) {
    container.addEventListener('mousedown', function(e) {
        if (!cropModeActive || !drawModeActive) return;
        // Find the imported stamp <g> to drag
        var target = selectedElement;
        if (!target || target.tagName.toLowerCase() !== 'g' || !target.hasAttribute('data-imported-stamp')) return;
        e.preventDefault();
        e.stopPropagation();
        var rect = container.getBoundingClientRect();
        var t = target.getAttribute('transform') || '';
        var m = t.match(/translate\(\s*([\d.e+-]+)\s*,\s*([\d.e+-]+)\s*\)/);
        if (!m) return;
        cropDragState = {
            el: target,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startTx: +m[1],
            startTy: +m[2],
            rectW: rect.width,
            rectH: rect.height
        };
        container.style.cursor = 'grabbing';
    });
    container.addEventListener('mousemove', function(e) {
        if (!cropDragState) return;
        e.preventDefault();
        var dx = (e.clientX - cropDragState.startMouseX) / cropDragState.rectW * 60;
        var dy = (e.clientY - cropDragState.startMouseY) / cropDragState.rectH * 60;
        var newTx = cropDragState.startTx + dx;
        var newTy = cropDragState.startTy + dy;
        var t = cropDragState.el.getAttribute('transform') || '';
        var scaleMatch = t.match(/scale\(\s*([\d.e+-]+)\s*\)/);
        var scaleStr = scaleMatch ? ' scale(' + scaleMatch[1] + ')' : '';
        cropDragState.el.setAttribute('transform', 'translate(' + newTx + ',' + newTy + ')' + scaleStr);
        updateSelectionRing();
    });
    container.addEventListener('mouseup', function(e) {
        if (!cropDragState) return;
        hasEditedExisting = true;
        cropDragState = null;
        container.style.cursor = 'grab';
    });
}

// Convert SVG root-space coordinates to variation <g> local-space coordinates
function toVariationLocalCoords(rawX, rawY) {
    if (!loupeVariationInverse) return { x: rawX, y: rawY };
    return {
        x: loupeVariationInverse.a * rawX + loupeVariationInverse.c * rawY + loupeVariationInverse.e,
        y: loupeVariationInverse.b * rawX + loupeVariationInverse.d * rawY + loupeVariationInverse.f
    };
}
// Transform a bbox from variation local-space to SVG root-space
function variationBBoxToRoot(bbox) {
    if (!loupeVariationMatrix) return bbox;
    var m = loupeVariationMatrix;
    var corners = [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x, y: bbox.y + bbox.height },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height }
    ];
    var txArr = [], tyArr = [];
    for (var i = 0; i < 4; i++) {
        txArr.push(m.a * corners[i].x + m.c * corners[i].y + m.e);
        tyArr.push(m.b * corners[i].x + m.d * corners[i].y + m.f);
    }
    var minX = Math.min.apply(null, txArr), maxX = Math.max.apply(null, txArr);
    var minY = Math.min.apply(null, tyArr), maxY = Math.max.apply(null, tyArr);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
// Check if an element is inside a variation transform <g>
function isInsideVariationG(el) {
    return el && !!el.closest('g[data-variation-transform]');
}
var pendingNewCardName = null; // name for card being drawn

// === Select / Edit mode state ===
var selectedElement = null;      // currently selected SVG element
var isDragging = false;          // drag in progress
var dragStartX = 0, dragStartY = 0; // mouse start position (SVG coords)
var elemStartX = 0, elemStartY = 0; // element start position (SVG coords)
var drawMouseMoveHandler = null;
var drawMouseUpHandler = null;
var drawKeyHandler = null;
var hasEditedExisting = false;    // track if existing elements were modified

var newCardModeActive = false;

function createNewCard() {
    var name = prompt('Card name (label):');
    if (!name || !name.trim()) return;
    pendingNewCardName = name.trim();
    // Open blank card in draw mode
    if (!drawModeActive) {
        toggleDrawMode();
    } else {
        // Already in draw mode, open fresh blank card
        openBlankCardLoupe();
        drawHistory = [];
    }
}

// --- New Card Mode: show letter labels on each row ---
function toggleNewCardMode() {
    if (newCardModeActive) {
        exitNewCardMode();
    } else {
        enterNewCardMode();
    }
}

function enterNewCardMode() {
    newCardModeActive = true;
    var plusBtn = document.getElementById('new-card-btn');
    if (plusBtn) {
        plusBtn.classList.add('loupe-active-tool');
        plusBtn.style.boxShadow = '0 0 0 2px #7eff7e';
    }
    // Hide variations
    hideVariations();
    // Show letter labels on each row (including empty rows)
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    // Scope rows to the active card set container so hidden sets don't affect letter assignment
    var activeContainer;
    if (isCustomCardSet(activeCardSet)) {
        activeContainer = document.getElementById('card-set-custom');
    } else if (activeCardSet === 'abc') {
        activeContainer = document.getElementById('card-set-abc');
    } else {
        activeContainer = document.getElementById('card-set-numbers');
    }
    var rows = (activeContainer || content).querySelectorAll('.library-row');
    var usedLetters = [];
    rows.forEach(function(row) {
        var letter = row.dataset.rowLetter;
        if (!letter) {
            var firstLabel = row.querySelector('.library-label');
            if (!firstLabel) return;
            letter = firstLabel.textContent.charAt(0).toUpperCase();
        }
        usedLetters.push(letter);
        // Create letter label on the left of the row
        var letterLabel = document.createElement('div');
        letterLabel.className = 'row-letter-label';
        letterLabel.textContent = letter;
        letterLabel.title = 'Add new card to group ' + letter;
        letterLabel.onclick = function() {
            startNewCardInGroup(letter, row);
        };
        row.style.position = 'relative';
        row.insertBefore(letterLabel, row.firstChild);
    });
    // Add next available letter below the last row
    var nextLetter = getNextLetter(usedLetters);
    if (nextLetter) {
        var newGroupRow = document.createElement('div');
        newGroupRow.className = 'library-row new-group-row';
        newGroupRow.id = 'new-group-row';
        var letterLabel = document.createElement('div');
        letterLabel.className = 'row-letter-label new-group-letter';
        letterLabel.textContent = nextLetter;
        letterLabel.title = 'Create new group ' + nextLetter;
        letterLabel.onclick = function() {
            startNewCardInNewGroup(nextLetter);
        };
        newGroupRow.appendChild(letterLabel);
        var hint = document.createElement('span');
        hint.className = 'new-group-hint';
        hint.textContent = '+ new group';
        newGroupRow.appendChild(hint);
        content.appendChild(newGroupRow);
    }
}

function exitNewCardMode() {
    newCardModeActive = false;
    var plusBtn = document.getElementById('new-card-btn');
    if (plusBtn) {
        plusBtn.classList.remove('loupe-active-tool');
        plusBtn.style.boxShadow = '';
    }
    // Remove all letter labels
    document.querySelectorAll('.row-letter-label').forEach(function(el) {
        el.parentNode.removeChild(el);
    });
    // Remove new group row
    var ngr = document.getElementById('new-group-row');
    if (ngr) ngr.parentNode.removeChild(ngr);
}

function getNextLetter(usedLetters) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < alphabet.length; i++) {
        if (usedLetters.indexOf(alphabet[i]) < 0) return alphabet[i];
    }
    return null;
}

function getNextNumber(letter) {
    // Scope to the active card set container so hidden sets don't inflate numbers
    var container;
    if (isCustomCardSet(activeCardSet)) {
        container = document.getElementById('card-set-custom');
    } else if (activeCardSet === 'abc') {
        container = document.getElementById('card-set-abc');
    } else {
        container = document.getElementById('card-set-numbers');
    }
    if (!container) container = document.querySelector('#domino-library-screen .domino-library-content');
    var labels = container.querySelectorAll('.library-label');
    var maxNum = 0;
    labels.forEach(function(lbl) {
        var txt = lbl.textContent;
        if (txt.charAt(0).toUpperCase() === letter) {
            var num = parseInt(txt.substring(1), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    });
    return maxNum + 1;
}

function startNewCardInGroup(letter, row) {
    var num = getNextNumber(letter);
    var cardName = letter + num;
    exitNewCardMode();
    pendingNewCardName = cardName;
    if (!drawModeActive) {
        toggleDrawMode();
    } else {
        openBlankCardLoupe();
        drawHistory = [];
    }
}

function startNewCardInNewGroup(letter) {
    var cardName = letter + '1';
    exitNewCardMode();
    pendingNewCardName = cardName;
    if (!drawModeActive) {
        toggleDrawMode();
    } else {
        openBlankCardLoupe();
        drawHistory = [];
    }
}

function toggleDrawMode() {
    drawModeActive = !drawModeActive;
    var panel = document.getElementById('draw-tools-panel');
    if (drawModeActive) {
        // If loupe is not open, open a blank card
        var overlay = document.getElementById('loupe-overlay');
        if (overlay.style.display === 'none' || overlay.style.display === '') {
            openBlankCardLoupe();
        }
        panel.style.display = 'flex';
        drawHistory = [];
        hasEditedExisting = false;
        attachDrawClickHandler();
        selectDrawTool(drawTool);
        initDrawColorSwatches();
    } else {
        panel.style.display = 'none';
        detachDrawClickHandler();
    }
}

function openBlankCardLoupe() {
    // Create a temporary blank card element to open in loupe
    var blankCard = document.createElement('div');
    blankCard.className = 'library-card draw-blank-card';
    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    preview.appendChild(svg);
    blankCard.appendChild(preview);
    loupeSourceCard = null; // no original card to save back to
    // Open the blank card in loupe manually
    var overlay = document.getElementById('loupe-overlay');
    var container = document.getElementById('loupe-card-container');
    container.innerHTML = '';
    var toolbar = document.querySelector('#domino-library-screen .library-zoom-fixed');
    if (toolbar) toolbar.classList.add('loupe-toolbar-raised');
    var zoomPanel = document.getElementById('zoom-panel');
    if (zoomPanel) zoomPanel.classList.add('loupe-toolbar-raised');
    var ruler = document.getElementById('lib-ruler-rect');
    if (ruler) ruler.classList.add('loupe-toolbar-raised');
    ['toggle-desc-btn', 'var-tool-btn', 'toggle-var-btn', 'new-card-btn', 'gm-btn'].forEach(function(id) {
        var b = document.getElementById(id);
        if (b) { b.classList.add('loupe-disabled'); b.disabled = true; }
    });
    var toolbarWidth = 60;
    var screenW = window.innerWidth;
    var screenH = window.innerHeight;
    var availW = screenW - toolbarWidth;
    var size = Math.min(availW, screenH) * 0.85;
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    overlay.style.paddingLeft = toolbarWidth + 'px';
    var svgClone = svg.cloneNode(true);
    svgClone.style.width = '100%';
    svgClone.style.height = '100%';
    svgClone.removeAttribute('width');
    svgClone.removeAttribute('height');
    container.appendChild(svgClone);
    // Grid
    var gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    gridSvg.setAttribute('viewBox', '0 0 100 100');
    gridSvg.setAttribute('preserveAspectRatio', 'none');
    gridSvg.classList.add('loupe-grid');
    for (var i = 1; i < 100; i++) {
        var cls = (i % 10 === 0) ? 'loupe-grid-major' : (i % 5 === 0) ? 'loupe-grid-mid' : '';
        var vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', i); vLine.setAttribute('y1', 0);
        vLine.setAttribute('x2', i); vLine.setAttribute('y2', 100);
        if (cls) vLine.classList.add(cls);
        gridSvg.appendChild(vLine);
        var hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', 0); hLine.setAttribute('y1', i);
        hLine.setAttribute('x2', 100); hLine.setAttribute('y2', i);
        if (cls) hLine.classList.add(cls);
        gridSvg.appendChild(hLine);
    }
    container.appendChild(gridSvg);
    overlay.style.display = 'flex';
}

var selectedTextChar = '';  // The character selected from T submenu
var selectedStampTool = ''; // The stamp/dot tool selected from Stamps submenu

function selectDrawTool(tool) {
    drawTool = tool;
    document.querySelectorAll('#draw-tools-panel .draw-tool-btn').forEach(function(b) {
        b.classList.remove('active');
    });
    var idMap = { select: 'draw-select-btn' };
    var btn = document.getElementById(idMap[tool]);
    if (btn) btn.classList.add('active');
    // Highlight group buttons for text/stamp tools
    if (tool === 'text') {
        var tBtn = document.getElementById('draw-text-group-btn');
        if (tBtn) tBtn.classList.add('active');
    }
    if (tool === 'circle' || tool === 'hollow' || stampSVGs[tool]) {
        var sBtn = document.getElementById('draw-stamps-group-btn');
        if (sBtn) sBtn.classList.add('active');
    }
    if (typeof tool === 'string' && tool.indexOf('stamp-imported-') === 0) {
        var impBtn = document.getElementById('draw-svg-import-btn');
        if (impBtn) impBtn.classList.add('active');
    }
    // Show/hide over-scale row and crop button for imported stamps
    var overscaleRow = document.getElementById('draw-overscale-row');
    var isImportedStamp = (typeof tool === 'string' && tool.indexOf('stamp-imported-') === 0);
    if (overscaleRow) {
        overscaleRow.style.display = isImportedStamp ? 'flex' : 'none';
    }
    var cropBtn = document.getElementById('draw-crop-btn');
    if (cropBtn) {
        cropBtn.style.display = isImportedStamp ? 'inline-flex' : 'none';
    }
    // Deactivate crop mode when switching tools
    if (cropModeActive) {
        cropModeActive = false;
        if (cropBtn) cropBtn.classList.remove('active');
    }
    // Highlight active item in submenu
    document.querySelectorAll('.draw-submenu-item').forEach(function(it) { it.classList.remove('active'); });
    if (tool === 'text' && selectedTextChar) {
        var items = document.querySelectorAll('#text-submenu .draw-submenu-item');
        items.forEach(function(it) {
            if (it.getAttribute('data-char') === selectedTextChar) it.classList.add('active');
        });
    }
    if (tool === 'circle' || tool === 'hollow' || stampSVGs[tool]) {
        var items = document.querySelectorAll('#stamps-submenu .draw-submenu-item');
        items.forEach(function(it) {
            if (it.getAttribute('data-tool') === tool) it.classList.add('active');
        });
    }
    // Update cursor
    var container = document.getElementById('loupe-card-container');
    if (container) {
        container.style.cursor = (tool === 'select') ? 'default' : 'crosshair';
    }
    // Deselect when switching away from select tool
    if (tool !== 'select') {
        deselectElement();
    }
}

// --- T submenu (text, numbers, math) ---
function populateTextSubmenu() {
    var numbers = '0123456789';
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var mathOps = ['+', '-', '\u00D7', '\u00F7', '='];
    var numGrid = document.getElementById('text-numbers-grid');
    var letGrid = document.getElementById('text-letters-grid');
    var mathGrid = document.getElementById('text-math-grid');
    if (!numGrid || !letGrid || !mathGrid) return;
    numGrid.innerHTML = '';
    letGrid.innerHTML = '';
    mathGrid.innerHTML = '';
    for (var i = 0; i < numbers.length; i++) {
        numGrid.appendChild(makeTextSubmenuItem(numbers[i]));
    }
    for (var i = 0; i < letters.length; i++) {
        letGrid.appendChild(makeTextSubmenuItem(letters[i]));
    }
    for (var i = 0; i < mathOps.length; i++) {
        mathGrid.appendChild(makeTextSubmenuItem(mathOps[i]));
    }
}
function makeTextSubmenuItem(ch) {
    var btn = document.createElement('button');
    btn.className = 'draw-submenu-item';
    btn.textContent = ch;
    btn.setAttribute('data-char', ch);
    btn.onclick = function() {
        selectedTextChar = ch;
        selectDrawTool('text');
        closeAllSubmenus();
        updateToolBadge('draw-text-group-btn', ch);
    };
    return btn;
}
function toggleTextSubmenu() {
    var menu = document.getElementById('text-submenu');
    var stamps = document.getElementById('stamps-submenu');
    if (stamps) stamps.style.display = 'none';
    if (menu) {
        if (menu.style.display === 'none') {
            populateTextSubmenu();
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    }
}

// --- Stamps submenu (dots + icons) ---
function populateStampsSubmenu() {
    var grid = document.getElementById('stamps-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // Filled circle
    var circBtn = document.createElement('button');
    circBtn.className = 'draw-submenu-item';
    circBtn.innerHTML = '&#9679;';
    circBtn.setAttribute('data-tool', 'circle');
    circBtn.title = 'Filled circle';
    circBtn.onclick = function() { selectStampTool('circle'); };
    grid.appendChild(circBtn);
    // Hollow circle
    var hollBtn = document.createElement('button');
    hollBtn.className = 'draw-submenu-item';
    hollBtn.innerHTML = '&#9675;';
    hollBtn.setAttribute('data-tool', 'hollow');
    hollBtn.title = 'Hollow circle';
    hollBtn.onclick = function() { selectStampTool('hollow'); };
    grid.appendChild(hollBtn);
    // Stamp icons
    var stampKeys = Object.keys(stampSVGs);
    var stampTitles = { 'stamp-sun': 'Sun', 'stamp-alien': 'Alien', 'stamp-sunflower': 'Sunflower', 'stamp-ant': 'Ant', 'stamp-brain': 'Brain', 'stamp-cat': 'Cat', 'stamp-dog': 'Dog', 'stamp-egg': 'Egg', 'stamp-union': 'Union', 'stamp-intersect': 'Intersection' };
    for (var i = 0; i < stampKeys.length; i++) {
        var key = stampKeys[i];
        var sBtn = document.createElement('button');
        sBtn.className = 'draw-submenu-item';
        sBtn.innerHTML = '<svg viewBox="0 0 100 100">' + stampSVGs[key] + '</svg>';
        sBtn.setAttribute('data-tool', key);
        sBtn.title = stampTitles[key] || key;
        (function(k) {
            sBtn.onclick = function() { selectStampTool(k); };
        })(key);
        grid.appendChild(sBtn);
    }
}
function selectStampTool(tool) {
    selectedStampTool = tool;
    selectDrawTool(tool);
    closeAllSubmenus();
}
function triggerSvgFileImport() {
    document.getElementById('svg-file-input').click();
}
function handleSvgFileSelected(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(e.target.result, 'image/svg+xml');
        var svgEl = doc.querySelector('svg');
        if (!svgEl) { alert('Not a valid SVG file'); return; }
        var vb = svgEl.getAttribute('viewBox') || '0 0 100 100';
        var parts = vb.split(/[\s,]+/).map(Number);
        var vbW = parts[2] || 100, vbH = parts[3] || 100;
        var innerMarkup = svgEl.innerHTML;
        var wrappedSVG = '<g transform="scale(' + (100/vbW) + ',' + (100/vbH) + ')">'
                          + innerMarkup + '</g>';
        var stampKey = 'stamp-imported-' + Date.now();
        stampSVGs[stampKey] = wrappedSVG;
        selectedStampTool = stampKey;
        selectDrawTool(stampKey);
    };
    reader.readAsText(file);
    event.target.value = '';
}
function toggleStampsSubmenu() {
    var menu = document.getElementById('stamps-submenu');
    var textMenu = document.getElementById('text-submenu');
    if (textMenu) textMenu.style.display = 'none';
    if (menu) {
        if (menu.style.display === 'none') {
            populateStampsSubmenu();
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    }
}

function closeAllSubmenus() {
    var t = document.getElementById('text-submenu');
    var s = document.getElementById('stamps-submenu');
    if (t) t.style.display = 'none';
    if (s) s.style.display = 'none';
}

function updateToolBadge(btnId, label) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    var badge = btn.querySelector('.tool-char-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'tool-char-badge';
        btn.appendChild(badge);
    }
    badge.textContent = label;
}

// Stamp icon SVG content (100x100 viewBox paths) — detailed, fills full viewBox
var stampSVGs = {
    'stamp-sun': '<polygon points="50,1 43,18 57,18" fill="#FFA500"/><polygon points="50,99 43,82 57,82" fill="#FFA500"/><polygon points="1,50 18,43 18,57" fill="#FFA500"/><polygon points="99,50 82,43 82,57" fill="#FFA500"/><polygon points="12,12 27,20 20,27" fill="#FFA500"/><polygon points="88,88 73,80 80,73" fill="#FFA500"/><polygon points="88,12 80,27 73,20" fill="#FFA500"/><polygon points="12,88 20,73 27,80" fill="#FFA500"/><polygon points="50,5 45,15 55,15" fill="#FF8C00"/><polygon points="50,95 45,85 55,85" fill="#FF8C00"/><polygon points="5,50 15,45 15,55" fill="#FF8C00"/><polygon points="95,50 85,45 85,55" fill="#FF8C00"/><circle cx="50" cy="50" r="30" fill="#FFD700"/><circle cx="50" cy="50" r="30" fill="none" stroke="#FFA500" stroke-width="2.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="#FFE44D" stroke-width="1" opacity="0.5"/><circle cx="30" cy="56" r="6" fill="#FF9999" opacity="0.5"/><circle cx="70" cy="56" r="6" fill="#FF9999" opacity="0.5"/><circle cx="38" cy="44" r="9" fill="white" stroke="#333" stroke-width="1.5"/><circle cx="62" cy="44" r="9" fill="white" stroke="#333" stroke-width="1.5"/><circle cx="40" cy="45" r="5" fill="#333"/><circle cx="64" cy="45" r="5" fill="#333"/><circle cx="37" cy="42" r="2.5" fill="white"/><circle cx="61" cy="42" r="2.5" fill="white"/><ellipse cx="50" cy="63" rx="8" ry="5" fill="#FF6B6B"/><path d="M42 63 Q50 70 58 63" stroke="#CC4444" stroke-width="1.5" fill="none"/><path d="M44 58 Q50 60 56 58" stroke="#E8A000" stroke-width="1" fill="none"/>',
    'stamp-alien': '<ellipse cx="50" cy="42" rx="38" ry="34" fill="#7CFC00" stroke="#32CD32" stroke-width="3"/><ellipse cx="50" cy="42" rx="32" ry="28" fill="#8AFF2A" opacity="0.4"/><ellipse cx="30" cy="38" rx="14" ry="8" fill="#111" stroke="#333" stroke-width="1.5" transform="rotate(-10 30 38)"/><ellipse cx="70" cy="38" rx="14" ry="8" fill="#111" stroke="#333" stroke-width="1.5" transform="rotate(10 70 38)"/><ellipse cx="32" cy="37" rx="5" ry="3" fill="#0f0" opacity="0.7"/><ellipse cx="72" cy="37" rx="5" ry="3" fill="#0f0" opacity="0.7"/><ellipse cx="50" cy="55" rx="3" ry="2" fill="#228B22"/><path d="M42 62 Q50 68 58 62" stroke="#228B22" stroke-width="2" fill="none"/><line x1="32" y1="8" x2="28" y2="2" stroke="#32CD32" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="2" r="3" fill="#7CFC00" stroke="#32CD32" stroke-width="1.5"/><line x1="68" y1="8" x2="72" y2="2" stroke="#32CD32" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="2" r="3" fill="#7CFC00" stroke="#32CD32" stroke-width="1.5"/><line x1="30" y1="76" x2="22" y2="96" stroke="#32CD32" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="76" x2="78" y2="96" stroke="#32CD32" stroke-width="5" stroke-linecap="round"/><ellipse cx="22" cy="97" rx="7" ry="3" fill="#32CD32"/><ellipse cx="78" cy="97" rx="7" ry="3" fill="#32CD32"/><line x1="50" y1="76" x2="50" y2="82" stroke="#32CD32" stroke-width="3" stroke-linecap="round"/>',
    'stamp-sunflower': '<line x1="50" y1="70" x2="50" y2="98" stroke="#3a7d28" stroke-width="5"/><ellipse cx="35" cy="88" rx="12" ry="6" fill="#3a7d28" transform="rotate(-30 35 88)"/><ellipse cx="65" cy="92" rx="10" ry="5" fill="#3a7d28" transform="rotate(25 65 92)"/><ellipse cx="50" cy="14" rx="9" ry="18" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><ellipse cx="50" cy="72" rx="9" ry="18" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><ellipse cx="14" cy="43" rx="18" ry="9" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><ellipse cx="86" cy="43" rx="18" ry="9" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><ellipse cx="24" cy="20" rx="9" ry="16" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(-45 24 20)"/><ellipse cx="76" cy="20" rx="9" ry="16" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(45 76 20)"/><ellipse cx="24" cy="66" rx="9" ry="16" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(45 24 66)"/><ellipse cx="76" cy="66" rx="9" ry="16" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(-45 76 66)"/><ellipse cx="50" cy="7" rx="7" ry="14" fill="#FFC800"/><ellipse cx="50" cy="79" rx="7" ry="14" fill="#FFC800"/><ellipse cx="7" cy="43" rx="14" ry="7" fill="#FFC800"/><ellipse cx="93" cy="43" rx="14" ry="7" fill="#FFC800"/><circle cx="50" cy="43" r="20" fill="#8B4513"/><circle cx="50" cy="43" r="20" fill="none" stroke="#654321" stroke-width="2.5"/><circle cx="44" cy="38" r="2.5" fill="#5a3010"/><circle cx="56" cy="38" r="2.5" fill="#5a3010"/><circle cx="50" cy="46" r="2.5" fill="#5a3010"/><circle cx="42" cy="48" r="2" fill="#5a3010"/><circle cx="58" cy="48" r="2" fill="#5a3010"/><circle cx="50" cy="36" r="1.5" fill="#5a3010"/><circle cx="44" cy="50" r="1.5" fill="#5a3010"/><circle cx="56" cy="50" r="1.5" fill="#5a3010"/>',
    'stamp-ant': '<line x1="36" y1="10" x2="25" y2="2" stroke="#4a3020" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="10" x2="75" y2="2" stroke="#4a3020" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="2" r="3" fill="#4a3020"/><circle cx="76" cy="2" r="3" fill="#4a3020"/><ellipse cx="50" cy="18" rx="14" ry="12" fill="#5a3828" stroke="#3a2010" stroke-width="2"/><circle cx="42" cy="16" r="3" fill="white" stroke="#333" stroke-width="1"/><circle cx="58" cy="16" r="3" fill="white" stroke="#333" stroke-width="1"/><circle cx="43" cy="16" r="1.5" fill="#333"/><circle cx="59" cy="16" r="1.5" fill="#333"/><ellipse cx="50" cy="38" rx="11" ry="10" fill="#5a3828" stroke="#3a2010" stroke-width="2"/><ellipse cx="50" cy="65" rx="18" ry="22" fill="#5a3828" stroke="#3a2010" stroke-width="2"/><ellipse cx="50" cy="60" rx="14" ry="16" fill="#6b4432" opacity="0.5"/><line x1="42" y1="32" x2="18" y2="22" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><line x1="58" y1="32" x2="82" y2="22" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><line x1="40" y1="40" x2="14" y2="42" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><line x1="60" y1="40" x2="86" y2="42" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><line x1="38" y1="58" x2="16" y2="72" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><line x1="62" y1="58" x2="84" y2="72" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="22" r="2" fill="#4a3020"/><circle cx="82" cy="22" r="2" fill="#4a3020"/><circle cx="14" cy="42" r="2" fill="#4a3020"/><circle cx="86" cy="42" r="2" fill="#4a3020"/><circle cx="16" cy="72" r="2" fill="#4a3020"/><circle cx="84" cy="72" r="2" fill="#4a3020"/>',
    'stamp-brain': '<path d="M50 8 C30 8 18 18 18 32 C18 38 20 42 14 48 C8 54 10 64 18 68 C22 76 30 82 38 84 L38 92 C38 96 42 98 46 98 L54 98 C58 98 62 96 62 92 L62 84 C70 82 78 76 82 68 C90 64 92 54 86 48 C80 42 82 38 82 32 C82 18 70 8 50 8Z" fill="#f0a0b8" stroke="#8b4060" stroke-width="3"/><path d="M50 8 C50 8 50 98 50 98" stroke="#8b4060" stroke-width="2.5"/><path d="M34 18 Q40 30 32 42" fill="none" stroke="#8b4060" stroke-width="2"/><path d="M66 18 Q60 30 68 42" fill="none" stroke="#8b4060" stroke-width="2"/><path d="M22 38 Q30 48 20 60" fill="none" stroke="#8b4060" stroke-width="2"/><path d="M78 38 Q70 48 80 60" fill="none" stroke="#8b4060" stroke-width="2"/><path d="M30 56 Q38 66 28 76" fill="none" stroke="#8b4060" stroke-width="1.5"/><path d="M70 56 Q62 66 72 76" fill="none" stroke="#8b4060" stroke-width="1.5"/><path d="M40 28 Q44 34 40 40" fill="none" stroke="#c06080" stroke-width="1"/><path d="M60 28 Q56 34 60 40" fill="none" stroke="#c06080" stroke-width="1"/><rect x="40" y="88" width="20" height="10" rx="4" fill="#d88898" stroke="#8b4060" stroke-width="2"/>',
    'stamp-cat': '<polygon points="10,42 24,4 38,36" fill="#f5c06a" stroke="#8b6914" stroke-width="2" stroke-linejoin="round"/><polygon points="90,42 76,4 62,36" fill="#f5c06a" stroke="#8b6914" stroke-width="2" stroke-linejoin="round"/><polygon points="14,40 25,10 36,36" fill="#f0a0a0"/><polygon points="86,40 75,10 64,36" fill="#f0a0a0"/><circle cx="50" cy="54" r="34" fill="#f5c06a" stroke="#8b6914" stroke-width="2.5"/><circle cx="50" cy="50" r="28" fill="#f5c06a" opacity="0.3"/><ellipse cx="34" cy="48" rx="6" ry="8" fill="#333"/><ellipse cx="66" cy="48" rx="6" ry="8" fill="#333"/><circle cx="36" cy="46" r="2.5" fill="white"/><circle cx="68" cy="46" r="2.5" fill="white"/><ellipse cx="34" cy="52" rx="2" ry="1" fill="#666" opacity="0.3"/><ellipse cx="66" cy="52" rx="2" ry="1" fill="#666" opacity="0.3"/><polygon points="50,60 47,64 53,64" fill="#e87a90"/><path d="M47,64 Q50,70 53,64" fill="none" stroke="#8b6914" stroke-width="1.5"/><line x1="47" y1="63" x2="50" y2="63" stroke="#8b6914" stroke-width="0.8"/><line x1="2" y1="54" x2="26" y2="56" stroke="#8b6914" stroke-width="1.2"/><line x1="2" y1="60" x2="26" y2="60" stroke="#8b6914" stroke-width="1.2"/><line x1="2" y1="66" x2="26" y2="63" stroke="#8b6914" stroke-width="1.2"/><line x1="98" y1="54" x2="74" y2="56" stroke="#8b6914" stroke-width="1.2"/><line x1="98" y1="60" x2="74" y2="60" stroke="#8b6914" stroke-width="1.2"/><line x1="98" y1="66" x2="74" y2="63" stroke="#8b6914" stroke-width="1.2"/><path d="M38 72 Q50 82 62 72" stroke="#8b6914" stroke-width="1" fill="none"/>',
    'stamp-dog': '<ellipse cx="14" cy="38" rx="12" ry="24" fill="#a07840" stroke="#8b6c30" stroke-width="2" transform="rotate(-10 14 38)"/><ellipse cx="86" cy="38" rx="12" ry="24" fill="#a07840" stroke="#8b6c30" stroke-width="2" transform="rotate(10 86 38)"/><ellipse cx="14" cy="30" rx="10" ry="18" fill="#8b6c30" opacity="0.3" transform="rotate(-10 14 30)"/><ellipse cx="86" cy="30" rx="10" ry="18" fill="#8b6c30" opacity="0.3" transform="rotate(10 86 30)"/><circle cx="50" cy="48" r="34" fill="#d4a860" stroke="#8b6c30" stroke-width="2.5"/><circle cx="50" cy="44" r="28" fill="#d4a860" opacity="0.3"/><circle cx="34" cy="40" r="7" fill="#333"/><circle cx="66" cy="40" r="7" fill="#333"/><circle cx="36" cy="38" r="2.8" fill="white"/><circle cx="68" cy="38" r="2.8" fill="white"/><ellipse cx="50" cy="56" rx="16" ry="12" fill="#e8d0a8" stroke="#8b6c30" stroke-width="1.5"/><ellipse cx="50" cy="52" rx="7" ry="5" fill="#333"/><ellipse cx="52" cy="51" r="2" fill="#555"/><path d="M42 60 Q50 68 58 60" stroke="#8b6c30" stroke-width="1.2" fill="none"/><ellipse cx="50" cy="74" rx="6" ry="10" fill="#e87a90" stroke="#c06070" stroke-width="1"/><line x1="50" y1="66" x2="50" y2="82" stroke="#c06070" stroke-width="1"/><ellipse cx="36" cy="62" rx="3" ry="2" fill="#333" opacity="0.15"/><ellipse cx="64" cy="62" rx="3" ry="2" fill="#333" opacity="0.15"/>',
    'stamp-egg': '<path d="M50 3 C30 3 14 30 14 52 C14 74 30 97 50 97 C70 97 86 74 86 52 C86 30 70 3 50 3Z" fill="#f5f0e0" stroke="#8b8060" stroke-width="3"/><path d="M50 8 C34 8 20 32 20 52 C20 70 34 92 50 92 C66 92 80 70 80 52 C80 32 66 8 50 8Z" fill="none" stroke="#c8c0a0" stroke-width="1" opacity="0.5"/><ellipse cx="36" cy="30" rx="8" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(-15,36,30)"/><ellipse cx="44" cy="22" rx="4" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-10,44,22)"/><ellipse cx="60" cy="70" rx="6" ry="10" fill="rgba(139,128,96,0.08)" transform="rotate(10,60,70)"/>',
    'stamp-union': '<g transform="translate(50,50) scale(0.9) translate(-50,-50)"><path d="M22 30 L22 58 C22 74 35 85 50 85 C65 85 78 74 78 58 L78 30" fill="none" stroke="#999" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>',
    'stamp-intersect': '<g transform="translate(50,50) scale(0.9) translate(-50,-50)"><path d="M22 70 L22 42 C22 26 35 15 50 15 C65 15 78 26 78 42 L78 70" fill="none" stroke="#999" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>'
};

// --- Selection helpers ---
function getElementPos(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'circle') return { x: +el.getAttribute('cx'), y: +el.getAttribute('cy') };
    if (tag === 'text') return { x: +el.getAttribute('x'), y: +el.getAttribute('y') };
    if (tag === 'g') {
        var t = el.getAttribute('transform') || '';
        var m = t.match(/translate\(\s*([\d.e+-]+)\s*,\s*([\d.e+-]+)\s*\)/);
        if (m) return { x: +m[1], y: +m[2] };
        return { x: 0, y: 0 };
    }
    return { x: 0, y: 0 };
}
function setElementPos(el, x, y) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'circle') { el.setAttribute('cx', x); el.setAttribute('cy', y); }
    else if (tag === 'text') { el.setAttribute('x', x); el.setAttribute('y', y); }
    else if (tag === 'g') {
        var t = el.getAttribute('transform') || '';
        var newT = t.replace(/translate\([^)]*\)/, 'translate(' + x + ',' + y + ')');
        if (newT === t && t.indexOf('translate') < 0) newT = 'translate(' + x + ',' + y + ') ' + t;
        el.setAttribute('transform', newT);
    }
}
var selectableTags = { circle:1, text:1, line:1, ellipse:1, path:1, rect:1, polygon:1, polyline:1, image:1, use:1 };
function isSelectableElement(el) {
    var tag = el.tagName.toLowerCase();
    var cardSvg = el.closest('svg:not(.loupe-grid)');
    if (!cardSvg) return false;
    // The variation transform <g> wrapper is NOT selectable itself
    if (tag === 'g' && el.hasAttribute('data-variation-transform')) return false;
    // Any shape element inside the card SVG
    if (selectableTags[tag]) return true;
    // A <g> group inside the card SVG (stamp groups, transform groups, etc.)
    if (tag === 'g' && el !== cardSvg && el.parentNode !== null) return true;
    return false;
}
// Get the actual selectable element (for children of a <g>, return the <g>)
function getSelectableElement(el) {
    var tag = el.tagName.toLowerCase();
    // If the element is inside a <g> that is a direct child of the card SVG, select the <g>
    var parentG = el.closest('g');
    if (parentG) {
        var parentOfG = parentG.parentNode;
        // If parentG is the variation transform wrapper, treat it as transparent
        // and select the element (or its inner <g>) that is a direct child of the wrapper
        if (parentG.hasAttribute('data-variation-transform')) {
            // el is inside the variation wrapper — select the direct child of the wrapper
            var child = el;
            while (child.parentNode !== parentG) child = child.parentNode;
            return child;
        }
        if (parentOfG && parentOfG.tagName && parentOfG.tagName.toLowerCase() === 'svg') {
            return parentG;
        }
        // Nested <g>: walk up to the outermost <g> that is a direct child of <svg>
        // but stop at the variation transform wrapper (treat it like <svg>)
        while (parentOfG && parentOfG.tagName && parentOfG.tagName.toLowerCase() === 'g') {
            if (parentOfG.hasAttribute('data-variation-transform')) {
                return parentG; // select the <g> just below the variation wrapper
            }
            parentG = parentOfG;
            parentOfG = parentG.parentNode;
        }
        if (parentOfG && parentOfG.tagName && parentOfG.tagName.toLowerCase() === 'svg') {
            return parentG;
        }
    }
    return el;
}

var selectionRing = null; // SVG rect/circle showing selection

// Get bounding box in SVG root coordinate space (handles <g> transforms)
function getSvgSpaceBBox(el) {
    var bbox = el.getBBox();
    if (el.tagName.toLowerCase() === 'g' && !el.hasAttribute('data-variation-transform')) {
        var t = el.getAttribute('transform') || '';
        var tm = t.match(/translate\(\s*([\d.e+-]+)\s*,\s*([\d.e+-]+)\s*\)/);
        var sm = t.match(/scale\(\s*([\d.e+-]+)\s*\)/);
        if (tm && sm) {
            var tx = +tm[1], ty = +tm[2], s = +sm[1];
            bbox = {
                x: tx + bbox.x * s,
                y: ty + bbox.y * s,
                width: bbox.width * s,
                height: bbox.height * s
            };
        }
    }
    // If inside a variation transform <g>, transform bbox to SVG root space
    if (isInsideVariationG(el)) {
        bbox = variationBBoxToRoot(bbox);
    }
    return bbox;
}

function applySelectionRingFromBBox(bbox) {
    selectionRing.setAttribute('x', bbox.x);
    selectionRing.setAttribute('y', bbox.y);
    selectionRing.setAttribute('width', bbox.width);
    selectionRing.setAttribute('height', bbox.height);
}

function selectElement(el) {
    deselectElement();
    selectedElement = el;
    // Create a visible selection ring around the element
    var cardSvg = el.closest('svg');
    if (cardSvg) {
        var bbox;
        try { bbox = getSvgSpaceBBox(el); } catch(e) { bbox = null; }
        if (bbox) {
            selectionRing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            applySelectionRingFromBBox(bbox);
            selectionRing.setAttribute('fill', 'none');
            selectionRing.setAttribute('stroke', '#FFD700');
            selectionRing.setAttribute('stroke-width', '0.5');
            selectionRing.setAttribute('stroke-dasharray', '1.5,1');
            selectionRing.setAttribute('rx', '0.5');
            selectionRing.classList.add('draw-sel-ring');
            selectionRing.style.pointerEvents = 'none';
            cardSvg.appendChild(selectionRing);
        }
    }
    // Show delete button
    var delBtn = document.getElementById('draw-delete-btn');
    if (delBtn) delBtn.style.display = '';
    // Populate property controls with element's current values
    populatePropsFromElement(el);
}

function updateSelectionRing() {
    if (!selectionRing || !selectedElement) return;
    try {
        var bbox = getSvgSpaceBBox(selectedElement);
        applySelectionRingFromBBox(bbox);
    } catch(e) {}
}

function deselectElement() {
    if (selectionRing && selectionRing.parentNode) {
        selectionRing.parentNode.removeChild(selectionRing);
    }
    selectionRing = null;
    if (selectedElement) {
        selectedElement = null;
    }
    var delBtn = document.getElementById('draw-delete-btn');
    if (delBtn) delBtn.style.display = 'none';
}

function populatePropsFromElement(el) {
    var tag = el.tagName.toLowerCase();
    var sz = 0;
    if (tag === 'circle') {
        // Read size from data attr or compute from radius
        sz = +el.getAttribute('data-draw-size');
        if (!sz) {
            var isHollow = el.getAttribute('fill') === 'none';
            var r;
            if (isHollow) {
                r = svgToGrid(+el.getAttribute('r') / 0.9);
            } else {
                r = svgToGrid(+el.getAttribute('r'));
            }
            sz = Math.round(r * 2); // radius → diameter = full size
        }
    } else if (tag === 'g') {
        sz = +el.getAttribute('data-draw-size');
        if (!sz) {
            // Legacy: try data-stamp-size
            sz = +el.getAttribute('data-stamp-size');
        }
        if (!sz) {
            var t = el.getAttribute('transform') || '';
            var sm = t.match(/scale\(\s*([\d.e+-]+)\s*\)/);
            if (sm) sz = Math.round(svgToGrid(+sm[1] * 100));
        }
    } else if (tag === 'text') {
        sz = +el.getAttribute('data-draw-size');
        if (!sz) {
            sz = Math.round(svgToGrid(+el.getAttribute('font-size')));
        }
        var ff = el.getAttribute('font-family') || 'Arial, sans-serif';
        drawFontFamily = ff;
        var sel = document.getElementById('draw-font-select');
        if (sel) {
            for (var i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === ff) { sel.selectedIndex = i; break; }
            }
        }
    }
    if (!sz) sz = 30;
    if (sz > 100) sz = 100;
    // Split into coarse (tens, 0-90) + fine (ones, 0-10)
    var coarse = Math.floor(sz / 10) * 10;
    if (coarse > 90) coarse = 90;
    var fine = sz - coarse;
    if (fine > 10) fine = 10;
    drawSizeCoarse = coarse;
    drawSizeFine = fine;
    var cSlider = document.getElementById('draw-coarse-slider');
    if (cSlider) cSlider.value = coarse;
    document.getElementById('draw-coarse-val').textContent = coarse;
    var fSlider = document.getElementById('draw-fine-slider');
    if (fSlider) fSlider.value = fine;
    document.getElementById('draw-fine-val').textContent = fine;
    updateTotalDisplay();
    // Restore over-scale state for imported stamps
    var overscaleRow = document.getElementById('draw-overscale-row');
    var overscaleSlider = document.getElementById('draw-overscale-slider');
    var overscaleLabel = document.getElementById('draw-overscale-val');
    var cropBtn = document.getElementById('draw-crop-btn');
    if (tag === 'g' && el.hasAttribute('data-imported-stamp')) {
        var savedScale = +el.getAttribute('data-over-scale') || 1;
        drawOverScale = savedScale;
        if (overscaleRow) overscaleRow.style.display = 'flex';
        if (overscaleSlider) overscaleSlider.value = savedScale;
        if (overscaleLabel) overscaleLabel.textContent = '\u00d7' + savedScale;
        if (cropBtn) cropBtn.style.display = 'inline-flex';
    } else {
        if (overscaleRow) overscaleRow.style.display = 'none';
        if (cropBtn) cropBtn.style.display = 'none';
    }
}

// --- Property change handlers (update selected element live) ---
function updateTotalDisplay() {
    var t = document.getElementById('draw-total-val');
    if (t) t.textContent = getEffectiveSize();
}
function onDrawCoarseChange(val) {
    drawSizeCoarse = +val;
    document.getElementById('draw-coarse-val').textContent = val;
    updateTotalDisplay();
    applyEffectiveSize();
}
function onDrawFineChange(val) {
    drawSizeFine = +val;
    document.getElementById('draw-fine-val').textContent = val;
    updateTotalDisplay();
    applyEffectiveSize();
}
// Apply the combined size (coarse + fine) to the currently selected element
function applyEffectiveSize() {
    if (!selectedElement) return;
    var sz = getEffectiveSize();
    var tag = selectedElement.tagName.toLowerCase();
    if (tag === 'circle') {
        hasEditedExisting = true;
        var halfSz = sz / 2;
        var isHollow = selectedElement.getAttribute('fill') === 'none';
        if (isHollow) {
            selectedElement.setAttribute('r', gridToSvg(halfSz * 0.9));
            selectedElement.setAttribute('stroke-width', gridToSvg(Math.max(1, Math.round(halfSz * 0.4))));
        } else {
            selectedElement.setAttribute('r', gridToSvg(halfSz));
        }
        selectedElement.setAttribute('data-draw-size', sz);
        updateSelectionRing();
    } else if (tag === 'g') {
        hasEditedExisting = true;
        var stampSizeSvg = gridToSvg(sz);
        if (stampSizeSvg < 1) stampSizeSvg = 1;
        var isImported = selectedElement.hasAttribute('data-imported-stamp');
        if (isImported) {
            stampSizeSvg = stampSizeSvg * drawOverScale;
            if (stampSizeSvg > 600) stampSizeSvg = 600; // max 10x card
        } else {
            if (stampSizeSvg > 60) stampSizeSvg = 60;
        }
        var scale = stampSizeSvg / 100;
        var t = selectedElement.getAttribute('transform') || '';
        var m = t.match(/translate\(\s*([\d.e+-]+)\s*,\s*([\d.e+-]+)\s*\)/);
        var oldScale = t.match(/scale\(\s*([\d.e+-]+)\s*\)/);
        if (m && oldScale) {
            var oldSz = +oldScale[1] * 100;
            var cx = +m[1] + oldSz / 2;
            var cy = +m[2] + oldSz / 2;
            selectedElement.setAttribute('transform', 'translate(' + (cx - stampSizeSvg / 2) + ',' + (cy - stampSizeSvg / 2) + ') scale(' + scale + ')');
        }
        if (isImported) {
            selectedElement.setAttribute('data-over-scale', drawOverScale);
        }
        selectedElement.setAttribute('data-draw-size', sz);
        updateSelectionRing();
    } else if (tag === 'text') {
        hasEditedExisting = true;
        selectedElement.setAttribute('font-size', gridToSvg(sz));
        selectedElement.setAttribute('data-draw-size', sz);
        updateSelectionRing();
    }
}
function onDrawFontFamilyChange(val) {
    drawFontFamily = val;
    if (selectedElement && selectedElement.tagName.toLowerCase() === 'text') {
        hasEditedExisting = true;
        selectedElement.setAttribute('font-family', val);
        updateSelectionRing();
    }
}

// --- Delete selected element ---
function drawDeleteSelected() {
    if (!selectedElement) return;
    // Remove from drawHistory if it's there
    var idx = drawHistory.indexOf(selectedElement);
    if (idx !== -1) drawHistory.splice(idx, 1);
    // Remove from SVG
    if (selectedElement.parentNode) selectedElement.parentNode.removeChild(selectedElement);
    hasEditedExisting = true;
    selectedElement = null;
    var delBtn = document.getElementById('draw-delete-btn');
    if (delBtn) delBtn.style.display = 'none';
}

var drawMouseDownHandler = null;
var drawClickHandler = null;
var justDragged = false; // flag to prevent click after drag

function attachDrawClickHandler() {
    var container = document.getElementById('loupe-card-container');

    // --- mousedown: only used to start dragging an existing element ---
    var lastMouseDownTime = 0;
    drawMouseDownHandler = function(e) {
        if (!drawModeActive) return;
        if (cropModeActive) return; // Don't start regular drag while crop/panning
        var target = e.target;
        if (!isSelectableElement(target)) return;
        target = getSelectableElement(target);
        // Detect rapid clicks (dblclick) — don't start drag
        var now = Date.now();
        if (now - lastMouseDownTime < 400) {
            lastMouseDownTime = now;
            return; // let dblclick fire cleanly
        }
        lastMouseDownTime = now;
        // Start drag on existing element
        var rect = container.getBoundingClientRect();
        var rawX = ((e.clientX - rect.left) / rect.width) * 60;
        var rawY = ((e.clientY - rect.top) / rect.height) * 60;
        // Transform to variation local coords if inside a variation <g>
        if (loupeVariationInverse && isInsideVariationG(target)) {
            var local = toVariationLocalCoords(rawX, rawY);
            rawX = local.x; rawY = local.y;
        }
        selectElement(target);
        selectDrawTool('select');
        isDragging = true;
        justDragged = false;
        dragStartX = rawX;
        dragStartY = rawY;
        var pos = getElementPos(target);
        elemStartX = pos.x;
        elemStartY = pos.y;
        e.preventDefault();
    };
    container.addEventListener('mousedown', drawMouseDownHandler);

    // --- click: used for drawing new elements, selecting, deselecting ---
    drawClickHandler = function(e) {
        if (!drawModeActive) return;
        if (cropModeActive) return; // Don't place elements while crop/panning
        // If we just finished a drag, don't also draw/select
        if (justDragged) { justDragged = false; return; }

        var rect = container.getBoundingClientRect();
        var rawX = ((e.clientX - rect.left) / rect.width) * 60;
        var rawY = ((e.clientY - rect.top) / rect.height) * 60;
        var target = e.target;

        // Click on existing element = select it (if not already dragging)
        if (isSelectableElement(target)) {
            selectElement(getSelectableElement(target));
            selectDrawTool('select');
            return;
        }

        // Click on empty space in select mode = deselect
        if (drawTool === 'select') {
            deselectElement();
            return;
        }

        // --- Drawing tools (only on empty space) ---
        // Transform coordinates to variation local space if applicable
        if (loupeVariationInverse) {
            var local = toVariationLocalCoords(rawX, rawY);
            rawX = local.x; rawY = local.y;
        }
        var x = snapToGrid(Math.max(-15, Math.min(60, rawX)));
        var y = snapToGrid(Math.max(-15, Math.min(60, rawY)));
        var cardSvg = container.querySelector('svg:not(.loupe-grid)');
        if (!cardSvg) return;

        var sz = getEffectiveSize();

        var el;
        if (drawTool === 'circle') {
            var halfSz = sz / 2;
            el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            el.setAttribute('cx', x);
            el.setAttribute('cy', y);
            el.setAttribute('r', gridToSvg(halfSz));
            el.setAttribute('fill', '#333');
            el.setAttribute('data-draw-size', sz);
        } else if (drawTool === 'hollow') {
            var halfSz = sz / 2;
            el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            el.setAttribute('cx', x);
            el.setAttribute('cy', y);
            el.setAttribute('r', gridToSvg(halfSz * 0.9));
            el.setAttribute('fill', 'none');
            el.setAttribute('stroke', '#333');
            el.setAttribute('stroke-width', gridToSvg(Math.max(1, Math.round(halfSz * 0.4))));
            el.setAttribute('data-draw-size', sz);
        } else if (drawTool === 'text') {
            var ch = selectedTextChar;
            if (!ch) return;
            el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            el.setAttribute('x', x);
            el.setAttribute('y', y);
            el.setAttribute('text-anchor', 'middle');
            el.setAttribute('font-size', gridToSvg(sz));
            el.setAttribute('font-family', drawFontFamily);
            el.setAttribute('font-weight', '500');
            el.setAttribute('fill', '#333');
            el.setAttribute('data-draw-size', sz);
            el.textContent = ch;
        } else if (stampSVGs[drawTool]) {
            var isImportedStamp = (typeof drawTool === 'string' && drawTool.indexOf('stamp-imported-') === 0);
            var stampSizeSvg = gridToSvg(sz);
            if (stampSizeSvg < 1) stampSizeSvg = 1;
            if (isImportedStamp) {
                stampSizeSvg = stampSizeSvg * drawOverScale;
                if (stampSizeSvg > 600) stampSizeSvg = 600;
            } else {
                if (stampSizeSvg > 60) stampSizeSvg = 60;
            }
            var scale = stampSizeSvg / 100;
            var ns = 'http://www.w3.org/2000/svg';
            el = document.createElementNS(ns, 'g');
            el.setAttribute('transform', 'translate(' + (x - stampSizeSvg / 2) + ',' + (y - stampSizeSvg / 2) + ') scale(' + scale + ')');
            el.innerHTML = stampSVGs[drawTool];
            el.setAttribute('data-draw-size', sz);
            if (isImportedStamp) {
                el.setAttribute('data-imported-stamp', 'true');
                el.setAttribute('data-over-scale', drawOverScale);
            }
        }
        if (el) {
            el.classList.add('draw-placed');
            // Append inside variation <g> if present, otherwise on SVG root
            var appendTarget = cardSvg.querySelector('g[data-variation-transform]') || cardSvg;
            appendTarget.appendChild(el);
            drawHistory.push(el);
        }
    };
    container.addEventListener('click', drawClickHandler);
    initCropDrag(container);

    // --- Double-click to edit text content ---
    container.addEventListener('dblclick', function(e) {
        if (!drawModeActive) return;
        // Auto-switch to select tool on dblclick
        if (drawTool !== 'select') selectDrawTool('select');
        var target = e.target;
        if (target.tagName.toLowerCase() === 'text' && isSelectableElement(target)) {
            e.preventDefault();
            e.stopPropagation();
            openInlineTextEditor(target, container);
        }
    });

    // --- Inline text editor (replaces prompt) ---
    function openInlineTextEditor(textEl, parentContainer) {
        // Remove any existing editor
        var old = document.getElementById('inline-text-editor');
        if (old) old.remove();
        // Create overlay
        var overlay = document.createElement('div');
        overlay.id = 'inline-text-editor';
        overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:9999;';
        var box = document.createElement('div');
        box.style.cssText = 'background:#2a2a3a;border:2px solid #FFD700;border-radius:10px;padding:16px 20px;min-width:220px;text-align:center;';
        var label = document.createElement('div');
        label.style.cssText = 'color:#ccc;font-size:13px;margin-bottom:8px;';
        label.textContent = 'Edit text:';
        box.appendChild(label);
        var input = document.createElement('input');
        input.type = 'text';
        input.value = textEl.textContent;
        input.style.cssText = 'width:100%;padding:8px 10px;font-size:16px;border:1px solid #555;border-radius:6px;background:#1a1a2a;color:white;outline:none;box-sizing:border-box;';
        box.appendChild(input);
        var btns = document.createElement('div');
        btns.style.cssText = 'display:flex;gap:8px;margin-top:10px;justify-content:center;';
        var okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.cssText = 'padding:6px 20px;border-radius:6px;border:none;background:#FFD700;color:#222;font-weight:bold;cursor:pointer;';
        var cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = 'padding:6px 20px;border-radius:6px;border:1px solid #555;background:transparent;color:#ccc;cursor:pointer;';
        btns.appendChild(okBtn);
        btns.appendChild(cancelBtn);
        box.appendChild(btns);
        overlay.appendChild(box);
        parentContainer.style.position = 'relative';
        parentContainer.appendChild(overlay);
        input.focus();
        input.select();
        function confirm() {
            var newText = input.value;
            if (newText !== textEl.textContent) {
                textEl.textContent = newText;
                hasEditedExisting = true;
                updateSelectionRing();
            }
            overlay.remove();
        }
        function cancel() { overlay.remove(); }
        okBtn.addEventListener('click', confirm);
        cancelBtn.addEventListener('click', cancel);
        input.addEventListener('keydown', function(ev) {
            if (ev.key === 'Enter') { ev.preventDefault(); confirm(); }
            if (ev.key === 'Escape') cancel();
            ev.stopPropagation(); // prevent arrow keys from moving elements
        });
        overlay.addEventListener('click', function(ev) {
            if (ev.target === overlay) cancel();
        });
    }

    // --- Mouse move for dragging ---
    drawMouseMoveHandler = function(e) {
        if (cropModeActive) return; // Don't interfere with crop/pan dragging
        if (!isDragging || !selectedElement) return;
        var rect = container.getBoundingClientRect();
        var rawX = ((e.clientX - rect.left) / rect.width) * 60;
        var rawY = ((e.clientY - rect.top) / rect.height) * 60;
        // Transform to variation local coords if dragging inside a variation <g>
        if (loupeVariationInverse && isInsideVariationG(selectedElement)) {
            var local = toVariationLocalCoords(rawX, rawY);
            rawX = local.x; rawY = local.y;
        }
        var dx = rawX - dragStartX;
        var dy = rawY - dragStartY;
        var newX = snapToGrid(Math.max(-15, Math.min(60, elemStartX + dx)));
        var newY = snapToGrid(Math.max(-15, Math.min(60, elemStartY + dy)));
        setElementPos(selectedElement, newX, newY);
        updateSelectionRing();
        hasEditedExisting = true;
        justDragged = true;
        e.preventDefault();
    };
    container.addEventListener('mousemove', drawMouseMoveHandler);

    // --- Mouse up to end drag ---
    drawMouseUpHandler = function(e) {
        if (isDragging) {
            isDragging = false;
        }
    };
    document.addEventListener('mouseup', drawMouseUpHandler);

    // --- Keyboard handler for arrow keys and Delete ---
    drawKeyHandler = function(e) {
        if (!selectedElement || !drawModeActive) return;
        var step = GRID_UNIT; // 1 grid unit
        if (e.shiftKey) step = GRID_UNIT * 5; // 5 grid units with shift
        var pos = getElementPos(selectedElement);
        // For elements inside a variation <g>, transform arrow directions
        // so visual movement matches the arrow keys
        var dxR = 0, dyR = 0, dxL = 0, dyL = 0, dxU = 0, dyU = 0, dxD = 0, dyD = 0;
        if (loupeVariationInverse && isInsideVariationG(selectedElement)) {
            var inv = loupeVariationInverse;
            // Transform unit vectors from root space to local space
            dxR = inv.a * step; dyR = inv.b * step;      // ArrowRight = (+step, 0) in root
            dxL = inv.a * -step; dyL = inv.b * -step;    // ArrowLeft = (-step, 0) in root
            dxU = inv.c * -step; dyU = inv.d * -step;    // ArrowUp = (0, -step) in root
            dxD = inv.c * step; dyD = inv.d * step;      // ArrowDown = (0, +step) in root
        } else {
            dxR = step; dyR = 0;
            dxL = -step; dyL = 0;
            dxU = 0; dyU = -step;
            dxD = 0; dyD = step;
        }
        if (e.key === 'ArrowLeft') {
            setElementPos(selectedElement, Math.max(-15, pos.x + dxL), Math.max(-15, Math.min(60, pos.y + dyL)));
            updateSelectionRing(); hasEditedExisting = true; e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            setElementPos(selectedElement, Math.min(60, pos.x + dxR), Math.max(-15, Math.min(60, pos.y + dyR)));
            updateSelectionRing(); hasEditedExisting = true; e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            setElementPos(selectedElement, Math.max(-15, Math.min(60, pos.x + dxU)), Math.max(-15, pos.y + dyU));
            updateSelectionRing(); hasEditedExisting = true; e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            setElementPos(selectedElement, Math.max(-15, Math.min(60, pos.x + dxD)), Math.min(60, pos.y + dyD));
            updateSelectionRing(); hasEditedExisting = true; e.preventDefault();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            drawDeleteSelected();
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', drawKeyHandler);

    container.style.cursor = (drawTool === 'select') ? 'default' : 'crosshair';
}

function detachDrawClickHandler() {
    var container = document.getElementById('loupe-card-container');
    if (drawMouseDownHandler) {
        container.removeEventListener('mousedown', drawMouseDownHandler);
        drawMouseDownHandler = null;
    }
    if (drawClickHandler) {
        container.removeEventListener('click', drawClickHandler);
        drawClickHandler = null;
    }
    if (drawMouseMoveHandler) {
        container.removeEventListener('mousemove', drawMouseMoveHandler);
        drawMouseMoveHandler = null;
    }
    if (drawMouseUpHandler) {
        document.removeEventListener('mouseup', drawMouseUpHandler);
        drawMouseUpHandler = null;
    }
    if (drawKeyHandler) {
        document.removeEventListener('keydown', drawKeyHandler);
        drawKeyHandler = null;
    }
    deselectElement();
    isDragging = false;
    justDragged = false;
    container.style.cursor = '';
}

function drawUndo() {
    if (drawHistory.length === 0) return;
    var last = drawHistory.pop();
    if (last && last.parentNode) last.parentNode.removeChild(last);
}

function drawSave() {
    var container = document.getElementById('loupe-card-container');
    var cardSvg = container.querySelector('svg:not(.loupe-grid)');
    if (!cardSvg) return;
    if (drawHistory.length === 0 && !hasEditedExisting && loupeSourceCard) {
        // No changes, just close
        closeLoupe();
        return;
    }
    deselectElement();
    // Build a clean SVG for the card
    var cleanSvg = cardSvg.cloneNode(true);
    cleanSvg.removeAttribute('style');
    cleanSvg.querySelectorAll('.draw-placed').forEach(function(el) {
        el.classList.remove('draw-placed');
    });
    cleanSvg.querySelectorAll('.draw-selected').forEach(function(el) {
        el.classList.remove('draw-selected');
    });
    cleanSvg.querySelectorAll('.draw-sel-ring').forEach(function(el) {
        el.parentNode.removeChild(el);
    });

    if (loupeSourceCard) {
        // Save back to existing card
        var origSvg = loupeSourceCard.querySelector('svg');
        if (origSvg) {
            origSvg.innerHTML = cleanSvg.innerHTML;
            // Mark as edited for persistence
            loupeSourceCard.dataset.edited = 'true';
        }
    } else {
        // New card: ask for name if not already set
        if (!pendingNewCardName) {
            var name = prompt('Card name (label):');
            if (!name || !name.trim()) return;
            pendingNewCardName = name.trim();
        }
        var _newLabel = pendingNewCardName;
        addNewDrawnCard(cleanSvg, pendingNewCardName);
        pendingNewCardName = null;
    }
    // Save variations (triggers localStorage save + marks dirty)
    if (typeof saveVariations === 'function') saveVariations();
    drawHistory = [];
    hasEditedExisting = false;
    closeLoupe();
    // Scroll the new card into view so the user can see it
    if (typeof _newLabel === 'string') {
        var _contentEl = document.querySelector('#domino-library-screen .domino-library-content');
        if (_contentEl) {
            var _allLabels = _contentEl.querySelectorAll('.library-card .library-label');
            for (var _li = 0; _li < _allLabels.length; _li++) {
                if (_allLabels[_li].textContent === _newLabel) {
                    _allLabels[_li].closest('.library-card').scrollIntoView({block: 'center'});
                    break;
                }
            }
        }
    }
}

// --- Loupe color palette ---
var drawColorList = [
    { color: '#333333', name: 'Black' },
    { color: '#CC0000', name: 'Red' },
    { color: '#0066CC', name: 'Blue' },
    { color: '#008800', name: 'Green' },
    { color: '#FF8C00', name: 'Orange' },
    { color: '#8B008B', name: 'Purple' },
    { color: '#8B4513', name: 'Brown' },
    { color: '#FF69B4', name: 'Pink' },
    { color: '#808080', name: 'Gray' },
    { color: '#FFFFFF', name: 'White' }
];
function initDrawColorSwatches() {
    var container = document.getElementById('draw-color-swatches');
    if (!container || container.children.length > 0) return;
    drawColorList.forEach(function(c) {
        var swatch = document.createElement('button');
        swatch.className = 'color-swatch';
        swatch.style.background = c.color;
        if (c.color === '#FFFFFF') swatch.style.border = '1px solid #999';
        swatch.title = c.name;
        swatch.onclick = function(e) {
            e.stopPropagation();
            applyColorInLoupe(c.color);
        };
        container.appendChild(swatch);
    });
}
function applyColorInLoupe(color) {
    // If an element is selected, color only that element
    if (selectedElement) {
        colorOneElement(selectedElement, color);
        hasEditedExisting = true;
        return;
    }
    // Nothing selected — color everything on the card
    var container = document.getElementById('loupe-card-container');
    var svg = container.querySelector('svg:not(.loupe-grid)');
    if (!svg) return;
    var all = svg.querySelectorAll('circle, ellipse, rect, polygon, path, line, polyline, text');
    for (var i = 0; i < all.length; i++) {
        if (all[i].closest('.draw-sel-ring')) continue;
        colorOneElement(all[i], color);
    }
    var stampGroups = svg.querySelectorAll('g.draw-placed');
    for (var g = 0; g < stampGroups.length; g++) {
        var innerEls = stampGroups[g].querySelectorAll('circle, ellipse, rect, polygon, path, line, polyline, text');
        for (var j = 0; j < innerEls.length; j++) {
            colorOneElement(innerEls[j], color);
        }
    }
    hasEditedExisting = true;
}
function colorOneElement(el, color) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'g') {
        // For group elements (stamps), color all children
        var kids = el.querySelectorAll('circle, ellipse, rect, polygon, path, line, polyline, text');
        for (var i = 0; i < kids.length; i++) {
            colorOneElement(kids[i], color);
        }
        return;
    }
    if (tag === 'text') {
        el.setAttribute('fill', color);
        return;
    }
    var fill = el.getAttribute('fill');
    var stroke = el.getAttribute('stroke');
    if (fill === 'none' && stroke) {
        el.setAttribute('stroke', color);
    } else if (fill && fill !== 'none') {
        el.setAttribute('fill', color);
    }
    if (stroke && stroke !== 'none') {
        el.setAttribute('stroke', color);
    }
}

// --- Loupe reflect/rotate ---
function toggleTransformSubmenu(groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var wasPinned = group.classList.contains('pinned');
    // Close both groups first
    document.querySelectorAll('.draw-hover-group.pinned').forEach(function(g) {
        g.classList.remove('pinned');
    });
    // Toggle the clicked one
    if (!wasPinned) group.classList.add('pinned');
}
function loupeTransformInPlace(transform) {
    var container = document.getElementById('loupe-card-container');
    var svg = container.querySelector('svg:not(.loupe-grid)');
    if (!svg) return;
    // Deselect any selected element first
    deselectElement();
    // Wrap all children in a <g> with the transform
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', transform);
    while (svg.firstChild) {
        g.appendChild(svg.firstChild);
    }
    svg.appendChild(g);
    hasEditedExisting = true;
}
function loupeCopyWithTransform(transform, desc) {
    if (!loupeSourceCard) return;
    var sourceLabel = '';
    var labelEl = loupeSourceCard.querySelector('.library-label');
    if (labelEl) sourceLabel = labelEl.textContent;

    // Get the current Loupe SVG content (may have been edited)
    var container = document.getElementById('loupe-card-container');
    var loupeSvg = container.querySelector('svg:not(.loupe-grid)');
    if (!loupeSvg) return;

    // Build a clean clone of the current Loupe state
    var cleanSvg = loupeSvg.cloneNode(true);
    cleanSvg.removeAttribute('style');
    cleanSvg.querySelectorAll('.draw-placed').forEach(function(el) { el.classList.remove('draw-placed'); });
    cleanSvg.querySelectorAll('.draw-selected').forEach(function(el) { el.classList.remove('draw-selected'); });
    cleanSvg.querySelectorAll('.draw-sel-ring').forEach(function(el) { el.parentNode.removeChild(el); });

    // Apply the transformation
    var transformedSvg = createVariationSVG(cleanSvg, transform);

    // Generate a label for the copy
    var copyLabel = generateCopyLabel(sourceLabel);

    // Insert as a new independent card in the library
    addCopyCard(transformedSvg, copyLabel, desc);
}
function generateCopyLabel(baseLabel) {
    // Use the same letter group as the source card, increment number
    var letter = baseLabel.charAt(0).toUpperCase();
    var num = getNextNumber(letter);
    return letter + num;
}
function addCopyCard(transformedSvg, copyLabel, desc) {
    if (!loupeSourceCard) return;
    var row = loupeSourceCard.closest('.library-row');
    if (!row) return;

    var card = document.createElement('div');
    card.className = 'library-card';
    card.dataset.custom = 'true';

    var labelEl = document.createElement('div');
    labelEl.className = 'library-label';
    labelEl.textContent = copyLabel;
    card.appendChild(labelEl);

    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    transformedSvg.setAttribute('viewBox', '0 0 60 60');
    transformedSvg.removeAttribute('width');
    transformedSvg.removeAttribute('height');
    transformedSvg.style.width = '';
    transformedSvg.style.height = '';
    preview.appendChild(transformedSvg);
    card.appendChild(preview);

    var descEl = document.createElement('div');
    descEl.className = 'library-desc';
    descEl.textContent = desc || 'Copy';
    card.appendChild(descEl);

    // Insert after the source card (and any existing copies/variations)
    var sourceLabel = loupeSourceCard.querySelector('.library-label') ? loupeSourceCard.querySelector('.library-label').textContent : '';
    var insertAfter = loupeSourceCard;
    var next = loupeSourceCard.nextElementSibling;
    while (next && next.classList.contains('library-card')) {
        var nextLabel = next.querySelector('.library-label');
        if (nextLabel && nextLabel.textContent.indexOf(sourceLabel) === 0) {
            insertAfter = next;
            next = next.nextElementSibling;
        } else {
            break;
        }
    }
    row.insertBefore(card, insertAfter.nextSibling);

    // Apply current zoom
    if (libZoom !== 1) {
        var cardSize = Math.round(70 * libZoom);
        var svgSize = Math.round(60 * libZoom);
        preview.style.width = cardSize + 'px';
        preview.style.height = cardSize + 'px';
        var svgEl = preview.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = svgSize + 'px';
            svgEl.style.height = svgSize + 'px';
        }
    }

    addCardDeleteButton(card);
    addVarButton(card);
    addCopyButton(card);
    // Save immediately
    if (typeof saveVariations === 'function') saveVariations();
}

function addNewDrawnCard(cleanSvg, cardName) {
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    var label = cardName || 'X1';

    // Determine which container this card belongs to
    var appendTarget;
    if (isCustomCardSet(activeCardSet)) {
        appendTarget = document.getElementById('card-set-custom') || content;
    } else if (activeCardSet === 'abc') {
        appendTarget = document.getElementById('card-set-abc') || content;
    } else {
        appendTarget = document.getElementById('card-set-numbers') || content;
    }

    // Find row matching this letter within the ACTIVE card set only
    // (searching across all sets could place cards in a hidden container)
    var firstChar = label.charAt(0).toUpperCase();
    var rows = appendTarget.querySelectorAll('.library-row');
    var targetRow = null;
    rows.forEach(function(r) {
        if ((r.dataset.rowLetter || '').toUpperCase() === firstChar) {
            targetRow = r;
        } else {
            var firstLabel = r.querySelector('.library-label');
            if (firstLabel && firstLabel.textContent.charAt(0).toUpperCase() === firstChar) {
                targetRow = r;
            }
        }
    });
    if (!targetRow) {
        var section = document.createElement('div');
        section.className = 'library-section';
        targetRow = document.createElement('div');
        targetRow.className = 'library-row';
        targetRow.dataset.rowLetter = firstChar;
        insertRowAlphabetically(appendTarget, section, targetRow, firstChar);
    }

    // Build card element
    var card = document.createElement('div');
    card.className = 'library-card';
    card.dataset.custom = 'true';
    var labelEl = document.createElement('div');
    labelEl.className = 'library-label';
    labelEl.textContent = label;
    card.appendChild(labelEl);
    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    cleanSvg.setAttribute('viewBox', '0 0 60 60');
    cleanSvg.removeAttribute('width');
    cleanSvg.removeAttribute('height');
    preview.appendChild(cleanSvg);
    card.appendChild(preview);
    var desc = document.createElement('div');
    desc.className = 'library-desc';
    desc.textContent = 'Custom card';
    card.appendChild(desc);
    targetRow.appendChild(card);
    updateRowEmptyState(targetRow);
    addCardDeleteButton(card);
    addVarButton(card);
    addCopyButton(card);

    // Apply current zoom
    if (libZoom !== 1) {
        var cardSize = Math.round(70 * libZoom);
        var svgSize = Math.round(60 * libZoom);
        preview.style.width = cardSize + 'px';
        preview.style.height = cardSize + 'px';
        cleanSvg.style.width = svgSize + 'px';
        cleanSvg.style.height = svgSize + 'px';
    }
}

function applyLibZoom() {
    const cardSize = Math.round(70 * libZoom);
    const svgSize = Math.round(60 * libZoom);
    document.querySelectorAll('.domino-half-preview').forEach(el => {
        el.style.width = cardSize + 'px';
        el.style.height = cardSize + 'px';
    });
    document.querySelectorAll('.domino-half-preview svg').forEach(el => {
        el.style.width = svgSize + 'px';
        el.style.height = svgSize + 'px';
    });
}

// Toggle card descriptions on Card Maker page
function toggleDescriptions() {
    const content = document.querySelector('#domino-library-screen .domino-library-content');
    const btn = document.getElementById('toggle-desc-btn');
    content.classList.toggle('compact-view');
    btn.textContent = content.classList.contains('compact-view') ? '>' : '<';
}

// Populate library set view with cards (no descriptions)
var libSetVarHidden = true;
function openLibrarySet() {
    const source = document.querySelector('#domino-library-screen .domino-library-content');
    const target = document.getElementById('library-set-content');
    // Keep the title, remove old cloned content
    target.querySelectorAll('.library-section, .library-row').forEach(el => el.remove());
    // Values for each row: A=0, B=1, C=2, D=3, E=4, F=5, G=6
    const rowValues = [0, 1, 2, 3, 4, 5, 6];
    let rowIndex = 0;
    // Clone rows from Card Maker
    source.querySelectorAll('.library-section, .library-row').forEach(el => {
        const clone = el.cloneNode(true);
        if (clone.classList.contains('library-row')) {
            // Prepend circle with value
            const circle = document.createElement('div');
            circle.className = 'library-circle';
            circle.textContent = rowValues[rowIndex] !== undefined ? rowValues[rowIndex] : '';
            clone.insertBefore(circle, clone.firstChild);
            rowIndex++;
            // Hide variation cards by default
            clone.querySelectorAll('.library-card.variation').forEach(function(v) {
                v.style.display = 'none';
            });
            // Remove variation delete buttons, variation boxes, and letter labels from clones
            clone.querySelectorAll('.variation-delete-btn').forEach(function(b) { b.remove(); });
            clone.querySelectorAll('.row-letter-label').forEach(function(b) { b.remove(); });
        }
        target.appendChild(clone);
    });
    // Add empty row at the bottom
    const emptySection = document.createElement('div');
    emptySection.className = 'library-section';
    target.appendChild(emptySection);
    const emptyRow = document.createElement('div');
    emptyRow.className = 'library-row';
    target.appendChild(emptyRow);
    // Reset toggle state
    libSetVarHidden = true;
    var btn = document.getElementById('toggle-lib-var-btn');
    if (btn) { btn.style.opacity = '0.4'; btn.title = 'Show variations'; }
}

function toggleLibSetVariations() {
    libSetVarHidden = !libSetVarHidden;
    var target = document.getElementById('library-set-content');
    target.querySelectorAll('.library-card.variation').forEach(function(v) {
        v.style.display = libSetVarHidden ? 'none' : '';
    });
    var btn = document.getElementById('toggle-lib-var-btn');
    btn.style.opacity = libSetVarHidden ? '0.4' : '1';
    btn.title = libSetVarHidden ? 'Show variations' : 'Hide variations';
}
// === Variation system ===
let activeVariationBox = null;
let activeVariationCard = null;

// Click handler on Card Maker content area
document.querySelector('#domino-library-screen .domino-library-content').addEventListener('click', function(e) {
    // Ignore clicks inside the variation box itself
    if (e.target.closest('.variation-box')) return;
    // Ignore clicks on action buttons
    if (e.target.closest('.variation-delete-btn') || e.target.closest('.card-delete-btn') || e.target.closest('.card-copy-btn')) return;
    // Ignore if a drag just ended
    if (cardDragJustEnded) { cardDragJustEnded = false; return; }
    // Ignore clicks on letter labels (new card mode)
    if (e.target.closest('.row-letter-label') || e.target.closest('.new-group-row')) return;

    const card = e.target.closest('.library-card');

    // Loupe mode: enlarge clicked card
    if (loupeMode && card) {
        openLoupe(card);
        return;
    }

    // Game Maker selection mode
    if (gameMakerActive) {
        if (!card) return;
        var label = card.querySelector('.library-label');
        if (!label) return;
        var labelText = label.textContent;
        if (card.classList.contains('card-selected')) {
            card.classList.remove('card-selected');
            gameMakerSelected = gameMakerSelected.filter(function(c) { return c.label !== labelText; });
        } else {
            var cardSvgEl = card.querySelector('svg');
            card.classList.add('card-selected');
            var info = { label: labelText, isVariation: card.classList.contains('variation') };
            if (info.isVariation) {
                info.originalLabel = card.dataset.originalLabel;
                info.transform = card.dataset.transform;
            }
            // Track which card set this card belongs to
            info.cardSet = activeCardSet === 'abc' ? 'ABC' : (isCustomCardSet(activeCardSet) ? activeCardSet : 'Numbers and Dots');
            // Store SVG markup for self-contained game data
            if (cardSvgEl) info.svgMarkup = cardSvgEl.innerHTML;
            gameMakerSelected.push(info);
        }
        return;
    }

    if (!card) {
        hideVariations();
        clearCardClicked();
        return;
    }
    var isVariation = card.classList.contains('variation');

    // Variation toolbar mode: apply selected tool to clicked card (not for variations)
    if (!isVariation && variationToolbarOpen && selectedVariationToolIndex >= 0) {
        var tool = variationTools[selectedVariationToolIndex];
        if (tool.transform === '__symbol_toggle__') {
            // Symbol toggle - swap element positions
            var svg = card.querySelector('svg');
            if (!svg) return;
            var elems = collectCardElements(svg);
            if (elems.length < 2) return;
            checkDuplicateAndAdd(card, tool.transform, tool.desc);
            return;
        }
        checkDuplicateAndAdd(card, tool.transform, tool.desc);
        return;
    }

    // Toggle card-clicked: show/hide delete cross
    if (card.classList.contains('card-clicked')) {
        card.classList.remove('card-clicked');
        hideVariations();
        return;
    }
    clearCardClicked();
    addCardDeleteButton(card);
    addCopyButton(card);
    card.classList.add('card-clicked');
});

// Double-click on a card: open in loupe with draw mode
document.querySelector('#domino-library-screen .domino-library-content').addEventListener('dblclick', function(e) {
    if (e.target.closest('.variation-box')) return;
    if (e.target.closest('.variation-delete-btn') || e.target.closest('.card-delete-btn') || e.target.closest('.card-copy-btn')) return;
    if (cardDragJustEnded) return;
    var card = e.target.closest('.library-card');
    if (!card) return;
    // Don't interfere with Game Maker selection
    if (gameMakerActive) return;
    // Close any open variation box and clear click state
    hideVariations();
    clearCardClicked();
    // Exit new card mode if active
    if (newCardModeActive) exitNewCardMode();
    // Open in loupe
    openLoupe(card);
    // Activate draw mode
    if (!drawModeActive) {
        toggleDrawMode();
    }
});

// --- Drag-to-move cards between rows AND reorder within rows ---
var cardDragJustEnded = false;
(function() {
    var contentEl = document.querySelector('#domino-library-screen .domino-library-content');
    if (!contentEl) return;
    var dragCard = null, dragStartX = 0, dragStartY = 0;
    var dragActive = false, dragPending = false;
    var dragSourceRow = null, dragOverRow = null;
    var dragCardSet = null;   // the card-set container the drag started in
    var dragPointerId = null; // pointer ID for capture
    var dropIndicator = null; // vertical line between cards
    var dropRefCard = null;   // card before which we'll insert
    var dropAtEnd = false;    // insert at end of row
    var DRAG_THRESHOLD = 8;

    // Create the drop indicator element (vertical line)
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'card-drop-indicator';
    dropIndicator.style.display = 'none';
    document.body.appendChild(dropIndicator);

    function hideDropIndicator() {
        dropIndicator.style.display = 'none';
        dropRefCard = null;
        dropAtEnd = false;
    }

    function findInsertPosition(row, pointerX) {
        // Get all non-variation cards in this row (skip the dragged card)
        var cards = Array.prototype.slice.call(
            row.querySelectorAll('.library-card:not(.variation)')
        ).filter(function(c) { return c !== dragCard; });
        if (cards.length === 0) return { refCard: null, atEnd: true, indicatorX: 0, indicatorTop: 0, indicatorHeight: 0 };

        // Find the gap the pointer is in
        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var midX = rect.left + rect.width / 2;
            if (pointerX < midX) {
                return {
                    refCard: cards[i],
                    atEnd: false,
                    indicatorX: rect.left - 4,
                    indicatorTop: rect.top,
                    indicatorHeight: rect.height
                };
            }
        }
        // Past the last card — insert at end
        var lastRect = cards[cards.length - 1].getBoundingClientRect();
        return {
            refCard: null,
            atEnd: true,
            indicatorX: lastRect.right + 2,
            indicatorTop: lastRect.top,
            indicatorHeight: lastRect.height
        };
    }

    contentEl.addEventListener('pointerdown', function(e) {
        if (e.button !== 0) return; // left button only
        // Don't drag from buttons
        if (e.target.closest('.card-delete-btn') || e.target.closest('.card-var-btn') ||
            e.target.closest('.card-copy-btn') || e.target.closest('.variation-delete-btn') ||
            e.target.closest('.variation-box')) return;
        var card = e.target.closest('.library-card');
        if (!card) return;
        dragCard = card;
        dragSourceRow = card.closest('.library-row');
        // Determine which card set this card belongs to (only allow dragging within the same set)
        dragCardSet = card.closest('.card-set-content') || contentEl;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragPending = true;
        dragActive = false;
        dragPointerId = e.pointerId;
    });

    document.addEventListener('pointermove', function(e) {
        if (!dragPending) return;
        var dx = e.clientX - dragStartX;
        var dy = e.clientY - dragStartY;
        if (!dragActive && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            dragActive = true;
            dragCard.classList.add('dragging');
            // Capture pointer for reliable touch drag
            try { contentEl.setPointerCapture(dragPointerId); } catch(ex) {}
        }
        if (!dragActive) return;
        // Find which row the pointer is over (only within the same card set)
        // Use expanded horizontal bounds so dragging to position 0 (left edge) is easier
        var ROW_HIT_MARGIN_X = 40;
        var ROW_HIT_MARGIN_Y = 10;
        var rows = (dragCardSet || contentEl).querySelectorAll('.library-row');
        var newOver = null;
        // First pass: check exact row bounds
        rows.forEach(function(row) {
            var rect = row.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
                e.clientX >= rect.left && e.clientX <= rect.right) {
                newOver = row;
            }
        });
        // Second pass: if not inside any row, check expanded bounds
        if (!newOver) {
            var bestDist = Infinity;
            rows.forEach(function(row) {
                var rect = row.getBoundingClientRect();
                if (e.clientY >= rect.top - ROW_HIT_MARGIN_Y && e.clientY <= rect.bottom + ROW_HIT_MARGIN_Y &&
                    e.clientX >= rect.left - ROW_HIT_MARGIN_X && e.clientX <= rect.right + ROW_HIT_MARGIN_X) {
                    // Pick closest row by vertical distance
                    var centerY = (rect.top + rect.bottom) / 2;
                    var dist = Math.abs(e.clientY - centerY);
                    if (dist < bestDist) {
                        bestDist = dist;
                        newOver = row;
                    }
                }
            });
        }
        if (newOver !== dragOverRow) {
            if (dragOverRow) dragOverRow.classList.remove('drag-over');
            dragOverRow = newOver;
            if (dragOverRow && dragOverRow !== dragSourceRow) {
                dragOverRow.classList.add('drag-over');
            }
        }
        // Show drop indicator for within-row reorder or cross-row insert position
        if (dragOverRow) {
            var pos = findInsertPosition(dragOverRow, e.clientX);
            dropRefCard = pos.refCard;
            dropAtEnd = pos.atEnd;
            if (pos.indicatorHeight > 0) {
                dropIndicator.style.display = 'block';
                dropIndicator.style.left = pos.indicatorX + 'px';
                dropIndicator.style.top = pos.indicatorTop + 'px';
                dropIndicator.style.height = pos.indicatorHeight + 'px';
            } else {
                hideDropIndicator();
            }
        } else {
            hideDropIndicator();
        }
    });

    document.addEventListener('pointerup', function(e) {
        if (!dragPending) return;
        if (dragActive) {
            var moved = false;
            var crossRowMove = false;
            if (dragOverRow) {
                if (dragOverRow !== dragSourceRow) {
                    // Cross-row move: insert at indicated position
                    if (dropRefCard) {
                        dragOverRow.insertBefore(dragCard, dropRefCard);
                    } else {
                        dragOverRow.appendChild(dragCard);
                    }
                    updateRowEmptyState(dragSourceRow);
                    updateRowEmptyState(dragOverRow);
                    // Renumber both source and target rows
                    renumberRow(dragSourceRow);
                    renumberRow(dragOverRow);
                    moved = true;
                    crossRowMove = true;
                } else {
                    // Same-row reorder: insert at indicated position
                    if (dropRefCard) {
                        dragOverRow.insertBefore(dragCard, dropRefCard);
                    } else {
                        dragOverRow.appendChild(dragCard);
                    }
                    // Renumber to reflect new order
                    renumberRow(dragOverRow);
                    moved = true;
                }
            }
            if (moved) {
                saveCardArrangement(dragCardSet ? dragCardSet.id : undefined);
                if (dragCardSet && dragCardSet.id === 'card-set-abc') saveAbcSnapshot();
                if (crossRowMove) {
                    if (typeof saveVariations === 'function') saveVariations();
                }
            }
            dragCard.classList.remove('dragging');
            if (dragOverRow) dragOverRow.classList.remove('drag-over');
            hideDropIndicator();
            // Release pointer capture
            try { contentEl.releasePointerCapture(dragPointerId); } catch(ex) {}
            // Prevent the click handler from firing
            cardDragJustEnded = true;
            setTimeout(function() { cardDragJustEnded = false; }, 50);
        }
        dragCard = null;
        dragSourceRow = null;
        dragOverRow = null;
        dragCardSet = null;
        dragPointerId = null;
        dragPending = false;
        dragActive = false;
    });
})();

function showVariations(card) {
    hideVariations();
    const row = card.closest('.library-row');
    if (!row) return;

    const label = card.querySelector('.library-label') ? card.querySelector('.library-label').textContent : '';
    const svg = card.querySelector('svg');
    if (!svg) return;

    const box = document.createElement('div');
    box.className = 'variation-box';

    // Header
    const header = document.createElement('div');
    header.className = 'variation-header';
    const headerSpan = document.createElement('span');
    headerSpan.textContent = 'Variations for ' + label;
    header.appendChild(headerSpan);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'variation-close-btn';
    closeBtn.textContent = '\u2715';
    closeBtn.onclick = function(e) { e.stopPropagation(); hideVariations(); };
    header.appendChild(closeBtn);
    box.appendChild(header);

    // Variation previews
    const items = document.createElement('div');
    items.className = 'variation-items';

    var transforms = [
        { label: '90\u00B0',  transform: 'rotate(90, 30, 30)',  desc: 'Rotate 90\u00B0' },
        { label: '180\u00B0', transform: 'rotate(180, 30, 30)', desc: 'Rotate 180\u00B0' },
        { label: '270\u00B0', transform: 'rotate(270, 30, 30)', desc: 'Rotate 270\u00B0' },
        { label: '\u2194',    transform: 'translate(60, 0) scale(-1, 1)',  desc: 'Flip horizontal' },
        { label: '\u2195',    transform: 'translate(0, 60) scale(1, -1)',  desc: 'Flip vertical' },
        { label: '\u2922',    transform: 'matrix(0, 1, 1, 0, 0, 0)',       desc: 'Flip diagonal' },
        { label: '\u2921',    transform: 'matrix(0, -1, -1, 0, 60, 60)',   desc: 'Flip anti-diagonal' }
    ];

    transforms.forEach(function(t) {
        var item = document.createElement('div');
        item.className = 'variation-item';

        var vlabel = document.createElement('div');
        vlabel.className = 'variation-item-label';
        vlabel.textContent = t.label;
        item.appendChild(vlabel);

        var preview = document.createElement('div');
        preview.className = 'variation-preview';
        preview.appendChild(createVariationSVG(svg, t.transform));
        item.appendChild(preview);

        var addBtn = document.createElement('button');
        addBtn.className = 'variation-add-btn';
        addBtn.textContent = 'Add';
        addBtn.onclick = function(e) {
            e.stopPropagation();
            checkDuplicateAndAdd(card, t.transform, t.desc);
        };
        item.appendChild(addBtn);

        items.appendChild(item);
    });

    box.appendChild(items);
    row.parentNode.insertBefore(box, row.nextSibling);
    activeVariationBox = box;
    activeVariationCard = card;
}

function hideVariations() {
    if (activeVariationBox) {
        activeVariationBox.remove();
        activeVariationBox = null;
        activeVariationCard = null;
    }
}

function clearCardClicked() {
    document.querySelectorAll('#domino-library-screen .library-card.card-clicked').forEach(function(c) {
        c.classList.remove('card-clicked');
    });
}

function applyColorToCard(card, color, mode) {
    var svg = card.querySelector('svg');
    if (!svg) return;

    var elements = svg.querySelectorAll('circle, ellipse, rect, polygon, path, line, polyline');
    var textElements = svg.querySelectorAll('text');

    if (mode === 'picture') {
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var fill = el.getAttribute('fill');
            var stroke = el.getAttribute('stroke');
            // Hollow elements (fill=none): change stroke color
            if (fill === 'none' && stroke) {
                el.setAttribute('stroke', color);
            } else if (fill && fill !== 'none') {
                el.setAttribute('fill', color);
            }
        }
        // Also color stamp <g> children (polygons, circles inside groups)
        var stampGroups = svg.querySelectorAll('g.draw-placed');
        for (var g = 0; g < stampGroups.length; g++) {
            var innerEls = stampGroups[g].querySelectorAll('circle, ellipse, rect, polygon, path, line, polyline');
            for (var j = 0; j < innerEls.length; j++) {
                var el = innerEls[j];
                var fill = el.getAttribute('fill');
                if (fill && fill !== 'none') {
                    el.setAttribute('fill', color);
                }
                var stroke = el.getAttribute('stroke');
                if (stroke) {
                    el.setAttribute('stroke', color);
                }
            }
        }
    } else if (mode === 'text') {
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].setAttribute('fill', color);
        }
    }
}

function createVariationSVG(originalSVG, transformStr) {
    var svg = originalSVG.cloneNode(true);
    // Remove any inline size styles (from zoom)
    svg.style.width = '';
    svg.style.height = '';

    if (transformStr === '__symbol_toggle__') {
        // Symbol toggle: swap positions of placed elements
        applySymbolToggle(svg);
        return svg;
    }

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', transformStr);
    g.setAttribute('data-variation-transform', '1');
    while (svg.firstChild) {
        g.appendChild(svg.firstChild);
    }
    svg.appendChild(g);
    return svg;
}

// Get the position of an SVG element (center point)
function getElementPosition(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'text') {
        return { x: parseFloat(el.getAttribute('x')) || 0, y: parseFloat(el.getAttribute('y')) || 0 };
    } else if (tag === 'circle') {
        return { x: parseFloat(el.getAttribute('cx')) || 0, y: parseFloat(el.getAttribute('cy')) || 0 };
    } else if (tag === 'ellipse') {
        return { x: parseFloat(el.getAttribute('cx')) || 0, y: parseFloat(el.getAttribute('cy')) || 0 };
    } else if (tag === 'rect') {
        var w = parseFloat(el.getAttribute('width')) || 0;
        var h = parseFloat(el.getAttribute('height')) || 0;
        return { x: (parseFloat(el.getAttribute('x')) || 0) + w / 2, y: (parseFloat(el.getAttribute('y')) || 0) + h / 2 };
    } else if (tag === 'g') {
        var t = el.getAttribute('transform') || '';
        var m = t.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
        if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
        return { x: 0, y: 0 };
    }
    return { x: 0, y: 0 };
}

// Set position of an SVG element
function setElementPosition(el, pos) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'text') {
        el.setAttribute('x', pos.x);
        el.setAttribute('y', pos.y);
    } else if (tag === 'circle' || tag === 'ellipse') {
        el.setAttribute('cx', pos.x);
        el.setAttribute('cy', pos.y);
    } else if (tag === 'rect') {
        var w = parseFloat(el.getAttribute('width')) || 0;
        var h = parseFloat(el.getAttribute('height')) || 0;
        el.setAttribute('x', pos.x - w / 2);
        el.setAttribute('y', pos.y - h / 2);
    } else if (tag === 'g') {
        var t = el.getAttribute('transform') || '';
        var m = t.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
        if (m) {
            var oldX = parseFloat(m[1]), oldY = parseFloat(m[2]);
            var newT = t.replace(/translate\(\s*[-\d.]+\s*,\s*[-\d.]+\s*\)/, 'translate(' + pos.x + ',' + pos.y + ')');
            el.setAttribute('transform', newT);
        }
    }
}

// Collect top-level placed elements from an SVG card
function collectCardElements(svg) {
    var elements = [];
    // Get direct children of the SVG (or unwrap one level of <g> wrapper from previous transforms)
    var searchRoot = svg;
    var children = searchRoot.children;
    for (var i = 0; i < children.length; i++) {
        var ch = children[i];
        var tag = ch.tagName.toLowerCase();
        if (tag === 'text' || tag === 'circle' || tag === 'ellipse' || tag === 'rect' || tag === 'g') {
            elements.push(ch);
        }
    }
    // If we only found one <g> wrapper (from a previous variation transform), look inside it
    if (elements.length === 1 && elements[0].tagName.toLowerCase() === 'g') {
        var inner = [];
        var innerChildren = elements[0].children;
        for (var j = 0; j < innerChildren.length; j++) {
            var ich = innerChildren[j];
            var itag = ich.tagName.toLowerCase();
            if (itag === 'text' || itag === 'circle' || itag === 'ellipse' || itag === 'rect' || itag === 'g') {
                inner.push(ich);
            }
        }
        if (inner.length >= 2) return inner;
    }
    return elements;
}

// Check if an SVG element is a math operator (not a numeral/letter)
function isMathOperator(el) {
    if (el.tagName.toLowerCase() !== 'text') return false;
    var ch = (el.textContent || '').trim();
    return ch === '+' || ch === '-' || ch === '\u00D7' || ch === '\u00F7' || ch === '=';
}

// Apply symbol toggle: swap positions of numeral/symbol elements, leaving operators in place
function applySymbolToggle(svg) {
    var elements = collectCardElements(svg);
    if (elements.length < 2) return;

    // Separate numerals/symbols from operators
    var numerals = [];
    for (var i = 0; i < elements.length; i++) {
        if (!isMathOperator(elements[i])) {
            numerals.push(elements[i]);
        }
    }
    if (numerals.length < 2) return;

    // Collect positions of numerals only
    var positions = numerals.map(function(el) { return getElementPosition(el); });

    // Rotate positions of numerals: element 0 gets position of element 1, etc.
    for (var i = 0; i < numerals.length; i++) {
        var nextIdx = (i + 1) % numerals.length;
        setElementPosition(numerals[i], positions[nextIdx]);
    }
}

// --- Duplicate variation detection ---
function svgToPixels(svgEl, callback) {
    var clone = svgEl.cloneNode(true);
    clone.setAttribute('width', '60');
    clone.setAttribute('height', '60');
    clone.style.width = '';
    clone.style.height = '';
    var str = new XMLSerializer().serializeToString(clone);
    var url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(str)));
    var img = new Image();
    img.onload = function() {
        var c = document.createElement('canvas');
        c.width = 60; c.height = 60;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 60, 60);
        try { callback(ctx.getImageData(0, 0, 60, 60).data); }
        catch(e) { callback(null); }
    };
    img.onerror = function() { callback(null); };
    img.src = url;
}

function pixelsMatch(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    var diff = 0, total = a.length / 4;
    for (var i = 0; i < a.length; i += 4) {
        if (Math.abs(a[i] - b[i]) > 12 || Math.abs(a[i+1] - b[i+1]) > 12 ||
            Math.abs(a[i+2] - b[i+2]) > 12 || Math.abs(a[i+3] - b[i+3]) > 12) diff++;
    }
    return diff / total < 0.03;
}

function highlightDuplicateCard(cardEl) {
    cardEl.classList.add('duplicate-highlight');
}

function clearDuplicateHighlights() {
    document.querySelectorAll('.duplicate-highlight').forEach(function(el) {
        el.classList.remove('duplicate-highlight');
    });
}

function showDuplicateConfirm(callback) {
    var overlay = document.getElementById('duplicate-var-overlay');
    overlay.style.display = 'flex';
    var confirmBtn = document.getElementById('dup-var-confirm-btn');
    var cancelBtn = document.getElementById('dup-var-cancel-btn');
    function cleanup() {
        overlay.style.display = 'none';
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
    }
    confirmBtn.onclick = function() { cleanup(); callback(true); };
    cancelBtn.onclick = function() { cleanup(); callback(false); };
}

function checkDuplicateAndAdd(originalCard, transform, desc) {
    var label = originalCard.querySelector('.library-label') ? originalCard.querySelector('.library-label').textContent : '';
    var row = originalCard.closest('.library-row');
    var svg = originalCard.querySelector('svg');
    if (!row || !svg) return;

    // Collect cards to compare: original + existing variations of this card
    var compareCards = [originalCard];
    row.querySelectorAll('.library-card.variation[data-original-label="' + label + '"]').forEach(function(v) {
        compareCards.push(v);
    });

    // Render the new variation to pixels
    var newVarSvg = createVariationSVG(svg, transform);
    svgToPixels(newVarSvg, function(newPixels) {
        if (!newPixels) {
            // Canvas failed, fall back to just adding
            addVariation(originalCard, transform, desc);
            return;
        }

        // Compare against each existing card in parallel
        var remaining = compareCards.length;
        var matchCard = null;

        compareCards.forEach(function(cardEl) {
            var cardSvg = cardEl.querySelector('svg');
            if (!cardSvg) { remaining--; checkDone(); return; }
            svgToPixels(cardSvg.cloneNode(true), function(existingPixels) {
                if (!matchCard && pixelsMatch(newPixels, existingPixels)) {
                    matchCard = cardEl;
                }
                remaining--;
                checkDone();
            });
        });

        function checkDone() {
            if (remaining > 0) return;
            if (matchCard) {
                // Found a visual duplicate - highlight it and ask
                highlightDuplicateCard(matchCard);
                showDuplicateConfirm(function(confirmed) {
                    clearDuplicateHighlights();
                    if (confirmed) addVariation(originalCard, transform, desc);
                });
            } else {
                addVariation(originalCard, transform, desc);
            }
        }
    });
}

function addVariation(originalCard, transform, desc, skipSave, editedSvgContent) {
    var row = originalCard.closest('.library-row');
    var label = originalCard.querySelector('.library-label') ? originalCard.querySelector('.library-label').textContent : '';
    var svg = originalCard.querySelector('svg');
    if (!row || !svg) return;

    // Create variation card
    var card = document.createElement('div');
    card.className = 'library-card variation';
    card.dataset.originalLabel = label;
    card.dataset.transform = transform;
    card.dataset.desc = desc;

    var cardLabel = document.createElement('div');
    cardLabel.className = 'library-label';
    card.appendChild(cardLabel);

    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    if (editedSvgContent) {
        // Use previously edited SVG content
        var editedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        editedSvg.setAttribute('viewBox', '0 0 60 60');
        editedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        editedSvg.innerHTML = editedSvgContent;
        preview.appendChild(editedSvg);
        card.dataset.edited = 'true';
    } else {
        preview.appendChild(createVariationSVG(svg, transform));
    }
    card.appendChild(preview);

    // Delete button
    var delBtn = document.createElement('button');
    delBtn.className = 'variation-delete-btn';
    delBtn.textContent = '\u2715';
    delBtn.onclick = function(e) {
        e.stopPropagation();
        removeVariation(card);
    };
    card.appendChild(delBtn);

    // Description
    var descEl = document.createElement('div');
    descEl.className = 'library-desc';
    descEl.textContent = desc;
    card.appendChild(descEl);

    // Insert after original card and any existing variations of this card
    var insertAfter = originalCard;
    var next = originalCard.nextElementSibling;
    while (next && next.classList.contains('variation') && next.dataset.originalLabel === label) {
        insertAfter = next;
        next = next.nextElementSibling;
    }
    row.insertBefore(card, insertAfter.nextSibling);

    renumberVariations(row, label);

    // Apply current zoom to the new card
    if (libZoom !== 1) {
        var cardSize = Math.round(70 * libZoom);
        var svgSize = Math.round(60 * libZoom);
        preview.style.width = cardSize + 'px';
        preview.style.height = cardSize + 'px';
        var svgEl = preview.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = svgSize + 'px';
            svgEl.style.height = svgSize + 'px';
        }
    }

    // Respect current hide-variations state
    if (variationsHidden) {
        card.style.display = 'none';
    }

    if (!skipSave) saveVariations();
}

function removeVariation(card) {
    var row = card.closest('.library-row');
    var label = card.dataset.originalLabel;
    card.remove();
    if (row && label) renumberVariations(row, label);
    saveVariations();
}

// --- Delete any card (built-in or custom) with confirmation ---
function addCardDeleteButton(card) {
    // Don't double-add; variations already have their own delete button
    if (card.querySelector('.card-delete-btn') || (card.classList.contains('variation') && card.querySelector('.variation-delete-btn'))) return;
    var btn = document.createElement('button');
    btn.className = 'card-delete-btn';
    btn.textContent = '\u2715';
    btn.onclick = function(e) {
        e.stopPropagation();
        confirmDeleteCard(card);
    };
    card.appendChild(btn);
}

function addVarButton(card) {
    if (card.querySelector('.card-var-btn') || card.classList.contains('variation')) return;
    var btn = document.createElement('button');
    btn.className = 'card-var-btn';
    btn.textContent = 'v';
    btn.title = 'Variations';
    btn.onclick = function(e) {
        e.stopPropagation();
        showVariations(card);
    };
    card.appendChild(btn);
}

function addCopyButton(card) {
    if (card.querySelector('.card-copy-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'card-copy-btn';
    btn.textContent = '\u29C9'; // ⧉
    btn.title = 'Copy card';
    btn.onclick = function(e) {
        e.stopPropagation();
        copyCardInRow(card);
    };
    card.appendChild(btn);
}

function copyCardInRow(sourceCard) {
    var row = sourceCard.closest('.library-row');
    if (!row) return;
    var labelEl = sourceCard.querySelector('.library-label');
    var baseLabel = labelEl ? labelEl.textContent : '';
    var descEl = sourceCard.querySelector('.library-desc');
    var descText = descEl ? descEl.textContent : '';
    var svgEl = sourceCard.querySelector('svg');
    if (!svgEl) return;

    // Generate unique label
    var letter = baseLabel.charAt(0).toUpperCase();
    var copyLabel = letter + getNextNumber(letter);

    // Build the new card element
    var card = document.createElement('div');
    card.className = 'library-card';
    card.dataset.custom = 'true';

    var newLabel = document.createElement('div');
    newLabel.className = 'library-label';
    newLabel.textContent = copyLabel;
    card.appendChild(newLabel);

    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    var clonedSvg = svgEl.cloneNode(true);
    clonedSvg.setAttribute('viewBox', '0 0 60 60');
    clonedSvg.removeAttribute('width');
    clonedSvg.removeAttribute('height');
    clonedSvg.style.width = '';
    clonedSvg.style.height = '';
    preview.appendChild(clonedSvg);
    card.appendChild(preview);

    var newDesc = document.createElement('div');
    newDesc.className = 'library-desc';
    newDesc.textContent = descText || 'Copy';
    card.appendChild(newDesc);

    // Insert after source card and its copies/variations
    var insertAfter = sourceCard;
    var next = sourceCard.nextElementSibling;
    while (next && next.classList.contains('library-card')) {
        var nl = next.querySelector('.library-label');
        if (nl && nl.textContent.indexOf(baseLabel) === 0) {
            insertAfter = next;
            next = next.nextElementSibling;
        } else {
            break;
        }
    }
    row.insertBefore(card, insertAfter.nextSibling);

    // Apply current zoom
    if (typeof libZoom !== 'undefined' && libZoom !== 1) {
        var cardSize = Math.round(70 * libZoom);
        var svgSize = Math.round(60 * libZoom);
        preview.style.width = cardSize + 'px';
        preview.style.height = cardSize + 'px';
        var s = preview.querySelector('svg');
        if (s) { s.style.width = svgSize + 'px'; s.style.height = svgSize + 'px'; }
    }

    addCardDeleteButton(card);
    addVarButton(card);
    addCopyButton(card);
    if (typeof saveVariations === 'function') saveVariations();
}

function addDeleteButtonsToAllCards() {
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    content.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
        addCardDeleteButton(card);
        addVarButton(card);
        addCopyButton(card);
    });
}

function confirmDeleteCard(card) {
    var label = card.querySelector('.library-label');
    var labelText = label ? label.textContent : 'this card';
    if (!confirm('Delete card "' + labelText + '"? This cannot be undone.')) return;
    deleteCard(card);
}

// --- Row letter labels & empty-row management ---
// Ensure a row has a data-row-letter and update its empty/non-empty visual state
function getRowLetter(row) {
    if (row.dataset.rowLetter) return row.dataset.rowLetter;
    var firstLabel = row.querySelector('.library-label');
    if (firstLabel) return firstLabel.textContent.charAt(0).toUpperCase();
    return '';
}
function updateRowEmptyState(row) {
    if (!row) return;
    var hasCards = row.querySelectorAll('.library-card').length > 0;
    row.classList.toggle('empty-row', !hasCards);
}
// Assign data-row-letter to every row and set initial empty state
function initRowLetters() {
    var container = document.getElementById('card-set-numbers');
    if (!container) return;
    container.querySelectorAll('.library-row').forEach(function(row) {
        var letter = getRowLetter(row);
        if (letter) row.dataset.rowLetter = letter;
        updateRowEmptyState(row);
    });
}
// Sort rows inside a container alphabetically by data-row-letter
function sortRowsAlphabetically() {
    var container = document.getElementById('card-set-numbers');
    if (!container) return;
    // Collect section+row pairs
    var pairs = [];
    var rows = container.querySelectorAll('.library-row');
    rows.forEach(function(row) {
        var section = row.previousElementSibling;
        if (section && section.classList.contains('library-section')) {
            pairs.push({ section: section, row: row, letter: (row.dataset.rowLetter || getRowLetter(row) || 'Z').toUpperCase() });
        } else {
            // Create a section if missing
            section = document.createElement('div');
            section.className = 'library-section';
            pairs.push({ section: section, row: row, letter: (row.dataset.rowLetter || getRowLetter(row) || 'Z').toUpperCase() });
        }
    });
    pairs.sort(function(a, b) { return a.letter < b.letter ? -1 : a.letter > b.letter ? 1 : 0; });
    pairs.forEach(function(p) {
        container.appendChild(p.section);
        container.appendChild(p.row);
    });
}
// Insert a new row at the correct alphabetical position
function insertRowAlphabetically(container, section, row, letter) {
    var existingRows = container.querySelectorAll('.library-row');
    var insertBefore = null;
    for (var i = 0; i < existingRows.length; i++) {
        var rl = (existingRows[i].dataset.rowLetter || '').toUpperCase();
        if (rl > letter.toUpperCase()) {
            // Insert before this row's section
            var prevSec = existingRows[i].previousElementSibling;
            insertBefore = (prevSec && prevSec.classList.contains('library-section')) ? prevSec : existingRows[i];
            break;
        }
    }
    if (insertBefore) {
        container.insertBefore(section, insertBefore);
        container.insertBefore(row, insertBefore);
    } else {
        container.appendChild(section);
        container.appendChild(row);
    }
}

// --- Unified card arrangement persistence (row + order) ---
function saveCardArrangement(setId) {
    var id = setId || 'card-set-numbers';
    var container = document.getElementById(id);
    if (!container) return;
    var arrangement = {};
    container.querySelectorAll('.library-row').forEach(function(row) {
        var letter = row.dataset.rowLetter;
        if (!letter) return;
        var labels = [];
        row.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
            var lbl = card.querySelector('.library-label');
            if (lbl) labels.push(lbl.textContent);
        });
        arrangement[letter] = labels;
    });
    var storageKey = id === 'card-set-abc' ? 'cardArrangement_abc' : 'cardArrangement';
    localStorage.setItem(storageKey, JSON.stringify(arrangement));
}
function applyCardArrangement(setId) {
    var id = setId || 'card-set-numbers';
    var storageKey = id === 'card-set-abc' ? 'cardArrangement_abc' : 'cardArrangement';
    var data;
    try { data = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) { return; }
    if (!data || Object.keys(data).length === 0) return;
    var container = document.getElementById(id);
    if (!container) return;
    // Build map of all card elements by label
    var allCards = {};
    container.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
        var lbl = card.querySelector('.library-label');
        if (lbl) allCards[lbl.textContent] = card;
    });
    // Build map of all rows by letter
    var rowMap = {};
    container.querySelectorAll('.library-row').forEach(function(row) {
        if (row.dataset.rowLetter) rowMap[row.dataset.rowLetter] = row;
    });
    // Move cards to their saved rows in saved order
    Object.keys(data).forEach(function(letter) {
        var targetRow = rowMap[letter];
        var labels = data[letter];
        if (!targetRow) {
            // Only create a missing row if it has at least one existing card
            var hasCard = labels.some(function(label) { return !!allCards[label]; });
            if (!hasCard) return;
            var section = document.createElement('div');
            section.className = 'library-section';
            targetRow = document.createElement('div');
            targetRow.className = 'library-row';
            targetRow.dataset.rowLetter = letter;
            insertRowAlphabetically(container, section, targetRow, letter);
            rowMap[letter] = targetRow;
        }
        var labelSet = {};
        labels.forEach(function(label) {
            labelSet[label] = true;
            var card = allCards[label];
            if (!card) return;
            targetRow.appendChild(card);
            delete allCards[label]; // mark as placed
        });
        // Append any untracked cards (new/custom cards not in saved arrangement)
        // to the end of the row so they don't float to the beginning
        targetRow.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
            var lbl = card.querySelector('.library-label');
            if (lbl && !labelSet[lbl.textContent]) {
                targetRow.appendChild(card);
            }
        });
    });
    // Update empty states for all rows
    container.querySelectorAll('.library-row').forEach(function(row) {
        updateRowEmptyState(row);
    });
}

function deleteCard(card) {
    var row = card.closest('.library-row');
    var label = card.querySelector('.library-label');
    var labelText = label ? label.textContent : '';

    // Persist deletion so built-in cards don't reappear on rebuild
    // Only track built-in card deletions — custom cards are managed
    // via customDrawnCards_abc and don't need deletion tracking.
    if (labelText && activeCardSet === 'abc' && card.dataset.custom !== 'true') {
        try {
            var delRaw = localStorage.getItem('deletedCards_abc');
            var deleted = delRaw ? JSON.parse(delRaw) : [];
            if (deleted.indexOf(labelText) === -1) deleted.push(labelText);
            localStorage.setItem('deletedCards_abc', JSON.stringify(deleted));
        } catch(e) {}
    }

    // Also remove any variations of this card
    if (row && labelText) {
        row.querySelectorAll('.library-card.variation[data-original-label="' + labelText + '"]').forEach(function(v) {
            v.remove();
        });
    }

    card.remove();

    // Update empty-row visual state (row stays, shows letter placeholder)
    if (row) updateRowEmptyState(row);

    // Renumber remaining cards sequentially
    if (row) renumberRow(row);

    saveVariations();
    saveCardArrangement(activeCardSet === 'abc' ? 'card-set-abc' : 'card-set-numbers');
    if (activeCardSet === 'abc') saveAbcSnapshot();
}

// Renumber all cards in a row sequentially: A1, A2, A3...
function renumberRow(row) {
    var letter = row.dataset.rowLetter;
    if (!letter) return;
    var cards = row.querySelectorAll('.library-card:not(.variation)');
    var num = 1;
    cards.forEach(function(card) {
        var lbl = card.querySelector('.library-label');
        if (lbl) lbl.textContent = letter + num;
        num++;
    });
}

function renumberVariations(row, originalLabel) {
    var letter = originalLabel.charAt(0).toUpperCase();
    var variations = row.querySelectorAll('.library-card.variation[data-original-label="' + originalLabel + '"]');
    variations.forEach(function(v) {
        var lbl = v.querySelector('.library-label');
        if (lbl) {
            var num = getNextNumber(letter);
            lbl.textContent = letter + num;
        }
    });
}

// --- Persistence: save/load variations to localStorage ---
function saveVariations() {
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    var vars = content.querySelectorAll('.library-card.variation');
    var data = [];
    vars.forEach(function(v) {
        // Determine which card set this variation belongs to
        var cardSetId = '';
        var parent = v.closest('.card-set-content');
        if (parent) {
            if (parent.id === 'card-set-abc') cardSetId = 'abc';
            else if (parent.id === 'card-set-custom') cardSetId = 'custom';
            else cardSetId = 'numbers';
        }
        var entry = {
            originalLabel: v.dataset.originalLabel,
            transform: v.dataset.transform,
            desc: v.dataset.desc || '',
            cardSet: cardSetId
        };
        // Save edited SVG content for variations that have been modified
        if (v.dataset.edited) {
            var svgEl = v.querySelector('svg');
            if (svgEl) entry.svgContent = svgEl.innerHTML;
        }
        data.push(entry);
    });
    localStorage.setItem('cardMakerVariations', JSON.stringify(data));
    // Also save custom drawn cards
    saveCustomCards();
    // Persist current card arrangement (row assignments + order)
    saveCardArrangement(activeCardSet === 'abc' ? 'card-set-abc' : 'card-set-numbers');
    if (activeCardSet === 'abc') saveAbcSnapshot();
    // Mark as dirty for save/cancel prompt
    cardMakerDirty = true;
}

// --- Persistence: save/load custom drawn cards to localStorage ---
function saveCustomCards() {
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    var numbersDiv = document.getElementById('card-set-numbers');
    var abcDiv = document.getElementById('card-set-abc');
    var data = [];
    // Save newly created custom cards (have 'Custom card' description or data-custom)
    // Only save custom cards from Numbers set (ABC cards are managed by buildAbcCardSet)
    var customScope = numbersDiv || content;
    customScope.querySelectorAll('.library-card[data-custom="true"]').forEach(function(card) {
        var lbl = card.querySelector('.library-label');
        var svg = card.querySelector('svg');
        if (lbl && svg) {
            data.push({
                label: lbl.textContent,
                svgContent: svg.innerHTML,
                desc: (card.querySelector('.library-desc') || {}).textContent || 'Custom card',
                cardSet: 'Numbers and Dots'
            });
        }
    });
    // Also save custom cards from orphaned rows (appended outside card-set containers)
    var children = content.children;
    for (var ci = 0; ci < children.length; ci++) {
        var ch = children[ci];
        if (ch.id === 'card-set-numbers' || ch.id === 'card-set-abc') continue;
        if (!ch.classList.contains('library-row')) continue;
        ch.querySelectorAll('.library-card[data-custom="true"]').forEach(function(card) {
            var lbl = card.querySelector('.library-label');
            var svg = card.querySelector('svg');
            if (lbl && svg) {
                data.push({
                    label: lbl.textContent,
                    svgContent: svg.innerHTML,
                    desc: (card.querySelector('.library-desc') || {}).textContent || 'Custom card',
                    cardSet: 'Numbers and Dots'
                });
            }
        });
    }
    localStorage.setItem('customDrawnCards', JSON.stringify(data));

    // Save edits to built-in cards — only save the ACTIVE set to avoid
    // wiping the other set's data when its container is empty/hidden
    if (activeCardSet === 'abc') {
        var abcEdits = [];
        var abcCustom = [];
        if (abcDiv) {
            abcDiv.querySelectorAll('.library-card[data-edited="true"]:not([data-custom="true"])').forEach(function(card) {
                var lbl = card.querySelector('.library-label');
                var svg = card.querySelector('svg');
                if (lbl && svg) {
                    abcEdits.push({ label: lbl.textContent, svgContent: svg.innerHTML });
                }
            });
            abcDiv.querySelectorAll('.library-card[data-custom="true"]').forEach(function(card) {
                var lbl = card.querySelector('.library-label');
                var svg = card.querySelector('svg');
                if (lbl && svg) {
                    abcCustom.push({
                        label: lbl.textContent,
                        svgContent: svg.innerHTML,
                        desc: (card.querySelector('.library-desc') || {}).textContent || 'Copy'
                    });
                }
            });
        }
        localStorage.setItem('editedBuiltinCards_abc', JSON.stringify(abcEdits));
        localStorage.setItem('customDrawnCards_abc', JSON.stringify(abcCustom));
        saveAbcSnapshot();
    } else if (isCustomCardSet(activeCardSet)) {
        // Save custom set cards — but only if the Card Maker is actually open.
        // The #card-set-custom div is only populated when entering the Card Maker
        // via buildCustomCardSet(). If we save while just previewing in the Library,
        // the div is empty and we'd overwrite localStorage with an empty array.
        var cardMakerScreen = document.getElementById('domino-library-screen');
        if (cardMakerScreen && cardMakerScreen.style.display !== 'none') {
            var customDiv = document.getElementById('card-set-custom');
            var customData = [];
            if (customDiv) {
                customDiv.querySelectorAll('.library-card[data-custom="true"]').forEach(function(card) {
                    var lbl = card.querySelector('.library-label');
                    var svg = card.querySelector('svg');
                    if (lbl && svg) {
                        customData.push({
                            label: lbl.textContent,
                            svgContent: svg.innerHTML,
                            desc: (card.querySelector('.library-desc') || {}).textContent || 'Custom card'
                        });
                    }
                });
            }
            localStorage.setItem('customDrawnCards_' + activeCardSet, JSON.stringify(customData));
        }
    }
}

function loadCustomCards() {
    // Load custom drawn cards
    var saved = localStorage.getItem('customDrawnCards');
    if (saved) {
        try {
            var data = JSON.parse(saved);
            data.forEach(function(item) {
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 60 60');
                svg.innerHTML = item.svgContent;
                addNewDrawnCard(svg, item.label);
            });
        } catch(e) {}
    }

}

var _deferredVariations = { abc: [], custom: [] };
function loadVariations() {
    var saved = localStorage.getItem('cardMakerVariations');
    if (!saved) return;
    try {
        var data = JSON.parse(saved);
        data.forEach(function(v) {
            // Defer ABC and custom card set variations until those sets are built
            if (v.cardSet === 'abc') {
                _deferredVariations.abc.push(v);
                return;
            }
            if (v.cardSet === 'custom') {
                _deferredVariations.custom.push(v);
                return;
            }
            var originalCard = findCardByLabel(v.originalLabel);
            if (originalCard) {
                addVariation(originalCard, v.transform, v.desc, true, v.svgContent);
            } else if (!v.cardSet) {
                // Backward compat: old data without cardSet — card might be
                // in ABC or custom set which isn't built yet; defer for both
                _deferredVariations.abc.push(v);
                _deferredVariations.custom.push(v);
            }
        });
    } catch(e) {}
}
function loadDeferredVariations(setType) {
    var deferred = _deferredVariations[setType] || [];
    if (deferred.length === 0) return;
    var cardSetName = setType === 'abc' ? 'ABC' : undefined;
    deferred.forEach(function(v) {
        var originalCard = findCardByLabel(v.originalLabel, cardSetName);
        if (originalCard) {
            addVariation(originalCard, v.transform, v.desc, true, v.svgContent);
        }
    });
    _deferredVariations[setType] = [];
}

function gameLabelToCardMakerLabel(gameLabel) {
    // Reverse of cardMakerLabelToGameLabel: A01 -> A1, B02 -> B2, etc.
    var m = gameLabel.match(/^([A-Z])0(\d)$/);
    return m ? m[1] + m[2] : gameLabel;
}

function findCardByLabel(label, cardSet) {
    var root;
    if (cardSet === 'ABC') {
        root = document.getElementById('card-set-abc');
    } else if (cardSet === 'Numbers and Dots') {
        root = document.getElementById('card-set-numbers');
    } else if (cardSet && cardSet !== 'ABC' && cardSet !== 'Numbers and Dots') {
        // Custom card set — look in #card-set-custom first
        root = document.getElementById('card-set-custom');
    }
    if (!root) root = document.querySelector('#domino-library-screen .domino-library-content');
    // For ABC cards, game labels (A01) differ from Card Maker labels (A1)
    var altLabel = (cardSet === 'ABC') ? gameLabelToCardMakerLabel(label) : null;
    var cards = root.querySelectorAll('.library-card:not(.variation)');
    for (var i = 0; i < cards.length; i++) {
        var lbl = cards[i].querySelector('.library-label');
        if (lbl && (lbl.textContent === label || (altLabel && lbl.textContent === altLabel))) return cards[i];
    }
    return null;
}

// --- Hide/show all variations toggle ---
var variationsHidden = false;
function toggleVariationVisibility() {
    variationsHidden = !variationsHidden;
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    var btn = document.getElementById('toggle-var-btn');
    content.querySelectorAll('.library-card.variation').forEach(function(v) {
        v.style.display = variationsHidden ? 'none' : '';
    });
    btn.textContent = variationsHidden ? 'V\u2212' : 'V+';
    btn.style.opacity = variationsHidden ? '0.4' : '1';
    btn.title = variationsHidden ? 'Show variations' : 'Hide variations';
}

// --- Variation creation toolbar ---
var variationToolbarOpen = false;
var selectedVariationToolIndex = -1;
var variationTools = [
    { transform: 'translate(60, 0) scale(-1, 1)',  desc: 'Vertical axis reflection' },
    { transform: 'translate(0, 60) scale(1, -1)',  desc: 'Horizontal axis reflection' },
    { transform: 'matrix(0, 1, 1, 0, 0, 0)',       desc: 'Diagonal reflection (\\)' },
    { transform: 'matrix(0, -1, -1, 0, 60, 60)',   desc: 'Diagonal reflection (/)' },
    { transform: 'rotate(90, 30, 30)',  desc: 'Rotate 90\u00B0' },
    { transform: 'rotate(180, 30, 30)', desc: 'Rotate 180\u00B0' },
    { transform: 'rotate(270, 30, 30)', desc: 'Rotate 270\u00B0' },
    { transform: '__symbol_toggle__',    desc: 'Toggle symbols' }
];

function toggleVariationToolbar() {
    variationToolbarOpen = !variationToolbarOpen;
    var tb = document.getElementById('variation-toolbar');
    var btn = document.getElementById('var-tool-btn');
    tb.style.display = variationToolbarOpen ? 'flex' : 'none';
    btn.style.opacity = variationToolbarOpen ? '1' : '';
    if (variationToolbarOpen) {
        btn.style.boxShadow = '0 0 0 2px #FFD700';
        // Position toolbar to the right of the V button
        var rect = btn.getBoundingClientRect();
        var parent = tb.offsetParent || document.body;
        var parentRect = parent.getBoundingClientRect();
        tb.style.top = (rect.top - parentRect.top) + 'px';
        tb.style.left = (rect.right - parentRect.left + 4) + 'px';
    } else {
        btn.style.boxShadow = '';
        selectedVariationToolIndex = -1;
        tb.querySelectorAll('.var-tool-btn').forEach(function(b) { b.classList.remove('active'); });
    }
}

function selectVariationTool(index, btnEl) {
    var tb = document.getElementById('variation-toolbar');
    var btns = tb.querySelectorAll('.var-tool-btn');
    if (selectedVariationToolIndex === index) {
        selectedVariationToolIndex = -1;
        if (btnEl) btnEl.classList.remove('active');
        else btns.forEach(function(b) { b.classList.remove('active'); });
    } else {
        selectedVariationToolIndex = index;
        btns.forEach(function(b) { b.classList.remove('active'); });
        if (btnEl) btnEl.classList.add('active');
    }
}

// Load saved custom cards and variations on startup
loadCustomCards();
loadVariations();

// Auto-save all card data before page unload (prevents data loss on refresh)
window.addEventListener('beforeunload', function() {
    if (typeof saveVariations === 'function') saveVariations();
});

// Migrate orphaned custom card rows into #card-set-numbers
// (fixes cards created by old addNewDrawnCard that placed new rows outside the container)
(function migrateOrphanedCustomCards() {
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    var numbersDiv = document.getElementById('card-set-numbers');
    if (!content || !numbersDiv) return;
    var children = Array.from(content.children);
    children.forEach(function(ch) {
        if (ch.id === 'card-set-numbers' || ch.id === 'card-set-abc') return;
        if (ch.classList.contains('library-title')) return;
        if (ch.classList.contains('library-section') || ch.classList.contains('library-row')) {
            numbersDiv.appendChild(ch);
        }
    });
})();

addDeleteButtonsToAllCards();
initRowLetters();
sortRowsAlphabetically();
// Use unified arrangement (replaces old cardRowOverrides + cardOrderInRows)
applyCardArrangement();
// Re-save arrangement so localStorage stays in sync with the actual DOM
// (removes stale entries for rows that no longer exist)
saveCardArrangement();
// Clear stale data from previous versions (caused corruption)
localStorage.removeItem('cardOrderInRows');
localStorage.removeItem('cardRowOverrides');

// Restore variations that were wrongly removed from Card Maker
// (due to old bug where game view delete removed from Card Maker globally)
function restoreMissingVariations() {
    var games = [];
    try {
        var gd = localStorage.getItem('savedCustomGames');
        games = gd ? JSON.parse(gd) : [];
    } catch(e) { return; }

    // Collect all unique variations referenced by any game
    var neededVars = {};
    games.forEach(function(game) {
        if (!game.cards) return;
        game.cards.forEach(function(c) {
            if (c.isVariation && c.originalLabel && c.transform) {
                var key = c.originalLabel + ':' + c.transform;
                if (!neededVars[key]) {
                    neededVars[key] = { originalLabel: c.originalLabel, transform: c.transform };
                }
            }
        });
    });

    // Load current Card Maker variations
    var existing = {};
    try {
        var saved = localStorage.getItem('cardMakerVariations');
        var data = saved ? JSON.parse(saved) : [];
        data.forEach(function(v) {
            existing[v.originalLabel + ':' + v.transform] = true;
        });
    } catch(e) {}

    // Find missing ones and re-add them
    var added = false;
    Object.keys(neededVars).forEach(function(key) {
        if (existing[key]) return; // already exists
        var v = neededVars[key];
        var originalCard = findCardByLabel(v.originalLabel);
        if (!originalCard) return; // original card not found
        addVariation(originalCard, v.transform, '', true);
        added = true;
    });

    if (added) saveVariations();
}
restoreMissingVariations();

// === Game Maker system ===
var gameMakerActive = false;
var gameMakerName = '';
var gameMakerDesc = '';
var gameMakerSelected = []; // array of { label, isVariation, originalLabel?, transform? }
var gameMakerEditIndex = -1; // -1 = new game, >= 0 = editing existing game

function toggleGmPopup() {
    var popup = document.getElementById('gm-popup');
    if (popup.style.display !== 'none') {
        popup.style.display = 'none';
        return;
    }
    // Build the list
    popup.innerHTML = '';
    var games = loadCustomGames();
    // "+ New Game" first
    var newBtn = document.createElement('button');
    newBtn.className = 'gm-popup-btn gm-new-game';
    newBtn.textContent = '+ New Game';
    newBtn.onclick = function() {
        popup.style.display = 'none';
        var name = prompt('Game name:');
        if (!name || !name.trim()) return;
        gameMakerEditIndex = -1;
        gameMakerName = name.trim();
        gameMakerDesc = '';
        enterSelectionMode();
    };
    popup.appendChild(newBtn);
    // Existing games
    games.forEach(function(game, i) {
        var row = document.createElement('div');
        row.className = 'gm-popup-row';
        // Game name button → opens Game View
        var btn = document.createElement('button');
        btn.className = 'gm-popup-btn';
        btn.textContent = game.name;
        btn.onclick = function() {
            popup.style.display = 'none';
            openGameView(i, 'domino-library-screen');
        };
        row.appendChild(btn);
        // Edit (pencil) button → enters selection mode
        var editBtn = document.createElement('button');
        editBtn.className = 'gm-popup-edit-btn';
        editBtn.innerHTML = '&#9998;'; // pencil icon
        editBtn.title = 'Edit card selection';
        editBtn.onclick = function(e) {
            e.stopPropagation();
            popup.style.display = 'none';
            gameMakerEditIndex = i;
            gameMakerName = game.name;
            gameMakerDesc = game.description || '';
            enterSelectionMode();
        };
        row.appendChild(editBtn);
        popup.appendChild(row);
    });
    popup.style.display = 'flex';
}

// Close GM popup when clicking outside
document.addEventListener('click', function(e) {
    var popup = document.getElementById('gm-popup');
    if (popup && popup.style.display !== 'none') {
        if (!e.target.closest('.gm-popup') && !e.target.closest('#gm-btn')) {
            popup.style.display = 'none';
        }
    }
    // Close draw tool submenus on click outside
    if (!e.target.closest('.draw-tool-group')) {
        closeAllSubmenus();
    }
});

function enterSelectionMode() {
    // Save all card edits before entering game maker mode
    if (typeof saveVariations === 'function') saveVariations();
    gameMakerActive = true;
    gameMakerSelected = [];
    // Close any open variation box
    hideVariations();
    // Clear previous selections
    document.querySelectorAll('#domino-library-screen .library-card.card-selected').forEach(function(c) {
        c.classList.remove('card-selected');
    });
    // If editing, pre-highlight existing cards
    if (gameMakerEditIndex >= 0) {
        var games = loadCustomGames();
        var existingCards = games[gameMakerEditIndex].cards || [];
        var allCards = document.querySelectorAll('#domino-library-screen .library-card');
        var matched = {};
        existingCards.forEach(function(ec) {
            var ecKey = ec.label;
            if (matched[ecKey]) return; // skip duplicates
            var found = false;
            allCards.forEach(function(cardEl) {
                if (found) return;
                var lbl = cardEl.querySelector('.library-label');
                if (!lbl) return;
                // Match by label text first
                if (lbl.textContent === ec.label) {
                    found = true;
                }
                // For variations, also match by originalLabel + transform
                // (in case subscript numbers changed after renumbering)
                if (!found && ec.isVariation && cardEl.classList.contains('variation') &&
                    cardEl.dataset.originalLabel === ec.originalLabel &&
                    cardEl.dataset.transform === ec.transform) {
                    found = true;
                    ecKey = lbl.textContent; // use current label
                }
                if (found && !matched[ecKey]) {
                    var info = { label: lbl.textContent, isVariation: ec.isVariation };
                    if (ec.isVariation) {
                        info.originalLabel = ec.originalLabel;
                        info.transform = ec.transform;
                    }
                    // Preserve card set from existing data, or determine from active set
                    info.cardSet = ec.cardSet || (activeCardSet === 'abc' ? 'ABC' : (isCustomCardSet(activeCardSet) ? activeCardSet : 'Numbers and Dots'));
                    // Store SVG markup for self-contained game data
                    var cardSvgEl = cardEl.querySelector('svg');
                    if (cardSvgEl) info.svgMarkup = cardSvgEl.innerHTML;
                    cardEl.classList.add('card-selected');
                    gameMakerSelected.push(info);
                    matched[ecKey] = true;
                }
            });
        });
    }
    // Show game name in title span
    var titleSpan = document.getElementById('card-maker-set-title');
    if (gameMakerEditIndex >= 0) {
        titleSpan.textContent = 'Editing: ' + gameMakerName;
        titleSpan.style.color = '#FFD700';
    } else {
        titleSpan.textContent = 'New game: ' + gameMakerName;
        titleSpan.style.color = '#FFD700';
    }
    // Red box around unselected cards when editing existing game
    var cmContent = document.querySelector('#domino-library-screen .domino-library-content');
    if (gameMakerEditIndex >= 0) {
        cmContent.classList.add('game-maker-editing');
    } else {
        cmContent.classList.remove('game-maker-editing');
    }
    // Show selection bar
    var actionWord = gameMakerEditIndex >= 0 ? 'Edit' : 'Select';
    document.getElementById('game-maker-bar-text').textContent = actionWord + ' cards for \u201C' + gameMakerName + '\u201D';
    document.getElementById('game-maker-bar').style.display = 'flex';
}

function cancelGameMaker() {
    gameMakerActive = false;
    gameMakerSelected = [];
    document.getElementById('game-maker-bar').style.display = 'none';
    document.querySelectorAll('#domino-library-screen .library-card.card-selected').forEach(function(c) {
        c.classList.remove('card-selected');
    });
    // Remove red box styling
    var cmContent = document.querySelector('#domino-library-screen .domino-library-content');
    cmContent.classList.remove('game-maker-editing');
    // Restore original title
    var titleSpan = document.getElementById('card-maker-set-title');
    titleSpan.textContent = activeCardSet === 'abc' ? 'ABC' : 'Numbers and Dots';
    titleSpan.style.color = '';
}

function completeGame() {
    if (gameMakerSelected.length === 0) {
        alert('Please select at least one card.');
        return;
    }
    // Reorder gameMakerSelected to match Card Maker DOM order
    // so the game view matches the visual card arrangement
    var selectedByLabel = {};
    gameMakerSelected.forEach(function(info) { selectedByLabel[info.label] = info; });
    var ordered = [];
    var cardSetContainer = activeCardSet === 'abc'
        ? document.getElementById('card-set-abc')
        : isCustomCardSet(activeCardSet)
            ? document.getElementById('card-set-custom')
            : document.getElementById('card-set-numbers');
    // Scan all visible library cards in DOM order (includes orphaned rows for Numbers set)
    var contentArea = document.querySelector('#domino-library-screen .domino-library-content');
    var scanRoot = cardSetContainer || contentArea;
    if (scanRoot) {
        scanRoot.querySelectorAll('.library-card').forEach(function(cardEl) {
            var lbl = cardEl.querySelector('.library-label');
            if (!lbl) return;
            var labelText = lbl.textContent;
            if (selectedByLabel[labelText]) {
                ordered.push(selectedByLabel[labelText]);
                delete selectedByLabel[labelText];
            }
        });
    }
    // Append any remaining cards not found in DOM (shouldn't happen, but be safe)
    Object.keys(selectedByLabel).forEach(function(label) {
        ordered.push(selectedByLabel[label]);
    });
    gameMakerSelected = ordered;
    if (gameMakerSelected.length === 0) {
        alert('Please select at least one card.');
        return;
    }

    // Save the game
    var games = loadCustomGames();
    if (gameMakerEditIndex >= 0) {
        // Track novel cards: cards in new selection not in the original game
        var oldLabels = {};
        (games[gameMakerEditIndex].cards || []).forEach(function(c) {
            if (!c.isVariation) oldLabels[c.label] = true;
        });
        var novelLabels = getNovelCards(gameMakerEditIndex);
        gameMakerSelected.forEach(function(c) {
            if (!c.isVariation && !oldLabels[c.label] && novelLabels.indexOf(c.label) < 0) {
                novelLabels.push(c.label);
            }
        });
        saveNovelCards(gameMakerEditIndex, novelLabels);
        // Also remove novel labels for cards removed from the game
        var newLabels = {};
        gameMakerSelected.forEach(function(c) { if (!c.isVariation) newLabels[c.label] = true; });
        novelLabels = novelLabels.filter(function(l) { return newLabels[l]; });
        saveNovelCards(gameMakerEditIndex, novelLabels);

        // Update existing game
        games[gameMakerEditIndex].description = gameMakerDesc;
        games[gameMakerEditIndex].cards = gameMakerSelected;
        alert('The game \u201C' + gameMakerName + '\u201D has been updated!');
    } else {
        // Create new game - no novel cards (everything is new)
        games.push({
            name: gameMakerName,
            description: gameMakerDesc,
            cards: gameMakerSelected
        });
        alert('The game \u201C' + gameMakerName + '\u201D is completed!');
    }
    saveCustomGames(games);

    // Exit selection mode
    cancelGameMaker();

    // Refresh game lists
    populateLibraryGames();
    populateStartScreenGames();
    populateCardMakerGames();
}

// loadCustomGames() is now in js/shared-data.js

// --- Game view ---
var gameViewReturnScreen = 'card-library-screen';

var currentGameViewIndex = -1;
var lastDeletedGameViewVariation = null;
var gameViewEraseMode = false;

// getDominoKey, getExcludedDominos, saveExcludedDominos,
// getExcludedVariations, saveExcludedVariations, getVariationKey
// are now in js/shared-data.js

function toggleGameViewEraseMode() {
    gameViewEraseMode = !gameViewEraseMode;
    var btn = document.getElementById('game-view-erase-btn');
    if (btn) {
        btn.style.opacity = gameViewEraseMode ? '1' : '0.4';
        btn.style.boxShadow = gameViewEraseMode ? '0 0 0 3px #ff4444, 0 0 10px rgba(255,68,68,0.4)' : '';
        btn.title = gameViewEraseMode ? 'Exit erase mode' : 'Erase cards from game';
    }
    var container = document.getElementById('game-view-cards');
    if (!container) return;
    if (gameViewEraseMode) {
        container.classList.add('erase-mode');
    } else {
        container.classList.remove('erase-mode');
    }
}

// Get the effective row letter for a game card.
// Uses the explicit gameRow property if set, otherwise falls back to
// the first character of the card label.
function getCardRow(card) {
    return card.gameRow || card.label.charAt(0);
}

function eraseGameCard(label, gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    // Find the card being erased so we can use its effective row
    var erasedCard = game.cards.find(function(c) { return c.label === label; });
    var rowLetter = erasedCard ? getCardRow(erasedCard) : label.charAt(0);
    // Count how many unique row letters remain (excluding the card being erased)
    var remainingInRow = game.cards.filter(function(c) {
        return !c.isVariation && c.label !== label && getCardRow(c) === rowLetter;
    }).length;
    var totalOrigCards = game.cards.filter(function(c) {
        return !c.isVariation && c.label !== label;
    }).length;
    if (totalOrigCards < 2) {
        alert('Cannot erase: game must keep at least 2 cards.');
        return;
    }
    // Remove the card and its variations from the game
    game.cards = game.cards.filter(function(c) {
        if (c.label === label) return false;
        if (c.isVariation && c.originalLabel === label) return false;
        return true;
    });
    // Also clean up excluded dominos that reference this card
    var excludedKeys = getExcludedDominos(gameIndex);
    excludedKeys = excludedKeys.filter(function(key) {
        return key.indexOf(label + ':') < 0 && key.indexOf(':' + label) < 0;
    });
    saveExcludedDominos(gameIndex, excludedKeys);
    // Remove erased card from novel cards list
    var novelLabels = getNovelCards(gameIndex);
    novelLabels = novelLabels.filter(function(l) { return l !== label; });
    saveNovelCards(gameIndex, novelLabels);
    saveCustomGames(games);
    // Refresh the game view
    openGameView(gameIndex, gameViewReturnScreen);
    // Re-enter erase mode
    gameViewEraseMode = false;
    toggleGameViewEraseMode();
}

function eraseGameRow(rowLetter, gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    var labelsToRemove = [];
    game.cards.forEach(function(c) {
        if (getCardRow(c) === rowLetter) labelsToRemove.push(c.label);
        if (c.isVariation && c.originalLabel) {
            var origCard = game.cards.find(function(o) { return o.label === c.originalLabel; });
            if (origCard && getCardRow(origCard) === rowLetter) labelsToRemove.push(c.label);
        }
    });
    // Check that enough cards remain
    var remaining = game.cards.filter(function(c) {
        return !c.isVariation && labelsToRemove.indexOf(c.label) < 0;
    });
    if (remaining.length < 2) {
        alert('Cannot erase row: game must keep at least 2 cards.');
        return;
    }
    if (!confirm('Erase all "' + rowLetter + '" cards from this game?')) return;
    game.cards = game.cards.filter(function(c) {
        return labelsToRemove.indexOf(c.label) < 0;
    });
    // Clean up excluded dominos referencing erased cards
    var excludedKeys = getExcludedDominos(gameIndex);
    var origLabels = labelsToRemove.filter(function(l) { return l.length <= 3; }); // original labels only
    excludedKeys = excludedKeys.filter(function(key) {
        for (var i = 0; i < origLabels.length; i++) {
            if (key.indexOf(origLabels[i] + ':') >= 0 || key.indexOf(':' + origLabels[i]) >= 0) return false;
        }
        return true;
    });
    saveExcludedDominos(gameIndex, excludedKeys);
    // Remove erased cards from novel cards list
    var novelLabels = getNovelCards(gameIndex);
    novelLabels = novelLabels.filter(function(l) { return labelsToRemove.indexOf(l) < 0; });
    saveNovelCards(gameIndex, novelLabels);
    saveCustomGames(games);
    openGameView(gameIndex, gameViewReturnScreen);
    gameViewEraseMode = false;
    toggleGameViewEraseMode();
}

// --- Add cards to game from game view ---
var gameViewAddMode = false;

function toggleGameViewAddCards() {
    var area = document.getElementById('game-view-add-cards-area');
    var btn = document.getElementById('game-view-add-btn');
    if (area && area.style.display !== 'none') {
        // Hide
        area.style.display = 'none';
        if (btn) { btn.style.opacity = ''; btn.style.boxShadow = ''; }
        gameViewAddMode = false;
        return;
    }
    gameViewAddMode = true;
    if (btn) { btn.style.opacity = '1'; btn.style.boxShadow = '0 0 8px #7eff7e'; }
    // Build or show area
    if (!area) {
        area = document.createElement('div');
        area.id = 'game-view-add-cards-area';
        var container = document.getElementById('game-view-cards');
        // Insert before buttons row (last few children) but after card rows
        container.appendChild(area);
    }
    area.style.display = 'block';
    buildAvailableCardsArea(currentGameViewIndex, area);
}

function buildAvailableCardsArea(gameIndex, area) {
    area.innerHTML = '';
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;

    // Collect labels already in this game (non-variation originals)
    var inGame = {};
    game.cards.forEach(function(c) {
        if (!c.isVariation) inGame[c.label] = true;
    });

    // Collect all card set sources to enumerate
    var sources = [];
    // Numbers and Dots
    sources.push({ name: 'Numbers and Dots', key: 'numbers', cardSetValue: 'Numbers and Dots' });
    // ABC
    sources.push({ name: 'ABC', key: 'abc', cardSetValue: 'ABC' });
    // Custom sets
    var customSets = loadCardSets();
    customSets.forEach(function(setName) {
        sources.push({ name: setName, key: setName, cardSetValue: setName, isCustom: true });
    });

    // Check if any deleted built-in sets should be hidden
    var deletedBuiltin = [];
    try {
        deletedBuiltin = JSON.parse(localStorage.getItem('deletedBuiltinSets') || '[]');
    } catch(e) {}

    var hasAnyAvailable = false;

    sources.forEach(function(source) {
        // Skip deleted built-in sets
        if (!source.isCustom && deletedBuiltin.indexOf(source.key) >= 0) return;

        var availableCards = getAvailableCardsFromSet(source, inGame);
        if (availableCards.length === 0) return;

        hasAnyAvailable = true;

        // Accordion header – clickable card set title
        var setHeader = document.createElement('div');
        setHeader.className = 'add-cards-set-header add-cards-accordion-header';
        setHeader.textContent = source.name;
        setHeader.title = 'Click to expand';
        area.appendChild(setHeader);

        // Collapsible body (hidden by default)
        var body = document.createElement('div');
        body.className = 'add-cards-accordion-body';
        body.style.display = 'none';
        area.appendChild(body);

        // Toggle accordion on header click
        (function(headerEl, bodyEl) {
            headerEl.onclick = function() {
                var isOpen = bodyEl.style.display !== 'none';
                bodyEl.style.display = isOpen ? 'none' : 'block';
                headerEl.classList.toggle('expanded', !isOpen);
            };
        })(setHeader, body);

        // Group by row letter (first character of label)
        var rowMap = {};
        var rowOrder = [];
        availableCards.forEach(function(c) {
            var row = c.label.charAt(0);
            if (!rowMap[row]) {
                rowMap[row] = [];
                rowOrder.push(row);
            }
            rowMap[row].push(c);
        });
        rowOrder.sort();

        rowOrder.forEach(function(rowLetter) {
            var rowDiv = document.createElement('div');
            rowDiv.className = 'add-cards-row';

            // Row add button (add all cards in this row as a new line)
            var rowBtn = document.createElement('button');
            rowBtn.className = 'add-row-btn';
            rowBtn.textContent = '+ ' + rowLetter;
            rowBtn.title = 'Add all "' + rowLetter + '" cards as a new line';
            (function(cards, src) {
                rowBtn.onclick = function() {
                    addCardsToCurrentGame(cards, src.cardSetValue, gameIndex);
                };
            })(rowMap[rowLetter], source);
            rowDiv.appendChild(rowBtn);

            // Individual cards
            rowMap[rowLetter].forEach(function(cardData) {
                var cardEl = document.createElement('div');
                cardEl.className = 'add-card-thumb';
                cardEl.title = 'Add ' + cardData.label;
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 60 60');
                if (cardData.svgContent) svg.innerHTML = cardData.svgContent;
                cardEl.appendChild(svg);
                var labelEl = document.createElement('div');
                labelEl.className = 'add-card-label';
                labelEl.textContent = cardData.label;
                cardEl.appendChild(labelEl);
                (function(cd, src) {
                    cardEl.onclick = function() {
                        addCardsToCurrentGame([cd], src.cardSetValue, gameIndex);
                    };
                })(cardData, source);
                rowDiv.appendChild(cardEl);
            });

            body.appendChild(rowDiv);
        });
    });

    if (!hasAnyAvailable) {
        var msg = document.createElement('p');
        msg.style.cssText = 'color:rgba(255,255,255,0.5);font-size:0.9rem;margin:10px 0;';
        msg.textContent = 'All available cards are already in this game.';
        area.appendChild(msg);
    }
}

function getAvailableCardsFromSet(source, inGame) {
    var cards = [];
    if (source.key === 'numbers') {
        // Get cards from the Numbers DOM
        var container = document.getElementById('card-set-numbers');
        if (container) {
            container.querySelectorAll('.library-card:not(.variation)').forEach(function(cardEl) {
                var lbl = cardEl.querySelector('.library-label');
                var svg = cardEl.querySelector('svg');
                if (!lbl || !svg) return;
                var label = lbl.textContent;
                if (inGame[label]) return;
                var content = svg.innerHTML.trim();
                cards.push({ label: label, svgContent: content });
            });
        }
        // Also check orphaned rows
        var content = document.querySelector('#domino-library-screen .domino-library-content');
        if (content) {
            var children = content.children;
            for (var ci = 0; ci < children.length; ci++) {
                var ch = children[ci];
                if (ch.id === 'card-set-numbers' || ch.id === 'card-set-abc' || ch.id === 'card-set-custom') continue;
                if (!ch.classList.contains('library-row')) continue;
                ch.querySelectorAll('.library-card:not(.variation)').forEach(function(cardEl) {
                    var lbl = cardEl.querySelector('.library-label');
                    var svg = cardEl.querySelector('svg');
                    if (!lbl || !svg) return;
                    var label = lbl.textContent;
                    if (inGame[label]) return;
                    var svgContent = svg.innerHTML.trim();
                    cards.push({ label: label, svgContent: svgContent });
                });
            }
        }
    } else if (source.key === 'abc') {
        // Get cards from the ABC DOM (build it if needed)
        var abcDiv = document.getElementById('card-set-abc');
        if (abcDiv && !abcDiv.querySelector('.library-card')) {
            if (typeof buildAbcCardSet === 'function') buildAbcCardSet();
        }
        if (abcDiv) {
            abcDiv.querySelectorAll('.library-card:not(.variation)').forEach(function(cardEl) {
                var lbl = cardEl.querySelector('.library-label');
                var svg = cardEl.querySelector('svg');
                if (!lbl || !svg) return;
                var label = lbl.textContent;
                if (inGame[label]) return;
                var content = svg.innerHTML.trim();
                cards.push({ label: label, svgContent: content });
            });
        }
    } else if (source.isCustom) {
        // Custom set - read from localStorage
        try {
            var raw = localStorage.getItem('customDrawnCards_' + source.key);
            if (raw) {
                var items = JSON.parse(raw);
                items.forEach(function(item) {
                    if (inGame[item.label]) return;
                    cards.push({ label: item.label, svgContent: item.svgContent || '' });
                });
            }
        } catch(e) {}
    }
    return cards;
}

function addCardsToCurrentGame(cardDataArray, cardSetValue, gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;

    var added = 0;
    var addedLabels = [];
    // Build set of existing labels to avoid duplicates
    var existing = {};
    game.cards.forEach(function(c) {
        if (!c.isVariation) existing[c.label] = true;
    });

    // Find the row letter after the last existing row (alphabetically)
    var maxRowCode = 64; // '@' = one before 'A'
    game.cards.forEach(function(c) {
        var rowChar = getCardRow(c);
        if (rowChar.charCodeAt(0) > maxRowCode) {
            maxRowCode = rowChar.charCodeAt(0);
        }
    });
    var nextRow = String.fromCharCode(Math.min(maxRowCode + 1, 90));

    cardDataArray.forEach(function(cd) {
        if (existing[cd.label]) return;
        game.cards.push({
            label: cd.label,
            isVariation: false,
            cardSet: cardSetValue,
            svgMarkup: cd.svgContent,
            gameRow: nextRow
        });
        existing[cd.label] = true;
        addedLabels.push(cd.label);
        added++;
    });

    if (added === 0) return;

    // Track newly added cards as novel
    var novelLabels = getNovelCards(gameIndex);
    addedLabels.forEach(function(label) {
        if (novelLabels.indexOf(label) < 0) {
            novelLabels.push(label);
        }
    });
    saveNovelCards(gameIndex, novelLabels);

    saveCustomGames(games);
    // Refresh game view
    openGameView(gameIndex, gameViewReturnScreen);
    // Re-open the add cards area
    gameViewAddMode = false;
    toggleGameViewAddCards();
}

function openGameView(gameIndex, returnScreen) {
    // Save all card edits before leaving card maker
    if (typeof saveVariations === 'function') saveVariations();
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;

    // Ensure the ABC card set DOM is built so findCardByLabel can resolve
    // live card designs for any game that uses ABC cards.
    var needsAbc = game.cards.some(function(c) { return c.cardSet === 'ABC'; });
    if (needsAbc) {
        var abcDiv = document.getElementById('card-set-abc');
        if (abcDiv && !abcDiv.querySelector('.library-card')) {
            if (typeof buildAbcCardSet === 'function') buildAbcCardSet();
        }
    }

    currentGameViewIndex = gameIndex;
    gameViewReturnScreen = returnScreen || 'card-library-screen';

    // Reset erase mode
    gameViewEraseMode = false;
    var eraseBtn = document.getElementById('game-view-erase-btn');
    if (eraseBtn) { eraseBtn.style.opacity = '0.4'; eraseBtn.style.boxShadow = ''; }

    // Reset add-cards mode
    gameViewAddMode = false;
    var addBtn = document.getElementById('game-view-add-btn');
    if (addBtn) { addBtn.style.opacity = ''; addBtn.style.boxShadow = ''; }

    document.getElementById('game-view-title').textContent = game.name;
    document.getElementById('game-view-desc').textContent = game.description;

    var container = document.getElementById('game-view-cards');
    container.innerHTML = '';
    container.classList.remove('erase-mode');

    // Load novel cards for this game
    var novelLabels = getNovelCards(gameIndex);
    var noveltyLocked = getNoveltyLocked(gameIndex);
    var hasNovelCards = novelLabels.length > 0;
    var novelSet = {};
    novelLabels.forEach(function(l) { novelSet[l] = true; });
    // Store on window so buildGameViewDomino can access it
    window._gameViewNovelSet = hasNovelCards ? novelSet : null;

    // Group cards by row letter
    var cardsByRow = {};
    var rowOrder = [];
    game.cards.forEach(function(c) {
        var row = getCardRow(c);
        if (!cardsByRow[row]) {
            cardsByRow[row] = [];
            rowOrder.push(row);
        }
        cardsByRow[row].push(c);
    });

    rowOrder.sort();
    rowOrder.forEach(function(row) {
        var section = document.createElement('div');
        section.className = 'library-section';
        container.appendChild(section);

        var rowDiv = document.createElement('div');
        rowDiv.className = 'library-row';
        rowDiv.dataset.gameRow = row;

        cardsByRow[row].forEach(function(cardInfo) {
            var cardEl = buildGameViewCard(cardInfo);
            if (cardEl) {
                // Store card label and variation flag on element for drag-and-drop
                cardEl.dataset.cardLabel = cardInfo.label;
                if (cardInfo.isVariation) cardEl.dataset.isVariation = 'true';
                // Apply pink border to novel cards
                if (hasNovelCards && !cardInfo.isVariation && novelSet[cardInfo.label]) {
                    cardEl.classList.add('novel-card');
                }
                // Only add erase button to non-variation cards
                if (!cardInfo.isVariation) {
                    cardEl.style.position = 'relative';
                    var eraseBtn = document.createElement('button');
                    eraseBtn.className = 'card-erase-btn';
                    eraseBtn.textContent = '\u2715';
                    eraseBtn.title = 'Erase card ' + cardInfo.label + ' from game';
                    (function(lbl) {
                        eraseBtn.onclick = function(e) {
                            e.stopPropagation();
                            eraseGameCard(lbl, gameIndex);
                        };
                    })(cardInfo.label);
                    cardEl.appendChild(eraseBtn);
                }
                rowDiv.appendChild(cardEl);
            }
        });

        // Erase-row button (visible only in erase mode)
        var eraseRowBtn = document.createElement('button');
        eraseRowBtn.className = 'row-erase-btn';
        eraseRowBtn.textContent = '\u2715 ' + row;
        eraseRowBtn.title = 'Erase all "' + row + '" cards from game';
        (function(r) {
            eraseRowBtn.onclick = function(e) {
                e.stopPropagation();
                eraseGameRow(r, gameIndex);
            };
        })(row);
        rowDiv.appendChild(eraseRowBtn);

        container.appendChild(rowDiv);
    });

    // Collect only original (non-variation) cards, deduplicated by label
    var origCards = [];
    var seenLabels = {};
    game.cards.forEach(function(c) {
        if (!c.isVariation && !seenLabels[c.label]) {
            seenLabels[c.label] = true;
            origCards.push(c);
        }
    });

    // Build variations (hidden by default, toggled by V button)
    var varArea = document.createElement('div');
    varArea.id = 'game-view-variations-area';
    varArea.style.display = 'none';
    buildGameViewVariations(varArea, origCards, gameIndex);
    container.appendChild(varArea);
    // Reset V button and undo button state
    var vBtn = document.getElementById('game-view-var-btn');
    if (vBtn) { vBtn.style.opacity = '1'; vBtn.title = 'Show variations'; }
    var undoBtn = document.getElementById('game-view-undo-btn');
    if (undoBtn) undoBtn.style.display = 'none';
    lastDeletedGameViewVariation = null;

    // Buttons row: Show Dominos + Copy Game
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'margin: 20px 0 10px 40px;';

    var showBtn = document.createElement('button');
    showBtn.className = 'show-dominos-btn';
    showBtn.style.display = 'inline-block';
    showBtn.style.margin = '0';
    showBtn.textContent = 'Show Dominos';
    showBtn.onclick = function() {
        var dominoArea = document.getElementById('game-view-dominos-area');
        if (dominoArea.style.display === 'block') {
            dominoArea.style.display = 'none';
            showBtn.textContent = 'Show Dominos';
        } else {
            dominoArea.style.display = 'block';
            showBtn.textContent = 'Hide Dominos';
        }
    };
    btnRow.appendChild(showBtn);

    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-game-btn';
    copyBtn.textContent = 'Copy Game';
    copyBtn.onclick = function() { copyGame(gameIndex); };
    btnRow.appendChild(copyBtn);

    var delBtn = document.createElement('button');
    delBtn.className = 'delete-game-btn';
    delBtn.textContent = 'Delete Game';
    delBtn.onclick = function() { deleteGame(gameIndex); };
    btnRow.appendChild(delBtn);

    container.appendChild(btnRow);

    // Novelty toggle row (only show if there are novel cards)
    if (hasNovelCards) {
        var noveltyRow = document.createElement('div');
        noveltyRow.className = 'novelty-toggle-row';
        noveltyRow.id = 'novelty-toggle-row';

        var noveltyLabel = document.createElement('span');
        noveltyLabel.textContent = 'New cards highlighted';
        noveltyRow.appendChild(noveltyLabel);

        var noveltySlider = document.createElement('div');
        noveltySlider.className = 'novelty-slider' + (noveltyLocked ? ' active' : '');
        noveltySlider.id = 'novelty-game-slider';
        var noveltyKnob = document.createElement('div');
        noveltyKnob.className = 'novelty-slider-knob';
        noveltySlider.appendChild(noveltyKnob);
        noveltyRow.appendChild(noveltySlider);

        var noveltyStatus = document.createElement('span');
        noveltyStatus.id = 'novelty-status-text';
        noveltyStatus.textContent = noveltyLocked ? 'Persistent' : 'Temporary';
        noveltyRow.appendChild(noveltyStatus);

        (function(gi) {
            noveltySlider.onclick = function() {
                var isActive = noveltySlider.classList.contains('active');
                if (isActive) {
                    // Move to left: clear novelty
                    noveltySlider.classList.remove('active');
                    clearNovelty(gi);
                    // Remove pink borders from cards and dominos
                    document.querySelectorAll('#game-view-cards .novel-card').forEach(function(el) {
                        el.classList.remove('novel-card');
                    });
                    document.querySelectorAll('#game-view-cards .novel-domino').forEach(function(el) {
                        el.classList.remove('novel-domino');
                    });
                    noveltyStatus.textContent = 'Cleared';
                    // Hide the toggle row after clearing
                    noveltyRow.style.display = 'none';
                } else {
                    // Move to right: lock novelty
                    noveltySlider.classList.add('active');
                    setNoveltyLocked(gi, true);
                    noveltyStatus.textContent = 'Persistent';
                }
            };
        })(gameIndex);

        container.appendChild(noveltyRow);
    }

    // Update flip button state on left toolbar
    updateFlipBtnState(!!game.flipEnabled);

    // Dominos area (hidden initially)
    var dominoArea = document.createElement('div');
    dominoArea.id = 'game-view-dominos-area';
    dominoArea.style.display = 'none';

    // Generate ALL card-to-card pair combinations
    var allDominos = [];
    for (var i = 0; i < origCards.length; i++) {
        for (var j = i + 1; j < origCards.length; j++) {
            var leftCard = origCards[i];
            var rightCard = origCards[j];
            var leftValue = leftCard.label.charAt(0);
            var rightValue = rightCard.label.charAt(0);
            allDominos.push({
                leftCard: leftCard,
                rightCard: rightCard,
                leftValue: leftValue,
                rightValue: rightValue,
                isDouble: leftValue === rightValue
            });
        }
    }

    // Load excluded dominos for this game
    var excludedKeys = getExcludedDominos(gameIndex);

    // Active box
    var activeBox = document.createElement('div');
    activeBox.className = 'domino-box domino-box-active';
    activeBox.id = 'domino-box-active';
    var activeLabel = document.createElement('span');
    activeLabel.className = 'domino-box-label';
    activeLabel.id = 'active-box-label';
    activeBox.appendChild(activeLabel);
    var activeContent = document.createElement('div');
    activeContent.id = 'active-dominos-content';
    activeBox.appendChild(activeContent);
    dominoArea.appendChild(activeBox);

    // Not Used box
    var unusedBox = document.createElement('div');
    unusedBox.className = 'domino-box domino-box-unused';
    unusedBox.id = 'domino-box-unused';
    var unusedLabel = document.createElement('span');
    unusedLabel.className = 'domino-box-label';
    unusedLabel.id = 'unused-box-label';
    unusedBox.appendChild(unusedLabel);
    var unusedContent = document.createElement('div');
    unusedContent.id = 'unused-dominos-content';
    unusedBox.appendChild(unusedContent);
    dominoArea.appendChild(unusedBox);

    container.appendChild(dominoArea);

    // Render dominos into boxes
    renderDominoBoxes(allDominos, excludedKeys, gameIndex);

    // Set up drag-and-drop for card reordering within game view
    setupGameViewDrag(container, gameIndex);

    document.getElementById(returnScreen).style.display = 'none';
    document.getElementById('game-view-screen').style.display = 'block';
}

// --- Game view drag-and-drop: reorder cards within rows & move between rows ---
var _gameViewDragCleanup = null;
function setupGameViewDrag(container, gameIndex) {
    // Clean up any previous drag handlers
    if (_gameViewDragCleanup) { _gameViewDragCleanup(); _gameViewDragCleanup = null; }

    var dragCard = null, dragStartX = 0, dragStartY = 0;
    var dragActive = false, dragPending = false;
    var dragSourceRow = null, dragOverRow = null;
    var dragPointerId = null;
    var DRAG_THRESHOLD = 8;

    // Reuse the global drop indicator if it exists, otherwise create one
    var dropIndicator = document.querySelector('.card-drop-indicator.gv-drop-indicator');
    if (!dropIndicator) {
        dropIndicator = document.createElement('div');
        dropIndicator.className = 'card-drop-indicator gv-drop-indicator';
        dropIndicator.style.display = 'none';
        document.body.appendChild(dropIndicator);
    }
    var dropRefCard = null, dropAtEnd = false;

    function hideDropIndicator() {
        dropIndicator.style.display = 'none';
        dropRefCard = null;
        dropAtEnd = false;
    }

    function findInsertPos(row, pointerX) {
        var cards = Array.prototype.slice.call(
            row.querySelectorAll('.library-card')
        ).filter(function(c) { return c !== dragCard && !c.classList.contains('row-erase-btn'); });
        if (cards.length === 0) return { refCard: null, atEnd: true, x: 0, top: 0, h: 0 };
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].getBoundingClientRect();
            if (pointerX < r.left + r.width / 2) {
                return { refCard: cards[i], atEnd: false, x: r.left - 4, top: r.top, h: r.height };
            }
        }
        var lr = cards[cards.length - 1].getBoundingClientRect();
        return { refCard: null, atEnd: true, x: lr.right + 2, top: lr.top, h: lr.height };
    }

    function saveGameViewOrder() {
        var games = loadCustomGames();
        var game = games[gameIndex];
        if (!game) return;
        // Build a map from label -> card data
        var cardMap = {};
        game.cards.forEach(function(c) { cardMap[c.label] = c; });
        // Rebuild cards array from DOM order, updating gameRow
        var newCards = [];
        var rows = container.querySelectorAll('.library-row[data-game-row]');
        rows.forEach(function(rowEl) {
            var rowLetter = rowEl.dataset.gameRow;
            var cardEls = rowEl.querySelectorAll('.library-card');
            cardEls.forEach(function(el) {
                var label = el.dataset.cardLabel;
                if (!label) return;
                var cardData = cardMap[label];
                if (cardData) {
                    cardData.gameRow = rowLetter;
                    newCards.push(cardData);
                    delete cardMap[label];
                }
            });
        });
        // Append any cards not found in DOM (variations, etc.)
        Object.keys(cardMap).forEach(function(label) {
            newCards.push(cardMap[label]);
        });
        game.cards = newCards;
        saveCustomGames(games);
    }

    function onPointerDown(e) {
        if (e.button !== 0) return;
        if (e.target.closest('.card-erase-btn') || e.target.closest('.row-erase-btn') ||
            e.target.closest('.show-dominos-btn') || e.target.closest('.copy-game-btn') ||
            e.target.closest('.delete-game-btn')) return;
        var card = e.target.closest('.library-card');
        if (!card) return;
        // Only drag cards that are inside a game-row
        var row = card.closest('.library-row[data-game-row]');
        if (!row) return;
        dragCard = card;
        dragSourceRow = row;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragPending = true;
        dragActive = false;
        dragPointerId = e.pointerId;
    }

    function onPointerMove(e) {
        if (!dragPending) return;
        if (!dragActive && Math.sqrt(Math.pow(e.clientX - dragStartX, 2) + Math.pow(e.clientY - dragStartY, 2)) > DRAG_THRESHOLD) {
            dragActive = true;
            dragCard.classList.add('dragging');
            try { container.setPointerCapture(dragPointerId); } catch(ex) {}
        }
        if (!dragActive) return;
        var rows = container.querySelectorAll('.library-row[data-game-row]');
        var newOver = null;
        rows.forEach(function(row) {
            var rect = row.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
                e.clientX >= rect.left && e.clientX <= rect.right) {
                newOver = row;
            }
        });
        if (!newOver) {
            var bestDist = Infinity;
            rows.forEach(function(row) {
                var rect = row.getBoundingClientRect();
                if (e.clientY >= rect.top - 10 && e.clientY <= rect.bottom + 10 &&
                    e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40) {
                    var dist = Math.abs(e.clientY - (rect.top + rect.bottom) / 2);
                    if (dist < bestDist) { bestDist = dist; newOver = row; }
                }
            });
        }
        if (newOver !== dragOverRow) {
            if (dragOverRow) dragOverRow.classList.remove('drag-over');
            dragOverRow = newOver;
            if (dragOverRow && dragOverRow !== dragSourceRow) dragOverRow.classList.add('drag-over');
        }
        if (dragOverRow) {
            var pos = findInsertPos(dragOverRow, e.clientX);
            dropRefCard = pos.refCard;
            dropAtEnd = pos.atEnd;
            if (pos.h > 0) {
                dropIndicator.style.display = 'block';
                dropIndicator.style.left = pos.x + 'px';
                dropIndicator.style.top = pos.top + 'px';
                dropIndicator.style.height = pos.h + 'px';
            } else {
                hideDropIndicator();
            }
        } else {
            hideDropIndicator();
        }
    }

    function onPointerUp(e) {
        if (!dragPending) return;
        if (dragActive) {
            if (dragOverRow) {
                if (dropRefCard) {
                    dragOverRow.insertBefore(dragCard, dropRefCard);
                } else {
                    // Insert before the erase-row button if present
                    var eraseBtn = dragOverRow.querySelector('.row-erase-btn');
                    if (eraseBtn) {
                        dragOverRow.insertBefore(dragCard, eraseBtn);
                    } else {
                        dragOverRow.appendChild(dragCard);
                    }
                }
                saveGameViewOrder();
            }
            dragCard.classList.remove('dragging');
            if (dragOverRow) dragOverRow.classList.remove('drag-over');
            hideDropIndicator();
            try { container.releasePointerCapture(dragPointerId); } catch(ex) {}
        }
        dragCard = null;
        dragSourceRow = null;
        dragOverRow = null;
        dragPointerId = null;
        dragPending = false;
        dragActive = false;
    }

    container.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    _gameViewDragCleanup = function() {
        container.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };
}

function renderDominoBoxes(allDominos, excludedKeys, gameIndex) {
    var activeContent = document.getElementById('active-dominos-content');
    var unusedContent = document.getElementById('unused-dominos-content');
    activeContent.innerHTML = '';
    unusedContent.innerHTML = '';

    var activeDominos = [];
    var unusedDominos = [];
    allDominos.forEach(function(d) {
        var key = getDominoKey(d);
        if (excludedKeys.indexOf(key) >= 0) {
            unusedDominos.push(d);
        } else {
            activeDominos.push(d);
        }
    });

    // Update labels with counts
    document.getElementById('active-box-label').textContent = 'Active (' + activeDominos.length + ')';
    document.getElementById('unused-box-label').textContent = 'Not Used (' + unusedDominos.length + ')';

    // Render active dominos (doubles first, then by value pair)
    renderDominoGroup(activeContent, activeDominos, function(d) {
        // Click to move to Not Used
        var key = getDominoKey(d);
        var ex = getExcludedDominos(gameIndex);
        ex.push(key);
        saveExcludedDominos(gameIndex, ex);
        renderDominoBoxes(allDominos, ex, gameIndex);
    });

    // Render unused dominos
    renderDominoGroup(unusedContent, unusedDominos, function(d) {
        // Click to move back to Active
        var key = getDominoKey(d);
        var ex = getExcludedDominos(gameIndex);
        ex = ex.filter(function(k) { return k !== key; });
        saveExcludedDominos(gameIndex, ex);
        renderDominoBoxes(allDominos, ex, gameIndex);
    });

    // Hide unused box if empty
    document.getElementById('domino-box-unused').style.display = unusedDominos.length > 0 ? 'block' : 'none';
}

function renderDominoGroup(container, dominos, onClick) {
    var doubles = dominos.filter(function(d) { return d.isDouble; });
    var nonDoubles = dominos.filter(function(d) { return !d.isDouble; });

    if (doubles.length > 0) {
        var dTitle = document.createElement('div');
        dTitle.className = 'game-view-group-title';
        dTitle.textContent = 'Doubles (' + doubles.length + ')';
        container.appendChild(dTitle);
        var dRow = document.createElement('div');
        dRow.className = 'game-view-dominos';
        doubles.forEach(function(d) {
            var el = buildGameViewDomino(d);
            el.onclick = function() { onClick(d); };
            dRow.appendChild(el);
        });
        container.appendChild(dRow);
    }

    if (nonDoubles.length > 0) {
        var byPair = {};
        var pairOrder = [];
        nonDoubles.forEach(function(d) {
            var key = d.leftValue + '-' + d.rightValue;
            if (!byPair[key]) {
                byPair[key] = [];
                pairOrder.push(key);
            }
            byPair[key].push(d);
        });
        pairOrder.forEach(function(key) {
            var nTitle = document.createElement('div');
            nTitle.className = 'game-view-group-title';
            nTitle.textContent = 'Value ' + key.charAt(0) + ' \u00D7 Value ' + key.charAt(2) + ' (' + byPair[key].length + ')';
            container.appendChild(nTitle);
            var nRow = document.createElement('div');
            nRow.className = 'game-view-dominos';
            byPair[key].forEach(function(d) {
                var el = buildGameViewDomino(d);
                el.onclick = function() { onClick(d); };
                nRow.appendChild(el);
            });
            container.appendChild(nRow);
        });
    }
}

function copyGame(gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    var newName = prompt('Name for the copy:', 'Copy of ' + game.name);
    if (!newName || !newName.trim()) return;
    newName = newName.trim();
    var newGame = {
        name: newName,
        description: game.description,
        cards: JSON.parse(JSON.stringify(game.cards)),
        flipEnabled: !!game.flipEnabled
    };
    games.push(newGame);
    saveCustomGames(games);
    // Copy excluded dominos and variations too
    var excluded = getExcludedDominos(gameIndex);
    if (excluded.length > 0) {
        saveExcludedDominos(games.length - 1, excluded);
    }
    var excludedVars = getExcludedVariations(gameIndex);
    if (excludedVars.length > 0) {
        saveExcludedVariations(games.length - 1, excludedVars);
    }
    // Copy novelty data too
    var novelLabels = getNovelCards(gameIndex);
    if (novelLabels.length > 0) {
        saveNovelCards(games.length - 1, novelLabels);
        if (getNoveltyLocked(gameIndex)) {
            setNoveltyLocked(games.length - 1, true);
        }
    }
    alert('Game copied as \u201C' + newName + '\u201D');
    populateLibraryGames();
    populateStartScreenGames();
    populateCardMakerGames();
    // Open the copied game
    openGameView(games.length - 1, gameViewReturnScreen);
}

function copyGameAndEdit(gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    var newName = prompt('Name for the copy:', 'Copy of ' + game.name);
    if (!newName || !newName.trim()) return;
    newName = newName.trim();
    var newGame = {
        name: newName,
        description: game.description,
        cards: JSON.parse(JSON.stringify(game.cards)),
        flipEnabled: !!game.flipEnabled
    };
    games.push(newGame);
    saveCustomGames(games);
    // Copy excluded dominos and variations too
    var excluded = getExcludedDominos(gameIndex);
    if (excluded.length > 0) {
        saveExcludedDominos(games.length - 1, excluded);
    }
    var excludedVars = getExcludedVariations(gameIndex);
    if (excludedVars.length > 0) {
        saveExcludedVariations(games.length - 1, excludedVars);
    }
    // Copy novelty data too
    var novelLabels2 = getNovelCards(gameIndex);
    if (novelLabels2.length > 0) {
        saveNovelCards(games.length - 1, novelLabels2);
        if (getNoveltyLocked(gameIndex)) {
            setNoveltyLocked(games.length - 1, true);
        }
    }
    populateLibraryGames();
    populateStartScreenGames();
    populateCardMakerGames();
    // Enter edit mode for the new copy
    var newIndex = games.length - 1;
    gameMakerEditIndex = newIndex;
    gameMakerName = newName;
    gameMakerDesc = newGame.description;
    enterSelectionMode();
}

// buildCardFromMarkup() is now in js/shared-data.js

function buildGameViewCard(cardInfo) {
    if (!cardInfo.isVariation) {
        var original = findCardByLabel(cardInfo.label, cardInfo.cardSet);
        if (original) {
            var clone = original.cloneNode(true);
            clone.classList.remove('card-selected');
            var del = clone.querySelector('.variation-delete-btn');
            if (del) del.remove();
            return clone;
        }
        // Fallback: build from stored svgMarkup
        return buildCardFromMarkup(cardInfo);
    } else {
        var original = findCardByLabel(cardInfo.originalLabel, cardInfo.cardSet);
        if (original) {
            var clone = original.cloneNode(true);
            clone.classList.remove('card-selected');
            var svg = clone.querySelector('svg');
            if (svg && cardInfo.transform) {
                var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('transform', cardInfo.transform);
                while (svg.firstChild) g.appendChild(svg.firstChild);
                svg.appendChild(g);
            }
            var lbl = clone.querySelector('.library-label');
            if (lbl) lbl.textContent = cardInfo.label;
            return clone;
        }
        // Fallback: build from stored svgMarkup
        return buildCardFromMarkup(cardInfo);
    }
}

function getGameCardSVGWithFallback(cardInfo) {
    var svg = getGameCardSVG(cardInfo);
    if (svg) return svg;
    // Fallback: build from stored svgMarkup
    if (cardInfo.svgMarkup) {
        var fallbackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        fallbackSvg.setAttribute('viewBox', '0 0 60 60');
        fallbackSvg.innerHTML = cardInfo.svgMarkup;
        if (cardInfo.isVariation && cardInfo.transform) {
            var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', cardInfo.transform);
            while (fallbackSvg.firstChild) g.appendChild(fallbackSvg.firstChild);
            fallbackSvg.appendChild(g);
        }
        return fallbackSvg;
    }
    return null;
}

function buildGameViewDomino(domino) {
    var el = document.createElement('div');
    el.className = 'game-view-domino';
    if (domino.isDouble) el.classList.add('double-domino');

    // Mark domino as novel if at least one half is a novel card
    var ns = window._gameViewNovelSet;
    if (ns && (ns[domino.leftCard.label] || ns[domino.rightCard.label])) {
        el.classList.add('novel-domino');
    }

    var leftHalf = document.createElement('div');
    leftHalf.className = 'game-view-domino-half';
    leftHalf.setAttribute('data-card-label', domino.leftCard.label);
    var leftSvg = getGameCardSVGWithFallback(domino.leftCard);
    if (leftSvg) leftHalf.appendChild(leftSvg);

    var rightHalf = document.createElement('div');
    rightHalf.className = 'game-view-domino-half';
    rightHalf.setAttribute('data-card-label', domino.rightCard.label);
    var rightSvg = getGameCardSVGWithFallback(domino.rightCard);
    if (rightSvg) rightHalf.appendChild(rightSvg);

    el.appendChild(leftHalf);
    el.appendChild(rightHalf);
    return el;
}

function buildGameViewVariations(varArea, origCards, gameIndex) {
    varArea.innerHTML = '';

    // Collect all variation cards from Card Maker DOM that belong to this game's cards
    var origLabels = {};
    var labelCardSet = {};
    origCards.forEach(function(c) { origLabels[c.label] = true; labelCardSet[c.label] = c.cardSet; });

    // Load per-game excluded variations
    var excludedVars = getExcludedVariations(gameIndex);

    var cmVarCards = document.querySelectorAll('#domino-library-screen .library-card.variation');
    // Group by original label, filtering out excluded for this game
    var varsByCard = {};
    var cardOrder = [];
    cmVarCards.forEach(function(el) {
        var origLabel = el.dataset.originalLabel;
        if (!origLabels[origLabel]) return;
        var vKey = getVariationKey(origLabel, el.dataset.transform);
        if (excludedVars.indexOf(vKey) >= 0) return; // excluded for this game
        if (!varsByCard[origLabel]) {
            varsByCard[origLabel] = [];
            cardOrder.push(origLabel);
        }
        varsByCard[origLabel].push(el);
    });

    if (cardOrder.length === 0) {
        var noVars = document.createElement('div');
        noVars.className = 'game-view-group-title';
        noVars.textContent = 'No variations for cards in this game';
        varArea.appendChild(noVars);
        return;
    }

    cardOrder.forEach(function(label) {
        var section = document.createElement('div');
        section.className = 'library-section';
        varArea.appendChild(section);

        var row = document.createElement('div');
        row.className = 'library-row';

        // Show original card first
        var origCard = findCardByLabel(label, labelCardSet[label]);
        if (origCard) {
            var origClone = origCard.cloneNode(true);
            origClone.classList.remove('card-selected');
            var origDel = origClone.querySelector('.variation-delete-btn');
            if (origDel) origDel.remove();
            row.appendChild(origClone);
        }

        // Clone each variation card from Card Maker DOM
        varsByCard[label].forEach(function(cmCard) {
            var clone = cmCard.cloneNode(true);
            clone.classList.remove('card-selected');
            clone.style.display = '';
            // Replace delete button with one that works in game view
            var oldDel = clone.querySelector('.variation-delete-btn');
            if (oldDel) oldDel.remove();
            var delBtn = document.createElement('button');
            delBtn.className = 'variation-delete-btn';
            delBtn.textContent = '\u2715';
            delBtn.title = 'Exclude this variation from this game';
            delBtn.onclick = (function(cardLabel, cardTransform) {
                return function(e) {
                    e.stopPropagation();
                    // Store undo data
                    lastDeletedGameViewVariation = {
                        varKey: getVariationKey(cardLabel, cardTransform),
                        varArea: varArea,
                        origCards: origCards,
                        gameIndex: gameIndex
                    };
                    // Add to per-game excluded variations
                    var ex = getExcludedVariations(gameIndex);
                    ex.push(getVariationKey(cardLabel, cardTransform));
                    saveExcludedVariations(gameIndex, ex);
                    // Rebuild (Card Maker is NOT touched)
                    buildGameViewVariations(varArea, origCards, gameIndex);
                    // Show undo button
                    var undoBtn = document.getElementById('game-view-undo-btn');
                    if (undoBtn) undoBtn.style.display = 'block';
                };
            })(cmCard.dataset.originalLabel, cmCard.dataset.transform);
            clone.appendChild(delBtn);
            row.appendChild(clone);
        });

        varArea.appendChild(row);
    });
}

function hideGameView() {
    // Close MPP panel if open
    if (mppGameIndex >= 0) closeMainPagePictures();
    // Check for unlocked novel cards before leaving
    var gi = currentGameViewIndex;
    if (gi >= 0) {
        var novelLabels = getNovelCards(gi);
        var locked = getNoveltyLocked(gi);
        if (novelLabels.length > 0 && !locked) {
            showNoveltyPrompt(gi, function() {
                // After prompt resolved, proceed with hide
                doHideGameView();
            });
            return;
        }
    }
    doHideGameView();
}

function doHideGameView() {
    document.getElementById('game-view-screen').style.display = 'none';
    document.getElementById(gameViewReturnScreen).style.display = 'block';
    window._gameViewNovelSet = null;
    populateCardMakerGames();
}

function showNoveltyPrompt(gameIndex, onDone) {
    var overlay = document.getElementById('novelty-prompt-overlay');
    if (!overlay) { onDone(); return; }
    overlay.style.display = 'flex';

    var slider = document.getElementById('novelty-prompt-slider');
    slider.classList.remove('active');

    var keepBtn = document.getElementById('novelty-keep-btn');
    var dismissBtn = document.getElementById('novelty-dismiss-btn');

    function cleanup() {
        overlay.style.display = 'none';
        keepBtn.onclick = null;
        dismissBtn.onclick = null;
        slider.onclick = null;
    }

    slider.onclick = function() {
        slider.classList.toggle('active');
    };

    keepBtn.onclick = function() {
        // If slider is active (pushed right), lock novelty
        if (slider.classList.contains('active')) {
            setNoveltyLocked(gameIndex, true);
        } else {
            // Keep pink was clicked but slider not moved right
            // Lock it anyway since user clicked "Keep pink"
            setNoveltyLocked(gameIndex, true);
        }
        cleanup();
        onDone();
    };

    dismissBtn.onclick = function() {
        // Clear all novelty
        clearNovelty(gameIndex);
        cleanup();
        onDone();
    };
}

function editGameTitle() {
    if (currentGameViewIndex < 0) return;
    var games = loadCustomGames();
    var game = games[currentGameViewIndex];
    if (!game) return;
    var newName = prompt('Game name:', game.name);
    if (!newName || !newName.trim()) return;
    newName = newName.trim();
    games[currentGameViewIndex].name = newName;
    saveCustomGames(games);
    document.getElementById('game-view-title').textContent = newName;
    populateLibraryGames();
    populateStartScreenGames();
    populateCardMakerGames();
}

function editGameDesc() {
    if (currentGameViewIndex < 0) return;
    var games = loadCustomGames();
    var game = games[currentGameViewIndex];
    if (!game) return;
    var newDesc = prompt('Game description:', game.description || '');
    if (newDesc === null) return;
    games[currentGameViewIndex].description = newDesc.trim();
    saveCustomGames(games);
    document.getElementById('game-view-desc').textContent = newDesc.trim();
}

function toggleGameViewVariations() {
    var varArea = document.getElementById('game-view-variations-area');
    var btn = document.getElementById('game-view-var-btn');
    if (!varArea) return;
    if (varArea.style.display === 'none') {
        varArea.style.display = 'block';
        btn.style.opacity = '1';
        btn.title = 'Hide variations';
    } else {
        varArea.style.display = 'none';
        btn.style.opacity = '0.4';
        btn.title = 'Show variations';
    }
}

function toggleGameFlip() {
    if (currentGameViewIndex < 0) return;
    var games = loadCustomGames();
    var game = games[currentGameViewIndex];
    if (!game) return;
    game.flipEnabled = !game.flipEnabled;
    saveCustomGames(games);
    updateFlipBtnState(game.flipEnabled);
}

function updateFlipBtnState(on) {
    var btn = document.getElementById('game-view-flip-btn');
    if (!btn) return;
    if (on) {
        btn.style.opacity = '1';
        btn.style.boxShadow = '0 0 0 3px #FFD700, 0 0 10px rgba(255,215,0,0.4)';
        btn.title = 'Activated. UP/DOWN mode: top/bottom flips during the game';
    } else {
        btn.style.opacity = '0.4';
        btn.style.boxShadow = '';
        btn.title = 'UP/DOWN mode: top/bottom flips during the game';
    }
}

function undoDeleteVariation() {
    if (!lastDeletedGameViewVariation) return;
    var data = lastDeletedGameViewVariation;
    lastDeletedGameViewVariation = null;
    // Remove the variation key from per-game exclusion list
    var ex = getExcludedVariations(data.gameIndex);
    var idx = ex.indexOf(data.varKey);
    if (idx >= 0) ex.splice(idx, 1);
    saveExcludedVariations(data.gameIndex, ex);
    // Rebuild game view variations (Card Maker is NOT touched)
    buildGameViewVariations(data.varArea, data.origCards, data.gameIndex);
    // Hide undo button
    var undoBtn = document.getElementById('game-view-undo-btn');
    if (undoBtn) undoBtn.style.display = 'none';
}

function deleteGame(gameIndex) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    if (!confirm('Delete game \u201C' + game.name + '\u201D? This cannot be undone.')) return;
    games.splice(gameIndex, 1);
    saveCustomGames(games);
    // Remove excluded dominos, variations, and novelty data for this game
    localStorage.removeItem('excludedDominos_' + gameIndex);
    localStorage.removeItem('excludedVariations_' + gameIndex);
    clearNovelty(gameIndex);
    // Update combined games: shift gameIndex values to account for removal
    var combinedGames = loadCombinedGames();
    var changed = false;
    combinedGames.forEach(function(cg) {
        cg.stages.forEach(function(stage) {
            if (stage.gameIndex > gameIndex) {
                stage.gameIndex--;
                changed = true;
            }
        });
    });
    if (changed) saveCombinedGames(combinedGames);
    populateLibraryGames();
    populateStartScreenGames();
    populateCardMakerGames();
    doHideGameView(); // Skip novelty prompt since game is deleted
}

document.getElementById('back-from-game-view-btn').addEventListener('click', function() {
    hideGameView();
});

// --- Populate game lists ---
function populateLibraryGames() {
    var list = document.getElementById('library-set-1-games');
    if (!list) return;
    list.innerHTML = '';
    var games = loadCustomGames();
    games.forEach(function(game, i) {
        var row = document.createElement('div');
        row.className = 'library-game-row';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'combine-checkbox';
        checkbox.dataset.gameIndex = i;
        checkbox.addEventListener('change', updateCombineButton);
        row.appendChild(checkbox);

        var btn = document.createElement('button');
        btn.className = 'library-game-link';
        btn.textContent = game.name;
        btn.onclick = function() { openGameView(i, 'card-library-screen'); };
        row.appendChild(btn);

        list.appendChild(row);
    });

    // Add "Combine Selected Games" button (hidden until 2+ checked)
    var combineBtn = document.createElement('button');
    combineBtn.id = 'combine-games-btn';
    combineBtn.className = 'combine-games-btn';
    combineBtn.textContent = 'Combine Selected Games';
    combineBtn.style.display = 'none';
    combineBtn.onclick = openCombineDialog;
    list.appendChild(combineBtn);

    // Show existing combined games
    var combinedGames = loadCombinedGames();
    if (combinedGames.length > 0) {
        var sep = document.createElement('div');
        sep.style.cssText = 'border-top:1px solid rgba(255,255,255,0.2);margin:12px 0 8px;padding-top:8px;color:#FFD700;font-weight:bold;font-size:0.9rem;';
        sep.textContent = 'Combined Games:';
        list.appendChild(sep);
        combinedGames.forEach(function(cg, ci) {
            var cgRow = document.createElement('div');
            cgRow.className = 'library-game-row';
            var cgBtn = document.createElement('button');
            cgBtn.className = 'library-game-link';
            cgBtn.textContent = cg.name;
            cgBtn.style.color = '#FFD700';
            cgRow.appendChild(cgBtn);
            var delBtn = document.createElement('button');
            delBtn.className = 'delete-combined-btn';
            delBtn.title = 'Delete combined game';
            delBtn.innerHTML = '&#10005;';
            delBtn.onclick = function() {
                if (confirm('Delete combined game "' + cg.name + '"?')) {
                    var all = loadCombinedGames();
                    all.splice(ci, 1);
                    saveCombinedGames(all);
                    populateLibraryGames();
                    populateStartScreenGames();
                }
            };
            cgRow.appendChild(delBtn);
            list.appendChild(cgRow);
        });
    }
}

// Returns the set key ('numbers' or 'abc') that a game belongs to,
// based on the cardSet property of its cards. Returns null if mixed/unknown.
function getGameSetKey(game) {
    if (!game.cards || game.cards.length === 0) return null;
    var hasNumbers = false, hasAbc = false;
    for (var i = 0; i < game.cards.length; i++) {
        var cs = game.cards[i].cardSet;
        if (cs === 'ABC') hasAbc = true;
        else hasNumbers = true; // 'Numbers and Dots' or missing = numbers
    }
    if (hasAbc && !hasNumbers) return 'abc';
    if (hasNumbers && !hasAbc) return 'numbers';
    return null; // mixed
}

function updateGameVisibility() {
    var rows = document.querySelectorAll('#library-set-1-games .library-game-row');
    var games = loadCustomGames();
    rows.forEach(function(row) {
        var checkbox = row.querySelector('.combine-checkbox');
        if (!checkbox) return; // combined game rows don't have checkboxes
        var idx = parseInt(checkbox.dataset.gameIndex, 10);
        if (isNaN(idx) || idx >= games.length) return;
        var gameSetKey = getGameSetKey(games[idx]);
        if (previewedCardSet && gameSetKey && gameSetKey !== previewedCardSet) {
            row.classList.add('game-dimmed');
        } else {
            row.classList.remove('game-dimmed');
        }
    });
}

function populateStartScreenGames() {
    // Also populate the intro screen game list
    populateIntroGames();
}

// === Card Set Selection ===
var activeCardSet = 'numbers'; // 'numbers' or 'abc'
var previewedCardSet = null; // which set is currently previewed inline

// Show compact card preview inline in the Library page
function movePreviewAfterRow(row) {
    var preview = document.getElementById('card-set-preview');
    var editBtn = document.getElementById('edit-card-set-btn');
    // Insert preview right after the clicked row
    row.parentNode.insertBefore(preview, row.nextSibling);
    // Insert edit button right after the preview
    if (editBtn) {
        preview.parentNode.insertBefore(editBtn, preview.nextSibling);
    }
}

function previewCardSet(setName, clickedBtn) {
    var numbersBtn = document.getElementById('set-numbers-btn');
    var abcBtn = document.getElementById('set-abc-btn');
    var preview = document.getElementById('card-set-preview');
    var editBtn = document.getElementById('edit-card-set-btn');

    // Deselect all custom set buttons
    var col = document.querySelector('.library-col-sets');
    if (col) col.querySelectorAll('.library-set-btn').forEach(function(b) {
        b.classList.remove('selected');
    });

    // Toggle: clicking same set hides preview
    if (previewedCardSet === setName) {
        previewedCardSet = null;
        preview.innerHTML = '';
        preview.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        updateGameVisibility();
        return;
    }

    previewedCardSet = setName;
    activeCardSet = setName;
    if (numbersBtn) numbersBtn.classList.toggle('selected', setName === 'numbers');
    if (abcBtn) abcBtn.classList.toggle('selected', setName === 'abc');

    // Move preview after the clicked row
    var row = clickedBtn ? clickedBtn.closest('.library-set-row') : null;
    if (row) movePreviewAfterRow(row);

    // Build compact card preview
    preview.innerHTML = '';
    preview.style.display = '';
    if (setName === 'numbers') {
        buildNumbersPreview(preview);
    } else {
        buildAbcPreview(preview);
    }
    if (editBtn) editBtn.style.display = '';
    updateGameVisibility();
}

function buildNumbersPreview(container) {
    var source = document.querySelector('#domino-library-screen #card-set-numbers');
    if (!source) return;
    source.querySelectorAll('.library-row').forEach(function(row) {
        var previewRow = document.createElement('div');
        previewRow.className = 'card-preview-row';
        row.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
            var svg = card.querySelector('svg');
            if (!svg) return;
            var thumb = document.createElement('div');
            thumb.className = 'card-preview-thumb';
            var clone = svg.cloneNode(true);
            thumb.appendChild(clone);
            previewRow.appendChild(thumb);
        });
        if (previewRow.children.length > 0) container.appendChild(previewRow);
    });
    // Also include orphaned custom card rows (outside #card-set-numbers)
    // for backward compatibility with cards saved before the fix
    var content = document.querySelector('#domino-library-screen .domino-library-content');
    if (content) {
        var children = content.children;
        for (var ci = 0; ci < children.length; ci++) {
            var ch = children[ci];
            if (ch.id === 'card-set-numbers' || ch.id === 'card-set-abc') continue;
            if (!ch.classList.contains('library-row')) continue;
            var previewRow = document.createElement('div');
            previewRow.className = 'card-preview-row';
            ch.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
                var svg = card.querySelector('svg');
                if (!svg) return;
                var thumb = document.createElement('div');
                thumb.className = 'card-preview-thumb';
                var clone = svg.cloneNode(true);
                thumb.appendChild(clone);
                previewRow.appendChild(thumb);
            });
            if (previewRow.children.length > 0) container.appendChild(previewRow);
        }
    }
}

function buildAbcPreview(container) {
    // Use the snapshot saved by the Card Maker — this guarantees the Library
    // preview shows the exact same cards in the exact same order.
    var letters = ['A', 'B', 'C', 'D', 'E'];
    var snapshot = null;
    try {
        var snapRaw = localStorage.getItem('abcCardSnapshot');
        if (snapRaw) snapshot = JSON.parse(snapRaw);
    } catch(e) {}

    if (snapshot) {
        // Include any extra letters beyond A-E (e.g. F, G, ...) from the snapshot
        var allLetters = letters.slice();
        Object.keys(snapshot).forEach(function(k) {
            if (allLetters.indexOf(k) === -1) allLetters.push(k);
        });
        allLetters.sort();
        allLetters.forEach(function(letter) {
            var cards = snapshot[letter];
            if (!cards || cards.length === 0) return;
            var previewRow = document.createElement('div');
            previewRow.className = 'card-preview-row';
            cards.forEach(function(svgContent) {
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 60 60');
                if (svgContent) svg.innerHTML = svgContent;
                var thumb = document.createElement('div');
                thumb.className = 'card-preview-thumb';
                thumb.appendChild(svg);
                previewRow.appendChild(thumb);
            });
            container.appendChild(previewRow);
        });
        return;
    }

    // Fallback: reconstruct from individual localStorage keys (before Card Maker has been opened)
    var colors = { A: '#336', B: '#633', C: '#363', D: '#663', E: '#636' };
    // Load saved edits
    var editMap = {};
    try {
        var _abcRaw = localStorage.getItem('editedBuiltinCards_abc');
        var edits = (_abcRaw && _abcRaw !== '[]') ? _abcRaw : localStorage.getItem('editedBuiltinCards');
        if (edits) {
            var abcLabels = {};
            letters.forEach(function(l) { for (var i = 1; i <= 5; i++) abcLabels[l + i] = true; });
            JSON.parse(edits).forEach(function(item) {
                if (abcLabels[item.label]) editMap[item.label] = item.svgContent;
            });
        }
    } catch(e) {}
    // Load deleted cards
    var deletedSet = {};
    try {
        var delRaw = localStorage.getItem('deletedCards_abc');
        if (delRaw) JSON.parse(delRaw).forEach(function(l) { deletedSet[l] = true; });
    } catch(e) {}
    // Load custom cards
    var customCards = [];
    try {
        var custRaw = localStorage.getItem('customDrawnCards_abc');
        if (custRaw) customCards = JSON.parse(custRaw);
    } catch(e) {}
    // Load arrangement
    var arrangement = {};
    try {
        var arrRaw = localStorage.getItem('cardArrangement_abc');
        if (arrRaw) arrangement = JSON.parse(arrRaw);
    } catch(e) {}

    // Build all cards into their default rows
    var allCards = {};
    var rowCards = {};
    letters.forEach(function(letter) {
        rowCards[letter] = [];
        for (var n = 1; n <= 5; n++) {
            var label = letter + n;
            if (deletedSet[label]) continue;
            // Skip empty placeholder slots (4-5) unless user edited them
            if (n >= 4 && !editMap[label]) continue;
            // Skip position 3 if no icon and not edited
            if (n === 3 && !abcIcons[letter] && !editMap[label]) continue;
            var svgContent = '';
            if (editMap[label]) {
                svgContent = editMap[label];
            } else if (n <= 2) {
                svgContent = '<text x="30" y="46" text-anchor="middle" font-size="48" font-weight="bold" fill="' + (colors[letter] || '#333') + '">' + letter + '</text>';
            } else if (n === 3 && abcIcons[letter]) {
                svgContent = abcIcons[letter].markup;
            }
            allCards[label] = { svg: svgContent };
            rowCards[letter].push(label);
        }
    });
    // Add custom cards
    customCards.forEach(function(item) {
        if (deletedSet[item.label]) return;
        var ch = item.label.charAt(0).toUpperCase();
        if (letters.indexOf(ch) < 0) return;
        allCards[item.label] = { svg: item.svgContent };
        rowCards[ch].push(item.label);
    });
    // Apply arrangement
    if (Object.keys(arrangement).length > 0) {
        var finalRows = {};
        var placed = {};
        letters.forEach(function(l) { finalRows[l] = []; });
        Object.keys(arrangement).forEach(function(letter) {
            if (!finalRows[letter]) finalRows[letter] = [];
            arrangement[letter].forEach(function(label) {
                if (allCards[label] && !placed[label]) {
                    finalRows[letter].push(label);
                    placed[label] = true;
                }
            });
        });
        letters.forEach(function(letter) {
            rowCards[letter].forEach(function(label) {
                if (allCards[label] && !placed[label]) {
                    finalRows[letter].push(label);
                    placed[label] = true;
                }
            });
        });
        rowCards = finalRows;
    }
    // Render
    letters.forEach(function(letter) {
        var previewRow = document.createElement('div');
        previewRow.className = 'card-preview-row';
        (rowCards[letter] || []).forEach(function(label) {
            var card = allCards[label];
            if (!card) return;
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 60 60');
            if (card.svg) svg.innerHTML = card.svg;
            var thumb = document.createElement('div');
            thumb.className = 'card-preview-thumb';
            thumb.appendChild(svg);
            previewRow.appendChild(thumb);
        });
        if (previewRow.children.length > 0) container.appendChild(previewRow);
    });
}

// --- Create new card set ---
function selectCustomSet(btn, setName) {
    // Deselect all set buttons
    var col = document.querySelector('.library-col-sets');
    col.querySelectorAll('.library-set-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    var preview = document.getElementById('card-set-preview');
    var editBtn = document.getElementById('edit-card-set-btn');

    // Toggle: clicking same set deselects
    if (previewedCardSet === setName) {
        previewedCardSet = null;
        preview.innerHTML = '';
        preview.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        updateGameVisibility();
        return;
    }

    btn.classList.add('selected');
    previewedCardSet = setName;
    activeCardSet = setName;

    // Move preview after the clicked row
    var row = btn.closest('.library-set-item-custom') || btn.closest('.library-set-row');
    if (row) movePreviewAfterRow(row);

    // Build preview of existing cards, or show empty message
    preview.innerHTML = '';
    preview.style.display = '';
    var hasCards = false;
    try {
        var raw = localStorage.getItem('customDrawnCards_' + setName);
        if (raw) {
            var cards = JSON.parse(raw);
            if (cards.length > 0) {
                hasCards = true;
                // Group cards by row letter (first character of label)
                var rowMap = {};
                var rowOrder = [];
                cards.forEach(function(item) {
                    var letter = item.label.charAt(0).toUpperCase();
                    if (!rowMap[letter]) {
                        rowMap[letter] = [];
                        rowOrder.push(letter);
                    }
                    rowMap[letter].push(item);
                });
                rowOrder.sort();
                rowOrder.forEach(function(letter) {
                    var previewRow = document.createElement('div');
                    previewRow.className = 'card-preview-row';
                    rowMap[letter].forEach(function(item) {
                        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('viewBox', '0 0 60 60');
                        svg.innerHTML = item.svgContent;
                        var thumb = document.createElement('div');
                        thumb.className = 'card-preview-thumb';
                        thumb.appendChild(svg);
                        previewRow.appendChild(thumb);
                    });
                    preview.appendChild(previewRow);
                });
            }
        }
    } catch(e) {}
    if (!hasCards) {
        preview.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-size:0.9rem;margin:10px 0;">Empty card set</p>';
    }

    // Show Edit button for custom sets
    if (editBtn) editBtn.style.display = '';
    updateGameVisibility();
}

function renameCardSet(btn, oldName, isBuiltin) {
    // Replace button with input for inline editing
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'new-set-input';
    input.value = btn.textContent;
    input.style.marginBottom = '0';
    btn.style.display = 'none';
    btn.parentNode.insertBefore(input, btn);
    input.focus();
    input.select();

    var committed = false;
    function commitRename() {
        if (committed) return;
        committed = true;
        var newName = input.value.trim();
        if (!newName) newName = oldName; // keep old name if empty
        input.remove();
        btn.style.display = '';
        btn.textContent = newName;

        if (newName === oldName) return;

        if (isBuiltin) {
            // Store renamed built-in set name
            var renames = {};
            try { renames = JSON.parse(localStorage.getItem('renamedBuiltinSets') || '{}'); } catch(e) {}
            renames[oldName] = newName;
            localStorage.setItem('renamedBuiltinSets', JSON.stringify(renames));
        } else {
            // Update custom sets list
            var sets = loadCardSets();
            var idx = sets.indexOf(oldName);
            if (idx !== -1) sets[idx] = newName;
            saveCardSets(sets);
            // Rename card data key
            var oldData = localStorage.getItem('customDrawnCards_' + oldName);
            if (oldData) {
                localStorage.setItem('customDrawnCards_' + newName, oldData);
                localStorage.removeItem('customDrawnCards_' + oldName);
            }
            // Update references in the button's click handler
            btn.onclick = null;
            btn.addEventListener('click', function() {
                selectCustomSet(btn, newName);
            });
            // Update delete button reference
            var wrapper = btn.parentNode;
            var delBtn = wrapper.querySelector('.library-set-delete-btn');
            if (delBtn) {
                delBtn.onclick = null;
                delBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteCardSet(newName, wrapper);
                });
            }
            // Update dblclick handler
            btn.ondblclick = null;
            btn.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                renameCardSet(btn, newName, false);
            });
            // Update active/previewed references
            if (previewedCardSet === oldName) previewedCardSet = newName;
            if (activeCardSet === oldName) activeCardSet = newName;
        }
    }

    input.addEventListener('blur', function() { commitRename(); });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
        if (e.key === 'Escape') { e.preventDefault(); input.value = oldName; commitRename(); }
    });
}

function deleteCardSet(setName, wrapper) {
    if (!confirm('Delete card set "' + setName + '"? This will also erase all cards in the set.')) return;
    // Remove from saved sets list
    var sets = loadCardSets();
    var idx = sets.indexOf(setName);
    if (idx !== -1) sets.splice(idx, 1);
    saveCardSets(sets);
    // Remove card data
    localStorage.removeItem('customDrawnCards_' + setName);
    // Clear preview/selection if this set was selected
    if (previewedCardSet === setName) {
        previewedCardSet = null;
        activeCardSet = 'numbers';
        var preview = document.getElementById('card-set-preview');
        if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
        var editBtn = document.getElementById('edit-card-set-btn');
        if (editBtn) editBtn.style.display = 'none';
    }
    // Remove from DOM
    wrapper.remove();
}

function deleteBuiltinCardSet(setName, wrapper) {
    var displayName = setName === 'abc' ? 'ABC' : 'Numbers and Dots';
    if (!confirm('Delete card set "' + displayName + '"? This will also erase all edits and custom cards in this set.')) return;
    // Clear related localStorage data
    if (setName === 'numbers') {
        localStorage.removeItem('customDrawnCards');
        localStorage.removeItem('cardArrangement');
    } else if (setName === 'abc') {
        localStorage.removeItem('editedBuiltinCards_abc');
        localStorage.removeItem('customDrawnCards_abc');
        localStorage.removeItem('deletedCards_abc');
        localStorage.removeItem('abcCardSnapshot');
    }
    // Clear preview/selection if this set was selected
    if (previewedCardSet === setName) {
        previewedCardSet = null;
        activeCardSet = 'numbers';
        var preview = document.getElementById('card-set-preview');
        if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
        var editBtn = document.getElementById('edit-card-set-btn');
        if (editBtn) editBtn.style.display = 'none';
    }
    // Persist deletion so built-in set stays hidden after reload
    try {
        var deleted = JSON.parse(localStorage.getItem('deletedBuiltinSets') || '[]');
        if (deleted.indexOf(setName) === -1) deleted.push(setName);
        localStorage.setItem('deletedBuiltinSets', JSON.stringify(deleted));
    } catch(e) {}
    // Remove from DOM
    wrapper.remove();
}

function createCustomSetElement(setName) {
    var wrapper = document.createElement('div');
    wrapper.className = 'library-set-item-custom';
    var btn = document.createElement('button');
    btn.className = 'library-set-btn';
    btn.textContent = setName;
    btn.addEventListener('click', function() {
        selectCustomSet(btn, setName);
    });
    btn.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        renameCardSet(btn, setName, false);
    });
    wrapper.appendChild(btn);
    var delBtn = document.createElement('button');
    delBtn.className = 'library-set-delete-btn';
    delBtn.title = 'Delete card set';
    delBtn.innerHTML = '&#10005;';
    delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteCardSet(setName, wrapper);
    });
    wrapper.appendChild(delBtn);
    return { wrapper: wrapper, btn: btn };
}

var deleteModeActive = false;
function toggleDeleteMode() {
    deleteModeActive = !deleteModeActive;
    var col = document.querySelector('.library-col-sets');
    var btn = document.getElementById('delete-mode-btn');
    if (deleteModeActive) {
        col.classList.add('delete-mode');
        btn.classList.add('active');
    } else {
        col.classList.remove('delete-mode');
        btn.classList.remove('active');
    }
}

function createNewCardSet() {
    var col = document.querySelector('.library-col-sets');
    // Don't create another if there's already a pending input
    if (col.querySelector('.new-set-input')) return;

    // Count all existing set buttons (built-in + custom)
    var existingCount = col.querySelectorAll('.library-set-btn').length;
    var n = existingCount + 1;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'new-set-input';
    input.placeholder = "Enter the title of the " + n + "'s card set";

    var committed = false;
    function commitSet() {
        if (committed) return;
        committed = true;
        var name = input.value.trim();
        if (!name) {
            name = 'Card Set Number ' + n;
        }
        // Create a button for the new set
        var el = createCustomSetElement(name);
        input.replaceWith(el.wrapper);

        // Save to localStorage
        var sets = loadCardSets();
        sets.push(name);
        saveCardSets(sets);

        // Initialize with 2 rows (A, B) each containing one empty card
        var initialCards = [
            { label: 'A1', svgContent: '', desc: 'Empty' },
            { label: 'B1', svgContent: '', desc: 'Empty' }
        ];
        localStorage.setItem('customDrawnCards_' + name, JSON.stringify(initialCards));
    }

    input.addEventListener('blur', function() {
        commitSet();
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitSet();
        }
    });

    // Insert at the end of the sets column
    col.appendChild(input);
    input.focus();
}

// loadCardSets, saveCardSets are now in js/shared-data.js

// Restore saved card sets on load
(function() {
    // Hide previously deleted built-in sets
    try {
        var deleted = JSON.parse(localStorage.getItem('deletedBuiltinSets') || '[]');
        deleted.forEach(function(setName) {
            var btnId = setName === 'abc' ? 'set-abc-btn' : 'set-numbers-btn';
            var btn = document.getElementById(btnId);
            if (btn && btn.parentNode) btn.parentNode.remove();
        });
    } catch(e) {}

    // Restore renamed built-in sets
    try {
        var renames = JSON.parse(localStorage.getItem('renamedBuiltinSets') || '{}');
        var numBtn = document.getElementById('set-numbers-btn');
        var abcBtn = document.getElementById('set-abc-btn');
        if (renames.numbers && numBtn) numBtn.textContent = renames.numbers;
        if (renames.abc && abcBtn) abcBtn.textContent = renames.abc;
    } catch(e) {}

    var sets = loadCardSets();
    if (!sets.length) return;
    var col = document.querySelector('.library-col-sets');
    sets.forEach(function(name) {
        var el = createCustomSetElement(name);
        col.appendChild(el.wrapper);
    });
})();

// Open the full Card Maker editor for the currently previewed set
function editCurrentCardSet() {
    if (!previewedCardSet) return;
    selectCardSet(previewedCardSet);
}

function isCustomCardSet(setName) {
    return setName !== 'numbers' && setName !== 'abc';
}

function buildCustomCardSet(setName) {
    var container = document.getElementById('card-set-custom');
    if (!container) return;
    container.innerHTML = '';
    // Load saved cards for this custom set
    var key = 'customDrawnCards_' + setName;
    try {
        var raw = localStorage.getItem(key);
        if (raw) {
            var cards = JSON.parse(raw);
            var rowMap = {};
            var rowOrder = [];
            cards.forEach(function(item) {
                var firstChar = item.label.charAt(0).toUpperCase();
                if (!rowMap[firstChar]) {
                    rowMap[firstChar] = [];
                    rowOrder.push(firstChar);
                }
                rowMap[firstChar].push(item);
            });
            rowOrder.sort();
            rowOrder.forEach(function(letter) {
                var section = document.createElement('div');
                section.className = 'library-section';
                container.appendChild(section);
                var row = document.createElement('div');
                row.className = 'library-row';
                row.dataset.rowLetter = letter;
                rowMap[letter].forEach(function(item) {
                    var card = document.createElement('div');
                    card.className = 'library-card';
                    card.dataset.custom = 'true';
                    var labelEl = document.createElement('div');
                    labelEl.className = 'library-label';
                    labelEl.textContent = item.label;
                    card.appendChild(labelEl);
                    var preview = document.createElement('div');
                    preview.className = 'domino-half-preview';
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 60 60');
                    svg.innerHTML = item.svgContent;
                    preview.appendChild(svg);
                    card.appendChild(preview);
                    var desc = document.createElement('div');
                    desc.className = 'library-desc';
                    desc.textContent = item.desc || 'Custom card';
                    card.appendChild(desc);
                    row.appendChild(card);
                    addCardDeleteButton(card);
                    addVarButton(card);
                    addCopyButton(card);
                });
                container.appendChild(row);
            });
        }
    } catch(e) {}
    // Restore any variations that were deferred until custom cards were built
    loadDeferredVariations('custom');
}

function selectCardSet(setName) {
    activeCardSet = setName;
    // Update button highlights
    var numbersBtn = document.getElementById('set-numbers-btn');
    var abcBtn = document.getElementById('set-abc-btn');
    if (numbersBtn) numbersBtn.classList.toggle('selected', setName === 'numbers');
    if (abcBtn) abcBtn.classList.toggle('selected', setName === 'abc');
    // Update Card Maker title
    var titleSpan = document.getElementById('card-maker-set-title');
    if (titleSpan) titleSpan.textContent = isCustomCardSet(setName) ? setName : (setName === 'abc' ? 'ABC' : 'Numbers and Dots');
    // Show/hide card set content — hide ALL content, then show only the active set
    var contentArea = document.querySelector('#domino-library-screen .domino-library-content');
    var numbersDiv = document.getElementById('card-set-numbers');
    var abcDiv = document.getElementById('card-set-abc');
    var customDiv = document.getElementById('card-set-custom');
    // Hide orphaned rows/sections that live outside card-set containers
    // (custom cards and variations added at the content level belong to Numbers set)
    var children = contentArea.children;
    for (var ci = 0; ci < children.length; ci++) {
        var ch = children[ci];
        if (ch.id === 'card-set-numbers' || ch.id === 'card-set-abc' || ch.id === 'card-set-custom') continue;
        if (ch.classList.contains('library-title')) continue;
        if (ch.classList.contains('library-section') || ch.classList.contains('library-row')) {
            ch.style.display = setName === 'numbers' ? '' : 'none';
        }
    }
    if (numbersDiv) numbersDiv.style.display = 'none';
    if (abcDiv) abcDiv.style.display = 'none';
    if (customDiv) customDiv.style.display = 'none';

    if (setName === 'abc') {
        if (abcDiv) {
            abcDiv.style.display = '';
            // Only rebuild from scratch if the container is empty (first load or after reset)
            if (!abcDiv.querySelector('.library-card')) buildAbcCardSet();
        }
    } else if (isCustomCardSet(setName)) {
        if (customDiv) { customDiv.style.display = ''; buildCustomCardSet(setName); }
    } else {
        if (numbersDiv) numbersDiv.style.display = '';
    }
    // Snapshot state before editing, navigate to Card Maker
    snapshotCardMakerState();
    document.getElementById('card-library-screen').style.display = 'none';
    document.getElementById('domino-library-screen').style.display = 'block';
}

// Built-in picture icons for ABC card set (slot 3 of each letter row)
var abcIcons = {
    A: {
        markup: '<ellipse cx="30" cy="14" rx="7" ry="6" fill="#4a3020"/><ellipse cx="30" cy="27" rx="5.5" ry="5" fill="#4a3020"/><ellipse cx="30" cy="43" rx="9" ry="11" fill="#4a3020"/><line x1="25" y1="9" x2="18" y2="2" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="35" y1="9" x2="42" y2="2" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><circle cx="17.5" cy="1.5" r="1.5" fill="#4a3020"/><circle cx="42.5" cy="1.5" r="1.5" fill="#4a3020"/><circle cx="27" cy="13" r="1.5" fill="white"/><circle cx="33" cy="13" r="1.5" fill="white"/><line x1="26" y1="24" x2="13" y2="17" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="34" y1="24" x2="47" y2="17" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="25" y1="28" x2="11" y2="30" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="35" y1="28" x2="49" y2="30" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="26" y1="32" x2="15" y2="42" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/><line x1="34" y1="32" x2="45" y2="42" stroke="#4a3020" stroke-width="1.5" stroke-linecap="round"/>',
        desc: 'Ant'
    },
    B: {
        markup: '<ellipse cx="30" cy="26" rx="20" ry="18" fill="#f0a0b8" stroke="#8b4060" stroke-width="1.5"/><line x1="30" y1="8" x2="30" y2="44" stroke="#8b4060" stroke-width="1.5"/><path d="M20 15 Q24 22 19 29" fill="none" stroke="#8b4060" stroke-width="1.2"/><path d="M40 15 Q36 22 41 29" fill="none" stroke="#8b4060" stroke-width="1.2"/><path d="M14 23 Q19 28 13 36" fill="none" stroke="#8b4060" stroke-width="1.2"/><path d="M46 23 Q41 28 47 36" fill="none" stroke="#8b4060" stroke-width="1.2"/><rect x="27" y="43" width="6" height="10" rx="2" fill="#d88898" stroke="#8b4060" stroke-width="1.2"/>',
        desc: 'Brain'
    },
    C: {
        markup: '<circle cx="30" cy="32" r="16" fill="#f5c06a" stroke="#8b6914" stroke-width="1.5"/><polygon points="16,22 20,6 26,20" fill="#f5c06a" stroke="#8b6914" stroke-width="1.5" stroke-linejoin="round"/><polygon points="44,22 40,6 34,20" fill="#f5c06a" stroke="#8b6914" stroke-width="1.5" stroke-linejoin="round"/><polygon points="18,21 21,10 25,20" fill="#f0a0a0"/><polygon points="42,21 39,10 35,20" fill="#f0a0a0"/><ellipse cx="23" cy="29" rx="3" ry="4" fill="#333"/><ellipse cx="37" cy="29" rx="3" ry="4" fill="#333"/><circle cx="24" cy="28" r="1.2" fill="white"/><circle cx="38" cy="28" r="1.2" fill="white"/><polygon points="30,35 28,37 32,37" fill="#e87a90"/><path d="M28,37 Q30,40 32,37" fill="none" stroke="#8b6914" stroke-width="1"/><line x1="6" y1="33" x2="21" y2="34" stroke="#8b6914" stroke-width="0.8"/><line x1="6" y1="37" x2="21" y2="36" stroke="#8b6914" stroke-width="0.8"/><line x1="54" y1="33" x2="39" y2="34" stroke="#8b6914" stroke-width="0.8"/><line x1="54" y1="37" x2="39" y2="36" stroke="#8b6914" stroke-width="0.8"/>',
        desc: 'Cat'
    },
    D: {
        markup: '<ellipse cx="13" cy="26" rx="7" ry="13" fill="#a07840" stroke="#8b6c30" stroke-width="1.5"/><ellipse cx="47" cy="26" rx="7" ry="13" fill="#a07840" stroke="#8b6c30" stroke-width="1.5"/><circle cx="30" cy="28" r="16" fill="#d4a860" stroke="#8b6c30" stroke-width="1.5"/><circle cx="23" cy="25" r="3.5" fill="#333"/><circle cx="37" cy="25" r="3.5" fill="#333"/><circle cx="24" cy="24" r="1.3" fill="white"/><circle cx="38" cy="24" r="1.3" fill="white"/><ellipse cx="30" cy="34" rx="8" ry="6" fill="#e8d0a8" stroke="#8b6c30" stroke-width="1"/><ellipse cx="30" cy="32" rx="3.5" ry="2.5" fill="#333"/><ellipse cx="31" cy="31.5" rx="1" ry="0.7" fill="#555"/><ellipse cx="30" cy="43" rx="3.5" ry="5" fill="#e87a90" stroke="#c06070" stroke-width="0.8"/><line x1="30" y1="39" x2="30" y2="47" stroke="#c06070" stroke-width="0.8"/>',
        desc: 'Dog'
    },
    E: {
        markup: '<path d="M30 5 C18 5 11 24 11 34 C11 47 19 55 30 55 C41 55 49 47 49 34 C49 24 42 5 30 5Z" fill="#f5f0e0" stroke="#8b8060" stroke-width="1.5"/><ellipse cx="24" cy="22" rx="4" ry="7" fill="rgba(255,255,255,0.4)" transform="rotate(-15,24,22)"/>',
        desc: 'Egg'
    }
};

function buildAbcCardSet() {
    var container = document.getElementById('card-set-abc');
    if (!container) return;
    container.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D', 'E'];
    var colors = { A: '#336', B: '#633', C: '#363', D: '#663', E: '#636' };
    // Load saved edits for ABC cards (prefer ABC-specific key, fall back to legacy)
    var editMap = {};
    try {
        var _abcRaw = localStorage.getItem('editedBuiltinCards_abc');
        var edits = (_abcRaw && _abcRaw !== '[]') ? _abcRaw : localStorage.getItem('editedBuiltinCards');
        if (edits) {
            var abcLabels = {};
            letters.forEach(function(l) { for (var i = 1; i <= 5; i++) abcLabels[l + i] = true; });
            JSON.parse(edits).forEach(function(item) {
                if (abcLabels[item.label]) editMap[item.label] = item.svgContent;
            });
        }
    } catch(e) {}
    letters.forEach(function(letter, li) {
        // Red separator line between groups
        var section = document.createElement('div');
        section.className = 'library-section';
        container.appendChild(section);
        // Row of cards for this letter
        var row = document.createElement('div');
        row.className = 'library-row';
        row.dataset.rowLetter = letter;
        // Generate cards per letter: positions 1-2 (letters), 3 (icon), 4-5 (only if user edited them)
        for (var n = 1; n <= 5; n++) {
            var label = letter + n;
            // Skip empty placeholder slots (4-5) unless user has drawn on them
            if (n >= 4 && !editMap[label]) continue;
            // Skip position 3 if no icon available and not edited
            if (n === 3 && !abcIcons[letter] && !editMap[label]) continue;
            var card = document.createElement('div');
            card.className = 'library-card';
            var labelDiv = document.createElement('div');
            labelDiv.className = 'library-label';
            labelDiv.textContent = label;
            card.appendChild(labelDiv);
            var preview = document.createElement('div');
            preview.className = 'domino-half-preview';
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 60 60');
            if (editMap[label]) {
                // Restore saved edit
                svg.innerHTML = editMap[label];
                card.dataset.edited = 'true';
            } else if (n <= 2) {
                var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '30');
                text.setAttribute('y', '46');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '48');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('fill', colors[letter] || '#333');
                text.textContent = letter;
                svg.appendChild(text);
            } else if (n === 3 && abcIcons[letter]) {
                svg.innerHTML = abcIcons[letter].markup;
            }
            preview.appendChild(svg);
            card.appendChild(preview);
            var desc = document.createElement('div');
            desc.className = 'library-desc';
            desc.textContent = n <= 2 ? 'Letter "' + letter + '"' : (n === 3 && abcIcons[letter] ? abcIcons[letter].desc : 'Custom');
            card.appendChild(desc);
            row.appendChild(card);
        }
        container.appendChild(row);
    });
    // Restore ABC custom cards (copies created by reflect/rotate)
    try {
        var abcCustomRaw = localStorage.getItem('customDrawnCards_abc');
        if (abcCustomRaw) {
            var abcCustomCards = JSON.parse(abcCustomRaw);
            abcCustomCards.forEach(function(item) {
                // Find the row for this card based on its first character
                var firstChar = item.label.charAt(0).toUpperCase();
                var rows = container.querySelectorAll('.library-row');
                var targetRow = null;
                var letterIdx = letters.indexOf(firstChar);
                if (letterIdx >= 0 && rows[letterIdx]) {
                    targetRow = rows[letterIdx];
                } else {
                    // Try to find any existing row with this letter
                    rows.forEach(function(r) {
                        if ((r.dataset.rowLetter || '').toUpperCase() === firstChar) targetRow = r;
                    });
                }
                if (!targetRow) {
                    // Create a new row for letters beyond A-E (e.g. F, G, ...)
                    var section = document.createElement('div');
                    section.className = 'library-section';
                    container.appendChild(section);
                    targetRow = document.createElement('div');
                    targetRow.className = 'library-row';
                    targetRow.dataset.rowLetter = firstChar;
                    container.appendChild(targetRow);
                }
                var card = document.createElement('div');
                card.className = 'library-card';
                card.dataset.custom = 'true';
                var labelDiv = document.createElement('div');
                labelDiv.className = 'library-label';
                labelDiv.textContent = item.label;
                card.appendChild(labelDiv);
                var preview = document.createElement('div');
                preview.className = 'domino-half-preview';
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 60 60');
                svg.innerHTML = item.svgContent;
                preview.appendChild(svg);
                card.appendChild(preview);
                var desc = document.createElement('div');
                desc.className = 'library-desc';
                desc.textContent = item.desc || 'Copy';
                card.appendChild(desc);
                targetRow.appendChild(card);
            });
        }
    } catch(e) {}
    // Add interactive buttons to restored custom cards
    container.querySelectorAll('.library-card[data-custom="true"]').forEach(function(card) {
        addCardDeleteButton(card);
        addVarButton(card);
        addCopyButton(card);
    });
    // Remove previously deleted ABC cards so they don't reappear
    // IMPORTANT: skip custom cards — deletedCards_abc tracks built-in card
    // deletions only; renumbering can cause custom cards to inherit a
    // deleted label, so we must never remove data-custom cards here.
    try {
        var deletedRaw = localStorage.getItem('deletedCards_abc');
        if (deletedRaw) {
            var deletedList = JSON.parse(deletedRaw);
            if (deletedList.length > 0) {
                container.querySelectorAll('.library-card:not(.variation):not([data-custom="true"])').forEach(function(card) {
                    var lbl = card.querySelector('.library-label');
                    if (lbl && deletedList.indexOf(lbl.textContent) !== -1) {
                        card.remove();
                    }
                });
                // Update empty-row state for affected rows
                container.querySelectorAll('.library-row').forEach(function(row) {
                    updateRowEmptyState(row);
                });
            }
        }
    } catch(e) {}
    // Also add interactive buttons to all built-in cards
    container.querySelectorAll('.library-card:not([data-custom="true"])').forEach(function(card) {
        addCardDeleteButton(card);
        addVarButton(card);
        addCopyButton(card);
    });
    // Apply saved card arrangement for ABC set
    applyCardArrangement('card-set-abc');
    // Re-save so new/custom cards are tracked in the arrangement
    saveCardArrangement('card-set-abc');
    // Save a snapshot of the rendered cards so the Library preview shows the exact same thing
    saveAbcSnapshot();
    // Restore any variations that were deferred until ABC cards were built
    loadDeferredVariations('abc');
}

// Save a snapshot of the Card Maker's rendered state so the Library preview
// can show the exact same cards without independent reconstruction.
function saveAbcSnapshot() {
    var container = document.getElementById('card-set-abc');
    if (!container) return;
    var snapshot = {};
    container.querySelectorAll('.library-row').forEach(function(row) {
        var letter = row.dataset.rowLetter;
        if (!letter) return;
        var cards = [];
        row.querySelectorAll('.library-card:not(.variation)').forEach(function(card) {
            var svg = card.querySelector('svg');
            cards.push(svg ? svg.innerHTML : '');
        });
        snapshot[letter] = cards;
    });
    try { localStorage.setItem('abcCardSnapshot', JSON.stringify(snapshot)); } catch(e) {}
}

// === Sync ABC Card Maker edits to the savedCustomGames entry ===
// Card Maker uses labels A1,A2..., game uses A01,A02... to avoid conflicts with Numbers set
function cardMakerLabelToGameLabel(cmLabel) {
    // A1 -> A01, B2 -> B02, etc.
    var m = cmLabel.match(/^([A-Z])(\d)$/);
    return m ? m[1] + '0' + m[2] : cmLabel;
}
function syncAbcCardsToGame() {
    var container = document.getElementById('card-set-abc');
    if (!container) return;
    var games = loadCustomGames();
    var abcIdx = -1;
    for (var i = 0; i < games.length; i++) {
        if (games[i].name === 'ABC') { abcIdx = i; break; }
    }
    if (abcIdx < 0) return;
    // Build a map of current Card Maker cards keyed by game label
    var markupMap = {};
    container.querySelectorAll('.library-card').forEach(function(card) {
        var lbl = card.querySelector('.library-label');
        var svg = card.querySelector('svg');
        if (!lbl || !svg) return;
        var markup = svg.innerHTML.trim();
        if (!markup) return;
        var gameLabel = cardMakerLabelToGameLabel(lbl.textContent);
        markupMap[gameLabel] = markup;
    });
    var changed = false;
    // Update svgMarkup on existing game cards
    var existingLabels = {};
    games[abcIdx].cards.forEach(function(c) {
        existingLabels[c.label] = true;
        if (markupMap[c.label] && markupMap[c.label] !== c.svgMarkup) {
            c.svgMarkup = markupMap[c.label];
            changed = true;
        }
    });
    // Remove deleted cards (in game but no longer in Card Maker)
    var filteredCards = games[abcIdx].cards.filter(function(c) {
        return !!markupMap[c.label];
    });
    if (filteredCards.length !== games[abcIdx].cards.length) {
        games[abcIdx].cards = filteredCards;
        changed = true;
    }
    // Add new cards (in Card Maker but not in game)
    Object.keys(markupMap).forEach(function(gameLabel) {
        if (!existingLabels[gameLabel]) {
            games[abcIdx].cards.push({
                label: gameLabel,
                isVariation: false,
                svgMarkup: markupMap[gameLabel],
                cardSet: 'ABC'
            });
            changed = true;
        }
    });
    if (changed) {
        saveCustomGames(games);
    }
}

// === Card Maker dirty tracking & save/cancel on leave ===
var cardMakerDirty = false;
var _cmSnapshot = {}; // localStorage snapshot taken on entry

// Take a snapshot of Card Maker-related localStorage on entry
// Note: cardArrangement is excluded — arrangement changes are auto-saved
// during drag and should always persist (even if user clicks Cancel).
function snapshotCardMakerState() {
    _cmSnapshot = {
        editedBuiltinCards_abc: localStorage.getItem('editedBuiltinCards_abc'),
        customDrawnCards: localStorage.getItem('customDrawnCards'),
        customDrawnCards_abc: localStorage.getItem('customDrawnCards_abc'),
        cardMakerVariations: localStorage.getItem('cardMakerVariations'),
        deletedCards_abc: localStorage.getItem('deletedCards_abc')
    };
    // Also snapshot custom set data if editing a custom set
    if (isCustomCardSet(activeCardSet)) {
        var customKey = 'customDrawnCards_' + activeCardSet;
        _cmSnapshot[customKey] = localStorage.getItem(customKey);
    }
    cardMakerDirty = false;
}

// Restore localStorage from snapshot (discard session changes)
function restoreCardMakerSnapshot() {
    var keys = ['editedBuiltinCards_abc', 'customDrawnCards', 'customDrawnCards_abc', 'cardMakerVariations', 'deletedCards_abc'];
    // Include custom set key if present in snapshot
    Object.keys(_cmSnapshot).forEach(function(k) {
        if (keys.indexOf(k) === -1) keys.push(k);
    });
    keys.forEach(function(key) {
        if (_cmSnapshot[key] === null || _cmSnapshot[key] === undefined) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, _cmSnapshot[key]);
        }
    });
}

// Called when user presses back from Card Maker
function returnToLibrary() {
    document.getElementById('domino-library-screen').style.display = 'none';
    document.getElementById('card-library-screen').style.display = 'block';
    // Refresh the inline preview if a card set is previewed
    if (previewedCardSet) {
        var preview = document.getElementById('card-set-preview');
        if (preview) {
            preview.innerHTML = '';
            if (previewedCardSet === 'numbers') buildNumbersPreview(preview);
            else if (previewedCardSet === 'abc') buildAbcPreview(preview);
            else {
                // Custom set: re-trigger selection to rebuild preview
                var col = document.querySelector('.library-col-sets');
                var btns = col.querySelectorAll('.library-set-btn');
                var setName = previewedCardSet;
                previewedCardSet = null; // reset so selectCustomSet doesn't toggle off
                btns.forEach(function(b) {
                    if (b.textContent === setName) {
                        selectCustomSet(b, setName);
                    }
                });
            }
        }
        var editBtn = document.getElementById('edit-card-set-btn');
        if (editBtn) editBtn.style.display = '';
    }
}

function leaveCardMaker() {
    // Final save to ensure all changes are persisted before leaving
    if (typeof saveVariations === 'function') saveVariations();
    if (activeCardSet === 'abc') {
        syncAbcCardsToGame();
    }
    cardMakerDirty = false;
    returnToLibrary();
}

function saveAndLeaveCardMaker() {
    // edits are already saved to editedBuiltinCards/etc by drawSave
    // Also sync ABC cards to savedCustomGames if ABC set is active
    if (activeCardSet === 'abc') {
        syncAbcCardsToGame();
    }
    cardMakerDirty = false;
    hideCardMakerSavePrompt();
    returnToLibrary();
}

function discardAndLeaveCardMaker() {
    // Restore localStorage to pre-editing state
    restoreCardMakerSnapshot();
    cardMakerDirty = false;
    hideCardMakerSavePrompt();
    // Rebuild DOM from restored state
    if (activeCardSet === 'abc') {
        buildAbcCardSet();
    } else {
        loadCustomCards();
    }
    returnToLibrary();
}

function showCardMakerSavePrompt() {
    var overlay = document.getElementById('card-maker-save-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideCardMakerSavePrompt() {
    var overlay = document.getElementById('card-maker-save-overlay');
    if (overlay) overlay.style.display = 'none';
}
