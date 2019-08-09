import React, { useRef, useEffect } from "react";
import Cropper from "cropperjs";

const CropperComponent = () => {
  let cropper: Cropper;
  const imageRef = useRef<HTMLImageElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const runCropper = () => {
    const image = imageRef.current as HTMLImageElement;
    cropper = new Cropper(image, {
      viewMode: 3,
      dragMode: "move",
      autoCropArea: 1,
      restore: false,
      modal: false,
      guides: false,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false
    });
  };

  useEffect(() => runCropper(), []);

  const generateCrop = () => {
    const canvas = cropper.getCroppedCanvas();
    const result = resultRef.current as HTMLDivElement;

    result.innerHTML = "";
    result.appendChild(canvas);
  };

  return (
    <div>
      <h1>Cropper</h1>
      <button onClick={generateCrop}>Generate Crop</button>
      <div style={{ width: 800, height: 500 }}>
        <img
          ref={imageRef}
          src="https://picsum.photos/id/999/1268/720"
          style={{ maxWidth: "100%" }}
        />
      </div>
      <div ref={resultRef} />
    </div>
  );
};

export default CropperComponent;
