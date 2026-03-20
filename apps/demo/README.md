This app is the local consumer for the `next-editor` package. It should use the
same package surface that downstream projects will use.

## Getting Started

From the repo root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backblaze B2 image uploads

Set these environment variables to enable image uploads from the packaged Lexxy
editor:

```bash
B2_ENDPOINT=https://s3.<region>.backblazeb2.com
B2_REGION=<region>
B2_BUCKET_NAME=<bucket-name>
B2_APPLICATION_KEY_ID=<application-key-id>
B2_APPLICATION_KEY=<application-key>
B2_PUBLIC_BASE_URL=https://f000.backblazeb2.com/file/<bucket-name>
```

`B2_PUBLIC_BASE_URL` should be the public base URL for the bucket, because the
upload route returns `${B2_PUBLIC_BASE_URL}/${object-key}` after each upload.
