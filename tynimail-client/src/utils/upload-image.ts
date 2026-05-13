// Image upload handler
export const handleImageUpload = async (file: Blob | File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};
