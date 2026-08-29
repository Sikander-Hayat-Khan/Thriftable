"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppToastContainer() {
  return (
    <ToastContainer
      position="top-left"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      className="thriftable-toast-container"
      toastClassName="thriftable-toast-item"
    />
  );
}
