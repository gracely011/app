
document.addEventListener('DOMContentLoaded', function () {
  const snowContainer = document.createElement('div');
  snowContainer.id = 'snow-container';
  snowContainer.style.position = 'fixed';
  snowContainer.style.top = '0';
  snowContainer.style.left = '0';
  snowContainer.style.width = '100%';
  snowContainer.style.height = '100%';
  snowContainer.style.pointerEvents = 'none';
  snowContainer.style.zIndex = '9999';
  document.body.appendChild(snowContainer);

  const snowflakes = ['❅', '❆', '.', '•'];

  function createSnowflake() {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      snowflake.style.position = 'absolute';
      snowflake.style.top = '-10px';
      snowflake.style.left = Math.random() * window.innerWidth + 'px';
      snowflake.style.fontSize = `${Math.random() * 24 + 12}px`;
      snowflake.style.color = 'white';
      snowflake.style.opacity = Math.random();
      snowflake.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`;
      snowflake.style.transition = 'opacity 1s ease-out';

      snowContainer.appendChild(snowflake);

      // Trigger dissolve and removal after animation
      setTimeout(() => {
          snowflake.style.opacity = '0'; // Start dissolve
          setTimeout(() => {
              snowflake.remove(); // Remove after dissolve
          }, 1000); // Match the transition duration
      }, 4000); // Duration before starting dissolve
  }

  setInterval(createSnowflake, 100);

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }
    .snowflake {
      position: absolute;
      animation: fall 5s linear infinite;
      will-change: transform;
    }
  `;
  document.head.appendChild(style);
});

