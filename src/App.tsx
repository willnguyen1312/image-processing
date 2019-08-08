import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import styled from "styled-components";
import { debounce } from "lodash";
import imageSrc from "./images/axon.jpg";
// import imageSrc from "./images/width.png";
// import imageSrc from "./images/height.png";
// import imageSrc from "./images/small.png";

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
`;

const CanvasWrapper = styled.div`
  position: relative;
  background-color: black;
  width: 810px;
  height: 450px;
`;

interface CanvasProps {
  zIndex?: number;
  isDraggable?: boolean;
}

const Canvas = styled.canvas<CanvasProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ zIndex }) => zIndex || 0};
  cursor: ${({ isDraggable }) => (isDraggable ? "move" : "initial")};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Img = styled.img`
  margin-top: 100px;
  height: 300px;
  width: 300px;
  object-fit: contain;
`;

const Button = styled.button`
  font-size: 18px;
`;

interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const App: React.FC = () => {
  const [isZoom, setIsZoom] = useState<boolean>(true);
  const [isDraggable, setIsDraggable] = useState<boolean>(false);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D>();
  const [rectCtx, setRectCtx] = useState<CanvasRenderingContext2D>();
  const [rectData, setRectData] = useState<RectData>({
    height: 0,
    width: 0,
    x: 0,
    y: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const kickOffCanvas = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = rectRef.current as HTMLCanvasElement;
    const canvasWrapper = canvasWrapperRef.current as HTMLDivElement;

    canvas.width = canvasWrapper.clientWidth;
    canvas.height = canvasWrapper.clientHeight;
    rect.width = canvasWrapper.clientWidth;
    rect.height = canvasWrapper.clientHeight;
    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
    const rectContext = rect.getContext("2d") as CanvasRenderingContext2D;

    setCanvasCtx(canvasContext);
    setRectCtx(rectContext);

    const image = new Image();
    image.src = imageSrc;
    let imageHeight, imageWidth;

    image.onload = () => {
      imageHeight = image.height;
      imageWidth = image.width;
      if (imageHeight > canvas.height) {
        // Scale image if too tall
        const oldHeight = imageHeight;
        imageHeight = canvas.height;
        imageWidth = Math.round(imageWidth * (imageHeight / oldHeight)); // resize height proportionally
      }

      if (imageWidth > canvas.width) {
        // Scale image if too wide, this must happen after scaling for tall
        const oldWidth = imageWidth;
        imageWidth = canvas.width;
        imageHeight = Math.round(imageHeight * (imageWidth / oldWidth));
      }

      const offsetY = Math.round((canvas.height - imageHeight) / 2);
      const offsetX = Math.round((canvas.width - imageWidth) / 2);
      canvasContext.drawImage(image, offsetX, offsetY, imageWidth, imageHeight);

      canvasContext.fillStyle = "#000";
      canvasContext.fillRect(0, 0, offsetX, canvas.height);
      canvasContext.fillRect(
        offsetX + imageWidth,
        0,
        canvas.width - offsetX,
        canvas.height
      );

      setRectData({
        x: canvasWrapper.clientWidth / 2 - 100,
        y: canvasWrapper.clientHeight / 2 - 100,
        width: 200,
        height: 200
      });
    };
  };

  useEffect(() => {
    kickOffCanvas();
  }, []);

  useLayoutEffect(() => {
    const canvasContext = canvasCtx as CanvasRenderingContext2D;
    const rectContext = rectCtx as CanvasRenderingContext2D;
    const canvasWrapper = canvasWrapperRef.current as HTMLDivElement;

    let { x, y, width, height } = rectData;

    if (width && height) {
      rectContext.clearRect(
        0,
        0,
        canvasWrapper.clientWidth,
        canvasWrapper.clientHeight
      );

      if (isZoom) {
        rectContext.beginPath();
        rectContext.lineWidth = 2;
        rectContext.strokeStyle = "red";
        rectContext.rect(x, y, width, height);
        rectContext.stroke();
      }

      // if (

      // ) {
      //   return;
      // }

      // const isLeftXOff = x < 0 || x > canvasWrapper.clientWidth - width - 0;
      // const isOffY = y < 0 || y > canvasWrapper.clientHeight - height - 0;

      // if (x > canvasWrapper.clientWidth - width) {
      //   x = canvasWrapper.clientWidth - width;
      // }
      // if (x < 0) {
      //   x = 0;
      // }

      // if (y > canvasWrapper.clientHeight - height) {
      //   y = canvasWrapper.clientHeight - height;
      // }
      // if (y < 0) {
      //   y = 0;
      // }

      rectContext.drawImage(
        canvasContext.canvas,
        x,
        y,
        width,
        height,
        x,
        y,
        width,
        height
      );
    }
  }, [rectData, canvasCtx, rectCtx, isZoom]);

  const toggleZoom = () => setIsZoom(!isZoom);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const rectContext = rectCtx as CanvasRenderingContext2D;
    if (isDraggable) {
      event.preventDefault();
      event.stopPropagation();

      const { mouseX, mouseY } = getMousePosition(event);
      const { x, y, width, height } = rectData;
      const canvasWidth = canvasWrapperRef.current!.clientWidth;
      const canvasHeight = canvasWrapperRef.current!.clientHeight;

      let newX = mouseX - width / 2;
      let newY = mouseY - height / 2;

      if (newX > canvasWidth - width) {
        newX = canvasWidth - width;
      }
      if (newX < 0) {
        newX = 0;
      }

      if (newY > canvasHeight - height) {
        newY = canvasHeight - height;
      }
      if (newY < 0) {
        newY = 0;
      }

      setRectData(prevData => {
        return {
          ...prevData,
          x: newX,
          y: newY
        };
      });
    }
  };

  const getMousePosition = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const BB = canvasWrapperRef.current!.getBoundingClientRect();
    const mouseX = Number(event.clientX - BB.left);
    const mouseY = Number(event.clientY - BB.top);

    return {
      mouseX,
      mouseY
    };
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    debugger;
    if (isZoom) {
      event.preventDefault();
      event.stopPropagation();

      const { mouseX, mouseY } = getMousePosition(event);

      const { x, y, width, height } = rectData;

      if (
        mouseX > x &&
        mouseX < x + width &&
        mouseY > y &&
        mouseY < y + height
      ) {
        setIsDraggable(true);
      }
    }
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isZoom) {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggable(false);
    }
  };

  return (
    <Wrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <Canvas zIndex={0} ref={canvasRef} />
        <Canvas
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          zIndex={2}
          isDraggable={isDraggable}
          ref={rectRef}
        />
        {isZoom && <Overlay />}
      </CanvasWrapper>
      <Img src={imageSrc} />
      <Button onClick={toggleZoom}>Zoom</Button>
    </Wrapper>
  );
};

export default App;
