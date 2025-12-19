class UserStats {
  final int postsCreated;
  final int totalLikes;
  final int impactScore;

  UserStats({
    required this.postsCreated,
    required this.totalLikes,
    required this.impactScore,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      postsCreated: json['posts_created'] ?? 0,
      totalLikes: json['total_likes'] ?? 0,
      impactScore: json['impact_score'] ?? 0,
    );
  }

  // Impact score calculation: posts * 2 + likes * 1
  static int calculateImpactScore(int posts, int likes) {
    return (posts * 2) + likes;
  }
}
