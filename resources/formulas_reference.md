# Quick Reference: Formulas and Circuits

## Basic Circuit Laws

### Ohm's Law
```
V = I × R
I = V / R
R = V / I
```
- V: Voltage (volts)
- I: Current (amperes)
- R: Resistance (ohms)

### Power Formulas
```
P = V × I
P = I² × R
P = V² / R
```
- P: Power (watts)

### Kirchhoff's Current Law (KCL)
Sum of currents entering a node = Sum of currents leaving a node
```
Σ I_in = Σ I_out
```

### Kirchhoff's Voltage Law (KVL)
Sum of voltages around a closed loop = 0
```
Σ V = 0
```

## Series and Parallel Circuits

### Series Resistors
```
R_total = R₁ + R₂ + R₃ + ...
```

### Parallel Resistors
```
1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...

For two resistors:
R_total = (R₁ × R₂) / (R₁ + R₂)
```

### Voltage Divider
```
V_out = V_in × (R₂ / (R₁ + R₂))
```

### Current Divider
```
I₁ = I_total × (R₂ / (R₁ + R₂))
```

## Capacitors and Inductors

### Capacitor Relationships
```
Q = C × V          (charge)
I = C × (dV/dt)    (current-voltage)
V = (1/C) × ∫I dt  (voltage-current)
```

### Series Capacitors
```
1/C_total = 1/C₁ + 1/C₂ + 1/C₃ + ...
```

### Parallel Capacitors
```
C_total = C₁ + C₂ + C₃ + ...
```

### Inductor Relationships
```
V = L × (dI/dt)    (voltage-current)
I = (1/L) × ∫V dt  (current-voltage)
```

### Series Inductors
```
L_total = L₁ + L₂ + L₃ + ...
```

### Parallel Inductors
```
1/L_total = 1/L₁ + 1/L₂ + 1/L₃ + ...
```

## RC and RL Circuits

### RC Time Constant
```
τ = R × C
```
- Time to reach 63.2% of final value

### RC Charging (Capacitor)
```
V(t) = V_final × (1 - e^(-t/τ))
```

### RC Discharging
```
V(t) = V_initial × e^(-t/τ)
```

### RL Time Constant
```
τ = L / R
```

### RL Current Growth
```
I(t) = I_final × (1 - e^(-t/τ))
```

### RL Current Decay
```
I(t) = I_initial × e^(-t/τ)
```

## AC Circuits

### Reactance

Capacitive Reactance:
```
X_C = 1 / (2πfC) = 1 / (ωC)
```

Inductive Reactance:
```
X_L = 2πfL = ωL
```

### Impedance
```
Z = R + jX
|Z| = √(R² + X²)
θ = arctan(X/R)
```

### RMS Values
```
V_rms = V_peak / √2
I_rms = I_peak / √2
```

### Average Power
```
P_avg = V_rms × I_rms × cos(θ)
```
- cos(θ): Power factor

## Frequency Response

### Resonant Frequency (LC Circuit)
```
f₀ = 1 / (2π√(LC))
ω₀ = 1 / √(LC)
```

### Quality Factor (Q)
```
Q = ω₀L / R = 1 / (ω₀RC)
```

### Bandwidth
```
BW = f₀ / Q
```

## Digital Logic

### Boolean Algebra Laws

Identity:
```
A + 0 = A
A · 1 = A
```

Null:
```
A + 1 = 1
A · 0 = 0
```

Idempotent:
```
A + A = A
A · A = A
```

Complement:
```
A + Ā = 1
A · Ā = 0
```

De Morgan's Theorems:
```
(A + B)' = A' · B'
(A · B)' = A' + B'
```

## Op-Amp Circuits

### Inverting Amplifier
```
V_out = -(R_f / R_in) × V_in
Gain = -R_f / R_in
```

### Non-Inverting Amplifier
```
V_out = (1 + R_f / R_in) × V_in
Gain = 1 + R_f / R_in
```

### Voltage Follower (Buffer)
```
V_out = V_in
Gain = 1
```

### Summing Amplifier
```
V_out = -(R_f/R₁ × V₁ + R_f/R₂ × V₂ + R_f/R₃ × V₃)
```

### Integrator
```
V_out = -(1/RC) × ∫V_in dt
```

### Differentiator
```
V_out = -RC × (dV_in/dt)
```

## Control Systems

### Transfer Function
```
G(s) = Y(s) / X(s)
```

### First-Order System
```
G(s) = K / (τs + 1)
```
- K: DC gain
- τ: Time constant

### Second-Order System
```
G(s) = ω_n² / (s² + 2ζω_n s + ω_n²)
```
- ω_n: Natural frequency
- ζ: Damping ratio

### PID Controller
```
u(t) = K_p e(t) + K_i ∫e(t)dt + K_d de(t)/dt
```
- K_p: Proportional gain
- K_i: Integral gain
- K_d: Derivative gain

## Unit Conversions

### Resistance
- 1 kΩ = 1,000 Ω
- 1 MΩ = 1,000,000 Ω

### Capacitance
- 1 µF = 1 × 10⁻⁶ F
- 1 nF = 1 × 10⁻⁹ F
- 1 pF = 1 × 10⁻¹² F

### Inductance
- 1 mH = 1 × 10⁻³ H
- 1 µH = 1 × 10⁻⁶ H

### Frequency
- 1 kHz = 1,000 Hz
- 1 MHz = 1,000,000 Hz
- ω = 2πf (rad/s)

## Common Component Values

### Standard Resistor Values (E12 Series)
10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 (and multiples)

### Common Capacitor Values
1 pF, 10 pF, 100 pF, 1 nF, 10 nF, 100 nF, 1 µF, 10 µF, 100 µF

### Typical Op-Amp Parameters
- Input impedance: 1-10 MΩ
- Output impedance: 10-100 Ω
- Open-loop gain: 100,000-1,000,000
- Bandwidth: 1-10 MHz

---

**Note**: This is a quick reference. Always verify formulas and values for your specific application.
