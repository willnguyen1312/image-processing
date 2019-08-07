import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import imageSrc from "./images/axon.jpg";

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
  width: 810px;
  height: 450px;
`;

const Canvas: any = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${(props: any) => props.zIndex};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  const [rectData, setRectData] = useState<RectData>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const kickOffCanvas = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = rectRef.current as HTMLCanvasElement;
    const canvasWrapper = canvasWrapperRef.current as HTMLDivElement;

    canvas.onmousemove = (event: MouseEvent) => {
      // console.log(event.clientX);
      // console.log(event.clientY);
    };
    canvas.width = canvasWrapper.clientWidth;
    canvas.height = canvasWrapper.clientHeight;
    rect.width = canvasWrapper.clientWidth;
    rect.height = canvasWrapper.clientHeight;
    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
    const rectContext = rect.getContext("2d") as CanvasRenderingContext2D;

    setRectData({
      x: canvasWrapper.clientWidth / 2,
      y: canvasWrapper.clientHeight / 2,
      width: 100,
      height: 100
    });

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

      const x = canvasWrapper.clientWidth / 2 - 100;
      const y = canvasWrapper.clientHeight / 2 - 100;

      rectContext.drawImage(canvas, x, y, 200, 200, x, y, 200, 200);
    };
  };

  useEffect(() => {
    kickOffCanvas();
  }, []);

  const toggleZoom = () => setIsZoom(!isZoom);

  return (
    <Wrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <Canvas ref={canvasRef} />
        <Canvas zIndex={2} ref={rectRef} />
        {isZoom && <Overlay />}
      </CanvasWrapper>
      <Img src={imageSrc} />
      <Button onClick={toggleZoom}>Zoom</Button>
    </Wrapper>
  );
};

export default App;
