import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/post_model.dart';
import '../models/thread_model.dart';

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
    double? latitude,
    double? longitude,
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
            'latitude': latitude,
            'longitude': longitude,
            'likes_count': 0,
            'threads_count': 0,
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

        // Use the likes_count and threads_count directly from posts table
        final likesCount = post['likes_count'] as int? ?? 0;
        final threadsCount = post['threads_count'] as int? ?? 0;

        return PostModel.fromJson({
          ...post,
          'user_display_name': userData['display_name'],
          'user_photo_url': userData['photo_url'],
          'likes_count': likesCount,
          'threads_count': threadsCount,
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

  // Fetch threads for a post (with nested structure)
  Future<List<ThreadModel>> getThreads(String postId) async {
    try {
      // Get all threads for this post
      final response = await _supabase
          .from('post_threads')
          .select('*, users(display_name, photo_url)')
          .eq('post_id', postId)
          .order('created_at', ascending: true);

      final allThreads = (response as List).map((t) {
        return ThreadModel.fromJson({
          ...t,
          'user_display_name': t['users']?['display_name'],
          'user_photo_url': t['users']?['photo_url'],
        });
      }).toList();

      // Build nested structure: separate top-level threads from replies
      final topLevelThreads = allThreads
          .where((t) => t.parentThreadId == null)
          .toList();

      final repliesMap = <String, List<ThreadModel>>{};
      for (var thread in allThreads) {
        if (thread.parentThreadId != null) {
          repliesMap.putIfAbsent(thread.parentThreadId!, () => []);
          repliesMap[thread.parentThreadId]!.add(thread);
        }
      }

      // Attach replies to their parent threads
      return topLevelThreads.map((thread) {
        return thread.copyWith(replies: repliesMap[thread.id] ?? []);
      }).toList();
    } catch (e) {
      print('Error fetching threads: $e');
      return [];
    }
  }

  // Upload thread/comment image to Supabase Storage
  Future<String?> uploadThreadImage(File imageFile) async {
    try {
      print('Starting thread image upload...');
      final String fileName =
          'thread_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final String filePath = fileName;

      print('Uploading to thread-images bucket: $filePath');
      await _supabase.storage
          .from('thread-images')
          .upload(
            filePath,
            imageFile,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      print('Upload successful, getting public URL...');
      final String imageUrl = _supabase.storage
          .from('thread-images')
          .getPublicUrl(filePath);

      print('Thread image URL: $imageUrl');
      return imageUrl;
    } catch (e) {
      print('Error uploading thread image: $e');
      print('Error details: ${e.toString()}');
      rethrow; // Rethrow to allow caller to handle the error
    }
  }

  // Add a thread to a post
  Future<void> addThread({
    required String postId,
    required String userId,
    required String content,
    String? parentThreadId, // null for top-level thread
    File? imageFile, // Optional image for the thread/comment
  }) async {
    try {
      // Upload image if provided
      String? imageUrl;
      if (imageFile != null) {
        print('Image file provided, uploading...');
        imageUrl = await uploadThreadImage(imageFile);
        if (imageUrl == null || imageUrl.isEmpty) {
          throw Exception(
            'Image upload failed. Please check if the "thread-images" bucket exists in Supabase Storage.',
          );
        }
        print('Image uploaded successfully: $imageUrl');
      } else {
        print('No image file provided');
      }

      print('Inserting thread with image_url: $imageUrl');
      // Add thread record
      await _supabase.from('post_threads').insert({
        'post_id': postId,
        'user_id': userId,
        'content': content,
        'parent_thread_id': parentThreadId,
        'image_url': imageUrl,
        'likes_count': 0,
        'replies_count': 0,
        'created_at': DateTime.now().toIso8601String(),
      });
      print('Thread inserted successfully');

      // If this is a reply, update parent's reply count
      if (parentThreadId != null) {
        final repliesResponse = await _supabase
            .from('post_threads')
            .select()
            .eq('parent_thread_id', parentThreadId);

        final repliesCount = (repliesResponse as List).length;

        await _supabase
            .from('post_threads')
            .update({'replies_count': repliesCount})
            .eq('id', parentThreadId);
      }

      // Count actual top-level threads and update the post
      final threadsResponse = await _supabase
          .from('post_threads')
          .select()
          .eq('post_id', postId)
          .isFilter('parent_thread_id', null);

      final actualThreadsCount = (threadsResponse as List).length;

      // Update the posts table with actual count
      await _supabase
          .from('posts')
          .update({'threads_count': actualThreadsCount})
          .eq('id', postId);
    } catch (e) {
      print('Error adding thread: $e');
      rethrow;
    }
  }

  // Toggle like on a thread
  Future<bool> toggleThreadLike(String threadId, String userId) async {
    try {
      // Check if user already liked this thread
      final existingLike = await _supabase
          .from('post_thread_likes')
          .select()
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .maybeSingle();

      bool wasLiked = existingLike != null;

      if (wasLiked) {
        // Unlike: Remove the like
        await _supabase
            .from('post_thread_likes')
            .delete()
            .eq('thread_id', threadId)
            .eq('user_id', userId);
      } else {
        // Like: Add the like
        await _supabase.from('post_thread_likes').insert({
          'thread_id': threadId,
          'user_id': userId,
          'created_at': DateTime.now().toIso8601String(),
        });
      }

      // Count actual likes and update the thread
      final likesResponse = await _supabase
          .from('post_thread_likes')
          .select('id')
          .eq('thread_id', threadId);

      final actualLikesCount = (likesResponse as List).length;

      await _supabase
          .from('post_threads')
          .update({'likes_count': actualLikesCount})
          .eq('id', threadId);

      return !wasLiked;
    } catch (e) {
      throw Exception('Failed to toggle thread like: $e');
    }
  }

  // Check if user liked a thread
  Future<bool> hasUserLikedThread(String threadId, String userId) async {
    try {
      final result = await _supabase
          .from('post_thread_likes')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .maybeSingle();
      return result != null;
    } catch (e) {
      print('Error checking thread like status: $e');
      return false;
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
