import { useState, MouseEvent, useEffect, SetStateAction } from "react";
import * as ReactDOM from "react-dom";
import behrImgSrc = require("./behr.png");
// import fs from "fs"; // todo this didn't work

export interface IElectronAPI {
  onSetImage: (callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => Promise<void>,
  removeSetImageListener: () => void
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}

function render() {
  ReactDOM.render(<App />, document.body);
}

render();

function App() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return (
    <div style={{ overflow: "hidden" }}>
      <Image screenWidth={width} screenHeight={height} />
      <Image screenWidth={width} screenHeight={height} />
      <Image screenWidth={width} screenHeight={height} />
      <Image screenWidth={width} screenHeight={height} />
      <Image screenWidth={width} screenHeight={height} />
    </div>
  );
}

function Image(props: { screenWidth: number; screenHeight: number }) {
  const [imagePath, setImagePath] = useState(undefined);
  
  useEffect(() => {
    window.api.onSetImage((_event: Electron.IpcRendererEvent, value: SetStateAction<string>) => {
      console.log('setImagePath: ', value)
      setImagePath(value)
    })
    return () => window.api.removeSetImageListener()
  }, [])

  useEffect(() => {
    console.log('imagePath changed: ', imagePath)
  }, [imagePath])

  const { screenWidth, screenHeight } = props;
  const IMAGE_DIMENSION = 100;
  const [top, setTop] = useState(
    Math.floor(Math.random() * screenHeight) - IMAGE_DIMENSION / 2 - window.innerHeight
  );
  const [left, setLeft] = useState(
    Math.floor(Math.random() * screenWidth) - IMAGE_DIMENSION / 2
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleStartMouseDrag = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleEndMouseDrag = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false)
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    setTop(e.clientY - IMAGE_DIMENSION / 2);
    setLeft(e.clientX - IMAGE_DIMENSION / 2);
  };

  useEffect(() => {
    setTimeout(() => {
      if (!isDragging) {
        top + 1 > window.innerHeight ? setTop(-IMAGE_DIMENSION) : setTop(top + 1);        
      }
    }, 10);
  }, [top, isDragging, window.innerHeight]);

  useEffect(() => {
    if (top === -IMAGE_DIMENSION) {
        setLeft(Math.floor(Math.random() * window.innerWidth));
    }
  }, [top])

  if(imagePath === undefined) {
    return null
  }

  return (
    <img
      className="image-confetti"
      height={IMAGE_DIMENSION}
      width={IMAGE_DIMENSION}
      // src={FileReader.prototype.readAsDataURL(imagePath)}
      // src={'data:image/png;base64,' + fs.readFileSync('file://' + imagePath).toString('base64')}
      src={''} // todo none of these worked
      style={{ cursor: "grab", top, left, position: "absolute" }}
      onMouseDown={handleStartMouseDrag}
      onMouseUp={handleEndMouseDrag}
      onMouseLeave={handleEndMouseDrag}
      onMouseMove={handleMouseMove}
    />
  );
}
