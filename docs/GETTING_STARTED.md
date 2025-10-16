# Getting Started with ELTN 132 Repository

Welcome to the ELTN 132 Digital and Control Electronics course repository!

## Prerequisites

### Required Software

1. **Python 3.7 or higher**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version` or `python3 --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Optional but Recommended

- **MATLAB** (or free alternative: GNU Octave)
- **Circuit Simulator** (LTspice, ngspice, or online tools)
- **Text Editor/IDE** (VS Code, PyCharm, Sublime Text, etc.)
- **Jupyter Notebook** for interactive Python work

## Setting Up Your Environment

### 1. Clone the Repository

```bash
git clone https://github.com/hectorMiranda/ELTN132.git
cd ELTN132
```

### 2. Set Up Python Environment (Recommended)

Create a virtual environment to manage dependencies:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install numpy matplotlib scipy
```

### 4. Test Your Setup

Run the example script to verify everything works:

```bash
cd scripts
python example_circuit_analysis.py
```

You should see circuit analysis output printed to the console.

## Repository Structure

```
ELTN132/
├── scripts/         # Utility scripts and tools
├── labs/            # Laboratory exercises
├── homework/        # Homework assignments
├── resources/       # Reference materials
├── docs/            # Documentation
└── README.md        # Main repository information
```

## Running Scripts

### Python Scripts

```bash
# Navigate to scripts directory
cd scripts

# Run a Python script
python script_name.py

# Or make it executable (Linux/macOS)
chmod +x script_name.py
./script_name.py
```

### MATLAB Scripts

1. Open MATLAB
2. Navigate to the script directory using the MATLAB file browser
3. Run the script by typing its name (without .m) in the command window

## Getting Help

- Check the README files in each directory for specific guidance
- Review example scripts for syntax and structure
- Consult course resources in the `resources/` directory
- Ask questions during office hours or on the course forum

## Tips for Success

1. **Organize Your Work**: Create subdirectories for each assignment
2. **Comment Your Code**: Make your code readable for yourself and others
3. **Test Frequently**: Run your scripts often to catch errors early
4. **Version Control**: Use git to track changes and save your work
5. **Backup**: Push your work to GitHub regularly

## Common Commands

### Git Commands
```bash
git status                  # Check repository status
git add <file>             # Stage a file for commit
git commit -m "message"    # Commit changes
git push                   # Push to remote repository
git pull                   # Pull latest changes
```

### Python Virtual Environment
```bash
# Activate
source venv/bin/activate    # macOS/Linux
venv\Scripts\activate       # Windows

# Deactivate
deactivate
```

## Troubleshooting

### Python Script Won't Run
- Check Python version: `python --version`
- Ensure you're in the correct directory
- Verify dependencies are installed: `pip list`

### Import Errors
- Activate virtual environment
- Install missing packages: `pip install <package_name>`

### Git Issues
- Ensure you've configured git: `git config --list`
- Check remote URL: `git remote -v`

## Next Steps

1. Review the example scripts in `scripts/`
2. Check for new lab assignments in `labs/`
3. Complete homework assignments in `homework/`
4. Explore additional resources in `resources/`

Happy coding and good luck with ELTN 132!
