import { useState, MouseEvent } from "react";
import * as ReactDOM from "react-dom";
const behrImgSrc = require('./behr.png')

function render() {
  ReactDOM.render(<App />, document.body);
}

render();

function App() {
  return (
    <>
      <Image />
    </>
  );
}

function Image() {
  const IMAGE_DIMENSION = 100;
  const [top, setTop] = useState(100);
  const [left, setLeft] = useState(100);
  const [isDragging, setIsDragging] = useState(false);

  const handleStartMouseDrag = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleEndMouseDrag = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    setTop(e.clientY - IMAGE_DIMENSION / 2);
    setLeft(e.clientX - IMAGE_DIMENSION / 2);
  };

  return (
    <img
      id="image-confetti"
      height={IMAGE_DIMENSION}
      width={IMAGE_DIMENSION}
      src={behrImgSrc}
      style={{ cursor: "grab", top, left, position: "absolute" }}
      onMouseDown={handleStartMouseDrag}
      onMouseUp={handleEndMouseDrag}
      onMouseLeave={handleEndMouseDrag}
      onMouseMove={handleMouseMove}
    />
  );
}
