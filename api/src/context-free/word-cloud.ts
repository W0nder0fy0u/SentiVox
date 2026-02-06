export function generateWordCloud(__keywords: {
  [key: string]: number;
}) {
  const width = 500;
  const height = 500;
  const padding = 2;
  const words = Object.entries(__keywords)
    .sort((a, b) => b[1] - a[1])
    .map(([text, size]) => ({ text, size }));

  const placedWords: {
    text: string;
    size: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];

  const maxFreq = words.length > 0 ? words[0].size : 1;
  const minFreq = words.length > 0 ? words[words.length - 1].size : 1;

  const getFontSize = (freq: number) => {
    if (maxFreq === minFreq) return 25;
    return 14 + ((freq - minFreq) / (maxFreq - minFreq)) * 36;
  };

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
  ];

  for (const word of words) {
    const fontSize = getFontSize(word.size);
    // Rough estimation of word dimensions
    const wordWidth = word.text.length * fontSize * 0.6;
    const wordHeight = fontSize;

    let angle = 0;
    let radius = 0;

    // Archimedean spiral: x = a*theta*cos(theta), y = a*theta*sin(theta)
    while (radius < Math.max(width, height) * 0.7) {
      const x = width / 2 + radius * Math.cos(angle) - wordWidth / 2;
      const y = height / 2 + radius * Math.sin(angle) - wordHeight / 2;

      let collision = false;
      for (const placedWord of placedWords) {
        if (
          x < placedWord.x + placedWord.width + padding &&
          x + wordWidth + padding > placedWord.x &&
          y < placedWord.y + placedWord.height + padding &&
          y + wordHeight + padding > placedWord.y
        ) {
          collision = true;
          break;
        }
      }

      if (
        !collision &&
        x >= 10 &&
        x + wordWidth <= width - 10 &&
        y >= 10 &&
        y + wordHeight <= height - 10
      ) {
        placedWords.push({
          text: word.text,
          size: fontSize,
          x,
          y,
          width: wordWidth,
          height: wordHeight,
        });
        break;
      }

      angle += 0.15;
      radius += 0.4;
    }
  }

  const svgElements = placedWords.map((word, index) => {
    const color = colors[index % colors.length];
    return `<text x="${word.x}" y="${
      word.y + word.height * 0.8
    }" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="${
      word.size
    }" fill="${color}" font-weight="bold">${word.text}</text>`;
  });

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">
    ${svgElements.join("\n    ")}
  </svg>`;

  return svg ;
}
