import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/tag_model.dart';

class TagService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get all available tags
  Future<List<TagModel>> getAllTags() async {
    try {
      final response = await _supabase.from('tags').select().order('name');

      return (response as List).map((json) => TagModel.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching tags: $e');
      rethrow;
    }
  }

  // Add tags to a post
  Future<void> addTagsToPost(String postId, List<String> tagIds) async {
    try {
      final postTags = tagIds
          .map((tagId) => {'post_id': postId, 'tag_id': tagId})
          .toList();

      await _supabase.from('post_tags').insert(postTags);
    } catch (e) {
      print('Error adding tags to post: $e');
      rethrow;
    }
  }

  // Remove all tags from a post
  Future<void> removeTagsFromPost(String postId) async {
    try {
      await _supabase.from('post_tags').delete().eq('post_id', postId);
    } catch (e) {
      print('Error removing tags from post: $e');
      rethrow;
    }
  }

  // Update tags for a post (remove old, add new)
  Future<void> updatePostTags(String postId, List<String> tagIds) async {
    try {
      // Remove existing tags
      await removeTagsFromPost(postId);

      // Add new tags
      if (tagIds.isNotEmpty) {
        await addTagsToPost(postId, tagIds);
      }
    } catch (e) {
      print('Error updating post tags: $e');
      rethrow;
    }
  }
}
