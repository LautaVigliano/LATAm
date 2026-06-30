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

    window.toggleSubSection = toggleSubSection;
    function toggleSubSection(id) {
        const el = document.getElementById(id);
        if (el) {
            if (el.style.display === 'none' || el.style.display === '') {
                el.style.display = 'block';
                // Scroll slightly so the user sees the newly opened content
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                el.style.display = 'none';
            }
        }
    }

    window.switchSection = switchSection;
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
       2b. INSTANCE 1b: LA TORTUGA PERSIGUE A AQUILES (CARRERA INVERTIDA)
       ========================================================================== */
    let raceStepVal = 0;
    let achillesPosVal = 100.00;
    let tortoisePosVal = 300.00;
    
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
        // Converges to 50m with ratio r = 0.5
        const ratio = Math.pow(0.5, raceStepVal);
        tortoisePosVal = 50 + 250 * ratio;
        achillesPosVal = 50 + 50 * ratio;
        const distanceVal = tortoisePosVal - achillesPosVal;
        
        if (raceStepDisplay) raceStepDisplay.textContent = raceStepVal;
        if (raceDistanceDisplay) raceDistanceDisplay.textContent = distanceVal.toFixed(2) + 'm';
        if (posAchillesDisplay) posAchillesDisplay.textContent = achillesPosVal.toFixed(2) + 'm';
        if (posTortoiseDisplay) posTortoiseDisplay.textContent = tortoisePosVal.toFixed(2) + 'm';
        
        if (avatarAchilles && avatarTortoise) {
            // Map p to SVG x (x = p + 10)
            const achillesX = achillesPosVal + 10;
            const tortoiseX = tortoisePosVal + 10;
            
            avatarAchilles.setAttribute('x', achillesX.toFixed(2));
            avatarTortoise.setAttribute('x', tortoiseX.toFixed(2));
        }
        
        if (raceFeedback) {
            if (distanceVal < 2.01) {
                raceFeedback.textContent = `¡Logrado! La distancia restante es ${distanceVal.toFixed(2)}m (< 2.0m) en el paso ${raceStepVal}. La Tortuga está infinitamente cerca de Aquiles.`;
                raceFeedback.className = 'callout success';
                if (raceChallengeBadge) {
                    raceChallengeBadge.textContent = '¡Completado!';
                    raceChallengeBadge.className = 'badge success-pulse';
                }
            } else {
                raceFeedback.textContent = `Distancia actual: ${distanceVal.toFixed(2)}m. ¡Da más pasos para acercar la Tortuga!`;
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
            if (raceStepVal < 12) {
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
       2c. INSTANCE 1c: LA CUADRÍCULA DEL INFINITO (MOSAICO DE FRACCIONES)
       ========================================================================== */
    let gridStep = 0;
    
    const gridTerm = document.getElementById('grid-term');
    const gridRemaining = document.getElementById('grid-remaining');
    const gridSumExpression = document.getElementById('grid-sum-expression');
    const gridSumVal = document.getElementById('grid-sum-val');
    const btnGridAdd = document.getElementById('btn-grid-add');
    const btnGridReset = document.getElementById('btn-grid-reset');
    const gridFeedback = document.getElementById('grid-feedback');
    const gridChallengeBadge = document.getElementById('grid-challenge-badge');
    const squareBlocksGroup = document.getElementById('square-blocks-group');

    function drawGridBlocks() {
        if (!squareBlocksGroup) return;
        squareBlocksGroup.innerHTML = '';
        
        let xMin = 10, xMax = 210;
        let yMin = 10, yMax = 210;
        
        const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'];
        
        for (let i = 1; i <= gridStep; i++) {
            const isOdd = (i % 2 !== 0);
            let x, y, w, h;
            
            if (isOdd) {
                const xMid = (xMin + xMax) / 2;
                x = xMin;
                y = yMin;
                w = xMid - xMin;
                h = yMax - yMin;
                xMin = xMid;
            } else {
                const yMid = (yMin + yMax) / 2;
                x = xMin;
                y = yMin;
                w = xMax - xMin;
                h = yMid - yMin;
                yMin = yMid;
            }
            
            // Draw rect
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', w);
            rect.setAttribute('height', h);
            rect.setAttribute('fill', colors[(i - 1) % colors.length]);
            rect.setAttribute('stroke', 'var(--color-card-bg)');
            rect.setAttribute('stroke-width', '1.5');
            rect.setAttribute('rx', '2');
            rect.setAttribute('style', 'transition: all 0.3s ease;');
            squareBlocksGroup.appendChild(rect);
            
            // Draw text label if large enough
            if (w >= 20 && h >= 20) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + w / 2);
                text.setAttribute('y', y + h / 2 + 3);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#ffffff');
                text.setAttribute('font-size', '10px');
                text.setAttribute('font-weight', '700');
                text.textContent = `1/${Math.pow(2, i)}`;
                squareBlocksGroup.appendChild(text);
            }
        }
        
        // Update red dashed remaining block
        const whiteBlock = document.getElementById('square-white-block');
        if (whiteBlock) {
            whiteBlock.setAttribute('x', xMin);
            whiteBlock.setAttribute('y', yMin);
            whiteBlock.setAttribute('width', xMax - xMin);
            whiteBlock.setAttribute('height', yMax - yMin);
            if (gridStep >= 8) {
                whiteBlock.setAttribute('stroke', 'none');
            } else {
                whiteBlock.setAttribute('stroke', 'var(--color-danger)');
            }
        }
    }

    function updateGridGame() {
        drawGridBlocks();
        
        const termVal = gridStep === 0 ? 'Ninguno' : `1/${Math.pow(2, gridStep)}`;
        const remainingVal = 1 / Math.pow(2, gridStep);
        const sumVal = 1 - remainingVal;
        
        if (gridTerm) gridTerm.textContent = termVal;
        if (gridRemaining) gridRemaining.textContent = remainingVal.toFixed(4);
        if (gridSumVal) gridSumVal.textContent = `Valor = ${sumVal.toFixed(4)}`;
        
        let expr = '0';
        if (gridStep > 0) {
            let terms = [];
            for (let i = 1; i <= Math.min(gridStep, 4); i++) {
                terms.push(`1/${Math.pow(2, i)}`);
            }
            if (gridStep > 4) {
                terms.push('...');
            }
            expr = terms.join(' + ');
        }
        if (gridSumExpression) gridSumExpression.textContent = expr;
        
        if (gridFeedback) {
            if (gridStep === 0) {
                gridFeedback.textContent = '¡Coloreá fracciones para rellenar la cuadrícula!';
                gridFeedback.className = 'callout warning';
                if (gridChallengeBadge) {
                    gridChallengeBadge.textContent = 'Misión Mosaico';
                    gridChallengeBadge.className = 'badge';
                }
            } else if (gridStep < 6) {
                gridFeedback.textContent = `Paso ${gridStep}: la suma es ${sumVal.toFixed(4)}. Queda un ${(remainingVal*100).toFixed(1)}% sin colorear.`;
                gridFeedback.className = 'callout warning';
            } else {
                gridFeedback.textContent = `¡Excelente! Rellenaste el ${(sumVal*100).toFixed(2)}% del cuadrado. El límite es claramente 1.`;
                gridFeedback.className = 'callout success';
                if (gridChallengeBadge) {
                    gridChallengeBadge.textContent = '¡Completado!';
                    gridChallengeBadge.className = 'badge success-pulse';
                }
            }
        }
    }

    if (btnGridAdd) {
        btnGridAdd.addEventListener('click', () => {
            if (gridStep < 8) {
                gridStep++;
                updateGridGame();
            }
        });
    }

    if (btnGridReset) {
        btnGridReset.addEventListener('click', () => {
            gridStep = 0;
            updateGridGame();
        });
    }

    updateGridGame();

    /* ==========================================================================
       3. INSTANCE 2: GEOMETRIC LAB - EXHAUSTION METHOD SIMULATOR
       ========================================================================== */
    const sidesSlider = document.getElementById('polygon-sides-slider');
    const sidesSlider2 = document.getElementById('polygon-sides-slider-2');
    const sidesValDisplay = document.getElementById('sides-val');
    const presetBtns = document.querySelectorAll('#presets-container .btn-preset');
    const presetsContainer = document.getElementById('presets-container');

    // Area bounding elements
    const targetSafeZone = document.getElementById('target-safe-zone');
    const targetShotPin = document.getElementById('target-shot-pin');
    const labMissionDesc = document.getElementById('lab-mission-desc');
    
    // Estimation Slider
    const estimationSlider = document.getElementById('estimation-slider');
    const estimationValDisplay = document.getElementById('estimation-val');
    const estimationFeedback = document.getElementById('estimation-feedback');
    
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
    const trigFeedback = document.getElementById('trig-feedback');
    
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
        
        // Sync the Area Gauges
        syncAreaGauges(lowerPI, upperPI, n);
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
        
        // Verify trigonometric missions
        updateTrigMissions(diff, angleDeg);
    }

    function updateLabMissions(error, n) {
        if (!missionCota1) return;
        
        let m1 = false;
        
        if (error < 0.05) {
            if (window.completeMission) window.completeMission(3);
            missionCota1.textContent = '¡Completado!';
            missionCota1.className = 'badge success';
            m1 = true;
        } else {
            missionCota1.textContent = 'Misión Activa';
            missionCota1.className = 'badge secondary';
        }
        
        if (labFeedback && !isZoomActive) {
            if (m1) {
                labFeedback.textContent = `¡Excelente! Atrapaste a Pi con un Margen de Tolerancia de ${error.toFixed(4)} usando n = ${n}.`;
                labFeedback.className = 'callout success';
            } else {
                labFeedback.textContent = `Diferencia actual: ${error.toFixed(4)}. ¡Añadí más varas rectas (lados) para acorralar la curva y reducir la diferencia a menos de 0.05!`;
                labFeedback.className = 'callout warning';
            }
        }
    }

    function updateTrigMissions(diff, angleDeg) {
        if (!missionCota2) return;
        
        let m2 = false;
        
        if (diff < 0.05) {
            missionCota2.textContent = '¡Completado!';
            missionCota2.className = 'badge success-pulse';
            m2 = true;
        } else {
            missionCota2.textContent = 'Misión Activa';
            missionCota2.className = 'badge secondary';
        }
        
        if (trigFeedback && isZoomActive) {
            if (m2) {
                trigFeedback.textContent = `¡Magnífico! A ${angleDeg.toFixed(1)}°, la diferencia entre la tangente y el seno es apenas ${diff.toFixed(4)}. Las tres líneas casi se fusionan.`;
                trigFeedback.className = 'callout success';
            } else {
                trigFeedback.textContent = `Diferencia actual: ${diff.toFixed(4)}. Disminuí el ángulo deslizando a la izquierda para reducirla a menos de 0.05.`;
                trigFeedback.className = 'callout warning';
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
            const n = parseInt(e.target.value);
            updateSimulation(n);
        });
    }

    if (sidesSlider2) {
        sidesSlider2.addEventListener('input', (e) => {
            const n = parseInt(e.target.value);
            updateZoomView(180 / n);
        });
    }

    // Event listeners for exhaustion presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const n = parseInt(btn.getAttribute('data-val'));
            updateSimulation(n);
        });
    });

    // Initial synchronization
    if (sidesSlider) {
        const initialN = parseInt(sidesSlider.value);
        updateSimulation(initialN);
    }
    if (sidesSlider2) {
        updateZoomView(180 / parseInt(sidesSlider2.value));
    }

    /* ==========================================================================
       3b. INSTANCE 2b: SINCRONIZADOR DE MEDIDORES DE AREA
       ========================================================================== */

    function validateEstimation() {
        if (!estimationSlider) return;
        const estVal = parseFloat(estimationSlider.value);
        if (estimationValDisplay) estimationValDisplay.textContent = estVal.toFixed(4);
        
        const minRange = 2.0;
        const maxRange = 4.0;
        const totalRange = maxRange - minRange;
        const estPercent = Math.max(0, Math.min(100, (estVal - minRange) / totalRange * 100));
        
        if (targetShotPin) {
            targetShotPin.style.bottom = estPercent + '%';
        }
        
        const isInside = estVal > currentLowerPI && estVal < currentUpperPI;
        
        if (estimationFeedback) {
            if (isInside) {
                estimationFeedback.innerHTML = `¡Excelente! Tu estimación <strong>${estVal.toFixed(4)}</strong> está correctamente ubicada dentro de los polígonos.`;
                estimationFeedback.className = 'callout success';
                if (estimationValDisplay) estimationValDisplay.style.color = 'var(--color-success)';
            } else {
                if (estVal <= currentLowerPI) {
                    estimationFeedback.innerHTML = `Tu estimación (${estVal.toFixed(4)}) es menor o igual al polígono inscrito (${currentLowerPI.toFixed(4)}). ¡Debe ser mayor!`;
                } else {
                    estimationFeedback.innerHTML = `Tu estimación (${estVal.toFixed(4)}) es mayor o igual al polígono circunscrito (${currentUpperPI.toFixed(4)}). ¡Debe ser menor!`;
                }
                estimationFeedback.className = 'callout warning';
                if (estimationValDisplay) estimationValDisplay.style.color = 'var(--color-danger)';
            }
        }
    }

    function syncAreaGauges(lowerPI, upperPI, n) {
        currentLowerPI = lowerPI;
        currentUpperPI = upperPI;
        currentSidesN = n;
        
        const minRange = 2.0;
        const maxRange = 4.0;
        const totalRange = maxRange - minRange;
        
        const bottomPercent = Math.max(0, Math.min(100, (lowerPI - minRange) / totalRange * 100));
        const topPercent = Math.max(0, Math.min(100, (upperPI - minRange) / totalRange * 100));
        const heightPercent = topPercent - bottomPercent;
        
        if (targetSafeZone) {
            targetSafeZone.style.bottom = bottomPercent + '%';
            targetSafeZone.style.height = heightPercent + '%';
        }
        
        validateEstimation();
    }

    if (estimationSlider) {
        estimationSlider.addEventListener('input', validateEstimation);
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
        const seqType = seqTypeRadio ? seqTypeRadio.value : 'ladder';
        
        let labelChar = 'a';
        if (seqType === 'ball') labelChar = 'b';
        else if (seqType === 'pendulum') labelChar = 'c';
        
        // 1. Draw Epsilon Band
        // Target L = 1.0 is at y=100 (range 0 to 2.0 -> y = 170 - val * 70)
        const bandY = 100 - 70 * eps;
        const bandHeight = 140 * eps;
        if (epsilonBand) {
            epsilonBand.setAttribute('y', bandY.toFixed(2));
            epsilonBand.setAttribute('height', bandHeight.toFixed(2));
        }
        
        // 2. Draw Guessed Step N Line
        const lineX = 45 + (N - 1) * 23;
        if (indicatorNLine) {
            indicatorNLine.setAttribute('x1', lineX);
            indicatorNLine.setAttribute('x2', lineX);
        }
        
        // 3. Render 15 Points
        if (epsilonPointsGroup) {
            epsilonPointsGroup.innerHTML = '';
            
            for (let n = 1; n <= 15; n++) {
                let val;
                if (seqType === 'ladder') {
                    val = 1.0 - 1.0 / n;
                } else if (seqType === 'ball') {
                    val = 1.0 + 1.0 / n;
                } else {
                    val = 1.0 + Math.pow(-1, n) / n;
                }
                
                const x = 45 + (n - 1) * 23;
                const y = 170 - val * 70;
                
                const diff = Math.abs(1.0 - val);
                const isInside = diff <= eps;
                
                // Draw point circle
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x.toFixed(2));
                circle.setAttribute('cy', y.toFixed(2));
                circle.setAttribute('r', '4');
                
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
                
                // Draw tick label above points
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x.toFixed(2));
                text.setAttribute('y', (y - 8).toFixed(2));
                text.setAttribute('class', 'epsilon-point-label');
                text.textContent = `${labelChar}${n}`;
                epsilonPointsGroup.appendChild(text);
                
                // Draw X ticks (every 2 steps to avoid clutter, but showing 1 and 15 always)
                if (n === 1 || n === 15 || n % 2 === 0) {
                    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    tick.setAttribute('x', x.toFixed(2));
                    tick.setAttribute('y', '185');
                    tick.setAttribute('class', 'graph-tick-text');
                    tick.setAttribute('text-anchor', 'middle');
                    tick.textContent = n;
                    epsilonPointsGroup.appendChild(tick);
                }
            }
        }
        
        // 4. Verify game state / feedback
        // All three sequences have error magnitude equal to 1/n.
        // Therefore, the critical step minN is the first step where 1/minN <= eps.
        let minN = 1;
        while (minN <= 15 && (1.0 / minN) > eps) {
            minN++;
        }
        
        if (epsilonFeedback) {
            let metaphorName = "la Escalera";
            if (seqType === 'ball') metaphorName = "la Pelota";
            else if (seqType === 'pendulum') metaphorName = "el Péndulo";

            if (N < minN) {
                let actualError = 1.0 / N;
                epsilonFeedback.innerHTML = `<strong>¡Refutación!</strong> Elegiste N = ${N}, pero en ese paso de <strong>${metaphorName}</strong> la diferencia restante con el límite (error = ${actualError.toFixed(3)}) supera el tamaño de tu grano de arena (tol. = ${eps.toFixed(2)}). ¡Tenés que dar más pasos!`;
                epsilonFeedback.className = 'callout danger';
            } else if (N === minN) {
                epsilonFeedback.innerHTML = `<strong>¡Sintonía Perfecta!</strong> N = ${N} es el paso crítico donde <strong>${metaphorName}</strong> se estabiliza. De aquí en adelante, la diferencia es menor que un grano de arena y entra siempre dentro de la franja verde.`;
                epsilonFeedback.className = 'callout success';
            } else {
                epsilonFeedback.innerHTML = `<strong>Válido, pero ineficiente.</strong> Es cierto que desde N = ${N} los puntos entran en la franja, pero podés sintonizarlo con un paso más chico. ¡Ajustá N hacia la izquierda para buscar el paso crítico!`;
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
       5. COMPONENTE TÉCNICO COMPLEMENTARIO: FAB CHATBOT WIDGET (AI INTEGRATION)
       ========================================================================== */
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotForm = document.getElementById('chatbot-input-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotChips = document.querySelectorAll('.chatbot-quick-chips .chip-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // El backend se encuentra en la ruta /api/chat y oculta la clave
    let chatHistory = [];

    function openChatbot() {
        if (chatbotWindow) chatbotWindow.classList.add('active');
    }

    function closeChatbot() {
        if (chatbotWindow) chatbotWindow.classList.remove('active');
    }

    if (chatbotFab) {
        chatbotFab.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chatbotWindow && chatbotWindow.classList.contains('active')) {
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

    function addMessageToDOM(text, sender) {
        const row = document.createElement('div');
        row.className = `chat-msg-row ${sender}`;
        
        if (sender === 'assistant') {
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar';
            avatar.textContent = '🏛️';
            row.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        
        // Parsear markdown simple (negritas y cursivas)
        let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlText = htmlText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        bubble.innerHTML = htmlText;
        row.appendChild(bubble);

        if (chatbotMessages) {
            chatbotMessages.appendChild(row);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }

    function addLoadingIndicator() {
        const row = document.createElement('div');
        row.className = `chat-msg-row assistant loading-msg`;
        row.innerHTML = `
            <div class="chat-avatar">🏛️</div>
            <div class="chat-msg-bubble" style="opacity: 0.7; font-style: italic;">Arquímedes está pensando...</div>
        `;
        if (chatbotMessages) {
            chatbotMessages.appendChild(row);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        return row;
    }

    async function sendMessageToGemini(userMessage) {
        addMessageToDOM(userMessage, 'user');
        
        chatHistory.push({
            role: "user",
            content: userMessage
        });

        const loadingIndicator = addLoadingIndicator();
        if (chatbotInput) chatbotInput.disabled = true;

        try {
            const response = await fetch('/api/chat', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chatHistory: chatHistory
                })
            });

            if (!response.ok) {
                throw new Error("Error en la conexión con el oráculo.");
            }

            const data = await response.json();
            loadingIndicator.remove();
            
            if (data.text) {
                const assistantReply = data.text;
                addMessageToDOM(assistantReply, 'assistant');
                
                chatHistory.push({
                    role: "model",
                    content: assistantReply
                });
            }

        } catch (error) {
            console.error(error);
            loadingIndicator.remove();
            addMessageToDOM("¡Por Zeus! Ha habido una tormenta en las líneas de comunicación. Inténtalo más tarde.", "assistant");
        } finally {
            if (chatbotInput) {
                chatbotInput.disabled = false;
                chatbotInput.focus();
            }
        }
    }

    if (chatbotForm) {
        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (chatbotInput) {
                const text = chatbotInput.value.trim();
                if (text) {
                    chatbotInput.value = '';
                    sendMessageToGemini(text);
                }
            }
        });
    }

    chatbotChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const question = chip.getAttribute('data-question');
            if (question) {
                sendMessageToGemini(question);
                if (chatbotWindow && !chatbotWindow.classList.contains('active')) {
                    openChatbot();
                }
            }
        });
    });

    if (chatbotWindow) {
        chatbotWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    document.addEventListener('click', () => {
        closeChatbot();
    });

    
    /* ==========================================================================
       6. INSTANCE 4: HISTORICAL LEGACY - CIRCLE EXHAUSTION SIMULATION
       ========================================================================== */
    const circleStepSlider = document.getElementById('circle-step-slider');
    const circleStepValDisplay = document.getElementById('circle-step-val');
    const btnCircleAdd = document.getElementById('btn-circle-add');
    const btnCircleReset = document.getElementById('btn-circle-reset');
    const circlePolygonsGroup = document.getElementById('circle-polygons-group');
    const circleTableBody = document.getElementById('circle-table-body');
    const circleAreaSum = document.getElementById('circle-area-sum');
    const historyDialogueText = document.getElementById('history-dialogue-text');

    // Circle Simulation State (Refined story-driven dialogues)
    let circleStepK = 0;
    const historyDialogues = [
        "Tomé mi rama de olivo y tracé este semicírculo en la arena de Siracusa. Aún no he inscrito ningún polígono. ¡Multiplica los lados para ver el misterio!",
        "Aquí tenemos la primera aproximación con varas rectas bajo la curva (2 lados rectos, como un triángulo). El área cubierta en la arena es de apenas 63.66%. Aún queda mucha bahía sin medir.",
        "He duplicado los lados: ahora es medio octógono (4 varas de medir). Mira cómo el polígono recto se estira hacia la curva, cubriendo el 90.03% del área.",
        "Añadimos más varas rectas. Con 8 lados, la aproximación comienza a verse casi tan redonda como el agua de la bahía circular. Cubrimos el 97.45%.",
        "¡Sublime! Con 16 lados, cubrimos el 99.36% del semicírculo. Al continuar este proceso infinitamente en tu mente, la diferencia física se extingue y el cálculo es exacto."
    ];

    function updateCircleSimulation() {
        if (!circleStepSlider) return;

        // Sync display and slider
        if (circleStepValDisplay) circleStepValDisplay.textContent = circleStepK;
        circleStepSlider.value = circleStepK;

        // Clear existing SVG
        if (circlePolygonsGroup) {
            circlePolygonsGroup.innerHTML = '';
        }

        const cx = 200, cy = 180, r = 150;
        
        let segments = 0;
        if (circleStepK === 1) segments = 2; // Triangle
        else if (circleStepK === 2) segments = 4; // Half Octagon
        else if (circleStepK === 3) segments = 8;
        else if (circleStepK === 4) segments = 16;
        
        let areaPercent = 0;

        if (segments > 0) {
            // Draw polygon inside semicircle
            let pts = [];
            for(let i=0; i<=segments; i++){
                let angle = i * Math.PI / segments;
                pts.push({
                    x: cx - r * Math.cos(angle),
                    y: cy - r * Math.sin(angle)
                });
            }
            
            const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            let pointsStr = "";
            for(let p of pts) pointsStr += `${p.x},${p.y} `;
            poly.setAttribute('points', pointsStr);
            poly.setAttribute('fill', 'rgba(99, 102, 241, 0.4)');
            poly.setAttribute('stroke', 'var(--color-primary)');
            poly.setAttribute('stroke-width', '2');
            if (circlePolygonsGroup) circlePolygonsGroup.appendChild(poly);
            
            // Area calculation
            let areaRatio = (segments/2) * Math.sin(Math.PI/segments) / (Math.PI/2);
            areaPercent = areaRatio * 100;
        }

        // Update Dialogue Bubble text
        if (historyDialogueText) {
            historyDialogueText.textContent = historyDialogues[circleStepK];
        }

        // Update calculations table
        let tableHTML = '';
        for (let j = 0; j <= circleStepK; j++) {
            let segs = j === 0 ? 0 : Math.pow(2, j);
            let pct = j === 0 ? 0 : ((segs/2) * Math.sin(Math.PI/segs) / (Math.PI/2) * 100);
            
            tableHTML += `
                <tr style="border-bottom: 1px solid var(--color-svg-border);">
                    <td style="padding: 0.5rem 0.25rem; font-weight:700;">k = ${j}</td>
                    <td style="padding: 0.5rem 0.25rem;">${segs}</td>
                    <td style="padding: 0.5rem 0.25rem; font-family:monospace; font-weight:700; color:var(--color-accent);">${pct.toFixed(2)}%</td>
                </tr>
            `;
        }

        if (circleTableBody) {
            circleTableBody.innerHTML = tableHTML;
        }

        if (circleAreaSum) {
            circleAreaSum.textContent = areaPercent.toFixed(2) + '%';
        }
    }

    if (circleStepSlider) {
        circleStepSlider.addEventListener('input', (e) => {
            circleStepK = parseInt(e.target.value);
            updateCircleSimulation();
        });
    }

    if (btnCircleAdd) {
        btnCircleAdd.addEventListener('click', () => {
            if (circleStepK < 4) {
                circleStepK++;
                updateCircleSimulation();
            }
        });
    }

    if (btnCircleReset) {
        btnCircleReset.addEventListener('click', () => {
            circleStepK = 0;
            updateCircleSimulation();
        });
    }

    // Initialize state
    setTimeout(() => { updateCircleSimulation(); }, 100);

    /* ==========================================================================
       4. INSTANCE 4: DESENROLLANDO EL CÍRCULO (SECCIÓN 2)
       ========================================================================== */
    const unrollSlider = document.getElementById('unroll-slider');
    const unrollValDisplay = document.getElementById('unroll-val');
    const rollingCircleGroup = document.getElementById('rolling-circle-group');
    const unrollTriangle = document.getElementById('unroll-triangle');
    const unrolledPath = document.getElementById('unrolled-path');
    const circleRadiusLine = document.getElementById('circle-radius-line');
    const unrollLabelH = document.getElementById('unroll-label-h');
    const unrollLabelB = document.getElementById('unroll-label-b');

    if (unrollSlider) {
        unrollSlider.addEventListener('input', (e) => {
            const percent = parseInt(e.target.value);
            if (unrollValDisplay) unrollValDisplay.textContent = percent + '%';
            
            // max rotation for 1 full circle is 360 deg
            const rotation = (percent / 100) * 360;
            // max distance is 2 * pi * 50 = 314.16
            const distance = (percent / 100) * 314.16;
            
            if (rollingCircleGroup) {
                // start at x=70. Move to right by distance.
                rollingCircleGroup.setAttribute('transform', `translate(${70 + distance}, 190) rotate(${rotation})`);
            }
            
            if (unrolledPath) {
                // Unrolled path draws from 70 to 70+distance
                unrolledPath.setAttribute('d', `M 70 240 L ${70 + distance} 240`);
            }
            
            if (unrollTriangle) {
                // Base is from 70 to 70+distance, height is at x=70 (from 240 to 190)
                unrollTriangle.setAttribute('points', `70,240 ${70 + distance},240 70,190`);
                if (percent > 0) {
                    unrollTriangle.style.opacity = '1';
                } else {
                    unrollTriangle.style.opacity = '0';
                }
            }
            
            if (unrollLabelH && unrollLabelB) {
                if (percent >= 100) {
                    unrollLabelH.style.opacity = '1';
                    unrollLabelB.style.opacity = '1';
                } else {
                    unrollLabelH.style.opacity = '0';
                    unrollLabelB.style.opacity = '0';
                }
            }
        });
    }

    /* ==========================================================================
       5. INSTANCE 5: LA BALANZA MECÁNICA (SECCIÓN 3)
       ========================================================================== */
    const balanceSlider = document.getElementById('balance-slices-slider');
    const balanceValDisplay = document.getElementById('balance-slices-val');
    const leverGroup = document.getElementById('lever-group');
    const parabolaSlicesGroup = document.getElementById('parabola-slices-group');
    const balanceStatus = document.getElementById('balance-status');

    function updateBalanceGame(n) {
        if (!parabolaSlicesGroup) return;
        
        if (balanceValDisplay) balanceValDisplay.textContent = n;
        
        parabolaSlicesGroup.innerHTML = '';
        
        const width = 60;
        const sliceWidth = width / n;
        let currentArea = 0;
        
        for (let i = 0; i < n; i++) {
            // inscribed rectangles
            const x1 = i * sliceWidth;
            const x2 = (i + 1) * sliceWidth;
            // parabola eq: y = 90 * (1 - ( (x-30)/30 )^2 )
            // evaluate at left, right, and take min for inscribed.
            const h1 = 90 * (1 - Math.pow((x1 - 30)/30, 2));
            const h2 = 90 * (1 - Math.pow((x2 - 30)/30, 2));
            const h = Math.min(h1, h2);
            
            if (h > 0) {
                currentArea += h * sliceWidth;
                
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x1 - 30);
                rect.setAttribute('y', 0);
                rect.setAttribute('width', sliceWidth);
                rect.setAttribute('height', h);
                rect.setAttribute('fill', 'rgba(96, 165, 250, 0.6)');
                rect.setAttribute('stroke', 'var(--color-bound-blue)');
                rect.setAttribute('stroke-width', n > 20 ? 0.5 : 1);
                parabolaSlicesGroup.appendChild(rect);
            }
        }
        
        const exactArea = 3600;
        const error = exactArea - currentArea;
        
        let angle = (error / 3600) * 12;
        if (angle < 0.1 && n > 50) angle = 0; // snap to 0
        
        if (leverGroup) {
            leverGroup.setAttribute('transform', `rotate(${angle}, 250, 220)`);
        }
        
        if (balanceStatus) {
            if (angle === 0 || n >= 90) {
                balanceStatus.textContent = '¡Perfectamente Equilibrado!';
                balanceStatus.setAttribute('fill', 'var(--color-success)');
            } else if (n > 30) {
                balanceStatus.textContent = 'Casi Equilibrado...';
                balanceStatus.setAttribute('fill', 'var(--color-warning)');
            } else {
                balanceStatus.textContent = 'Desequilibrado';
                balanceStatus.setAttribute('fill', 'var(--color-danger)');
            }
        }
    }
    if (balanceSlider) {
        balanceSlider.addEventListener('input', (e) => {
            updateBalanceGame(parseInt(e.target.value));
        });
        // Initial setup
        updateBalanceGame(1);
    }

    /* ==========================================================================
       6. LOGIC FOR ADVANCED SUB-SECTIONS
       ========================================================================== */

    // --- Sub-section 1: Bouncing Ball ---
    let ballAnimId;
    const btnBallDrop = document.getElementById('btn-ball-drop');
    const btnBallReset = document.getElementById('btn-ball-reset');
    const ballSvg = document.getElementById('bouncing-ball-svg');
    const ballEl = document.getElementById('bouncing-ball');
    const ballPath = document.getElementById('ball-path');
    const ballBounces = document.getElementById('ball-bounces');
    const ballTimeEl = document.getElementById('ball-time');

    if (btnBallDrop) {
        let isBouncing = false;
        
        function resetBall() {
            cancelAnimationFrame(ballAnimId);
            isBouncing = false;
            ballEl.setAttribute('cx', 20);
            ballEl.setAttribute('cy', 20); // dropped from y=20 (height=140)
            ballPath.setAttribute('d', '');
            ballBounces.textContent = '0';
            ballTimeEl.textContent = '0.00s';
            btnBallDrop.classList.add('active');
            btnBallReset.classList.remove('active');
        }

        function animateBall() {
            if (isBouncing) return;
            isBouncing = true;
            btnBallDrop.classList.remove('active');
            btnBallReset.classList.add('active');

            let startY = 20;
            const floorY = 160;
            let currentX = 20;
            
            let initialHeight = floorY - startY;
            let currentHeight = initialHeight;
            let timeAccumulated = 0;
            let bounceCount = 0;
            let pathD = `M 20 20`;
            
            // Physical simulation parameters (abstracted for effect)
            // Time for fall proportional to sqrt(height)
            let fallTimeMs = 800; // time for first full fall
            let startTime = performance.now();
            let state = 'falling'; // falling or rising
            let jumpStartY = startY;
            let jumpStartTime = startTime;
            
            function step(timestamp) {
                if (!isBouncing) return;
                
                let elapsed = timestamp - jumpStartTime;
                let progress = Math.min(elapsed / fallTimeMs, 1);
                
                let y;
                if (state === 'falling') {
                    // easing in (accelerating)
                    y = jumpStartY + currentHeight * (progress * progress);
                    currentX += 0.5; // moving right
                } else {
                    // easing out (decelerating)
                    y = floorY - currentHeight * (progress * (2 - progress));
                    currentX += 0.5;
                }
                
                ballEl.setAttribute('cx', currentX);
                ballEl.setAttribute('cy', y);
                
                // Add to path occasionally to avoid massive strings
                if (Math.random() > 0.5) pathD += ` L ${currentX} ${y}`;
                ballPath.setAttribute('d', pathD);
                
                // Real-time updating display
                let currentSimTime = timeAccumulated + (progress * fallTimeMs) / 1000;
                ballTimeEl.textContent = currentSimTime.toFixed(2) + 's';
                
                if (progress === 1) {
                    jumpStartTime = timestamp;
                    if (state === 'falling') {
                        state = 'rising';
                        bounceCount++;
                        ballBounces.textContent = bounceCount;
                        timeAccumulated += fallTimeMs / 1000;
                        
                        // Next height is half
                        currentHeight = currentHeight / 2;
                        jumpStartY = floorY;
                        
                        // New time to rise (sqrt of 0.5 is approx 0.707)
                        fallTimeMs = fallTimeMs * 0.707;
                        
                        if (currentHeight < 0.5) {
                            // Stop simulation, it's virtually flat
                            ballTimeEl.textContent = (timeAccumulated).toFixed(2) + 's (Límite Final)';
                            ballTimeEl.style.color = "var(--color-success)";
                            isBouncing = false;
                            return;
                        }
                    } else {
                        state = 'falling';
                        timeAccumulated += fallTimeMs / 1000;
                        jumpStartY = floorY - currentHeight;
                    }
                }
                
                ballAnimId = requestAnimationFrame(step);
            }
            ballAnimId = requestAnimationFrame(step);
        }

        btnBallDrop.addEventListener('click', animateBall);
        btnBallReset.addEventListener('click', () => {
            ballTimeEl.style.color = "var(--color-text-dark)";
            resetBall();
        });
        resetBall();
    }

    // --- Sub-section 2: Exhaustion Sphere vs Cylinder ---
    const diskSlider = document.getElementById('disk-slider');
    const diskVal = document.getElementById('disk-val');
    const diskGroup = document.getElementById('sphere-disks-group');
    const diskVolEl = document.getElementById('disk-vol');

    if (diskSlider && diskGroup) {
        function drawDisks() {
            diskGroup.innerHTML = '';
            const n = parseInt(diskSlider.value);
            diskVal.textContent = n;
            
            // Sphere radius in SVG coordinates
            const R = 100;
            const cx = 200;
            const cy = 200; // floor of hemisphere
            
            const sliceThickness = R / n;
            let sumVol = 0;
            
            for (let i = 0; i < n; i++) {
                // y from 0 to R
                let yBottom = i * sliceThickness;
                let yTop = (i + 1) * sliceThickness;
                
                // x radius of sphere at y (using circle equation x^2 + y^2 = R^2)
                let rDisk = Math.sqrt(R*R - yBottom*yBottom);
                
                // Volume of this disk (cylindrical slice) proportional to pi * r^2 * h
                // Since cylinder volume is pi * R^2 * R, fraction is (rDisk/R)^2 * (sliceThickness/R)
                let normVol = Math.pow(rDisk / R, 2) * (1 / n);
                sumVol += normVol;
                
                // Draw disk as rectangle
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', cx - rDisk);
                rect.setAttribute('y', cy - yTop);
                rect.setAttribute('width', rDisk * 2);
                rect.setAttribute('height', sliceThickness);
                rect.setAttribute('fill', 'var(--sphere-disk-bg)');
                rect.setAttribute('stroke', 'var(--color-success)');
                rect.setAttribute('stroke-width', n > 25 ? '0.5' : '1');
                
                diskGroup.appendChild(rect);
            }
            
            diskVolEl.textContent = sumVol.toFixed(4);
            if (n >= 50) {
                diskVolEl.style.color = "var(--color-success)";
                diskVolEl.textContent += " (≈ 2/3)";
            } else {
                diskVolEl.style.color = "var(--color-text-dark)";
            }
        }
        
        diskSlider.addEventListener('input', drawDisks);
        drawDisks();
    }

    // --- Sub-section 3: Archer's Aim (Continuous Limit) ---
    const deltaSlider = document.getElementById('delta-slider');
    const deltaValEl = document.getElementById('delta-val');
    const archerDelta = document.getElementById('archer-delta');
    const archerCurve = document.getElementById('archer-curve');
    const archerFeedback = document.getElementById('archer-feedback');

    if (deltaSlider && archerCurve) {
        // Draw cubic curve crossing (200, 100)
        let curveD = `M 0 200 C 100 200, 150 150, 200 100 C 250 50, 300 0, 400 0`;
        archerCurve.setAttribute('d', curveD);
        
        let pathStr = "M ";
        for(let x=0; x<=400; x+=5) {
            let y = 100 - Math.pow(x-200, 3) / 10000;
            if (y > 250) y = 250;
            if (y < -50) y = -50;
            pathStr += `${x} ${y} L `;
        }
        pathStr = pathStr.slice(0, -3);
        archerCurve.setAttribute('d', pathStr);

        function updateArcher() {
            let width = parseInt(deltaSlider.value); // max 150
            archerDelta.setAttribute('width', width);
            archerDelta.setAttribute('x', 200 - width/2);
            
            let halfWidth = width / 2;
            let maxYDiff = Math.pow(halfWidth, 3) / 10000;
            
            if (width >= 100) deltaValEl.textContent = "Ancha";
            else if (width >= 60) deltaValEl.textContent = "Media";
            else deltaValEl.textContent = "Estrecha";

            if (maxYDiff > 30) {
                archerDelta.setAttribute('fill', 'var(--archer-danger-bg)'); // Red warning
                archerDelta.setAttribute('stroke', 'var(--color-danger)');
                archerFeedback.className = "callout danger";
                archerFeedback.innerHTML = "¡Cuidado! Tu mirilla es muy ancha. La trayectoria podría salirse de la zona verde y fallar el objetivo.";
            } else {
                archerDelta.setAttribute('fill', 'var(--archer-safe-bg)'); // Blue safe
                archerDelta.setAttribute('stroke', 'var(--color-primary)');
                archerFeedback.className = "callout success";
                archerFeedback.innerHTML = "¡Perfecto! Has acotado la mira lo suficiente (\(\delta\)). Ahora es matemáticamente imposible que la curva se salga de la zona objetivo (\(\varepsilon\)).";
            }
        }

        deltaSlider.addEventListener('input', updateArcher);
        updateArcher();
    }

    // --- Sub-section 4: Derivative (Instantaneous Velocity) ---
    const secantSlider = document.getElementById('secant-slider');
    const secantVal = document.getElementById('secant-val');
    const secantLine = document.getElementById('secant-line');
    const tangentLine = document.getElementById('tangent-line');
    const pointA = document.getElementById('point-a');
    const pointB = document.getElementById('point-b');

    if (secantSlider) {
        function getPointOnCurve(t) {
            let x = Math.pow(1-t, 2)*50 + 2*(1-t)*t*200 + t*t*350;
            let y = Math.pow(1-t, 2)*180 + 2*(1-t)*t*180 + t*t*40;
            return {x, y};
        }

        const pA = getPointOnCurve(0.6);
        pointA.setAttribute('cx', pA.x);
        pointA.setAttribute('cy', pA.y);

        function updateSecant() {
            let dist = parseInt(secantSlider.value);
            
            if (dist === 0) {
                secantVal.textContent = "¡Cero! (Instante exacto)";
                secantVal.style.color = "var(--color-success)";
                
                pointB.style.opacity = "0";
                secantLine.style.opacity = "0";
                tangentLine.style.opacity = "1";
                
                let dx = 2*(1-0.6)*(200-50) + 2*0.6*(350-200);
                let dy = 2*(1-0.6)*(180-180) + 2*0.6*(40-180);
                
                tangentLine.setAttribute('x1', pA.x - dx*0.5);
                tangentLine.setAttribute('y1', pA.y - dy*0.5);
                tangentLine.setAttribute('x2', pA.x + dx*0.5);
                tangentLine.setAttribute('y2', pA.y + dy*0.5);
                
            } else {
                secantVal.textContent = dist + " unidades";
                secantVal.style.color = "var(--color-text-dark)";
                
                pointB.style.opacity = "1";
                secantLine.style.opacity = "1";
                tangentLine.style.opacity = "0";
                
                let tB = 0.6 + (dist / 200) * 0.35;
                const pB = getPointOnCurve(tB);
                
                pointB.setAttribute('cx', pB.x);
                pointB.setAttribute('cy', pB.y);
                
                let dx = pB.x - pA.x;
                let dy = pB.y - pA.y;
                secantLine.setAttribute('x1', pA.x - dx*0.2);
                secantLine.setAttribute('y1', pA.y - dy*0.2);
                secantLine.setAttribute('x2', pB.x + dx*0.5);
                secantLine.setAttribute('y2', pB.y + dy*0.5);
            }
        }
        
        secantSlider.addEventListener('input', updateSecant);
        updateSecant();
    }

    /* ==========================================================================
       SUB-SECTION GAMES LOGIC
       ========================================================================== */
    
    
    // 1. EL LIMITE GEOMETRICO: LLENANDO EL CUADRADO
    const btnSeries = document.getElementById('btn-series-step');
    const squareContainer = document.getElementById('series-square-container');
    const formulaContainer = document.getElementById('series-formula');
    const conclusion = document.getElementById('series-conclusion');
    
    let seriesStep = 1; // 1 means half, 2 means quarter...
    let isVerticalSplit = true;
    
    if (btnSeries && squareContainer) {
        btnSeries.addEventListener('click', () => {
            const fraction = Math.pow(2, seriesStep);
            
            // Create a new fraction block
            const block = document.createElement('div');
            block.classList.add('fraction-box');
            block.innerText = `1/${fraction}`;
            
            // Calculate positioning to fill the remaining space
            // Assuming container is 200x200
            if (seriesStep === 1) { // 1/2
                block.style.top = '0';
                block.style.left = '0';
                block.style.width = '100px';
                block.style.height = '200px';
                formulaContainer.innerHTML = 'S = 1/2';
            } else if (seriesStep === 2) { // 1/4
                block.style.top = '0';
                block.style.left = '100px';
                block.style.width = '100px';
                block.style.height = '100px';
                formulaContainer.innerHTML += ' + 1/4';
            } else if (seriesStep === 3) { // 1/8
                block.style.top = '100px';
                block.style.left = '100px';
                block.style.width = '50px';
                block.style.height = '100px';
                formulaContainer.innerHTML += ' + 1/8';
            } else if (seriesStep === 4) { // 1/16
                block.style.top = '100px';
                block.style.left = '150px';
                block.style.width = '50px';
                block.style.height = '50px';
                formulaContainer.innerHTML += ' + 1/16';
            } else if (seriesStep === 5) { // 1/32
                block.style.top = '150px';
                block.style.left = '150px';
                block.style.width = '25px';
                block.style.height = '50px';
                formulaContainer.innerHTML += ' + 1/32';
            } else if (seriesStep === 6) { // 1/64
                block.style.top = '150px';
                block.style.left = '175px';
                block.style.width = '25px';
                block.style.height = '25px';
                formulaContainer.innerHTML += ' + ...';
            } else if (seriesStep > 6) {
                // Too small to draw text
                btnSeries.disabled = true;
                btnSeries.innerText = "Suma Infinita Completada";
                conclusion.style.display = 'block';
                formulaContainer.innerHTML = 'S = &sum; (1/2^n) = 1';
                return;
            }
            
            squareContainer.appendChild(block);
            
            // Trigger reflow for animation
            void block.offsetWidth;
            block.classList.add('active');
            
            seriesStep++;
        });
    }

    // 2. LA REBANADORA 3D
    const slicesSlider = document.getElementById('slices-slider');
    const slicesLabel = document.getElementById('slices-label');
    const slicesVolLabel = document.getElementById('slices-volume-label');
    const slicesRatioLabel = document.getElementById('slices-ratio-label');
    const slicerCanvas = document.getElementById('slicer-canvas');
    
    if (slicesSlider && slicerCanvas) {
        const sctx = slicerCanvas.getContext('2d');
        
        function drawSlicer() {
            const n = parseInt(slicesSlider.value);
            slicesLabel.innerText = n;
            
            const w = slicerCanvas.width;
            const h = slicerCanvas.height;
            const cx = w/2;
            const cy = h/2;
            const r = w/2 - 10;
            
            sctx.clearRect(0, 0, w, h);
            
            // Draw Sphere outline
            sctx.strokeStyle = 'var(--color-primary)';
            sctx.lineWidth = 2;
            sctx.beginPath();
            sctx.arc(cx, cy, r, 0, Math.PI*2);
            sctx.stroke();
            
            // Draw rectangles (representing cylinder slices of sphere)
            sctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
            sctx.strokeStyle = '#d97706';
            sctx.lineWidth = 1;
            
            let totalSliceVol = 0;
            const sliceHeight = (2 * r) / n;
            const cylinderVol = Math.PI * (r*r) * (2*r); // Volume of bounding cylinder
            
            for (let i = 0; i < n; i++) {
                // y center of this slice relative to circle center
                const y = -r + (i + 0.5) * sliceHeight;
                // slice width via Pythagoras: x^2 + y^2 = r^2
                const x = Math.sqrt(Math.max(0, r*r - y*y));
                
                sctx.fillRect(cx - x, cy + y - sliceHeight/2, x*2, sliceHeight);
                sctx.strokeRect(cx - x, cy + y - sliceHeight/2, x*2, sliceHeight);
                
                // Volume of this disk: pi * radius^2 * height
                totalSliceVol += Math.PI * (x*x) * sliceHeight;
            }
            
            const ratio = totalSliceVol / cylinderVol;
            const percentage = (ratio * 100).toFixed(1);
            
            slicesVolLabel.innerText = percentage + '%';
            slicesRatioLabel.innerText = ratio.toFixed(4) + ' (→ 0.6666)';
        }
        
        slicesSlider.addEventListener('input', drawSlicer);
        requestAnimationFrame(drawSlicer);
    }
    
    // 3. PROFUNDIZACIÓN LÍMITES: CALCULADORAS INTERACTIVAS
    const btnCalcMicroscopic = document.getElementById('btn-calc-microscopic');
    const epsilonScaleSelect = document.getElementById('epsilon-scale-select');
    const microscopicResult = document.getElementById('microscopic-result');

    const btnBarrierLaunch = document.getElementById('btn-barrier-launch');
    const inputBarrierVal = document.getElementById('input-barrier-val');
    const barrierResult = document.getElementById('barrier-result');

    // Desafío A: Épsilon Atómico
    if (btnCalcMicroscopic && epsilonScaleSelect && microscopicResult) {
        btnCalcMicroscopic.addEventListener('click', () => {
            const eps = parseFloat(epsilonScaleSelect.value);
            const selectText = epsilonScaleSelect.options[epsilonScaleSelect.selectedIndex].text;
            
            // min N calculation: N = ceil(1/eps)
            const N = Math.ceil(1.0 / eps);
            
            microscopicResult.style.display = 'block';
            microscopicResult.innerHTML = `
                <strong>¡Sintonía de escala lograda!</strong><br>
                Para una tolerancia equivalente a <strong>${selectText}</strong> (error \\( \\varepsilon = ${eps.toFixed(10)} \\)), 
                necesitás dar un mínimo de <strong>\\( N = ${N.toLocaleString('es-AR')} \\)</strong> pasos para asegurar que todos los puntos 
                posteriores queden atrapados dentro de la franja verde.<br><br>
                🏛️ <em>"Geómetra, mi mente concibe divisiones que superan a toda la materia física de Siracusa. El infinito no tiene fronteras rígidas".</em> — Arquímedes
            `;
            
            setTimeout(() => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise().catch((err) => console.log(err));
                }
            }, 50);
        });
    }

    // Desafío B: El Acorralamiento
    if (btnBarrierLaunch && inputBarrierVal && barrierResult) {
        btnBarrierLaunch.addEventListener('click', () => {
            const val = parseFloat(inputBarrierVal.value);
            
            if (isNaN(val) || val <= 0.5 || val >= 1.0) {
                barrierResult.style.display = 'block';
                barrierResult.style.borderLeftColor = 'var(--color-danger)';
                barrierResult.innerHTML = `<strong>Error:</strong> Por favor ingresá un número que esté entre 0.5 y 0.9999999 para que esté bien cerca de 1.0.`;
                return;
            }
            
            // For La Escalera (1 - 1/n), we want 1 - 1/n > val -> 1 - val > 1/n -> n > 1/(1-val)
            const N = Math.ceil(1.0 / (1.0 - val));
            const actualVal = 1.0 - 1.0 / N;
            
            barrierResult.style.display = 'block';
            barrierResult.style.borderLeftColor = 'var(--color-accent)';
            barrierResult.innerHTML = `
                <strong>¡Barrera superada!</strong><br>
                Definiste una barrera en \\( B = ${val} \\).<br>
                La Escalera sobrepasa esa barrera en el paso <strong>\\( n = ${N.toLocaleString('es-AR')} \\)</strong>, 
                alcanzando el valor de <strong>\\( a_n = ${actualVal.toFixed(8)} \\)</strong>.<br><br>
                No importa qué número elijas antes del 1.0, la aproximación infinita siempre lo sobrepasará si camina suficientes pasos. Por eso el 1.0 es el único horizonte verdadero.
            `;
            
            setTimeout(() => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise().catch((err) => console.log(err));
                }
            }, 50);
        });
    }
    
    // 4. EL DESAFIO DE LA NOTACION
    const btnGreek = document.getElementById('btn-greek-step');
    const greekSteps = document.getElementById('greek-steps');
    const canvas = document.getElementById('greek-visual-canvas');
    const caption = document.getElementById('greek-visual-caption');
    
    function drawGreekVisual(step) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = 100, cy = 55, r = 40;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Base curve (The true area)
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (step === 0 || step === 1 || step === 2) {
            caption.innerText = step === 2 ? "Buscamos el área pero sin usar infinitos." : "Área curva exacta (Desconocida)";
        }
        else if (step === 3) {
            // Assume Area is LARGER
            ctx.beginPath();
            ctx.arc(cx, cy, r + 10, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ef4444'; // red
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            caption.innerHTML = "Suposición falsa:<br><span style='color:#ef4444'>Área > Real</span>";
        }
        else if (step === 4) {
            // Assume Area is LARGER + Inscribed polygon
            ctx.beginPath();
            ctx.arc(cx, cy, r + 10, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ef4444';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Inscribed hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = i * Math.PI / 3;
                let px = cx + r * Math.cos(angle);
                let py = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // blue
            ctx.fill();
            ctx.strokeStyle = '#3b82f6';
            ctx.stroke();
            caption.innerHTML = "Un polígono inscrito <span style='color:#3b82f6'>choca</span> con la suposición.";
        }
        else if (step === 5) {
            // Assume Area is SMALLER
            ctx.beginPath();
            ctx.arc(cx, cy, r - 10, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ef4444';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            caption.innerHTML = "Suposición falsa:<br><span style='color:#ef4444'>Área < Real</span>";
        }
        else if (step === 6) {
            // Assume Area is SMALLER + Circumscribed polygon
            ctx.beginPath();
            ctx.arc(cx, cy, r - 10, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ef4444';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Circumscribed hexagon
            let r_out = r / Math.cos(Math.PI / 6);
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = i * Math.PI / 3 + Math.PI / 6;
                let px = cx + r_out * Math.cos(angle);
                let py = cy + r_out * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(34, 197, 94, 0.4)'; // green
            ctx.fill();
            ctx.strokeStyle = '#22c55e';
            ctx.stroke();
            caption.innerHTML = "Un polígono externo <span style='color:#22c55e'>choca</span> con la suposición.";
        }
        else if (step >= 7) {
            // Exact
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.6)'; // yellow/gold
            ctx.fill();
            caption.innerHTML = "<strong>Área Exacta Confirmada</strong>";
        }
    }
    
    // Initial draw
    setTimeout(() => { if(typeof drawGreekVisual === 'function') drawGreekVisual(0); }, 100);
    
    let greekStepCount = 0;
    const greekTexts = [
        "Paso 1: Queremos medir un área curva exacta, pero solo confiamos en áreas de líneas rectas (polígonos).",
        "Paso 2: Como le tememos al infinito, no podemos simplemente decir 'usemos un polígono de infinitos lados'.",
        "Paso 3: Entonces, 'rodeamos' el problema. Primero, imaginemos por un momento que el área curva fuera MÁS GRANDE de lo calculado.",
        "Paso 4: Si fuera más grande, podríamos meter un polígono adentro que demuestra que eso es lógicamente imposible.",
        "Paso 5: Ahora, imaginemos que el área curva fuera MÁS CHICA de lo calculado.",
        "Paso 6: Si fuera más chica, podríamos meter otro polígono que también demuestra que es imposible.",
        "Paso 7: ¡Ajá! Si no puede ser ni más grande ni más chica... ¡Debe ser exactamente igual! (Extremadamente largo, ¿verdad?)"
    ];
    
    const btnGreekReset = document.getElementById('btn-greek-reset');
    
    if (btnGreek) {
        btnGreek.addEventListener('click', () => {
            if (greekStepCount === 0) greekSteps.innerHTML = '';
            if (greekStepCount < greekTexts.length) {
                const p = document.createElement('p');
                p.style.marginBottom = '0.75rem';
                p.innerText = greekTexts[greekStepCount];
                greekSteps.appendChild(p);
                greekSteps.scrollTop = greekSteps.scrollHeight;
                
                greekStepCount++;
                if (typeof drawGreekVisual === 'function') {
                    drawGreekVisual(greekStepCount);
                }
                
                if (greekStepCount === greekTexts.length) {
                    btnGreek.innerText = "¡Demostración Completa!";
                    btnGreek.disabled = true;
                    btnGreek.style.opacity = '0.5';
                    btnGreek.style.cursor = 'not-allowed';
                }
            }
        });
    }
    
    if (btnGreekReset) {
        btnGreekReset.addEventListener('click', () => {
            greekStepCount = 0;
            greekSteps.innerHTML = '<div style="color: #94a3b8; font-family: sans-serif; font-style: normal; text-align: center; margin-top: 1rem;">Esperando el razonamiento...</div>';
            btnGreek.innerText = "📜 Razonar paso lógico";
            btnGreek.disabled = false;
            btnGreek.style.opacity = '1';
            btnGreek.style.cursor = 'pointer';
            if (typeof drawGreekVisual === 'function') {
                drawGreekVisual(0);
            }
        });
    }

});
