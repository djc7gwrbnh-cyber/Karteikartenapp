// Dezentes haptisches Feedback.
// Android/Chrome: Vibration API. iOS Safari (ab 18) kennt keine Vibration API,
// löst aber beim Umschalten eines <input type="checkbox" switch> ein leichtes Tick aus.

type Strength = 'light' | 'success' | 'warning';

let enabled = true;
let iosSwitch: HTMLLabelElement | null = null;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function iosTick() {
  if (!iosSwitch) {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;left:-100px;top:-100px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  iosSwitch.click();
}

export function haptic(strength: Strength = 'light') {
  if (!enabled) return;
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(strength === 'light' ? 8 : strength === 'success' ? 14 : [10, 40, 10]);
    } else {
      iosTick();
    }
  } catch {
    /* Haptik ist reine Zugabe */
  }
}
