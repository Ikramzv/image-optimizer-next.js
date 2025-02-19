# Next.js Custom Image Optimizer

A custom image optimizer for Next.js that creates its own image cache directory and use it for subsequent requests that match the same image.

ETag response header is set to direct a browser to cache the image using Etag. Subsequent requests that match the same image will return 304 Not Modified status which tells the browser use the cached image since the image hasn't changed. Conditional requests made by the browser are handled by returning 304 Not Modified status.

If the image is changed, the ETag will be different and the the endpoint will return the image from the cache (.image-cache directory) if it exists. Otherwise, the image will be fetched from the source (local or remote), optimized and saved to the cache. Optimized image is saved webp format and will be sent to the client with ETag header that matches the cache key.
