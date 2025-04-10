import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { VisuallyHidden } from "react-aria";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-between items-center pt-4 pb-4">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/logo.svg" alt="ImgDiff logo" width={35} height={35} />
        <h1 className="text-md font-bold">ImgDiff</h1>
        <VisuallyHidden>Go to homepage</VisuallyHidden>
      </Link>
      <a
        href="https://github.com/mikewesthad/image-diff"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
      >
        <FaGithub />
        <VisuallyHidden>View project on GitHub</VisuallyHidden>
      </a>
    </header>
  );
}
