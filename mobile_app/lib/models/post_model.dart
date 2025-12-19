import 'tag_model.dart';

class PostModel {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String location;
  final String? tagId;
  final String? imageUrl;
  final int likes;
  final int commentsCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  // User details (from join)
  final String? userDisplayName;
  final String? userPhotoUrl;

  // Tag details (from join)
  final TagModel? tag;

  PostModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.location,
    this.tagId,
    this.imageUrl,
    this.likes = 0,
    this.commentsCount = 0,
    required this.createdAt,
    this.updatedAt,
    this.userDisplayName,
    this.userPhotoUrl,
    this.tag,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    TagModel? tagModel;
    if (json['tags'] != null) {
      tagModel = TagModel.fromJson(json['tags']);
    }

    return PostModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      location: json['location'] as String,
      tagId: json['tag_id'] as String?,
      imageUrl: json['image_url'] as String?,
      likes: json['likes_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
      userDisplayName: json['user_display_name'] as String?,
      userPhotoUrl: json['user_photo_url'] as String?,
      tag: tagModel,
      commentsCount: json['comments_count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'location': location,
      'tag_id': tagId,
      'image_url': imageUrl,
      'likes': likes,
      'comments_count': commentsCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
