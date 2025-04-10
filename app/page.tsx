"use client";

import ImageDropZone from "./ImageDropZone";
import { useImageProvider } from "./ImageProvider/useImageProvider";
import { useRouter } from "next/navigation";
import Header from "./header";
export default function Home() {
  const { setImage1, setImage2 } = useImageProvider();
  const router = useRouter();

  const handleImageDrop = async (files: FileList) => {
    const file1 = files[0];
    const file2 = files[1];

    await Promise.all([file1 ? setImage1(file1) : null, file2 ? setImage2(file2) : null]);

    router.push("/diff");
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Header />

        <h1 className="text-2xl font-bold text-center pb-2">Image Diff Tool</h1>

        <h1 className="text-xl text-center pb-8">
          Upload two images to compare them side by side and see the differences
        </h1>

        <div className="max-w-[500px] w-full mx-auto h-[250px]">
          <ImageDropZone onDrop={handleImageDrop} className="w-full">
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-lg mb-1">Drag and drop images</p>
                <p className="text-sm">Or, click to select files</p>
              </div>
            </div>
          </ImageDropZone>
        </div>
      </div>
    </main>
  );
}
