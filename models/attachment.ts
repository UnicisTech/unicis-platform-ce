import json from '@/components/defaultLanding/data/availableExtensions.json';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest } from 'next';
import { v4 as uuidv4 } from 'uuid';

const availableExtensions = json['availableExtensions'] as any;

export const createAttachment = async (
  taskId: number,
  filename: string,
  fileData: Buffer,
  url: string,
  attachmentId: string
) => {
  return prisma.attachment.create({
    data: {
      taskId,
      filename,
      fileData,
      url,
      id: attachmentId,
    },
  });
};

export const findAttachmentById = async (id: string) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });
  return attachment;
};

export const readFile = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  options.maxFileSize = 10 * 1024 * 1024;
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const fileSignatures: Record<string, number[][]> = {
  png: [[0x89, 0x50, 0x4e, 0x47]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  pdf: [[0x25, 0x50, 0x44, 0x46]],
};

const matchesSignature = (buffer: Buffer, signature: number[]) =>
  signature.every((byte, index) => buffer[index] === byte);

export const isValidFileSignature = (fileData: Buffer, extension: string) => {
  const signatures = fileSignatures[extension];
  if (!signatures) return true;
  return signatures.some((signature) => matchesSignature(fileData, signature));
};

export const saveFileAsAttachment = async (
  taskId: number,
  file: formidable.File
) => {
  const {
    filepath: tempPath,
    originalFilename: filename,
    //mimetype: mimeType,
  } = file;

  const fileData = await fs.promises.readFile(tempPath);

  const extension = filename ? getFileExtensionFromFileName(filename) : null;
  if (extension && !isValidFileSignature(fileData, extension)) {
    await fs.promises.unlink(tempPath);
    throw new Error('fileContentMismatch');
  }

  const attachmentId = uuidv4();
  const url = `/attachments/${attachmentId}`;

  await createAttachment(
    taskId,
    filename as string,
    fileData,
    url,
    attachmentId
  );

  await fs.promises.unlink(tempPath);

  return url;
};

export const deleteAttachment = async (id: string) => {
  await prisma.attachment.delete({
    where: {
      id,
    },
  });
};

const getFileExtensionFromFileName = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substr(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

export const checkExtensionAndMIMEType = (file: formidable.File) => {
  if (file.originalFilename && file.mimetype) {
    const extension = getFileExtensionFromFileName(file.originalFilename);
    if (extension) {
      const isAllowedExtension = availableExtensions[extension];
      const isAllowedType = availableExtensions[extension] === file.mimetype;
      if (isAllowedExtension && isAllowedType) {
        return true;
      }
    }
  }
  return false;
};
