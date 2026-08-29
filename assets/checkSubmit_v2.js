document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector('button[type="submit"]');
    if (!submitButton) return; 

    const turnstileWidget = document.querySelector('.cf-turnstile');
    const hasTurnstile = turnstileWidget !== null;

    if (hasTurnstile) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';

        const checkTurnstile = setInterval(() => {
            const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
            if (turnstileResponse && turnstileResponse.value !== "") {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
                clearInterval(checkTurnstile);
            }
        }, 250);
    }
});