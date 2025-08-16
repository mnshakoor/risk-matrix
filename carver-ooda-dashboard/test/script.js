/* Original JS here, with additions */

// Add error handling to init and key functions
function init() {
    try {
        loadFromLocalStorage();
        renderHeader();
        renderTabs();
        addEventListeners();
        updateState();
    } catch (err) {
        console.error('Init error:', err);
        showFeedback('Error initializing dashboard: ' + err.message);
    }
}

// In computeDerived: Add NaN handling
function computeDerived(row, scale = 5) {
    const numsL = [row.A, row.V, row.Rz].map(n => Number(n) || 1);
    const numsI = [row.C, row.E, row.R].map(n => Number(n) || 1);
    const L = avg(numsL);
    const I = avg(numsI);
    const score = +(L * I).toFixed(2);
    return { L, I, score };
}

// Fix role filter in updateState
appState.filteredRows = appState.rows.filter(row => {
    // ... existing
    const roleMatch = appState.role === 'All' ||
        (appState.role === 'Comms' && row.type?.toLowerCase().includes('comms')) ||
        (appState.role === 'Sec' && (row.type?.toLowerCase().includes('sec') || row.type?.toLowerCase().includes('radar'))) ||  // Expanded for 'Sec'
        (appState.role === 'Ops' && !['comms', 'radar', 'sec'].some(t => row.type?.toLowerCase().includes(t)));
    // ... rest
});

// In renderHeatmap: Fix label orientation (L high to low)
for (let l = 5; l >= 1; l--) {
    grid.innerHTML += `<div class="heatmap-cell-label">${l} L (H-L)</div>`;  // Clarified label
    // ... rest
}

// Add to file upload: Error handling
reader.onload = (event) => {
    try {
        // ... existing
    } catch (err) {
        showFeedback('Upload error: ' + err.message);
        console.error(err);
    }
};