// ! for cards infinte scrolling

// ! for the cards very slow infinte animation

function infinteAnimation(root , carousel) {
    const AUTO_SPEED  = 50;     // px per second -> the "very slow" part (lower = slower)
    const IDLE_RESUME = 300;   // ms without any user action before it moves again

    // false = it always animates
    // true  = it stops for visitors who turned animations off in their system
    //         (on Windows : Settings > Accessibility > Visual effects > Animation effects)
    const RESPECT_REDUCED_MOTION = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf       = null;   // the running requestAnimationFrame
    let autoPos   = 0;      // our own position, with decimals (scrollLeft gets rounded)
    let lastTime  = 0;
    let idleUntil = 0;      // don't move before this time

    let mouseInside = false;        // the mouse is somewhere on the carousel
    let mouseX = 0 , mouseY = 0;    // its last position
    let touching = false;           // a finger is on the carousel

    //! >>>>>>>>>>>>>>  [ 1 ]   When it may move  :

    function pauseFor(now) {
        idleUntil = now + IDLE_RESUME;
    }

    // is the mouse on a CARD ? (the gaps, the padding and the arrows don't count)
    // checked every frame, because the cards move under a mouse that stays still
    function onCard() {
        if (!mouseInside)
            return false;

        const under = document.elementFromPoint(mouseX , mouseY);

        return under !== null && under.closest(".card") !== null;
    }

    function canMove() {
        if (!carousel.isLooping())         // the cards fit -> no clones -> nothing to animate
            return false;

        if (onCard() || carousel.isBusy()) // the mouse is on a card, or an arrow / drag is running
            return false;
        
        if (touching)                      // a finger is holding the cards
            return false;

        if (RESPECT_REDUCED_MOTION && reduced.matches)
            return false;

        return true;
    }

    //! >>>>>>>>>>>>>>  [ 2 ]   One frame  :

    function step(now) {
        raf = requestAnimationFrame(step);

        let dt = 0;
        if (lastTime)
            dt = Math.min(now - lastTime , 50) / 1000;  // capped : no big jump after a lag
        lastTime = now;

        // someone else moved the cards (arrow, drag, wheel, resize...) -> follow them, then wait
        if (Math.abs(carousel.getPos() - autoPos) > 2) {
            autoPos = carousel.getPos();
            pauseFor(now);
        }

        if (!canMove()) {
            pauseFor(now);      // so it waits IDLE_RESUME after the user is done
            return;
        }

        if (now < idleUntil)
            return;

        autoPos += AUTO_SPEED * dt;     // always the same direction
        carousel.setPos(autoPos);
        autoPos += carousel.wrapNow();  // passed the clones -> jump back one set (invisible)
    }

    //! >>>>>>>>>>>>>>  [ 3 ]   Start / Stop  :

    function start() {
        if (raf)
            return;

        lastTime = 0;
        autoPos  = carousel.getPos();
        raf      = requestAnimationFrame(step);
    }

    function stop() {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
    }

    root.addEventListener("mousemove" , e => {
        mouseInside = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    root.addEventListener("mouseleave" , () => {
        mouseInside = false;
    });

    root.addEventListener("touchstart" , () => {
        touching = true;
        pauseFor(performance.now());
    } , { passive : true });

    root.addEventListener("touchend" , () => {
        touching = false;
        pauseFor(performance.now());
    } , { passive : true });

    root.addEventListener("touchcancel" , () => {
        touching = false;
        pauseFor(performance.now());
    } , { passive : true });

    // only runs while the carousel is on the screen
    // (a hidden tab is display:none -> not intersecting -> stopped)
    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting)
            start();
        else
            stop();
    }).observe(root);
}


