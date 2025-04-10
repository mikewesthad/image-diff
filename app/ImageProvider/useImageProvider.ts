import { useContext } from "react";
import { ImageContext } from "./ImageProvider";

export function useImageProvider() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageProvider must be used within an ImageProvider");
  }
  return context;
}
