import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';
import { randomUUID } from 'crypto';

function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getContainerClient() {
    const connStr = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT};AccountKey=${process.env.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net`;
    const client = BlobServiceClient.fromConnectionString(connStr);
    return client.getContainerClient(process.env.AZURE_STORAGE_CONTAINER!);
}

export async function uploadToBlob(buffer: Buffer, originalName: string, contentType: string, folder = 'uploads', name?: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();
    const shortId = randomUUID().replace(/-/g, '').slice(0, 4);
    const base = name ? slugify(name) : 'file';
    const blobName = `${folder}/${base}-${shortId}${ext}`;
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
