# PassShield ???
> Real-time password strength analysis, entropy calculation, and cryptographically secure generation.

PassShield is a client-side focused security application designed to analyze password complexity, estimate brute-force cracking times, and generate strong credentials adhering to modern NIST SP 800-63B standards.

## ?? Key Features

- **Real-Time Entropy Calculation**: Computes password randomness dynamically using character pool sizes.
- **Brute-Force Crack Time Estimation**: Visualizes crack timelines based on an assumed rate of 1 billion guesses per second.
- **Pattern & Weakness Detection**: Identifies keyboard walks (qwerty), sequential series (123, abc), and character repetitions (aaa).
- **Cryptographically Secure Generation**: Utilizes the Web Crypto API (window.crypto.getRandomValues) to prevent predictable pseudo-random sequences.
- **Batch Generation**: Produces 5 customizable passwords at once with an option to filter ambiguous characters (l, 1, O, 0).
- **Privacy-First Architecture**: Evaluates inputs entirely in the browser—no user passwords are submitted to a server.

## ??? Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3 (Dark Theme), Vanilla JavaScript
- **Security Logic**: Web Crypto API, Regex-based Pattern Analysis

## ?? Local Setup

1. **Clone the repository:**
   \\\ash
   git clone https://github.com/AUSTIN-JR/passshield.git
   cd passshield
   \\\

2. **Install dependencies:**
   \\\ash
   pip install -r requirements.txt
   \\\

3. **Run the application:**
   \\\ash
   python app.py
   \\\

4. **Access the application:**
   Navigate to http://127.0.0.1:5000 in your web browser.

## ?? Security Reference
Built in alignment with NIST Special Publication 800-63B guidelines regarding character sets, memorability, and length-focused complexity.
