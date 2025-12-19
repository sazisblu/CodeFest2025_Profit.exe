import 'package:flutter/material.dart';

class MunicipalPost {
  final String organizationName;
  final String profileImageUrl;
  final String postTime;
  final String title;
  final String content;
  final List<String> bulletPoints;
  final String imageUrl;
  final bool isVerified;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;

  MunicipalPost({
    required this.organizationName,
    required this.profileImageUrl,
    required this.postTime,
    required this.title,
    required this.content,
    required this.bulletPoints,
    required this.imageUrl,
    this.isVerified = false,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.sharesCount = 0,
  });
}

class MunicipalPostCard extends StatefulWidget {
  final MunicipalPost post;
  final VoidCallback? onTap;

  const MunicipalPostCard({
    super.key,
    required this.post,
    this.onTap,
  });

  @override
  State<MunicipalPostCard> createState() => _MunicipalPostCardState();
}

class _MunicipalPostCardState extends State<MunicipalPostCard>
    with SingleTickerProviderStateMixin {
  bool hasLiked = false;
  late int likeCount;
  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;

  @override
  void initState() {
    super.initState();
    likeCount = widget.post.likesCount;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _animationController?.dispose();
    super.dispose();
  }

  void _handleLike() {
    setState(() {
      if (hasLiked) {
        hasLiked = false;
        likeCount--;
      } else {
        hasLiked = true;
        likeCount++;
        _animationController?.forward().then((_) {
          _animationController?.reverse();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 1,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header section
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                // Profile picture with verification
                Stack(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.grey.shade300, width: 2),
                      ),
                      child: ClipOval(
                        child: Image.network(
                          widget.post.profileImageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: const Color(0xFF1877F2),
                              child: const Icon(
                                Icons.account_balance,
                                color: Colors.white,
                                size: 25,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    if (widget.post.isVerified)
                      Positioned(
                        bottom: -2,
                        right: -2,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1877F2),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 12,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                // Organization info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            widget.post.organizationName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1a1a1a),
                            ),
                          ),
                          if (widget.post.isVerified) ...[
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.verified,
                              color: Color(0xFF1877F2),
                              size: 16,
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.post.postTime,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF65676b),
                        ),
                      ),
                    ],
                  ),
                ),
                // More options button
                Container(
                  padding: const EdgeInsets.all(8),
                  child: Icon(
                    Icons.more_horiz,
                    color: Colors.grey.shade600,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),

          // Post content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Post title
                Text(
                  widget.post.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1a1a1a),
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),

                // Main content
                Text(
                  widget.post.content,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Color(0xFF050505),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),

                // Bullet points
                ...widget.post.bulletPoints.map(
                  (point) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '• ',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF050505),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            point,
                            style: const TextStyle(
                              fontSize: 15,
                              color: Color(0xFF050505),
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Additional content footer
                Text(
                  'We are committed to keeping all citizens informed — please continue to provide feedback or report any new issues during the repair process.',
                  style: const TextStyle(
                    fontSize: 15,
                    color: Color(0xFF050505),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Post image
          Container(
            width: double.infinity,
            height: 300,
            margin: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.grey.shade200,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.post.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey.shade300,
                    child: const Center(
                      child: Icon(
                        Icons.image_not_supported,
                        size: 40,
                        color: Colors.grey,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Action buttons row (same as regular posts)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                // Like button with animation
                GestureDetector(
                  onTap: _handleLike,
                  child: AnimatedBuilder(
                    animation: _scaleAnimation!,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: hasLiked
                            ? const Color(0xFF2E4F99)
                            : Colors.transparent,
                        border: hasLiked
                            ? null
                            : Border.all(
                                color: const Color(0xFF2E4F99),
                                width: 1.5,
                              ),
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: hasLiked
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF2E4F99).withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            hasLiked
                                ? Icons.thumb_up
                                : Icons.thumb_up_outlined,
                            color: hasLiked
                                ? Colors.white
                                : const Color(0xFF2E4F99),
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 300),
                            style: TextStyle(
                              color: hasLiked
                                  ? Colors.white
                                  : const Color(0xFF2E4F99),
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                            child: Text(hasLiked ? 'Liked' : 'Like'),
                          ),
                        ],
                      ),
                    ),
                    builder: (context, child) {
                      return Transform.scale(
                        scale: hasLiked ? _scaleAnimation!.value : 1.0,
                        child: child,
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                // Comment button
                GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F0FF),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.mode_comment_rounded,
                      color: Color(0xFF2E4F99),
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Share button
                GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Share functionality coming soon!'),
                      ),
                    );
                  },
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F0FF),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.send_rounded,
                      color: Color(0xFF2E4F99),
                      size: 20,
                    ),
                  ),
                ),
                const Spacer(),
                // Comments and Thread indicator
                GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F0FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${widget.post.commentsCount} replies',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF2E4F99),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.arrow_forward_ios,
                          size: 10,
                          color: Color(0xFF2E4F99),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}