# ELTN132 - Digital and Control Electronics

**Fall 2025 ELTN 132 #80031 DIGITAL AND CONTROL ELECTRONIC**

## Lab 2C: RC Low-Pass Filter Frequency Response Analysis

This repository contains Python code for analyzing the frequency response of an RC low-pass filter using measured data from laboratory experiments.

### Description

The `lab2c.py` script plots both magnitude and phase response of an RC low-pass filter based on measured data from Part 4 (Points 9–11) of Lab 2C. The script generates professional-quality plots showing:

- **Magnitude Response**: Log-log plot of Vout/Vin ratio vs. frequency
- **Phase Response**: Semi-log plot of phase shift vs. frequency

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hectorMiranda/ELTN132.git
   cd ELTN132
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Script

Once you have installed the dependencies, run the script:

```bash
python lab2c.py
```

### Output

The script will:
1. Display an interactive plot window showing both magnitude and phase response
2. Save a high-resolution PNG image named `Lab2C_RC_LowPass_Response.png` in the current directory

### Dependencies

The script requires the following Python packages (automatically installed via requirements.txt):

- **NumPy** (≥1.21.0): For numerical computations and array handling
- **Matplotlib** (≥3.5.0): For creating plots and graphs

### Project Structure

```
ELTN132/
├── lab2c.py              # Main analysis script
├── requirements.txt      # Python dependencies
├── README.md            # This file
├── .gitignore          # Git ignore file
└── Lab2C_RC_LowPass_Response.png  # Generated output (after running)
```

### Measured Data

The script analyzes measured data from an RC low-pass filter experiment:
- **Frequency range**: 10 Hz to 100 kHz (13 measurement points)
- **Measurements**: Vout/Vin ratio and phase shift
- **Filter characteristics**: Shows typical low-pass behavior with rolloff

### Deactivating Virtual Environment

When you're done working, deactivate the virtual environment:

```bash
deactivate
```

### Troubleshooting

**Common Issues:**

1. **ModuleNotFoundError**: Make sure you've activated your virtual environment and installed dependencies
2. **Permission errors**: Ensure you have write permissions in the directory for saving the output image
3. **Display issues**: If running on a headless system, the plot window won't appear, but the PNG file will still be saved

**Getting Help:**
- Check that Python 3.7+ is installed: `python --version`
- Verify pip installation: `pip --version`
- List installed packages: `pip list`

---

**Author:** Hector Miranda  
**Course:** ELTN132 - Digital and Control Electronics  
**Lab:** 2C - RC Low-Pass Filter Frequency Response
