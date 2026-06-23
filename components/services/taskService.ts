import json from '@/components/defaultLanding/data/availableExtensions.json';

const availableExtensions = json['availableExtensions'] as any;

export const getCurrentStringDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const getFileExtensionFromFileName = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substr(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

export const checkExtensionAndMIMEType = (file: File) => {
  const extension = getFileExtensionFromFileName(file.name);
  if (extension) {
    const isAllowedExtension = availableExtensions[extension];
    if (!isAllowedExtension) return false;
    if (!file.type) return true;
    const isAllowedType = isAllowedExtension === file.type;
    if (isAllowedType) return true;
  }
  return false;
};
