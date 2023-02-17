function retina_one_px_border(direction, color) {
  if (!direction || !color) return '';
  direction = direction.trim();
  color = color.trim();
  let result = `
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
  `
  if (direction == 'top' || direction == 'bottom') {
    result = `
      ${result}
      right: 0;
      height: 2px;
      transform: scaleY(0.5);
      border-top: 2px solid ${color};
      `
  }
  if (direction === 'top') {
    result = `${result}
    transform-origin: 0 0;`
  }
  if (direction == 'bottom') {
    result = `
      ${result}
      top: auto;
      bottom: 0;
      transform-origin: 0 100%;
      `
  }
  if (direction == 'right' || direction == 'left') {
    result = `
      ${result}
      width: 2px;
      bottom: 0;
      transform: scaleX(0.5);
      border-left: 2px solid ${color};
      `
  }

  if (direction == 'right') {
    result = `
      ${result}
      transform-origin: 0 0;
    `
  }
  if (direction == 'right') {
    result = `
      ${result}
      left: 0;
      transform-origin: 100% 0;
    `
  }
  if (direction == 'all') {
    result = `
      ${result}
      width: 200%;
      height: 200%;
      transform-origin: left top;
      transform: scale(0.5);
      border: 2px solid ${color};
      `
  }
  return result;
}
function ellipsis_lines(lines) {
  if (!lines) return '';
  return `
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${lines.trim()};
    -webkit-box-orient: vertical;
  `
}

export const STYLE_MIXIN = {
  '@retina_one_px_border': retina_one_px_border,
  '@ellipsis_lines': ellipsis_lines,
}
 