function infinteScrolling(root) {
    const track = root.querySelector(".list");
    const prev = root.querySelector(".arrow.prev");
    const next = root.querySelector(".arrow.next");

    if (!track || !track.children.length)
        return;

    // to handle arabic not being scrlolling
    const rtl    = () => getComputedStyle(track).direction === "rtl";
    const getPos = () => Math.abs(track.scrollLeft);
    const setPos = (v) => { track.scrollLeft = rtl() ? -v : v; };

    const SETS = 3; // number of the clones from the same card - to loop from right and left
    const originals = Array.from(track.children); // to return an arry of the orginal <li>

    let looping = false; // to check if the cards "clones" are looping right now
    let period = 0;      // the exact width of one set
    let ready = false;   // to check if the start position has been set

    //! >>>>>>>>>>>>>>  [ 1 ]   Clones  :

    function addClones() {
        for (let set = 1 ; set < SETS ; set++) {
            originals.forEach(li => {
                const copy = li.cloneNode(true);

                copy.removeAttribute("id");
                copy.setAttribute("aria-hidden" , "true");
                copy.setAttribute("data-clone" , "");

                track.appendChild(copy);
            });
        }
    }

    function removeClones() {
        Array.from(track.children).forEach(element => {
            if (element.hasAttribute("data-clone"))
                element.remove();
        });
    }

    //! >>>>>>>>>>>>>>  [ 2 ]   Measuring  :

    function measurePeriod() {
        const twin = track.children[originals.length];

        if (twin)
            return Math.abs(twin.offsetLeft - track.children[0].offsetLeft);

        return 0;
    }

    function update() {
        // const oneSet = looping ? measurePeriod() : track.scrollWidth;
        const oneSet = (() => {
            if (looping)
                return measurePeriod();
            return track.scrollWidth;
        })();

        const shouldLoop = oneSet > track.clientWidth + 1;
        const changed = shouldLoop !== looping;

        if (changed) {
            if (shouldLoop) {
                addClones();
                looping = true;
            }
            else {
                removeClones();
                looping = false;
            }
        }

        root.classList.toggle("is-static" , !looping);

        if (looping)
            period = measurePeriod();
        else 
            period = 0;

        if (changed || !ready) {
            if (looping)
                setPos(period);
            else
                setPos(0);
            ready = true;
        }
        else if (looping)
            wrapNow();
    }

    root._update = update;  // so tab-switching code can re-measure-
                            // (._ =... is to assign a custom property)
    update();
    window.addEventListener("load" , update);
    window.addEventListener("languagechange", update);
    track.querySelectorAll("img").forEach(img => {
        if (!img.complete)
            img.addEventListener("load" , update , { once : true });
    });

    new ResizeObserver(update).observe(track);

    //! >>>>>>>>>>>>>>  [ 3 ]   The wrap  :

    function wrapNow() {
        if (!looping || !period)
            return 0;

        if (getPos() < period * 0.5) {
            setPos(getPos() + period);
            return period;
        }

        if (getPos() > period * 1.5) {
            setPos(getPos() - period);
            return -period;
        }

        return 0;
    }

    track.addEventListener("scroll" , () => {
        if (!dragging && !anim)
            wrapNow();
    } , { passive: true });

    //! >>>>>>>>>>>>>>  [ 4 ]   Arrows  :

    let anim = null;

    function stopAnim() {
        if (anim) {
            cancelAnimationFrame(anim);
            anim = null;
        }
    }

    function animateBy(amount , duration = 450) {
        if (!looping)
            return;

        stopAnim();

        const start = performance.now();
        let done = 0;
        // const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        function easeFunc(t) {
            if (t < 0.5)
                return 2 * t * t;
            else
                return 1 - Math.pow(-2 * t + 2 , 2) / 2;
        }
        const ease = easeFunc;

        function step(now) {
            const t = Math.min((now - start) / duration , 1);
            const target = amount * ease(t);

            setPos(getPos() + (target - done));
            done = target;

            wrapNow();
            // anim = t < 1 ? requestAnimationFrame(step) : null;
            if (t < 1)
                anim = requestAnimationFrame(step);
            else
                anim = null;
        }

        anim =requestAnimationFrame(step);
    }

    function stepSize() {
        const first = track.firstElementChild;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

        return first.getBoundingClientRect().width + gap;
    }

    if (next)
        next.addEventListener("click" , () => animateBy(stepSize()));

    if (prev)
        prev.addEventListener("click" , () => animateBy(-stepSize()));

    //! >>>>>>>>>>>>>>  [ 5 ]   Drag  :

    const DRAG_THRESHOLD = 6;
    let dragging = false , startX = 0 , startScroll = 0 , moved = 0;

    track.addEventListener("pointerdown" , e => {
        if (!looping)
            return;
        if (e.pointerType !== "mouse" || e.button !== 0)
            return;

        stopAnim();

        dragging = true;
        moved = 0;
        startX = e.clientX;
        startScroll = getPos();

        track.classList.add("dragging");
        // NO setPointerCapture — it retargets the click to the <ul>
    });

    window.addEventListener("pointermove" , e => {
        if (!dragging)
            return;
        
        const dx = e.clientX - startX;
        moved = Math.max(moved , Math.abs(dx));
        
        setPos(startScroll - (rtl() ? -dx : dx));
        startScroll += wrapNow();
    });

    function endDrag() {
        if (!dragging)
            return;

        dragging = false;
        track.classList.remove("dragging");
    }

    window.addEventListener("pointerup" , endDrag);
    window.addEventListener("pointercancel" , endDrag);

    //! >>>>>>>>>>>>>>  [ 6 ]   Click vs Drag  :

    track.addEventListener("click" , e => {
        if (moved > DRAG_THRESHOLD) {
            e.preventDefault();
            e.stopPropagation();
        }
    } , true);

    track.addEventListener("dragstart" , e => e.preventDefault());

    //! >>>>>>>>>>>>>>  [ 7 ]   Infinte animation  :

    infinteAnimation(root , {
        getPos    : getPos,
        setPos    : setPos,
        wrapNow   : wrapNow,
        isLooping : () => looping,
        isBusy    : () => dragging || anim !== null,
    });

}

