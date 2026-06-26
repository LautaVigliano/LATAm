/**
 * Arquímedes y el Límite - Didactic Web Application
 * Core JS Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       0. THEME MANAGEMENT (LIGHT / DARK MODE)
       ========================================================================== */
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    
    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeUI(isLight);
    }
    
    function updateThemeUI(isLight) {
        const icons = document.querySelectorAll('.theme-icon');
        const labels = document.querySelectorAll('.theme-label');
        
        icons.forEach(icon => {
            icon.textContent = '';
        });
        
        labels.forEach(label => {
            label.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
        });
    }
    
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeUI(true);
    } else {
        updateThemeUI(false);
    }
    
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
    if (themeToggleDesktop) {
        themeToggleDesktop.addEventListener('click', toggleTheme);
    }

    /* ==========================================================================
       1. ROUTING & NAVIGATION (NON-LINEAR TABS)
       ========================================================================== */
    const navItems = document.querySelectorAll('.nav-item');
    const footerNavBtns = document.querySelectorAll('.footer-nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const appSidebar = document.getElementById('app-sidebar');

    function switchSection(targetSectionId) {
        // Hide all sections and remove active classes
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active state from all navigation buttons
        navItems.forEach(item => item.classList.remove('active'));
        footerNavBtns.forEach(btn => btn.classList.remove('active'));
        
        // Activate target section
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Highlight active buttons (both sidebar and footer dock)
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetSectionId) {
                item.classList.add('active');
            }
        });
        footerNavBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === targetSectionId) {
                btn.classList.add('active');
            }
        });

        // If mobile sidebar drawer is open, close it
        if (appSidebar.classList.contains('open')) {
            appSidebar.classList.remove('open');
            mobileNavToggle.classList.remove('open');
        }
        
        // Trigger MathJax re-render for formulas in newly visible sections
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }

    // Attach click listeners to sidebar nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = item.getAttribute('data-target');
            switchSection(target);
        });
    });

    // Attach click listeners to mobile footer nav items
    footerNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            switchSection(target);
        });
    });

    // Mobile Sidebar Drawer Toggle
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            appSidebar.classList.toggle('open');
            mobileNavToggle.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024) {
            if (!appSidebar.contains(e.target) && !mobileNavToggle.contains(e.target) && appSidebar.classList.contains('open')) {
                appSidebar.classList.remove('open');
                mobileNavToggle.classList.remove('open');
            }
        }
    });

    /* ==========================================================================
       1.5 SUB-TABS MANAGEMENT
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabsContainer = btn.parentElement;
            const targetTabId = btn.getAttribute('data-tab');
            
            // Deactivate all buttons in this container
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            // Deactivate all tab-content blocks in the parent card
            const parentCard = tabsContainer.closest('.card');
            parentCard.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Activate target
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       2. INSTANCE 1: PARADOJAS DEL INFINITO - EL CHOCOLATE DE ZENÓN
       ========================================================================== */
    let chocStep = 0;
    let chocChallenge = 1; // 1: error < 0.01 (step >= 7), 2: error < 0.001 (step >= 10)
    
    const chocStepDisplay = document.getElementById('choc-step');
    const chocRemainingDisplay = document.getElementById('choc-remaining');
    const chocSumDisplay = document.getElementById('choc-sum');
    const btnChocEat = document.getElementById('btn-choc-eat');
    const btnChocReset = document.getElementById('btn-choc-reset');
    const chocFeedback = document.getElementById('choc-feedback');
    const chocBlocksGroup = document.getElementById('chocolate-blocks-group');
    const chocChallengeTitle = document.getElementById('choc-challenge-title');
    const chocChallengeDesc = document.getElementById('choc-challenge-desc');
    const chocChallengeBadge = document.getElementById('choc-challenge-badge');

    function drawChocolate() {
        if (!chocBlocksGroup) return;
        chocBlocksGroup.innerHTML = '';
        
        // Draw dynamically
        for (let i = 1; i <= chocStep; i++) {
            const w = 400 / Math.pow(2, i);
            const x = 400 * (1 - 1 / Math.pow(2, i - 1));
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x.toFixed(2));
            rect.setAttribute('y', '20');
            rect.setAttribute('width', w.toFixed(2));
            rect.setAttribute('height', '50');
            rect.setAttribute('class', 'chocolate-block-eaten');
            rect.setAttribute('rx', '3');
            chocBlocksGroup.appendChild(rect);
            
            if (w > 15) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (x + w/2).toFixed(2));
                text.setAttribute('y', '47');
                text.setAttribute('class', 'chocolate-text-label eaten');
                text.textContent = `1/${Math.pow(2, i)}`;
                chocBlocksGroup.appendChild(text);
            }
        }
        
        // Draw remaining block
        const remW = 400 / Math.pow(2, chocStep);
        const remX = 400 * (1 - 1 / Math.pow(2, chocStep));
        
        if (remW > 0.001) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', remX.toFixed(2));
            rect.setAttribute('y', '20');
            rect.setAttribute('width', remW.toFixed(2));
            rect.setAttribute('height', '50');
            rect.setAttribute('class', 'chocolate-block-remaining');
            rect.setAttribute('rx', '3');
            chocBlocksGroup.appendChild(rect);
            
            if (remW > 18) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (remX + remW/2).toFixed(2));
                text.setAttribute('y', '47');
                text.setAttribute('class', 'chocolate-text-label remaining');
                text.textContent = chocStep === 0 ? '1' : `1/${Math.pow(2, chocStep)}`;
                chocBlocksGroup.appendChild(text);
            }
        }
    }

    function updateChocolateGame() {
        const remainingVal = 1 / Math.pow(2, chocStep);
        const eatenVal = 1 - remainingVal;
        
        if (chocStepDisplay) chocStepDisplay.textContent = chocStep;
        if (chocRemainingDisplay) chocRemainingDisplay.textContent = remainingVal.toFixed(4);
        if (chocSumDisplay) chocSumDisplay.textContent = eatenVal.toFixed(4);
        
        drawChocolate();
        
        // Challenge verification
        if (chocFeedback) {
            if (chocChallenge === 1) {
                if (remainingVal < 0.01) {
                    chocFeedback.textContent = `¡Logrado! El trozo restante es ${remainingVal.toFixed(4)} (< 0.01) en el paso ${chocStep}.`;
                    chocFeedback.className = 'callout success';
                    
                    // Show next challenge button after 1.5 seconds
                    setTimeout(() => {
                        chocChallenge = 2;
                        if (chocChallengeTitle) chocChallengeTitle.textContent = 'Desafío del 0.1% (Tolerancia ε = 0.001)';
                        if (chocChallengeDesc) chocChallengeDesc.textContent = 'Comé suficiente chocolate para que el trozo sobrante sea menor al 0.1% (0.001) de la barra original.';
                        chocFeedback.textContent = '¡Nueva Misión Activa! Seguí comiendo...';
                        chocFeedback.className = 'callout warning';
                    }, 1800);
                } else {
                    chocFeedback.textContent = `Llevás comido ${eatenVal.toFixed(4)}. Queda ${remainingVal.toFixed(4)}. ¡Sigue comiendo!`;
                    chocFeedback.className = 'callout warning';
                }
            } else if (chocChallenge === 2) {
                if (remainingVal < 0.001) {
                    chocFeedback.textContent = `¡Espectacular! Con ${chocStep} divisiones, el trozo restante es ${remainingVal.toFixed(4)} (< 0.001). ¡Completaste todos los desafíos!`;
                    chocFeedback.className = 'callout success';
                    if (chocChallengeBadge) {
                        chocChallengeBadge.textContent = '¡Completado!';
                        chocChallengeBadge.className = 'badge success-pulse';
                    }
                } else {
                    chocFeedback.textContent = `Llevás comido ${eatenVal.toFixed(4)}. Queda ${remainingVal.toFixed(4)}. ¡Falta poco!`;
                    chocFeedback.className = 'callout warning';
                }
            }
        }
    }

    // Attach Zeno Chocolate listeners
    const btnEat = document.getElementById('btn-choc-eat');
    const btnReset = document.getElementById('btn-choc-reset');
    
    if (btnEat) {
        btnEat.addEventListener('click', () => {
            if (chocStep < 15) { 
                chocStep++;
                updateChocolateGame();
            }
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            chocStep = 0;
            chocChallenge = 1;
            if (chocChallengeTitle) chocChallengeTitle.textContent = 'Desafío del 1% (Tolerancia ε = 0.01)';
            if (chocChallengeDesc) chocChallengeDesc.textContent = 'Comé suficiente chocolate para que el trozo sobrante sea menor al 1% (0.01) de la barra original.';
            if (chocChallengeBadge) {
                chocChallengeBadge.textContent = 'Misión Activa';
                chocChallengeBadge.className = 'badge';
            }
            updateChocolateGame();
        });
    }

    // Initialize Chocolate Game
    updateChocolateGame();

    /* ==========================================================================
       2b. INSTANCE 1b: AQUILES Y LA TORTUGA
       ========================================================================== */
    let raceStepVal = 0;
    let achillesPosVal = 0.00;
    let tortoisePosVal = 190.00;
    
    const raceStepDisplay = document.getElementById('race-step');
    const raceDistanceDisplay = document.getElementById('race-distance');
    const posAchillesDisplay = document.getElementById('pos-achilles');
    const posTortoiseDisplay = document.getElementById('pos-tortoise');
    const btnRaceStep = document.getElementById('btn-race-step');
    const btnRaceReset = document.getElementById('btn-race-reset');
    const raceFeedback = document.getElementById('race-feedback');
    const raceChallengeBadge = document.getElementById('race-challenge-badge');
    
    const avatarAchilles = document.getElementById('avatar-achilles');
    const avatarTortoise = document.getElementById('avatar-tortoise');

    function updateRaceGame() {
        const distanceVal = 190 / Math.pow(10, raceStepVal);
        
        if (raceStepVal === 0) {
            achillesPosVal = 0.00;
            tortoisePosVal = 190.00;
        } else {
            let aPos = 0;
            let tPos = 190;
            for (let i = 1; i <= raceStepVal; i++) {
                aPos = tPos;
                tPos = aPos + 190 / Math.pow(10, i);
            }
            achillesPosVal = aPos;
            tortoisePosVal = tPos;
        }
        
        if (raceStepDisplay) raceStepDisplay.textContent = raceStepVal;
        if (raceDistanceDisplay) raceDistanceDisplay.textContent = distanceVal.toFixed(2) + 'm';
        if (posAchillesDisplay) posAchillesDisplay.textContent = achillesPosVal.toFixed(2) + 'm';
        if (posTortoiseDisplay) posTortoiseDisplay.textContent = tortoisePosVal.toFixed(2) + 'm';
        
        if (avatarAchilles && avatarTortoise) {
            // Map pos to SVG (0 to 211.11 maps to x=10 to x=320)
            const achillesX = 10 + (achillesPosVal / 211.111) * 310;
            const tortoiseX = 10 + (tortoisePosVal / 211.111) * 310;
            
            avatarAchilles.setAttribute('x', achillesX.toFixed(2));
            avatarTortoise.setAttribute('x', tortoiseX.toFixed(2));
        }
        
        if (raceFeedback) {
            if (distanceVal < 1.901) {
                raceFeedback.textContent = `¡Logrado! La distancia restante es ${distanceVal.toFixed(2)}m (< 1.9m) en el paso ${raceStepVal}. Aquiles está infinitamente cerca de la Tortuga.`;
                raceFeedback.className = 'callout success';
                if (raceChallengeBadge) {
                    raceChallengeBadge.textContent = '¡Completado!';
                    raceChallengeBadge.className = 'badge success-pulse';
                }
            } else {
                raceFeedback.textContent = `Distancia actual: ${distanceVal.toFixed(2)}m. ¡Da más pasos para acercar a Aquiles!`;
                raceFeedback.className = 'callout warning';
                if (raceChallengeBadge) {
                    raceChallengeBadge.textContent = 'Misión Zenón';
                    raceChallengeBadge.className = 'badge';
                }
            }
        }
    }
    
    if (btnRaceStep) {
        btnRaceStep.addEventListener('click', () => {
            if (raceStepVal < 6) {
                raceStepVal++;
                updateRaceGame();
            }
        });
    }
    
    if (btnRaceReset) {
        btnRaceReset.addEventListener('click', () => {
            raceStepVal = 0;
            updateRaceGame();
        });
    }
    
    updateRaceGame();

    /* ==========================================================================
       3. INSTANCE 2: GEOMETRIC LAB - EXHAUSTION METHOD SIMULATOR
       ========================================================================== */
    const sidesSlider = document.getElementById('polygon-sides-slider');
    const sidesValDisplay = document.getElementById('sides-val');
    const presetBtns = document.querySelectorAll('#presets-container .btn-preset');
    const presetsContainer = document.getElementById('presets-container');

    // Tiro al Blanco elements and state declared early to avoid initialization ReferenceErrors
    const aimShotSlider = document.getElementById('aim-shot-slider');
    const aimShotValDisplay = document.getElementById('aim-shot-val');
    const gaugeFillInscribed = document.getElementById('gauge-fill-inscribed');
    const gaugeFillCircumscribed = document.getElementById('gauge-fill-circumscribed');
    const gaugeValInscribed = document.getElementById('gauge-val-inscribed');
    const gaugeValCircumscribed = document.getElementById('gauge-val-circumscribed');
    const targetSafeZone = document.getElementById('target-safe-zone');
    const targetShotPin = document.getElementById('target-shot-pin');
    const targetScoreDisplay = document.getElementById('target-score');
    const targetMultiplierDisplay = document.getElementById('target-multiplier');
    const targetFeedback = document.getElementById('target-feedback');
    
    let targetScoreVal = 0;
    let currentLowerPI = 3.0000;
    let currentUpperPI = 3.4641;
    let currentSidesN = 6;
    
    const inscribedPoly = document.getElementById('inscribed-poly');
    const circumscribedPoly = document.getElementById('circumscribed-poly');
    const angleIndicatorsGroup = document.getElementById('angle-indicators');
    
    const calcInscribed = document.getElementById('calc-inscribed');
    const calcCircumscribed = document.getElementById('calc-circumscribed');
    const boundLower = document.getElementById('bound-lower');
    const boundUpper = document.getElementById('bound-upper');
    const boundError = document.getElementById('bound-error');
    
    // Zoom/Lupa sector elements
    const toggleZoomView = document.getElementById('toggle-zoom-view');
    const exhaustionNormalView = document.getElementById('exhaustion-normal-view');
    const exhaustionZoomView = document.getElementById('exhaustion-zoom-view');
    const angleValueDisplay = document.getElementById('angle-value-display');
    const sliderLabel = document.getElementById('slider-label');
    
    const zoomSine = document.getElementById('zoom-sine');
    const zoomTangent = document.getElementById('zoom-tangent');
    const zoomCurveArc = document.getElementById('zoom-curve-arc');
    const zoomRadius = document.getElementById('zoom-radius');
    const zoomSecant = document.getElementById('zoom-secant');
    
    // Missions elements
    const missionCota1 = document.getElementById('mission-cota-1');
    const missionCota2 = document.getElementById('mission-cota-2');
    const labFeedback = document.getElementById('lab-feedback');
    
    const svgRadius = 80; // Radius of unit circle in SVG coords
    let isZoomActive = false;

    // Helper to create namespaced SVG elements
    function createSVGElement(tag, attrs, parent) {
        const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let key in attrs) {
            elem.setAttribute(key, attrs[key]);
        }
        if (parent) parent.appendChild(elem);
        return elem;
    }

    function updateSimulation(n) {
        n = parseInt(n);
        
        // 1. Update text displays
        if (sidesValDisplay) sidesValDisplay.textContent = n;
        
        // 2. Math Calculations (Unit Circle R = 1)
        const angleRad = Math.PI / n; // Half angle for trig calculations
        const angleDeg = 180 / n;
        
        const lowerPI = n * Math.sin(angleRad);
        const upperPI = n * Math.tan(angleRad);
        const errorVal = upperPI - lowerPI;
        
        // Update math steps descriptions
        if (calcInscribed) calcInscribed.innerHTML = `${n} &middot; sin(${angleDeg.toFixed(2)}&deg;) = ${lowerPI.toFixed(4)}`;
        if (calcCircumscribed) calcCircumscribed.innerHTML = `${n} &middot; tan(${angleDeg.toFixed(2)}&deg;) = ${upperPI.toFixed(4)}`;
        
        // Update bound display
        if (boundLower) boundLower.textContent = lowerPI.toFixed(4);
        if (boundUpper) boundUpper.textContent = upperPI.toFixed(4);
        if (boundError) boundError.textContent = errorVal.toFixed(4);
        
        const boundTarget = document.querySelector('.bound-target');
        if (boundTarget) boundTarget.textContent = 'π';
        
        // 3. Draw Polygons in SVG
        if (inscribedPoly && circumscribedPoly) {
            let inscribedPoints = [];
            let circumscribedPoints = [];
            const rOut = svgRadius / Math.cos(angleRad);
            
            for (let i = 0; i < n; i++) {
                const alpha = (2 * Math.PI * i) / n - Math.PI / 2;
                const xIn = svgRadius * Math.cos(alpha);
                const yIn = svgRadius * Math.sin(alpha);
                inscribedPoints.push(`${xIn.toFixed(2)},${yIn.toFixed(2)}`);
                
                const alphaOut = alpha + angleRad;
                const xOut = rOut * Math.cos(alphaOut);
                const yOut = rOut * Math.sin(alphaOut);
                circumscribedPoints.push(`${xOut.toFixed(2)},${yOut.toFixed(2)}`);
            }
            
            inscribedPoly.setAttribute('points', inscribedPoints.join(' '));
            circumscribedPoly.setAttribute('points', circumscribedPoints.join(' '));
        }
        
        // 4. Update SVG Indicators (Draw center rays for the first sector)
        if (angleIndicatorsGroup) {
            angleIndicatorsGroup.innerHTML = '';
            
            const alphaStart = -Math.PI / 2;
            const alphaEnd = alphaStart + (2 * Math.PI) / n;
            const alphaMid = alphaStart + angleRad;
            
            const xInStart = svgRadius * Math.cos(alphaStart);
            const yInStart = svgRadius * Math.sin(alphaStart);
            const xInEnd = svgRadius * Math.cos(alphaEnd);
            const yInEnd = svgRadius * Math.sin(alphaEnd);
            
            createSVGElement('line', {
                x1: 0, y1: 0,
                x2: xInStart, y2: yInStart,
                class: 'svg-radius-indicator'
            }, angleIndicatorsGroup);
            
            createSVGElement('line', {
                x1: 0, y1: 0,
                x2: xInEnd, y2: yInEnd,
                class: 'svg-radius-indicator'
            }, angleIndicatorsGroup);
            
            const arcRadius = 25;
            const xArcStart = arcRadius * Math.cos(alphaStart);
            const yArcStart = arcRadius * Math.sin(alphaStart);
            const xArcEnd = arcRadius * Math.cos(alphaEnd);
            const yArcEnd = arcRadius * Math.sin(alphaEnd);
            
            const arcPath = `M ${xArcStart} ${yArcStart} A ${arcRadius} ${arcRadius} 0 0 1 ${xArcEnd} ${yArcEnd}`;
            
            createSVGElement('path', {
                d: arcPath,
                class: 'svg-angle-indicator'
            }, angleIndicatorsGroup);
            
            const labelX = (arcRadius + 12) * Math.cos(alphaMid);
            const labelY = (arcRadius + 12) * Math.sin(alphaMid);
            const textElem = createSVGElement('text', {
                x: labelX,
                y: labelY,
                'font-size': '7px',
                'fill': 'var(--color-warning)',
                'font-weight': '700',
                'text-anchor': 'middle',
                'dominant-baseline': 'middle'
            }, angleIndicatorsGroup);
            textElem.textContent = `${(360/n).toFixed(0)}°`;
        }
        
        // Highlight active preset button
        presetBtns.forEach(btn => {
            if (parseInt(btn.getAttribute('data-val')) === n) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Sync slider value
        if (sidesSlider) sidesSlider.value = n;
        
        // Verify missions
        updateLabMissions(errorVal, n);
        
        // Sync the Area Guessing Target game
        syncAreaTargetGame(lowerPI, upperPI, n);
    }

    function updateZoomView(angleDeg) {
        angleDeg = parseFloat(angleDeg);
        if (angleValueDisplay) angleValueDisplay.textContent = `Ángulo θ: ${angleDeg.toFixed(1)}°`;
        
        const angleRad = (angleDeg * Math.PI) / 180;
        const R = 150;
        
        // Arc coordinates (bottom left origin at 20, 180)
        const xArc = 20 + R * Math.cos(angleRad);
        const yArc = 180 - R * Math.sin(angleRad);
        
        // 1. Update SVG Elements
        if (zoomRadius) {
            zoomRadius.setAttribute('x2', xArc.toFixed(2));
            zoomRadius.setAttribute('y2', yArc.toFixed(2));
        }
        if (zoomSine) {
            zoomSine.setAttribute('x1', xArc.toFixed(2));
            zoomSine.setAttribute('y1', yArc.toFixed(2));
            zoomSine.setAttribute('x2', xArc.toFixed(2));
            zoomSine.setAttribute('y2', '180');
        }
        
        const yTan = 180 - R * Math.tan(angleRad);
        if (zoomTangent) {
            zoomTangent.setAttribute('x1', '170');
            zoomTangent.setAttribute('y1', '180');
            zoomTangent.setAttribute('x2', '170');
            zoomTangent.setAttribute('y2', yTan.toFixed(2));
        }
        if (zoomSecant) {
            zoomSecant.setAttribute('x2', '170');
            zoomSecant.setAttribute('y2', yTan.toFixed(2));
        }
        
        const dArc = `M 170 180 A 150 150 0 0 0 ${xArc.toFixed(2)} ${yArc.toFixed(2)}`;
        if (zoomCurveArc) zoomCurveArc.setAttribute('d', dArc);
        
        const zoomArcBg = document.getElementById('zoom-arc');
        if (zoomArcBg) zoomArcBg.setAttribute('d', dArc);
        
        // 2. Math Calculations
        const sinVal = Math.sin(angleRad);
        const tanVal = Math.tan(angleRad);
        const diff = tanVal - sinVal;
        
        if (calcInscribed) calcInscribed.innerHTML = `Segmento Azul (Seno): sin(${angleDeg.toFixed(1)}&deg;) = ${sinVal.toFixed(4)}`;
        if (calcCircumscribed) calcCircumscribed.innerHTML = `Segmento Verde (Tangente): tan(${angleDeg.toFixed(1)}&deg;) = ${tanVal.toFixed(4)}`;
        
        if (boundLower) boundLower.textContent = sinVal.toFixed(4);
        if (boundUpper) boundUpper.textContent = tanVal.toFixed(4);
        if (boundError) boundError.textContent = diff.toFixed(4);
        
        const boundTarget = document.querySelector('.bound-target');
        if (boundTarget) boundTarget.textContent = `Arco (θ) = ${angleRad.toFixed(4)}`;
        
        if (labFeedback) {
            if (angleDeg <= 10) {
                labFeedback.textContent = "¡Ángulo infinitesimal! Observa cómo a medida que θ tiende a 0, la cuerda (Seno), el arco (Ángulo) y la tangente se vuelven idénticos.";
                labFeedback.className = "callout success";
            } else {
                labFeedback.textContent = "Disminuí el ángulo deslizando a la izquierda para ver cómo se acoplan las tres líneas.";
                labFeedback.className = "callout warning";
            }
        }
    }

    function updateLabMissions(error, n) {
        if (!missionCota1 || !missionCota2) return;
        
        let m1 = false;
        let m2 = false;
        
        if (error < 0.05) {
            missionCota1.textContent = '¡Completado!';
            missionCota1.className = 'badge success';
            m1 = true;
        } else {
            missionCota1.textContent = 'Pendiente';
            missionCota1.className = 'badge secondary';
        }
        
        if (error < 0.003) {
            missionCota2.textContent = '¡Completado!';
            missionCota2.className = 'badge success-pulse';
            m2 = true;
        } else {
            missionCota2.textContent = 'Pendiente';
            missionCota2.className = 'badge secondary';
        }
        
        if (labFeedback && !isZoomActive) {
            if (m1 && m2) {
                labFeedback.textContent = `¡Espectacular! Completaste ambas misiones. Trappaste a Pi con un error de ${error.toFixed(4)} usando n = ${n}.`;
                labFeedback.className = 'callout success';
            } else if (m1) {
                labFeedback.textContent = `¡Misión 1 lograda! Ahora intenta aproximar con precisión de Arquímedes (error < 0.003, n = 96).`;
                labFeedback.className = 'callout warning';
            } else {
                labFeedback.textContent = `Error actual: ${error.toFixed(4)}. Deslizá el control para sumar más lados.`;
                labFeedback.className = 'callout warning';
            }
        }
    }

    // Toggle simulation views
    if (toggleZoomView) {
        toggleZoomView.addEventListener('change', (e) => {
            isZoomActive = e.target.checked;
            if (isZoomActive) {
                if (exhaustionNormalView) exhaustionNormalView.style.display = 'none';
                if (exhaustionZoomView) exhaustionZoomView.style.display = 'flex';
                if (presetsContainer) presetsContainer.style.display = 'none';
                if (angleValueDisplay) angleValueDisplay.style.display = 'inline';
                if (sliderLabel) sliderLabel.innerHTML = 'Ángulo Central (\\(\\theta\\)):';
                
                if (sidesSlider) {
                    sidesSlider.min = 5;
                    sidesSlider.max = 75;
                    sidesSlider.step = 1;
                    sidesSlider.value = 30;
                }
                updateZoomView(30);
            } else {
                if (exhaustionNormalView) exhaustionNormalView.style.display = 'flex';
                if (exhaustionZoomView) exhaustionZoomView.style.display = 'none';
                if (presetsContainer) presetsContainer.style.display = 'flex';
                if (angleValueDisplay) angleValueDisplay.style.display = 'none';
                if (sliderLabel) sliderLabel.innerHTML = 'Número de Lados (\\(n\\)): <span id="sides-val" class="highlight-val">6</span>';
                
                if (sidesSlider) {
                    sidesSlider.min = 4;
                    sidesSlider.max = 96;
                    sidesSlider.step = 1;
                    sidesSlider.value = 6;
                }
                // Sync display text element
                sidesValDisplay.textContent = 6;
                updateSimulation(6);
            }
            
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }
        });
    }

    // Event listener for exhaustion slider
    if (sidesSlider) {
        sidesSlider.addEventListener('input', (e) => {
            if (isZoomActive) {
                updateZoomView(e.target.value);
            } else {
                updateSimulation(e.target.value);
            }
        });
    }

    // Event listeners for exhaustion presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isZoomActive) {
                const val = btn.getAttribute('data-val');
                updateSimulation(val);
            }
        });
    });

    /* ==========================================================================
       3b. INSTANCE 2b: TIRO AL BLANCO DE AREAS
       ========================================================================== */

    function validateShot() {
        if (!aimShotSlider) return;
        const shotVal = parseFloat(aimShotSlider.value);
        if (aimShotValDisplay) aimShotValDisplay.textContent = shotVal.toFixed(4);
        
        // Range mapping: 2.0000 to 4.0000 maps to 0% to 100%
        const shotPercent = Math.max(0, Math.min(100, (shotVal - 2.0) / (4.0 - 2.0) * 100));
        if (targetShotPin) targetShotPin.style.left = shotPercent + '%';
        
        const isHit = shotVal >= currentLowerPI && shotVal <= currentUpperPI;
        
        if (targetFeedback) {
            if (isHit) {
                const pts = Math.round(currentSidesN * 10);
                targetScoreVal = pts;
                if (targetScoreDisplay) targetScoreDisplay.textContent = targetScoreVal + ' pts';
                if (targetMultiplierDisplay) targetMultiplierDisplay.textContent = `x${(currentSidesN / 6).toFixed(1)} (n=${currentSidesN})`;
                
                targetFeedback.textContent = `¡Impacto! Tu conjetura de área ${shotVal.toFixed(4)} está dentro del rango seguro para n = ${currentSidesN}. ¡Ganaste ${pts} puntos! Aumentá los lados para achicar la zona y sumar más puntos.`;
                targetFeedback.className = 'callout success';
                if (aimShotValDisplay) {
                    aimShotValDisplay.style.color = 'var(--color-success)';
                }
            } else {
                targetScoreVal = 0;
                if (targetScoreDisplay) targetScoreDisplay.textContent = '0 pts';
                if (targetMultiplierDisplay) targetMultiplierDisplay.textContent = `x0.0 (n=${currentSidesN})`;
                
                targetFeedback.textContent = `¡Fallaste! Tu conjetura de área ${shotVal.toFixed(4)} cayó fuera del sándwich [${currentLowerPI.toFixed(4)} , ${currentUpperPI.toFixed(4)}]. Ajustá el control o reducila para acertar.`;
                targetFeedback.className = 'callout warning';
                if (aimShotValDisplay) {
                    aimShotValDisplay.style.color = 'var(--color-danger)';
                }
            }
        }
    }

    function syncAreaTargetGame(lowerPI, upperPI, n) {
        currentLowerPI = lowerPI;
        currentUpperPI = upperPI;
        currentSidesN = n;
        
        const minRange = 2.0;
        const maxRange = 4.0;
        const totalRange = maxRange - minRange;
        
        const inscribedPercent = Math.max(0, Math.min(100, (lowerPI - minRange) / totalRange * 100));
        const circumscribedPercent = Math.max(0, Math.min(100, (upperPI - minRange) / totalRange * 100));
        
        if (gaugeFillInscribed) gaugeFillInscribed.style.width = inscribedPercent + '%';
        if (gaugeFillCircumscribed) gaugeFillCircumscribed.style.width = circumscribedPercent + '%';
        
        if (gaugeValInscribed) gaugeValInscribed.textContent = lowerPI.toFixed(4);
        if (gaugeValCircumscribed) gaugeValCircumscribed.textContent = upperPI.toFixed(4);
        
        const leftPercent = Math.max(0, Math.min(100, (lowerPI - minRange) / totalRange * 100));
        const widthPercent = Math.max(0, Math.min(100, (upperPI - lowerPI) / totalRange * 100));
        
        if (targetSafeZone) {
            targetSafeZone.style.left = leftPercent + '%';
            targetSafeZone.style.width = widthPercent + '%';
        }
        
        validateShot();
    }

    if (aimShotSlider) {
        aimShotSlider.addEventListener('input', validateShot);
    }

    // Initialize Simulation
    updateSimulation(6);

    /* ==========================================================================
       4. INSTANCE 3: LIMITS VISUALIZATION - EPSILON TUNER
       ========================================================================== */
    const epsilonSlider = document.getElementById('epsilon-slider');
    const stepNSlider = document.getElementById('step-n-slider');
    const epsilonValDisplay = document.getElementById('epsilon-val');
    const stepNValDisplay = document.getElementById('step-n-val');
    const epsilonFeedback = document.getElementById('epsilon-feedback');
    const epsilonBand = document.getElementById('epsilon-band');
    const indicatorNLine = document.getElementById('indicator-n-line');
    const epsilonPointsGroup = document.getElementById('epsilon-points-group');

    function updateEpsilonTuner() {
        if (!epsilonSlider || !stepNSlider) return;
        
        const eps = parseFloat(epsilonSlider.value);
        const N = parseInt(stepNSlider.value);
        
        if (epsilonValDisplay) epsilonValDisplay.textContent = eps.toFixed(2);
        if (stepNValDisplay) stepNValDisplay.textContent = N;
        
        // Fetch current sequence type
        const seqTypeRadio = document.querySelector('input[name="sequence-type"]:checked');
        const seqType = seqTypeRadio ? seqTypeRadio.value : 'monotonic';
        const labelChar = seqType === 'monotonic' ? 'a' : 'b';
        
        // 1. Draw Epsilon Band
        // Target L = 1.0 is at y=70 (value scale: y = 170 - (v / 1.2) * 120 -> R = 120 pixels)
        const bandY = 70 - 100 * eps;
        const bandHeight = 200 * eps;
        if (epsilonBand) {
            epsilonBand.setAttribute('y', bandY.toFixed(2));
            epsilonBand.setAttribute('height', bandHeight.toFixed(2));
        }
        
        // 2. Draw Guessed Step N Line
        const lineX = 50 + (N - 1) * 44;
        if (indicatorNLine) {
            indicatorNLine.setAttribute('x1', lineX);
            indicatorNLine.setAttribute('x2', lineX);
        }
        
        // 3. Render Points
        if (epsilonPointsGroup) {
            epsilonPointsGroup.innerHTML = '';
            
            for (let n = 1; n <= 8; n++) {
                let val;
                if (seqType === 'monotonic') {
                    val = 1 - 1 / Math.pow(2, n);
                } else {
                    val = 1 + Math.pow(-1, n) / n;
                }
                
                const x = 50 + (n - 1) * 44;
                const y = 170 - (val / 1.2) * 120;
                
                const diff = Math.abs(1.0 - val);
                const isInside = diff <= eps;
                
                // Draw point circle
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x.toFixed(2));
                circle.setAttribute('cy', y.toFixed(2));
                circle.setAttribute('r', '5');
                
                let ptClass = 'epsilon-point';
                if (isInside) {
                    ptClass += ' inside';
                } else {
                    ptClass += ' outside';
                }
                if (n === N) {
                    ptClass += ' selected';
                }
                circle.setAttribute('class', ptClass);
                epsilonPointsGroup.appendChild(circle);
                
                // Draw tick label under points
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x.toFixed(2));
                text.setAttribute('y', (y - 10).toFixed(2));
                text.setAttribute('class', 'epsilon-point-label');
                text.textContent = `${labelChar}${n}`;
                epsilonPointsGroup.appendChild(text);
                
                // Draw X ticks
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tick.setAttribute('x', x.toFixed(2));
                tick.setAttribute('y', '185');
                tick.setAttribute('class', 'graph-tick-text');
                tick.setAttribute('text-anchor', 'middle');
                tick.textContent = n;
                epsilonPointsGroup.appendChild(tick);
            }
        }
        
        // 4. Verify game state / feedback
        let minN = 1;
        if (seqType === 'monotonic') {
            while (minN <= 8 && (1 / Math.pow(2, minN)) > eps) {
                minN++;
            }
        } else {
            while (minN <= 8 && (1 / minN) > eps) {
                minN++;
            }
        }
        
        if (epsilonFeedback) {
            if (N < minN) {
                epsilonFeedback.textContent = `¡Cuidado! El punto ${labelChar}${N} (y posiblemente otros) quedan fuera de la zona verde. Elegí un paso N más grande.`;
                epsilonFeedback.className = 'callout warning';
            } else if (N === minN) {
                epsilonFeedback.textContent = `¡Excelente sintonía! N = ${N} es el paso mínimo ideal. Todos los puntos desde ${labelChar}${N} en adelante están a salvo dentro de la tolerancia ε = ${eps.toFixed(2)}.`;
                epsilonFeedback.className = 'callout success';
            } else {
                epsilonFeedback.textContent = `¡Correcto! Todos los puntos a partir de N = ${N} están adentro. Pero podés afinar más la sintonía eligiendo un N menor. ¡Inténtalo!`;
                epsilonFeedback.className = 'callout warning';
            }
        }
    }
 
    if (epsilonSlider) {
        epsilonSlider.addEventListener('input', updateEpsilonTuner);
    }
    
    if (stepNSlider) {
        stepNSlider.addEventListener('input', updateEpsilonTuner);
    }

    const seqTypeRadios = document.querySelectorAll('input[name="sequence-type"]');
    seqTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateEpsilonTuner);
    });

    // Initialize Epsilon Tuner
    updateEpsilonTuner();

    /* ==========================================================================
       5. COMPONENTE TÉCNICO COMPLEMENTARIO: FAB CHATBOT WIDGET
       ========================================================================== */
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotIframe = document.getElementById('chatbot-iframe');
    
    // Developer: Replace this placeholder string with your production Chatbot URL
    const CHATBOT_URL = "about:blank"; // Can be replaced by e.g. "https://chatbot.educacion.cba.gov.ar"

    function openChatbot() {
        chatbotWindow.classList.add('active');
        
        // Lazy load chatbot iframe source only when opened
        if (chatbotIframe.src === "about:blank" || chatbotIframe.src === "") {
            chatbotIframe.src = CHATBOT_URL;
        }
    }

    function closeChatbot() {
        chatbotWindow.classList.remove('active');
    }

    if (chatbotFab) {
        chatbotFab.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chatbotWindow.classList.contains('active')) {
                closeChatbot();
            } else {
                openChatbot();
            }
        });
    }

    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatbot();
        });
    }

    // Let user tap chatbot window container without closing it
    chatbotWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Tap outside chatbot closes it
    document.addEventListener('click', () => {
        closeChatbot();
    });

    /* ==========================================================================
       6. INSTANCE 4: HISTORICAL LEGACY - PARABOLA QUADRATURE SIMULATION
       ========================================================================== */
    const parabolaStepSlider = document.getElementById('parabola-step-slider');
    const parabolaStepValDisplay = document.getElementById('parabola-step-val');
    const btnParabolaAdd = document.getElementById('btn-parabola-add');
    const btnParabolaReset = document.getElementById('btn-parabola-reset');
    const parabolaTrianglesGroup = document.getElementById('parabola-triangles-group');
    const parabolaTableBody = document.getElementById('parabola-table-body');
    const parabolaAreaSum = document.getElementById('parabola-area-sum');
    const historyDialogueText = document.getElementById('history-dialogue-text');

    let parabolaStepK = 0;

    const historyDialogues = [
        "He trazado el triángulo principal en color ocre. Su área es de exactamente 1.0000 unidad relativa. ¿Cuánto crees que mide todo el segmento curvo? ¡Prueba agregar triángulos para descubrirlo!",
        "¡Excelente! Hemos añadido 2 nuevos triángulos en las brechas laterales. Cada uno tiene un área de 0.1250, sumando 0.2500 en este paso. La diferencia con la curva se va reduciendo.",
        "Añadimos 4 triángulos más pequeños. Su área sumada en este paso es de 0.0625, acumulando 1.3125. Observa cómo los nuevos triángulos se van adaptando a la forma curva de la parábola.",
        "Paso k=3: sumamos 8 triángulos diminutos (área de 0.0156). Ya acumulamos 1.3281. La diferencia curvo-rectilínea es casi imperceptible a la vista.",
        "¡Sublime! Llegamos al paso k=4 con 16 triángulos agregados en este paso. El área total acumulada es de 1.3320. Demostré matemáticamente que la suma converge exactamente a 4/3 (1.3333). ¡Hemos atrapado la parábola!"
    ];

    function getParabolaY(x) {
        const dx = (x - 200) / 150;
        return 160 - 120 * (1 - dx * dx);
    }

    function generateParabolaTriangles(xStart, xEnd, depth, maxDepth, result) {
        const xMid = (xStart + xEnd) / 2;
        const yStart = getParabolaY(xStart);
        const yEnd = getParabolaY(xEnd);
        const yMid = getParabolaY(xMid);
        
        if (depth === maxDepth) {
            result.push([xStart, yStart, xEnd, yEnd, xMid, yMid]);
            return;
        }
        
        generateParabolaTriangles(xStart, xMid, depth + 1, maxDepth, result);
        generateParabolaTriangles(xMid, xEnd, depth + 1, maxDepth, result);
    }

    function updateParabolaSimulation() {
        if (!parabolaStepSlider) return;

        // Sync display and slider
        if (parabolaStepValDisplay) parabolaStepValDisplay.textContent = parabolaStepK;
        parabolaStepSlider.value = parabolaStepK;

        // Clear existing SVG triangles
        if (parabolaTrianglesGroup) {
            parabolaTrianglesGroup.innerHTML = '';
        }

        // Draw triangles dynamically for each level up to parabolaStepK
        for (let i = 0; i <= parabolaStepK; i++) {
            const levelTriangles = [];
            generateParabolaTriangles(50, 350, 0, i, levelTriangles);
            
            levelTriangles.forEach(t => {
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', `${t[0]},${t[1]} ${t[4]},${t[5]} ${t[2]},${t[3]}`);
                
                let className = 'parabola-triangle';
                if (i === 1) className = 'parabola-triangle-step1';
                else if (i === 2) className = 'parabola-triangle-step2';
                else if (i >= 3) className = 'parabola-triangle-step3';
                
                polygon.setAttribute('class', className);
                if (parabolaTrianglesGroup) {
                    parabolaTrianglesGroup.appendChild(polygon);
                }
            });
        }

        // Update Dialogue Bubble text
        if (historyDialogueText) {
            historyDialogueText.textContent = historyDialogues[parabolaStepK];
        }

        // Update calculations table
        let totalArea = 0;
        let tableHTML = '';
        for (let j = 0; j <= parabolaStepK; j++) {
            const count = Math.pow(2, j);
            const added = 1 / Math.pow(4, j);
            totalArea += added;

            tableHTML += `
                <tr style="border-bottom: 1px solid var(--color-svg-border);">
                    <td style="padding: 0.5rem 0.25rem; font-weight:700;">k = ${j}</td>
                    <td style="padding: 0.5rem 0.25rem;">${count}</td>
                    <td style="padding: 0.5rem 0.25rem; font-family:monospace;">${added.toFixed(4)}</td>
                    <td style="padding: 0.5rem 0.25rem; font-family:monospace; font-weight:700; color:var(--color-accent);">${totalArea.toFixed(4)}</td>
                </tr>
            `;
        }

        if (parabolaTableBody) {
            parabolaTableBody.innerHTML = tableHTML;
        }

        if (parabolaAreaSum) {
            parabolaAreaSum.textContent = totalArea.toFixed(4);
        }
        
        // Retrigger math formulas render
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }

    if (parabolaStepSlider) {
        parabolaStepSlider.addEventListener('input', (e) => {
            parabolaStepK = parseInt(e.target.value);
            updateParabolaSimulation();
        });
    }

    if (btnParabolaAdd) {
        btnParabolaAdd.addEventListener('click', () => {
            if (parabolaStepK < 4) {
                parabolaStepK++;
                updateParabolaSimulation();
            }
        });
    }

    if (btnParabolaReset) {
        btnParabolaReset.addEventListener('click', () => {
            parabolaStepK = 0;
            updateParabolaSimulation();
        });
    }

    // Initialize Parabola Simulation
    updateParabolaSimulation();
});
