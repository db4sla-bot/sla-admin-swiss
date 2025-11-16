// ImageKit upload utility for Aadhar card images

// Direct upload to ImageKit using their REST API
export const uploadToImageKitDirect = async (file, fileName, folder = 'employees') => {
  try {
    const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

    console.log('Starting ImageKit upload...', { fileName, folder });

    if (!privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not configured. Please check your .env file.');
    }

    // Convert file to base64
    const base64File = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Get base64 string without data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });

    console.log('File converted to base64, uploading to ImageKit...');

    // Create Basic Auth header (privateKey:)
    const authString = btoa(privateKey + ':');

    // Create FormData (ImageKit expects multipart/form-data)
    const formData = new FormData();
    formData.append('file', base64File);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'false');

    console.log('Upload data prepared:', { fileName, folder });

    // Upload to ImageKit using their REST API
    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`
      },
      body: formData
    });

    console.log('Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('ImageKit upload error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `Upload failed with status ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    console.log('ImageKit upload success:', result);
    return result.url; // Return the uploaded file URL
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

export default uploadToImageKitDirect;
