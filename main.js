// Lotto Ball Web Component
class LottoBall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['number'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'number') {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  getBallColor(num) {
    if (num <= 10) return 'var(--ball-yellow)';
    if (num <= 20) return 'var(--ball-blue)';
    if (num <= 30) return 'var(--ball-red)';
    if (num <= 40) return 'var(--ball-gray)';
    return 'var(--ball-green)';
  }

  render() {
    const number = this.getAttribute('number') || '0';
    const num = parseInt(number, 10);
    const color = this.getBallColor(num);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          perspective: 1000px;
        }
        .ball {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, white 0%, ${color} 40%, oklch(0 0 0 / 0.3) 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: 800;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px oklch(0 0 0 / 0.3), inset 0 -2px 5px oklch(0 0 0 / 0.2);
          text-shadow: 1px 1px 2px oklch(0 0 0 / 0.3);
          animation: drop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          user-select: none;
        }

        @keyframes drop-in {
          0% {
            transform: scale(0) translateY(-50px) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0) rotate(0);
            opacity: 1;
          }
        }

        @media (max-width: 450px) {
          .ball {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      </style>
      <div class="ball">${number}</div>
    `;
  }
}

customElements.define('lotto-ball', LottoBall);

// Main Logic
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('ball-container');
  const generateBtn = document.getElementById('generate-btn');

  const generateLottoNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  };

  const updateUI = () => {
    // Clear container
    container.innerHTML = '';
    
    const numbers = generateLottoNumbers();
    
    numbers.forEach((num, index) => {
      setTimeout(() => {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', num);
        container.appendChild(ball);
      }, index * 100); // Staggered animation
    });
  };

  generateBtn.addEventListener('click', () => {
    // Disable button briefly to prevent spam
    generateBtn.disabled = true;
    updateUI();
    setTimeout(() => {
      generateBtn.disabled = false;
    }, 1000);
  });
});
