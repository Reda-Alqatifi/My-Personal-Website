// ! for cards infinte scrolling

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
}

function carousel() {
    document.querySelectorAll(".carousel").forEach(infinteScrolling);
}


export {carousel};
