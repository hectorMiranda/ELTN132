#!/usr/bin/env python3
"""
Example Circuit Analysis Script for ELTN 132
Fall 2025 - Digital and Control Electronics

This script demonstrates basic circuit analysis calculations
including voltage dividers, current calculations, and power analysis.
"""

import numpy as np
import matplotlib.pyplot as plt


def voltage_divider(v_in, r1, r2):
    """
    Calculate output voltage of a voltage divider circuit.
    
    Args:
        v_in (float): Input voltage in volts
        r1 (float): Resistance of first resistor in ohms
        r2 (float): Resistance of second resistor in ohms
    
    Returns:
        float: Output voltage in volts
    """
    v_out = v_in * (r2 / (r1 + r2))
    return v_out


def current_calculation(voltage, resistance):
    """
    Calculate current using Ohm's law (I = V/R).
    
    Args:
        voltage (float): Voltage in volts
        resistance (float): Resistance in ohms
    
    Returns:
        float: Current in amperes
    """
    if resistance == 0:
        raise ValueError("Resistance cannot be zero")
    current = voltage / resistance
    return current


def power_calculation(voltage, current):
    """
    Calculate power dissipation (P = V * I).
    
    Args:
        voltage (float): Voltage in volts
        current (float): Current in amperes
    
    Returns:
        float: Power in watts
    """
    power = voltage * current
    return power


def plot_voltage_response(time, voltage):
    """
    Plot voltage response over time.
    
    Args:
        time (array): Time values
        voltage (array): Voltage values
    """
    plt.figure(figsize=(10, 6))
    plt.plot(time, voltage, 'b-', linewidth=2)
    plt.xlabel('Time (s)', fontsize=12)
    plt.ylabel('Voltage (V)', fontsize=12)
    plt.title('Voltage Response Over Time', fontsize=14)
    plt.grid(True, alpha=0.3)
    plt.show()


def main():
    """Main function demonstrating circuit analysis examples."""
    
    print("="*60)
    print("ELTN 132 - Digital and Control Electronics")
    print("Example Circuit Analysis Script")
    print("="*60)
    print()
    
    # Example 1: Voltage Divider
    print("Example 1: Voltage Divider Analysis")
    print("-" * 40)
    v_in = 12.0  # volts
    r1 = 1000.0  # ohms (1kΩ)
    r2 = 2000.0  # ohms (2kΩ)
    v_out = voltage_divider(v_in, r1, r2)
    print(f"Input Voltage: {v_in} V")
    print(f"R1: {r1/1000} kΩ")
    print(f"R2: {r2/1000} kΩ")
    print(f"Output Voltage: {v_out:.2f} V")
    print()
    
    # Example 2: Current Calculation
    print("Example 2: Current Calculation (Ohm's Law)")
    print("-" * 40)
    voltage = 5.0  # volts
    resistance = 220.0  # ohms
    current = current_calculation(voltage, resistance)
    print(f"Voltage: {voltage} V")
    print(f"Resistance: {resistance} Ω")
    print(f"Current: {current*1000:.2f} mA")
    print()
    
    # Example 3: Power Calculation
    print("Example 3: Power Dissipation")
    print("-" * 40)
    power = power_calculation(voltage, current)
    print(f"Voltage: {voltage} V")
    print(f"Current: {current*1000:.2f} mA")
    print(f"Power: {power*1000:.2f} mW")
    print()
    
    # Example 4: Time-domain Analysis
    print("Example 4: RC Circuit Step Response")
    print("-" * 40)
    print("Generating plot...")
    
    # RC circuit parameters
    R = 1000.0  # ohms
    C = 10e-6   # farads (10 µF)
    tau = R * C  # time constant
    
    # Time array
    t = np.linspace(0, 5*tau, 1000)
    
    # Step response: V(t) = V0 * (1 - e^(-t/tau))
    V0 = 5.0  # volts
    v_t = V0 * (1 - np.exp(-t/tau))
    
    print(f"R = {R/1000} kΩ")
    print(f"C = {C*1e6} µF")
    print(f"Time constant (τ) = {tau*1000:.2f} ms")
    print()
    
    # Plot is commented out to avoid blocking in automated environments
    # Uncomment to visualize:
    # plot_voltage_response(t*1000, v_t)  # time in ms
    
    print("="*60)
    print("Analysis Complete!")
    print("="*60)


if __name__ == "__main__":
    main()
