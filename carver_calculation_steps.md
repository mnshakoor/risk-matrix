Here’s the exact mapping used in the app.

### Inputs
CARVER scores on a chosen scale S in {5, 10}:  
C, A, R (Recuperability), V, E, Rz.

### Steps
1) Compute interim CARVER means on scale S  
   - \(L_S = \text{round}\big((A + V + Rz)/3\big)\)  
   - \(I_S = \text{round}\big((C + E + R)/3\big)\)

2) Normalize each to a 1 to 5 Likelihood–Impact scale  
   - \(L = \text{clamp}_{1..5}\big(\text{round}(L_S \times 5 / S)\big)\)  
   - \(I = \text{clamp}_{1..5}\big(\text{round}(I_S \times 5 / S)\big)\)

3) Product and tier (used by the matrix)  
   - \(v = L \times I\)  
   - Tier from thresholds: Low ≤ low, Moderate ≤ mod, High ≤ high, else Critical.

Notes  
- Recuperability R increases Impact, so higher R drives I upward.  
- When S = 5 the normalization step preserves the same value since \(5/5 = 1\).  
- When S = 10 the normalization linearly maps 1 to 10 into 1 to 5.

### Quick example (S = 10)
A = 7, V = 8, Rz = 6 → \(L_S = \text{round}(7)\) → 7 → \(L = \text{round}(7 × 5 / 10) = 4\)  
C = 8, E = 7, R = 6 → \(I_S = \text{round}(7)\) → 7 → \(I = \text{round}(7 × 5 / 10) = 4\)  
So \(v = 4 × 4 = 16\).