// ! for cards finite scrolling + a very slow auto-scroll (only when the cards overflow)

function finiteScrolling(root) {
    const track = root.querySelector(".list");
    const prev  = root.querySelector(".arrow.prev");
    const next  = root.querySelector(".arrow.next");

    if (!track || !track.children.length)
        return;

    //! >>>>>>>>>>>>>>  [ 0 ]   Knobs  :

    const AUTO_SPEED     = 20;    // px per second -> the "very slow" animation
    const AUTO_HOLD      = 1500;  // ms to wait at each end before turning back
    const IDLE_RESUME    = 4000;  // ms after the user stops before the auto-scroll comes back
    const STEP_TIME      = 450;   // ms for one arrow step
    const REWIND_TIME    = 350;   // ms for the fast trip to the 1st / last card
    const DRAG_THRESHOLD = 6;     // px of movement that turns a click into a drag

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let overflowing = false;  // do the cards overflow their container ?
    let maxScroll   = 0;      // the biggest legal scroll position
    let isRtl       = false;  // measured once per update(), NOT every frame

    //! >>>>>>>>>>>>>>  [ 1 ]   Position helpers  :

    // to handle arabic : in rtl, scrollLeft goes from 0 to -max
    function getPos() {
        return Math.abs(track.scrollLeft);
    }

    function setPos(value) {
        if (isRtl)
            track.scrollLeft = -value;
        else
            track.scrollLeft = value;
    }

    // distance of each card from the start of the list (works for ltr and rtl)
    function cardStarts() {
        const first = track.children[0];

        return Array.from(track.children , li => {
            if (isRtl)
                return (first.offsetLeft + first.offsetWidth) - (li.offsetLeft + li.offsetWidth);
            return li.offsetLeft - first.offsetLeft;
        });
    }

    //! >>>>>>>>>>>>>>  [ 2 ]   Measuring  :

    function update() {
        isRtl       = getComputedStyle(track).direction === "rtl";
        maxScroll   = Math.max(0 , track.scrollWidth - track.clientWidth);
        overflowing = maxScroll > 1;

        root.classList.toggle("is-static" , !overflowing);

        if (!overflowing) {
            stopAuto();
            stopAnim();
            setPos(0);
            return;
        }

        if (getPos() > maxScroll)   // the window got wider : stay inside the list
            setPos(maxScroll);

        startAuto();
    }

    // after a language change the direction flips : start again from the 1st card
    function restart() {
        stopAuto();
        stopAnim();
        autoDir = 1;
        track.scrollLeft = 0;       // 0 is "the start" in both ltr and rtl
        update();
    }

    //! >>>>>>>>>>>>>>  [ 3 ]   Auto-scroll (the very slow animation)  :

    let autoRaf   = null;
    let autoPos   = 0;      // our own float position (see the doc, section 6)
    let autoDir   = 1;      // 1 = towards the last card , -1 = towards the 1st
    let lastTime  = 0;
    let holdUntil = 0;
    let idleTimer = null;

    let hovered = false;    // the mouse is on the carousel
    let visible = false;    // the carousel is on the screen

    function canAuto() {
        return overflowing && visible && !hovered && !dragging && !anim && !reduced.matches;
    }

    function autoStep(now) {
        autoRaf = requestAnimationFrame(autoStep);

        if (!lastTime) {
            lastTime = now;
            return;
        }

        const dt = Math.min(now - lastTime , 50) / 1000;  // capped : no big jump after a lag
        lastTime = now;

        if (now < holdUntil)    // resting at one end
            return;

        autoPos += autoDir * AUTO_SPEED * dt;

        if (autoPos >= maxScroll) {
            autoPos   = maxScroll;
            autoDir   = -1;
            holdUntil = now + AUTO_HOLD;
        }
        else if (autoPos <= 0) {
            autoPos   = 0;
            autoDir   = 1;
            holdUntil = now + AUTO_HOLD;
        }

        setPos(autoPos);
    }

    function startAuto() {
        if (autoRaf || !canAuto())
            return;

        autoPos   = getPos();   // continue from where the user left it
        lastTime  = 0;
        holdUntil = performance.now() + AUTO_HOLD;
        autoRaf   = requestAnimationFrame(autoStep);
    }

    function stopAuto() {
        clearTimeout(idleTimer);

        if (autoRaf) {
            cancelAnimationFrame(autoRaf);
            autoRaf = null;
        }
    }

    function resumeLater() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startAuto , IDLE_RESUME);
    }

    //! >>>>>>>>>>>>>>  [ 4 ]   Arrows  :

    let anim = null;
    let animTarget = 0;

    function stopAnim() {
        if (anim) {
            cancelAnimationFrame(anim);
            anim = null;
        }
    }

    function easeFunc(t) {
        if (t < 0.5)
            return 2 * t * t;
        else
            return 1 - Math.pow(-2 * t + 2 , 2) / 2;
    }

    function animateTo(target , duration) {
        stopAnim();
        stopAuto();

        const from     = getPos();
        const distance = target - from;
        const start    = performance.now();

        animTarget = target;

        if (Math.abs(distance) < 1 || reduced.matches) {
            setPos(target);
            resumeLater();
            return;
        }

        function step(now) {
            const t = Math.min((now - start) / duration , 1);

            setPos(from + distance * easeFunc(t));

            if (t < 1)
                anim = requestAnimationFrame(step);
            else {
                anim = null;
                resumeLater();
            }
        }

        anim = requestAnimationFrame(step);
    }

    // where we are, or where we are going if an arrow animation is still running
    // (so fast double clicks move 2 cards instead of getting lost)
    function currentPos() {
        if (anim)
            return animTarget;
        return getPos();
    }

    function goNext() {
        if (!overflowing)
            return;

        const pos = currentPos();

        if (pos >= maxScroll - 1) {                 // no card after -> back to the 1st one
            animateTo(0 , REWIND_TIME);
            return;
        }

        const starts = cardStarts();

        for (let i = 0 ; i < starts.length ; i++) {
            if (starts[i] > pos + 1) {
                animateTo(Math.min(starts[i] , maxScroll) , STEP_TIME);
                return;
            }
        }

        animateTo(maxScroll , STEP_TIME);
    }

    function goPrev() {
        if (!overflowing)
            return;

        const pos = currentPos();

        if (pos <= 1) {                             // no card before -> to the last one
            animateTo(maxScroll , REWIND_TIME);
            return;
        }

        const starts = cardStarts();

        for (let i = starts.length - 1 ; i >= 0 ; i--) {
            if (starts[i] < pos - 1) {
                animateTo(starts[i] , STEP_TIME);
                return;
            }
        }

        animateTo(0 , STEP_TIME);
    }

    if (next)
        next.addEventListener("click" , goNext);

    if (prev)
        prev.addEventListener("click" , goPrev);

    //! >>>>>>>>>>>>>>  [ 5 ]   Pausing  :

    root.addEventListener("mouseenter" , () => {
        hovered = true;
        stopAuto();
    });

    root.addEventListener("mouseleave" , () => {
        hovered = false;
        resumeLater();
    });

    root.addEventListener("touchstart" , stopAuto , { passive : true });
    root.addEventListener("touchend"   , resumeLater , { passive : true });

    root.addEventListener("focusin"  , stopAuto);
    root.addEventListener("focusout" , resumeLater);

    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;

        if (visible)
            startAuto();
        else
            stopAuto();
    }).observe(root);

    reduced.addEventListener("change" , () => {
        stopAuto();
        startAuto();
    });

    //! >>>>>>>>>>>>>>  [ 6 ]   Drag  :

    let dragging = false , startX = 0 , startScroll = 0 , moved = 0;

    track.addEventListener("pointerdown" , e => {
        if (!overflowing)
            return;
        if (e.pointerType !== "mouse" || e.button !== 0)
            return;

        stopAnim();
        stopAuto();

        dragging = true;
        moved = 0;
        startX = e.clientX;
        startScroll = getPos();

        track.classList.add("dragging");
        // NO setPointerCapture — it retargets the click to the <ul>
    });

    window.addEventListener("pointermove" , e => {
        if (!dragging)
            return;

        const dx = e.clientX - startX;
        moved = Math.max(moved , Math.abs(dx));

        // finite : the browser clamps it between the 1st and the last card
        if (isRtl)
            setPos(startScroll + dx);
        else
            setPos(startScroll - dx);
    });

    function endDrag() {
        if (!dragging)
            return;

        dragging = false;
        track.classList.remove("dragging");
        resumeLater();
    }

    window.addEventListener("pointerup" , endDrag);
    window.addEventListener("pointercancel" , endDrag);

    //! >>>>>>>>>>>>>>  [ 7 ]   Click vs Drag  :

    track.addEventListener("click" , e => {
        if (moved > DRAG_THRESHOLD) {
            e.preventDefault();
            e.stopPropagation();
        }
    } , true);

    track.addEventListener("dragstart" , e => e.preventDefault());

    //! >>>>>>>>>>>>>>  [ 8 ]   Start  :

    root._update = update;  // so tab-switching code can re-measure
                            // (._ =... is to assign a custom property)

    new ResizeObserver(update).observe(track);  // also catches a tab going display:none -> shown
    window.addEventListener("load" , update);
    window.addEventListener("languagechange" , restart);

    track.querySelectorAll("img").forEach(img => {
        if (!img.complete)
            img.addEventListener("load" , update , { once : true });
    });

    update();
}

function carousel() {
    document.querySelectorAll(".carousel").forEach(infinteScrolling);
}


export {carousel};
