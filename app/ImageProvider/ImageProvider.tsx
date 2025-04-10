"use client";

import { createContext, useState, useCallback, ReactNode } from "react";
import { isError } from "@/app/result";
import { loadImage } from "./loadImage";

interface ImageContextType {
  image1State: ImageState;
  image2State: ImageState;
  setImage1: (file: File | null) => void;
  setImage2: (file: File | null) => void;
  reset: () => void;
}

export const ImageContext = createContext<ImageContextType | null>(null);

type ImageState =
  | {
      state: "success";
      imageElement: HTMLImageElement;
      width: number;
      height: number;
    }
  | {
      state: "error";
      error: string;
    }
  | { state: "loading" }
  | { state: "empty" };

export function ImageProvider({ children }: { children: ReactNode }) {
  const [image1State, setImage1State] = useState<ImageState>({ state: "empty" });
  const [image2State, setImage2State] = useState<ImageState>({ state: "empty" });

  const setImage = async (file: File | null, setState: (state: ImageState) => void) => {
    if (!file) {
      setState({ state: "empty" });
      return;
    }

    setState({ state: "loading" });
    const result = await loadImage(file);
    if (!isError(result)) {
      setState({
        state: "success",
        imageElement: result.value,
        width: result.value.naturalWidth,
        height: result.value.naturalHeight,
      });
    } else {
      setState({ state: "error", error: result.error });
    }
  };

  const setImage1 = async (file: File | null) => {
    if (image1State.state === "success") {
      URL.revokeObjectURL(image1State.imageElement.src);
    }
    await setImage(file, setImage1State);
  };

  const setImage2 = async (file: File | null) => {
    if (image2State.state === "success") {
      URL.revokeObjectURL(image2State.imageElement.src);
    }
    await setImage(file, setImage2State);
  };

  const reset = useCallback(() => {
    setImage1(null);
    setImage2(null);
  }, [setImage1, setImage2]);

  const value = {
    image1State,
    image2State,
    setImage1,
    setImage2,
    reset,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
}
