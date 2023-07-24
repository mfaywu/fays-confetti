import { useState, MouseEvent, useEffect, SetStateAction } from "react";
import * as ReactDOM from "react-dom";

export interface IElectronAPI {
  onSetImage: (callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => Promise<void>,
  setImage: (image: string | null) => void,
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
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    window.api.setImage(window.localStorage.getItem('image'))
  }, [])

  useEffect(() => {
    window.api.onSetImage((_event: Electron.IpcRendererEvent, value: SetStateAction<string>) => {
      console.log('setImage: ', value)
      window.localStorage.setItem('image', value.toString()) // why? 
      setImage(value)
    })
    return () => window.api.removeSetImageListener()
  }, [])

  useEffect(() => {
    console.log('image changed: ', image)
  }, [image])

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

  if(image === null) {
    return null
  }

  return (
    <img
      className="image-confetti"
      height={IMAGE_DIMENSION}
      width={IMAGE_DIMENSION}
      src={`fay://images/${image}`}
      style={{ cursor: "grab", top, left, position: "absolute" }}
      onMouseDown={handleStartMouseDrag}
      onMouseUp={handleEndMouseDrag}
      onMouseLeave={handleEndMouseDrag}
      onMouseMove={handleMouseMove}
    />
  );
}
