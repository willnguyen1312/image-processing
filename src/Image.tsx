import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import styled from "styled-components";
// import imageSrc from "./images/axon.jpg";
import imageSrc from "./images/width.png";
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
  resize?: string;
}

const Canvas = styled.canvas<CanvasProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ zIndex }) => zIndex || 0};
  cursor: ${({ isDraggable, resize }) => {
    if (isDraggable) {
      return "move";
    }

    if (resize) {
      return resize;
    }

    return "initial";
  }};
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
  const image = new Image();
  image.src = imageSrc;
  const [isZoom, setIsZoom] = useState<boolean>(true);
  const [resizable, setResizable] = useState<string>("");
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

      if (isZoom) {
        rectContext.beginPath();
        rectContext.lineWidth = 2;
        rectContext.strokeStyle = "red";
        rectContext.rect(x, y, width, height);
        rectContext.stroke();

        rectContext.fillStyle = "#FFF";
        rectContext.fillRect(x, y, 10, 10);
        rectContext.fillRect(x, y + height - 10, 10, 10);
        rectContext.fillRect(x + width - 10, y, 10, 10);
        rectContext.fillRect(x + width - 10, y + height - 10, 10, 10);

        rectContext.closePath();
      }
    }
  }, [rectData, canvasCtx, rectCtx, isZoom]);

  const toggleZoom = () => setIsZoom(!isZoom);

  const updateRectData = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { mouseX, mouseY } = getMousePosition(event);
    const { width, height } = rectData;
    const canvasWidth = canvasWrapperRef.current!.clientWidth;
    const canvasHeight = canvasWrapperRef.current!.clientHeight;

    let newX = mouseX - width / 2;
    let newY = mouseY - height / 2;

    if (newX > canvasWidth - width) {
      newX = canvasWidth - width - 1;
    }
    if (newX < 0) {
      newX = 1;
    }

    if (newY > canvasHeight - height) {
      newY = canvasHeight - height - 1;
    }
    if (newY < 0) {
      newY = 1;
    }

    setRectData(prevData => {
      return {
        ...prevData,
        x: newX,
        y: newY
      };
    });
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isDraggable) {
      event.preventDefault();
      event.stopPropagation();

      updateRectData(event);
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
    if (isZoom) {
      event.preventDefault();
      event.stopPropagation();

      const { mouseX, mouseY } = getMousePosition(event);

      const { x, y, width, height } = rectData;

      if (mouseX > x && mouseX < x + 10 && mouseY > y && mouseY < y + 10) {
        setResizable("se-resize");
        return;
      }

      if (
        mouseX > x &&
        mouseX < x + 10 &&
        mouseY > y + height - 10 &&
        mouseY < y + height
      ) {
        setResizable("ne-resize");
        return;
      }

      if (
        mouseX > x + width - 10 &&
        mouseX < x + width &&
        mouseY > y &&
        mouseY < y + 10
      ) {
        setResizable("sw-resize");
        return;
      }

      if (
        mouseX > x + width - 10 &&
        mouseX < x + width &&
        mouseY > y + height - 10 &&
        mouseY < y + height
      ) {
        setResizable("nw-resize");
        return;
      }

      if (
        mouseX > x &&
        mouseX < x + width &&
        mouseY > y &&
        mouseY < y + height
      ) {
        setIsDraggable(true);

        updateRectData(event);
      }
    }
  };

  const clearStates = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isZoom) {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggable(false);
      setResizable("");
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = "Test file";

    const canvas = document.createElement("canvas");

    const canctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    canctx.drawImage(image, 0, 0);

    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Wrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <Canvas zIndex={0} ref={canvasRef} />
        <Canvas
          onMouseDown={handleMouseDown}
          onMouseUp={clearStates}
          onMouseLeave={clearStates}
          onMouseMove={handleMouseMove}
          zIndex={2}
          isDraggable={isDraggable}
          resize={resizable}
          ref={rectRef}
        />
        {isZoom && (
          <>
            <Overlay />
            {/* <button
              style={{
                position: "absolute",
                left: rectData.x + 10,
                top: rectData.y,
                zIndex: 2
              }}
            >
              Zoom
            </button>
            <button
              style={{
                position: "absolute",
                left: rectData.x + rectData.width - 45,
                top: rectData.y,
                zIndex: 2
              }}
            >
              Exit
            </button> */}
          </>
        )}
      </CanvasWrapper>
      <Img src={imageSrc} />
      <Button onClick={toggleZoom}>Zoom</Button>
      <Button onClick={downloadImage}>Download</Button>
    </Wrapper>
  );
};

export default App;
