import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

if (!env.s3Bucket || !env.s3Endpoint || !env.s3AccessKeyId || !env.s3SecretAccessKey) throw new Error("S3 storage configuration is missing");

const client = new S3Client({ region: env.s3Region, endpoint: env.s3Endpoint, forcePathStyle: true, credentials: { accessKeyId: env.s3AccessKeyId, secretAccessKey: env.s3SecretAccessKey } });

export function putPrivateImage(key, body, contentType) {
  return client.send(new PutObjectCommand({ Bucket: env.s3Bucket, Key: key, Body: body, ContentType: contentType, ServerSideEncryption: "AES256" }));
}

export function getPrivateImage(key) {
  return client.send(new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }));
}
