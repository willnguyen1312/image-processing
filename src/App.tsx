import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import imageSrc from "./images/axon.jpg";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
`;

const Img = styled.img`
  margin-top: 100px;
  height: 300px;
  width: 300px;
  object-fit: contain;
`;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const kickOffCanvas = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;

    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 810;
    canvas.height = 450;
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
    };
  };

  useEffect(() => {
    kickOffCanvas();
  }, []);

  return (
    <Wrapper>
      <h1>Canvas</h1>
      <canvas ref={canvasRef} />
      <Img src={imageSrc} />
    </Wrapper>
  );
};

export default App;
