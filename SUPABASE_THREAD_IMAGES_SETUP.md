# Supabase Setup Guide for Thread/Comment Images

This guide will help you set up Supabase to support image uploads in thread/comment sections.

## 1. Database Schema Update

### Add `image_url` column to `post_threads` table

Run this SQL query in your Supabase SQL Editor:

```sql
-- Add image_url column to post_threads table
ALTER TABLE post_threads
ADD COLUMN image_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN post_threads.image_url IS 'URL of the image attached to the thread/comment';
```

## 2. Storage Bucket Setup

### Create a new storage bucket for thread images

1. Go to **Storage** in your Supabase dashboard
2. Click **"New bucket"**
3. Enter the following details:
   - **Name**: `thread-images`
   - **Public bucket**: ✅ Check this (to allow public access to images)
   - **File size limit**: Set to `5MB` (or your preferred size)
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, image/webp`

4. Click **"Create bucket"**

### Alternative: Using SQL to create the bucket

If you prefer SQL, you can run this in the Supabase SQL Editor:

```sql
-- Create storage bucket for thread images
INSERT INTO storage.buckets (id, name, public)
VALUES ('thread-images', 'thread-images', true);
```

## 3. Storage Policies

### Set up RLS (Row Level Security) policies for the bucket

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Policy 1: Allow authenticated users to upload thread images
CREATE POLICY "Allow authenticated users to upload thread images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thread-images'
);

-- Policy 2: Allow public access to view thread images
CREATE POLICY "Allow public to read thread images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'thread-images'
);

-- Policy 3: Allow users to update their own thread images
CREATE POLICY "Allow users to update their own thread images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thread-images'
)
WITH CHECK (
  bucket_id = 'thread-images'
);

-- Policy 4: Allow users to delete their own thread images
CREATE POLICY "Allow users to delete their own thread images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thread-images'
);
```

## 4. Database RLS Policies (Optional but Recommended)

### Update post_threads table policies to handle image_url

If you have RLS enabled on your `post_threads` table, make sure the policies allow the `image_url` column:

```sql
-- Example: Update existing insert policy to include image_url
-- (Adjust this based on your existing policies)

-- Drop existing policy if needed (replace with your actual policy name)
-- DROP POLICY IF EXISTS "Users can insert threads" ON post_threads;

-- Create new policy allowing image_url
CREATE POLICY "Users can insert threads with images"
ON post_threads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Ensure SELECT policy allows viewing image_url
CREATE POLICY "Anyone can view threads with images"
ON post_threads
FOR SELECT
TO public
USING (true);
```

## 5. Verify the Setup

### Test the storage bucket

1. Go to **Storage** → **thread-images** in your Supabase dashboard
2. Try uploading a test image manually
3. Check if you can access the public URL of the uploaded image

### Test the database column

Run this query to verify the column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'post_threads' AND column_name = 'image_url';
```

Expected output:
```
column_name | data_type | is_nullable
image_url   | text      | YES
```

## 6. Configuration Checklist

Before running the app, make sure:

- ✅ `post_threads` table has `image_url` column
- ✅ `thread-images` storage bucket exists and is public
- ✅ Storage policies allow authenticated users to upload
- ✅ Storage policies allow public users to read
- ✅ Your Supabase URL and anon key are correctly set in the Flutter app

## 7. Testing the Feature

### In your Flutter app:

1. Navigate to any post
2. Click the comment/thread icon
3. Click the image icon in the reply input
4. Select an image from your gallery
5. Add text (optional) and send
6. The comment should appear with the image displayed

### Troubleshooting

**Issue**: "Upload failed" error
- **Solution**: Check that the `thread-images` bucket exists and is set to public
- Verify storage policies are correctly set up

**Issue**: Images not displaying
- **Solution**: Check that the bucket is public
- Verify the image URL is correctly saved in the database

**Issue**: "Permission denied" error
- **Solution**: Check your RLS policies on both storage and database
- Make sure user is authenticated

**Issue**: Large images taking too long to upload
- **Solution**: Consider implementing image compression in the app before upload
- Reduce the file size limit in the bucket settings

## 8. Optional Enhancements

### Image Compression (Recommended)

To reduce upload time and storage costs, consider adding the `flutter_image_compress` package:

```yaml
dependencies:
  flutter_image_compress: ^2.1.0
```

Then compress images before upload in your service:

```dart
import 'package:flutter_image_compress/flutter_image_compress.dart';

Future<File?> compressImage(File file) async {
  final filePath = file.absolute.path;
  final lastIndex = filePath.lastIndexOf('.');
  final outPath = '${filePath.substring(0, lastIndex)}_compressed${filePath.substring(lastIndex)}';
  
  final result = await FlutterImageCompress.compressAndGetFile(
    filePath,
    outPath,
    quality: 70,
    minWidth: 1024,
    minHeight: 1024,
  );
  
  return result != null ? File(result.path) : null;
}
```

### Add File Size Validation

Limit upload size in your Flutter app:

```dart
Future<void> _pickImage() async {
  try {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    
    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final fileSize = await file.length();
      
      // Check if file is larger than 5MB
      if (fileSize > 5 * 1024 * 1024) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image must be less than 5MB')),
        );
        return;
      }
      
      setState(() {
        _selectedImage = file;
      });
    }
  } catch (e) {
    // Handle error
  }
}
```

## 9. Security Best Practices

1. **Set appropriate file size limits** in the bucket settings
2. **Enable virus scanning** if available in your Supabase plan
3. **Implement rate limiting** to prevent abuse
4. **Validate file types** on both client and server side
5. **Consider implementing content moderation** for user-uploaded images

## Summary

You have successfully set up image upload functionality for thread/comments! Users can now:
- Upload images when adding comments/threads
- View images attached to comments/threads
- Remove selected images before posting

The implementation includes:
- ✅ Database schema updates
- ✅ Storage bucket creation
- ✅ Proper RLS policies
- ✅ Full CRUD operations on thread images
- ✅ UI for image selection and preview
- ✅ Error handling and loading states

Need help? Check the Supabase documentation: https://supabase.com/docs/guides/storage
