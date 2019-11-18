import React, { useRef } from "react";
import Cropper from "cropperjs";
import videoSrc from "./videos/sample.mp4";

function log(...args: any[]) {
  console.log(args);
}

const Video = () => {
  let cropper: Cropper | null;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const getFrame = () => {
    const video = videoRef.current as HTMLVideoElement;
    const canvas = canvasRef.current as HTMLCanvasElement;

    canvas.height = 360;
    canvas.width = 640;

    const canvasCtx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvasCtx.drawImage(video, 0, 0);

    const imageSrc = canvas.toDataURL();

    const image = imageRef.current as HTMLImageElement;

    image.src = imageSrc;
    updateCropper(imageSrc);
  };

  const updateCropper = (url: string) => {
    if (!cropper) {
      const image = imageRef.current as HTMLImageElement;
      cropper = new Cropper(image);
      return;
    }

    cropper.replace(url);
  };

  return (
    <div>
      <button onClick={getFrame}>Get frame</button>
      <h1>Video</h1>
      <video onSeeked={getFrame} ref={videoRef} controls src={videoSrc} />
      <canvas style={{ display: "none" }} ref={canvasRef} />
      <div style={{ width: 640, height: 360 }}>
        <img style={{ maxWidth: "100%" }} ref={imageRef} />
      </div>
    </div>
  );
};

export default Video;
