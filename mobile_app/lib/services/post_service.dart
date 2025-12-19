import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/post_model.dart';
import '../models/comment_model.dart';

class PostService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Upload image to Supabase Storage
  Future<String?> uploadImage(File imageFile) async {
    try {
      final String fileName =
          'post_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final String filePath = fileName;

      await _supabase.storage
          .from('post-images')
          .upload(
            filePath,
            imageFile,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      final String imageUrl = _supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

      return imageUrl;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }

  // Create a new post
  Future<PostModel> createPost({
    required String userId,
    required String title,
    required String description,
    required String location,
    required String tagId,
    File? imageFile,
  }) async {
    try {
      String? imageUrl;
      if (imageFile != null) {
        imageUrl = await uploadImage(imageFile);
      }

      final response = await _supabase
          .from('posts')
          .insert({
            'user_id': userId,
            'title': title,
            'description': description,
            'location': location,
            'tag_id': tagId,
            'image_url': imageUrl,
            'likes_count': 0,
            'comments_count': 0,
            'created_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();

      return PostModel.fromJson(response);
    } catch (e) {
      print('Error creating post: $e');
      rethrow;
    }
  }

  // Get all posts with user details, tags, like and comment counts
  Future<List<PostModel>> getAllPosts() async {
    try {
      final response = await _supabase
          .from('posts')
          .select('''
            *,
            users!inner(display_name, photo_url),
            tags(*)
          ''')
          .order('created_at', ascending: false);

      return (response as List).map((post) {
        final userData = post['users'];

        // Use the likes_count and comments_count directly from posts table
        final likesCount = post['likes_count'] as int? ?? 0;
        final commentsCount = post['comments_count'] as int? ?? 0;

        return PostModel.fromJson({
          ...post,
          'user_display_name': userData['display_name'],
          'user_photo_url': userData['photo_url'],
          'likes_count': likesCount,
          'comments_count': commentsCount,
        });
      }).toList();
    } catch (e) {
      print('Error getting posts: $e');
      return [];
    }
  }

  // Toggle like for a post (robust implementation)
  Future<bool> toggleLike(String postId, String userId) async {
    try {
      // Verify user is authenticated
      final currentUser = _supabase.auth.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      // Check if user already liked this post
      final existingLike = await _supabase
          .from('post_likes')
          .select()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

      bool wasLiked = existingLike != null;

      if (wasLiked) {
        // Unlike: Remove the like
        await _supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
      } else {
        // Like: Add the like
        await _supabase.from('post_likes').insert({
          'post_id': postId,
          'user_id': userId,
          'created_at': DateTime.now().toIso8601String(),
        });
      }

      // Verify the operation by counting actual likes
      final likesResponse = await _supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId);

      final actualLikesCount = (likesResponse as List).length;

      // Update the posts table with actual count
      await _supabase
          .from('posts')
          .update({'likes_count': actualLikesCount})
          .eq('id', postId);

      // Small delay to ensure database consistency across all connections
      await Future.delayed(const Duration(milliseconds: 100));

      return !wasLiked; // Return new like status
    } catch (e) {
      throw Exception('Failed to toggle like: $e');
    }
  }

  // Backward compatibility methods
  Future<void> likePost(String postId, String userId) async {
    await toggleLike(postId, userId);
  }

  Future<void> unlikePost(String postId, String userId) async {
    await toggleLike(postId, userId);
  }

  // Check if user liked a post
  Future<bool> hasUserLiked(String postId, String userId) async {
    try {
      final result = await _supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();
      return result != null;
    } catch (e) {
      print('❌ Error checking like status: $e');
      return false;
    }
  }

  // Fetch comments for a post
  Future<List<CommentModel>> getComments(String postId) async {
    final response = await _supabase
        .from('post_comments')
        .select('*, users(display_name, photo_url)')
        .eq('post_id', postId)
        .order('created_at', ascending: true);
    return (response as List).map((c) {
      return CommentModel.fromJson({
        ...c,
        'user_display_name': c['users']?['display_name'],
        'user_photo_url': c['users']?['photo_url'],
      });
    }).toList();
  }

  // Add a comment to a post
  Future<void> addComment({
    required String postId,
    required String userId,
    required String comment,
  }) async {
    try {
      // Add comment record
      await _supabase.from('post_comments').insert({
        'post_id': postId,
        'user_id': userId,
        'comment': comment,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Count actual comments and update the post
      final commentsResponse = await _supabase
          .from('post_comments')
          .select()
          .eq('post_id', postId);

      final actualCommentsCount = (commentsResponse as List).length;

      // Update the posts table with actual count
      await _supabase
          .from('posts')
          .update({'comments_count': actualCommentsCount})
          .eq('id', postId);
    } catch (e) {
      print('Error adding comment: $e');
      rethrow;
    }
  }

  // Get posts by user
  Future<List<PostModel>> getUserPosts(String userId) async {
    try {
      final response = await _supabase
          .from('posts')
          .select('''
            *, 
            users!inner(display_name, photo_url),
            tags(*)
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return (response as List).map((post) {
        final userData = post['users'];
        return PostModel.fromJson({
          ...post,
          'user_display_name': userData['display_name'],
          'user_photo_url': userData['photo_url'],
        });
      }).toList();
    } catch (e) {
      print('Error getting user posts: $e');
      return [];
    }
  }

  // Get a single post
  Future<PostModel?> getPost(String postId) async {
    try {
      final response = await _supabase
          .from('posts')
          .select('''
            *, 
            users!inner(display_name, photo_url),
            tags(*)
          ''')
          .eq('id', postId)
          .single();

      final userData = response['users'];
      return PostModel.fromJson({
        ...response,
        'user_display_name': userData['display_name'],
        'user_photo_url': userData['photo_url'],
      });
    } catch (e) {
      print('Error getting post: $e');
      return null;
    }
  }

  // Update post
  Future<PostModel> updatePost({
    required String postId,
    String? title,
    String? description,
    String? location,
    String? tagId,
  }) async {
    try {
      final updateData = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (title != null) updateData['title'] = title;
      if (description != null) updateData['description'] = description;
      if (location != null) updateData['location'] = location;
      if (tagId != null) updateData['tag_id'] = tagId;

      final response = await _supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId)
          .select()
          .single();

      return PostModel.fromJson(response);
    } catch (e) {
      print('Error updating post: $e');
      rethrow;
    }
  }

  // Delete post
  Future<void> deletePost(String postId) async {
    try {
      await _supabase.from('posts').delete().eq('id', postId);
    } catch (e) {
      print('Error deleting post: $e');
      rethrow;
    }
  }

  // (Old likePost removed, see new likePost above)
}
