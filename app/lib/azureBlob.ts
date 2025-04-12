import { BlobServiceClient } from "@azure/storage-blob";
import { File } from "formidable";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME!;

export const uploadBufferToAzure = async (
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const blobName = `${Date.now()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the buffer
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: mimetype || "application/octet-stream",
    },
  });

  return blockBlobClient.url;
};

export const uploadToAzure = async (file: File): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const blobName = `${Date.now()}-${file.originalFilename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload using file path
  await blockBlobClient.uploadFile(file.filepath, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype || "application/octet-stream",
    },
  });

  return blockBlobClient.url;
};

export const uploadToAzureBulk = async (files: File[]): Promise<string[]> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const blobName = `${Date.now()}-${file.originalFilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload each file
    await blockBlobClient.uploadFile(file.filepath, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype || "application/octet-stream",
      },
    });

    uploadedUrls.push(blockBlobClient.url); // Store the URL for each uploaded image
  }

  return uploadedUrls;
};
