import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { auth } from "~/server/auth"

const f = createUploadthing()

export const ourFileRouter = {
  mixImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user?.id) {
        // UploadThingError is the SDK's auth failure signal.
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- UploadThingError
        throw new UploadThingError("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
