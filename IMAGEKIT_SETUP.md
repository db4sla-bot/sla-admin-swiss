# ImageKit Setup Instructions

## Getting Your ImageKit Credentials

1. **Sign up for ImageKit** (if you haven't already):
   - Go to https://imagekit.io/
   - Create a free account

2. **Get your credentials**:
   - After signing in, go to the Dashboard
   - Navigate to "Developer Options" in the left sidebar
   - You'll find:
     - **Public Key**: Copy this value
     - **Private Key**: Copy this value (keep it secure!)
     - **URL Endpoint**: Copy this value (looks like: https://ik.imagekit.io/your_imagekit_id)

3. **Update your .env file**:
   Replace the placeholder values in `.env` with your actual credentials:
   ```
   VITE_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
   VITE_IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
   VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
   ```

4. **Restart your dev server** after updating .env:
   ```
   npm run dev
   ```

## How it Works

When you add an employee:
1. The Aadhar card file is uploaded to ImageKit first
2. ImageKit returns a secure URL
3. This URL is saved to Firebase Firestore along with other employee data
4. The file is stored in the folder: `employees/aadhar/`

## Important Notes

- **Security**: Private key should NEVER be exposed in client-side code in production
- **Recommendation**: For production, create a backend API endpoint to handle ImageKit uploads
- **File naming**: Files are named as `aadhar_{employeeId}_{timestamp}_{originalName}`
- **Folder structure**: All Aadhar cards are stored in `employees/aadhar/` folder
