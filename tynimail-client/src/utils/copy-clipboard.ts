import toast from "react-hot-toast";

const hanlderCopyToClipboard = async (text: string) => {
  try {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}${text}`;
    await navigator.clipboard.writeText(url);
    toast.success("Text copied to clipboard!");
  } catch (err) {
    toast.error("Failed to copy text to clipboard.");
  }
};
export { hanlderCopyToClipboard };
