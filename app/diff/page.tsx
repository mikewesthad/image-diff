"use client";

import ImageDifference from "../imageDifference/ImageDifference";
import ImagePreview from "../ImagePreview";
import Link from "next/link";
import { useImageProvider } from "../ImageProvider/useImageProvider";
import Header from "../header";

export default function DiffPage() {
  const { image1State, image2State, setImage1, setImage2, reset } = useImageProvider();

  const handleImage1Change = async (file: File) => {
    await setImage1(file);
  };

  const handleImage2Change = async (file: File) => {
    await setImage2(file);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="space-y-8">
          <h2 className="text-xl font-semibold mb-2">Original Images</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-[300px]">
              <ImagePreview
                image={image1State.state === "success" ? image1State.imageElement : null}
                label="Image 1"
                onRemove={() => setImage1(null)}
                onImageChange={handleImage1Change}
              />
            </div>
            <div className="h-[300px]">
              <ImagePreview
                image={image2State.state === "success" ? image2State.imageElement : null}
                label="Image 2"
                onRemove={() => setImage2(null)}
                onImageChange={handleImage2Change}
              />
            </div>
          </div>

          <ImageDifference
            imageA={image1State.state === "success" ? image1State.imageElement : null}
            imageB={image2State.state === "success" ? image2State.imageElement : null}
          />
        </div>
      </div>
    </main>
  );
}
