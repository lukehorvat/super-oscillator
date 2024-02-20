export function render(containerEl: Element): Promise<void> {
  return new Promise((resolve) => {
    const welcomeEl = document.createElement('div');
    welcomeEl.className = 'welcome';
    containerEl.appendChild(welcomeEl);

    const headerEl = document.createElement('h1');
    headerEl.textContent = 'Super Oscillator';
    welcomeEl.appendChild(headerEl);

    const descriptionEl = document.createElement('p');
    welcomeEl.appendChild(descriptionEl);

    const textStart = document.createTextNode('An ');
    descriptionEl.appendChild(textStart);

    const forkLink = document.createElement('a');
    forkLink.textContent = 'open-source';
    forkLink.href = 'https://github.com/lukehorvat/super-oscillator';
    descriptionEl.appendChild(forkLink);

    const textEnd = document.createTextNode(
      ' 3D music synthesizer for the Web.'
    );
    descriptionEl.appendChild(textEnd);

    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.type = 'button';
    startButton.autofocus = true;
    startButton.addEventListener('click', () => {
      welcomeEl.remove();
      resolve();
    });
    welcomeEl.appendChild(startButton);
  });
}
