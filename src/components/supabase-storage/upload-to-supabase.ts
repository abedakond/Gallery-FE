import { ReadableStream } from "stream/web";
import { getSupabaseClient } from "./get-client";

type FileBody =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | Buffer
  | File
  | FormData
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>
  | URLSearchParams
  | string

export const uploadToSupabase = async (lowResImage: FileBody, lowResImagePath: string, highResImage: FileBody, highResImagePath: string) => {
    const supabase = getSupabaseClient();

    try {
        const [lowResUploadResult, highResUploadResult] = await Promise.all([
            supabase.storage
                .from("image-bucket-1")
                .upload('lowResImage', lowResImage, {
                    cacheControl: "3600",
                    upsert: true,
                }),
            supabase.storage
                .from("image-bucket-1")
                .upload('highResImage', highResImage, {
                    cacheControl: "3600",
                    upsert: true,
                }),
        ]);
        if(lowResUploadResult.error || highResUploadResult.error) {
            console.log(lowResUploadResult.error, highResUploadResult.error);
        } else {
            console.log(highResUploadResult.data, lowResUploadResult.data)
        }
    } catch (err) {
        console.error("Error uploading images to Supabase:", err);
    }
};
