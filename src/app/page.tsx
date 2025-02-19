"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen">
      {/* Local image optimized by the custom optimizer */}
      <Image
        src="/test1.png"
        alt="test"
        width={100}
        height={100}
        loader={({ src, width, quality }) => {
          return `/api/image?url=${src}&w=${width}&q=${quality || 75}`;
        }}
      />

      {/* Remote image optimized by the custom optimizer */}
      <Image
        src="https://static.vecteezy.com/system/resources/thumbnails/044/280/984/small_2x/stack-of-books-on-a-brown-background-concept-for-world-book-day-photo.jpg"
        alt="test"
        width={100}
        height={56}
        loader={({ src, width, quality }) => {
          return `/api/image?url=${src}&w=${width}&q=${quality || 75}`;
        }}
      />

      {/* Remote image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://img.freepik.com/free-photo/book-composition-with-open-book_23-2147690555.jpg"
        alt="test"
        width={100}
        height={67}
      />

      {/* Local image optimized by the default Next.js image optimizer */}
      <Image src="/testt.png" alt="test" width={100} height={100} />
    </div>
  );
}
