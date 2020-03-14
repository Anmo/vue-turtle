export const convertValue = value =>
  Array.isArray(value) || !value ? value : [value];

const timeRegex = /(m?s)/i;
const timeConverter = {
  s: 1000,
  ms: 1
};
export function convertArg(arg) {
  const [num, timeFactor = "ms"] = `${arg}`.split(timeRegex);

  return num * timeConverter[timeFactor];
}

export function wrapper(fn, wait, throttle) {
  let timeout = null;
  let lastArgs = [];

  function wrapperCB(...args) {
    lastArgs = args;

    if (throttle && timeout !== null) {
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      fn.apply(this, lastArgs);
      lastArgs = [];
    }, wait);
  }

  wrapperCB.cancel = function cancel() {
    clearTimeout(timeout);
    timeout = null;
    lastArgs = [];
  };

  return wrapperCB;
}
