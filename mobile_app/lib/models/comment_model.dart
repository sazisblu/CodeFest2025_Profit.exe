class CommentModel {
  final String id;
  final String postId;
  final String userId;
  final String comment;
  final DateTime createdAt;
  final String? userDisplayName;
  final String? userPhotoUrl;

  CommentModel({
    required this.id,
    required this.postId,
    required this.userId,
    required this.comment,
    required this.createdAt,
    this.userDisplayName,
    this.userPhotoUrl,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] as String,
      postId: json['post_id'] as String,
      userId: json['user_id'] as String,
      comment: json['comment'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      userDisplayName: json['user_display_name'] as String?,
      userPhotoUrl: json['user_photo_url'] as String?,
    );
  }
}
