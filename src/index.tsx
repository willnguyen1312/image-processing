import React from "react";
import ReactDOM from "react-dom";
import "cropperjs/dist/cropper.css";
import "./index.css";
import App from "./Cropper";

ReactDOM.render(<App />, document.getElementById("root"));

if (module.hot) module.hot.accept();
