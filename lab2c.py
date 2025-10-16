# ==========================================================
#  ELTN132 – Lab 2C: RC Low-Pass Filter Frequency Response
#  Student: Hector Miranda
#  Description: Plot magnitude and phase response using
#               measured data from Part 4 (Points 9–11)
# ==========================================================

import numpy as np
import matplotlib.pyplot as plt
import os

# Create outputs directory if it doesn't exist
os.makedirs('outputs', exist_ok=True)

# -----------------------------
# 1. Measured data
# -----------------------------
freq = np.array([10, 30, 60, 100, 300, 600, 1000,
                 3000, 6000, 10000, 30000, 60000, 100000])  # Hz

vout_vin = np.array([1.000, 0.998, 0.998, 0.994, 0.958,
                     0.861, 0.717, 0.328, 0.174, 0.107,
                     0.0396, 0.0214, 0.0148])  # normalized ratio

phase_deg = np.array([-19.12, -13.66, -11.8, -10.94, -11.13,
                      -13.38, -16.4, -21.88, -26.65, -27.97,
                      -27.96, -27.97, -27.34])  # degrees

# -----------------------------
# 2. Configure Matplotlib
# -----------------------------
plt.rcParams.update({
    "font.size": 12,
    "axes.labelsize": 12,
    "axes.titlesize": 13,
    "figure.figsize": (8, 8)
})

# -----------------------------
# 3. Magnitude plot (log-log)
# -----------------------------
plt.subplot(2, 1, 1)
plt.loglog(freq, vout_vin, 'o-', color='royalblue', label='Measured data')
plt.title("RC Low-Pass Filter – Frequency Response (Measured)")
plt.ylabel("Vout / Vin (ratio)")
plt.grid(True, which='both', ls='--', lw=0.6)
plt.legend()

# -----------------------------
# 4. Phase plot (semi-log)
# -----------------------------
plt.subplot(2, 1, 2)
plt.semilogx(freq, phase_deg, 'o-', color='darkorange', label='Measured phase')
plt.xlabel("Frequency (Hz)")
plt.ylabel("Phase (°)")
plt.grid(True, which='both', ls='--', lw=0.6)
plt.legend()

# -----------------------------
# 5. Save and show
# -----------------------------
plt.tight_layout()
plt.savefig("outputs/Lab2C_RC_LowPass_Response.png", dpi=300)  # saves figure to outputs folder
plt.show()
