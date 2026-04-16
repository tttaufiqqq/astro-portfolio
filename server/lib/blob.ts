import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';

function getContainerClient() {
    const connStr = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT};AccountKey=${process.env.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net`;
    const client = BlobServiceClient.fromConnectionString(connStr);
    return client.getContainerClient(process.env.AZURE_STORAGE_CONTAINER!);
}

export async function uploadToBlob(buffer: Buffer, originalName: string, contentType: string): Promise<string> {
    const ext = path.extname(originalName);
    const blobName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
    });
    return blockBlobClient.url;
}

export async function deleteFromBlob(url: string): Promise<void> {
    try {
        const containerClient = getContainerClient();
        // URL format: https://{account}.blob.core.windows.net/{container}/{blobName}
        const blobName = new URL(url).pathname.split('/').slice(2).join('/');
        await containerClient.deleteBlob(blobName);
    } catch {
        // ignore — blob may not exist
    }
}
