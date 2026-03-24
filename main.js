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

// --- Lotto Logic ---
const initLotto = () => {
  const container = document.getElementById('ball-container');
  const generateBtn = document.getElementById('generate-btn');

  if (!container || !generateBtn) return;

  const generateLottoNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  };

  const updateUI = () => {
    container.innerHTML = '';
    const numbers = generateLottoNumbers();
    numbers.forEach((num, index) => {
      setTimeout(() => {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', num);
        container.appendChild(ball);
      }, index * 100);
    });
  };

  generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    updateUI();
    setTimeout(() => {
      generateBtn.disabled = false;
    }, 1000);
  });
};

// --- Animal AI Logic (Image Upload Version) ---
const TM_URL = "https://teachablemachine.withgoogle.com/models/7zneaY_Vl/";
let model, labelContainer, maxPredictions;

const initAI = async () => {
  const imageUpload = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const uploadLabel = document.getElementById('upload-label');
  labelContainer = document.getElementById('label-container');

  if (!imageUpload || !imagePreview || !labelContainer) return;

  // Load model immediately
  const modelURL = TM_URL + "model.json";
  const metadataURL = TM_URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreview.style.display = 'block';
      previewPlaceholder.style.display = 'none';
      
      imagePreview.onload = async () => {
        await predictAI(imagePreview);
      };
    };
    reader.readAsDataURL(file);
    
    uploadLabel.querySelector('.btn-text').textContent = "다른 사진 업로드";
  });
};

const predictAI = async (imageElement) => {
  const prediction = await model.predict(imageElement);
  
  // Setup or Clear results
  labelContainer.innerHTML = '';
  
  // Sort by probability
  prediction.sort((a, b) => b.probability - a.probability);

  for (let i = 0; i < maxPredictions; i++) {
    const className = prediction[i].className;
    const probability = (prediction[i].probability * 100).toFixed(0);
    
    const predictionBar = document.createElement("div");
    predictionBar.classList.add("prediction-bar");
    predictionBar.innerHTML = `
      <div class="prediction-label">
        <span class="class-name">${className}</span>
        <span class="probability">${probability}%</span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width: ${probability}%"></div>
      </div>
    `;
    labelContainer.appendChild(predictionBar);
  }
};

// --- Initialize All ---
document.addEventListener('DOMContentLoaded', () => {
  initLotto();
  initAI();
});
