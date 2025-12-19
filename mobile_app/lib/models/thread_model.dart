class ThreadModel {
  final String id;
  final String postId;
  final String userId;
  final String? parentThreadId; // null for top-level threads
  final String content;
  final String? imageUrl; // Image attached to the thread/comment
  final int likesCount;
  final int repliesCount;
  final DateTime createdAt;
  final String? userDisplayName;
  final String? userPhotoUrl;

  // For nested thread structure
  final List<ThreadModel> replies;

  ThreadModel({
    required this.id,
    required this.postId,
    required this.userId,
    this.parentThreadId,
    required this.content,
    this.imageUrl,
    this.likesCount = 0,
    this.repliesCount = 0,
    required this.createdAt,
    this.userDisplayName,
    this.userPhotoUrl,
    this.replies = const [],
  });

  factory ThreadModel.fromJson(Map<String, dynamic> json) {
    return ThreadModel(
      id: json['id'] as String,
      postId: json['post_id'] as String,
      userId: json['user_id'] as String,
      parentThreadId: json['parent_thread_id'] as String?,
      content: json['content'] as String,
      imageUrl: json['image_url'] as String?,
      likesCount: json['likes_count'] as int? ?? 0,
      repliesCount: json['replies_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      userDisplayName: json['user_display_name'] as String?,
      userPhotoUrl: json['user_photo_url'] as String?,
      replies: json['replies'] != null
          ? (json['replies'] as List)
                .map((r) => ThreadModel.fromJson(r))
                .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'post_id': postId,
      'user_id': userId,
      'parent_thread_id': parentThreadId,
      'content': content,
      'image_url': imageUrl,
      'likes_count': likesCount,
      'replies_count': repliesCount,
      'created_at': createdAt.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  ThreadModel copyWith({
    String? id,
    String? postId,
    String? userId,
    String? parentThreadId,
    String? content,
    String? imageUrl,
    int? likesCount,
    int? repliesCount,
    DateTime? createdAt,
    String? userDisplayName,
    String? userPhotoUrl,
    List<ThreadModel>? replies,
  }) {
    return ThreadModel(
      id: id ?? this.id,
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
      parentThreadId: parentThreadId ?? this.parentThreadId,
      content: content ?? this.content,
      imageUrl: imageUrl ?? this.imageUrl,
      likesCount: likesCount ?? this.likesCount,
      repliesCount: repliesCount ?? this.repliesCount,
      createdAt: createdAt ?? this.createdAt,
      userDisplayName: userDisplayName ?? this.userDisplayName,
      userPhotoUrl: userPhotoUrl ?? this.userPhotoUrl,
      replies: replies ?? this.replies,
    );
  }
}
