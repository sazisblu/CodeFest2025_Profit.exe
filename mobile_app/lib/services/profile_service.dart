import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../models/user_stats_model.dart';

class ProfileService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get user statistics
  Future<UserStats> getUserStats(String userId) async {
    try {
      // Get total posts created by user
      final postsResponse = await _supabase
          .from('posts')
          .select('id')
          .eq('user_id', userId);

      final postsCreated = (postsResponse as List).length;

      // Get total likes across all user's posts
      final likesResponse = await _supabase
          .from('posts')
          .select('likes_count')
          .eq('user_id', userId);

      int totalLikes = 0;
      for (var post in likesResponse as List) {
        totalLikes += (post['likes_count'] as int?) ?? 0;
      }

      // Calculate impact score
      final impactScore = UserStats.calculateImpactScore(
        postsCreated,
        totalLikes,
      );

      return UserStats(
        postsCreated: postsCreated,
        totalLikes: totalLikes,
        impactScore: impactScore,
      );
    } catch (e) {
      throw Exception('Failed to fetch user stats: $e');
    }
  }

  // Upload profile photo to Supabase Storage
  Future<String> uploadProfilePhoto(File imageFile, String userId) async {
    try {
      // Delete old custom photo if exists
      await _deleteOldProfilePhoto(userId);

      // Create unique filename
      final fileName = '$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';

      // Upload to Supabase storage
      await _supabase.storage
          .from('profile-photos')
          .upload(fileName, imageFile);

      // Get public URL
      final photoUrl = _supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

      // Update user profile with new photo URL
      await _supabase
          .from('users')
          .update({'photo_url': photoUrl})
          .eq('id', userId);

      return photoUrl;
    } catch (e) {
      throw Exception('Failed to upload photo: $e');
    }
  }

  // Delete old profile photo from storage
  Future<void> _deleteOldProfilePhoto(String userId) async {
    try {
      // List all files in user's folder
      final files = await _supabase.storage
          .from('profile-photos')
          .list(path: userId);

      // Delete all old photos
      if (files.isNotEmpty) {
        final filesToDelete = files
            .map((file) => '$userId/${file.name}')
            .toList();
        await _supabase.storage.from('profile-photos').remove(filesToDelete);
      }
    } catch (e) {
      // Ignore errors if no files exist
    }
  }

  // Pick image from gallery
  Future<File?> pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        return File(pickedFile.path);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to pick image: $e');
    }
  }

  // Get user's current photo URL
  Future<String?> getUserPhotoUrl(String userId) async {
    try {
      final response = await _supabase
          .from('users')
          .select('photo_url')
          .eq('id', userId)
          .single();

      return response['photo_url'] as String?;
    } catch (e) {
      return null;
    }
  }
}
