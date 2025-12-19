import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../models/thread_model.dart';
import '../services/post_service.dart';
import '../services/auth_service.dart';
import '../services/profile_service.dart';
import '../models/user_model.dart';

class PostDetailScreen extends StatefulWidget {
  final PostModel post;

  const PostDetailScreen({super.key, required this.post});

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen>
    with SingleTickerProviderStateMixin {
  final PostService _postService = PostService();
  final AuthService _authService = AuthService();
  final TextEditingController _replyController = TextEditingController();

  List<ThreadModel> threads = [];
  bool loadingThreads = false;
  late int likeCount;
  late int threadCount;
  bool hasLiked = false;
  bool isProcessingLike = false;

  // Animation related
  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;
  Animation<double>? _iconAnimation;

  @override
  void initState() {
    super.initState();
    likeCount = widget.post.likes;
    threadCount = widget.post.threadsCount;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.elasticOut),
    );

    _iconAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.bounceOut),
    );

    _checkIfLiked();
    _fetchThreads();
  }

  Future<void> _checkIfLiked() async {
    final user = _authService.currentUser;
    if (user != null && !isProcessingLike) {
      hasLiked = await _postService.hasUserLiked(widget.post.id, user.id);
      if (mounted && !isProcessingLike) {
        setState(() {});
      }
    }
  }

  Future<void> _fetchThreads() async {
    if (mounted) {
      setState(() {
        loadingThreads = true;
      });
    }
    threads = await _postService.getThreads(widget.post.id);
    if (mounted) {
      setState(() {
        loadingThreads = false;
      });
    }
  }

  Future<void> _handleLike() async {
    final user = _authService.currentUser;
    if (user == null || isProcessingLike) {
      return;
    }

    if (mounted) {
      setState(() {
        isProcessingLike = true;
      });
    }

    _animationController?.forward().then((_) {
      _animationController?.reverse();
    });

    try {
      final newLikeState = await _postService.toggleLike(
        widget.post.id,
        user.id,
      );

      if (mounted) {
        setState(() {
          hasLiked = newLikeState;
          if (newLikeState) {
            likeCount++;
          } else {
            likeCount = likeCount > 0 ? likeCount - 1 : 0;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating like: $e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          isProcessingLike = false;
        });
      }
    }
  }

  Future<void> _addReply() async {
    final user = _authService.currentUser;
    if (user == null || _replyController.text.trim().isEmpty) return;

    try {
      await _postService.addThread(
        postId: widget.post.id,
        userId: user.id,
        content: _replyController.text.trim(),
      );

      _replyController.clear();
      await _fetchThreads();

      if (mounted) {
        setState(() {
          threadCount++;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error adding reply: $e')));
      }
    }
  }

  @override
  void dispose() {
    _replyController.dispose();
    _animationController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1a1a1a)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Thread',
          style: TextStyle(
            color: Color(0xFF1a1a1a),
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Main thread (original post)
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Main Post Thread
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // User header section
                        Row(
                          children: [
                            // Profile avatar
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [Colors.orange, Colors.deepOrange],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: widget.post.userPhotoUrl != null
                                  ? ClipOval(
                                      child: Image.network(
                                        widget.post.userPhotoUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return const Icon(
                                                Icons.person,
                                                color: Colors.white,
                                                size: 32,
                                              );
                                            },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      color: Colors.white,
                                      size: 32,
                                    ),
                            ),
                            const SizedBox(width: 16),
                            // User info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  RichText(
                                    text: TextSpan(
                                      children: [
                                        TextSpan(
                                          text:
                                              widget.post.userDisplayName ??
                                              'Anonymous User',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1a1a1a),
                                          ),
                                        ),
                                        if (widget
                                            .post
                                            .location
                                            .isNotEmpty) ...[
                                          const TextSpan(
                                            text: ' is feeling angry in ',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: Color(0xFF666666),
                                            ),
                                          ),
                                          TextSpan(
                                            text: widget.post.location,
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              color: Color(0xFF1a1a1a),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatDate(widget.post.createdAt),
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Color(0xFF999999),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Post title
                        Text(
                          widget.post.title,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1a1a1a),
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Post description
                        Text(
                          widget.post.description,
                          style: const TextStyle(
                            fontSize: 17,
                            color: Color(0xFF333333),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Post image display
                        if (widget.post.imageUrl != null &&
                            widget.post.imageUrl!.isNotEmpty) ...[
                          Container(
                            width: double.infinity,
                            constraints: const BoxConstraints(maxHeight: 300),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(15),
                              child: Image.network(
                                widget.post.imageUrl!,
                                fit: BoxFit.cover,
                                loadingBuilder:
                                    (context, child, loadingProgress) {
                                      if (loadingProgress == null) return child;
                                      return Container(
                                        height: 200,
                                        color: Colors.grey.shade200,
                                        child: const Center(
                                          child: CircularProgressIndicator(),
                                        ),
                                      );
                                    },
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    height: 200,
                                    color: Colors.grey.shade200,
                                    child: Icon(
                                      Icons.broken_image,
                                      size: 60,
                                      color: Colors.grey.shade400,
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // Main thread analytics
                        Row(
                          children: [
                            Text(
                              '$likeCount likes',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF666666),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 20),
                            Text(
                              '$threadCount replies',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF666666),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Action buttons row
                        Row(
                          children: [
                            // Animated Like button
                            _animationController != null
                                ? AnimatedBuilder(
                                    animation: _animationController!,
                                    builder: (context, child) {
                                      return Transform.scale(
                                        scale: _scaleAnimation?.value ?? 1.0,
                                        child: GestureDetector(
                                          onTap: isProcessingLike
                                              ? null
                                              : _handleLike,
                                          child: AnimatedContainer(
                                            duration: const Duration(
                                              milliseconds: 300,
                                            ),
                                            curve: Curves.easeInOut,
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 20,
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              color: isProcessingLike
                                                  ? Colors.grey.shade300
                                                  : hasLiked
                                                  ? const Color(0xFF2E4F99)
                                                  : Colors.transparent,
                                              border:
                                                  hasLiked || isProcessingLike
                                                  ? null
                                                  : Border.all(
                                                      color: const Color(
                                                        0xFF2E4F99,
                                                      ),
                                                      width: 1.5,
                                                    ),
                                              borderRadius:
                                                  BorderRadius.circular(25),
                                              boxShadow: hasLiked
                                                  ? [
                                                      BoxShadow(
                                                        color:
                                                            const Color(
                                                              0xFF2E4F99,
                                                            ).withValues(
                                                              alpha: 0.3,
                                                            ),
                                                        blurRadius: 8,
                                                        offset: const Offset(
                                                          0,
                                                          2,
                                                        ),
                                                      ),
                                                    ]
                                                  : null,
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                AnimatedScale(
                                                  scale: hasLiked
                                                      ? (_iconAnimation
                                                                ?.value ??
                                                            1.0)
                                                      : 1.0,
                                                  duration: const Duration(
                                                    milliseconds: 200,
                                                  ),
                                                  child: Icon(
                                                    hasLiked
                                                        ? Icons.thumb_up
                                                        : Icons
                                                              .thumb_up_outlined,
                                                    color: hasLiked
                                                        ? Colors.white
                                                        : const Color(
                                                            0xFF2E4F99,
                                                          ),
                                                    size: 18,
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                AnimatedDefaultTextStyle(
                                                  duration: const Duration(
                                                    milliseconds: 300,
                                                  ),
                                                  style: TextStyle(
                                                    color: hasLiked
                                                        ? Colors.white
                                                        : const Color(
                                                            0xFF2E4F99,
                                                          ),
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                  child: Text(
                                                    hasLiked ? 'Liked' : 'Like',
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  )
                                : Container(),
                            const SizedBox(width: 16),
                            // Share button
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F0FF),
                                borderRadius: BorderRadius.circular(25),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.send_rounded,
                                    color: Color(0xFF2E4F99),
                                    size: 18,
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Share',
                                    style: TextStyle(
                                      color: Color(0xFF2E4F99),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Divider
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    height: 1,
                    color: Colors.grey.shade200,
                  ),

                  // Sub-threads (Comments/Replies)
                  if (loadingThreads)
                    const Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (threads.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        children: [
                          Icon(
                            Icons.chat_bubble_outline,
                            size: 48,
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'No replies yet',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.grey.shade600,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Be the first to reply to this thread',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: threads.length,
                      itemBuilder: (context, index) {
                        final thread = threads[index];
                        return SubThreadCard(thread: thread);
                      },
                    ),
                ],
              ),
            ),
          ),

          // Reply input at bottom
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // User avatar in reply section
                  FutureBuilder<UserModel?>(
                    future: _authService.getUserProfile(
                      _authService.currentUser?.id ?? '',
                    ),
                    builder: (context, snapshot) {
                      final user = snapshot.data;
                      String? photoUrl;
                      if (user != null) {
                        return FutureBuilder<String?>(
                          future: ProfileService().getUserPhotoUrl(user.id),
                          builder: (context, photoSnapshot) {
                            photoUrl = photoSnapshot.data ?? user.photoUrl;
                            return Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [Colors.orange, Colors.deepOrange],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: (photoUrl != null && photoUrl!.isNotEmpty)
                                  ? ClipOval(
                                      child: Image.network(
                                        photoUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return const Icon(
                                                Icons.person,
                                                color: Colors.white,
                                                size: 20,
                                              );
                                            },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                            );
                          },
                        );
                      }
                      return Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [Colors.orange, Colors.deepOrange],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: const Icon(
                          Icons.person,
                          color: Colors.white,
                          size: 20,
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 12),
                  // Reply input field
                  Expanded(
                    child: TextField(
                      controller: _replyController,
                      decoration: const InputDecoration(
                        hintText: 'Reply to this thread...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(25)),
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Send button
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2E4F99),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                      onPressed: _addReply,
                      padding: const EdgeInsets.only(left: 2),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

class SubThreadCard extends StatefulWidget {
  final ThreadModel thread;

  const SubThreadCard({super.key, required this.thread});

  @override
  State<SubThreadCard> createState() => _SubThreadCardState();
}

class _SubThreadCardState extends State<SubThreadCard>
    with SingleTickerProviderStateMixin {
  final AuthService _authService = AuthService();
  bool hasLiked = false;
  bool isProcessingLike = false;
  int likeCount = 0;

  // Animation related
  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;
  Animation<double>? _iconAnimation;

  @override
  void initState() {
    super.initState();
    likeCount = widget.thread.likesCount;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.elasticOut),
    );

    _iconAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.bounceOut),
    );

    // _checkIfLiked(); // Would need to implement comment like checking
  }

  Future<void> _handleLike() async {
    final user = _authService.currentUser;
    if (user == null || isProcessingLike) {
      return;
    }

    if (mounted) {
      setState(() {
        isProcessingLike = true;
      });
    }

    _animationController?.forward().then((_) {
      _animationController?.reverse();
    });

    try {
      // For now, just toggle locally since we don't have comment likes in backend
      // In a real implementation, you'd call _postService.toggleCommentLike()
      if (mounted) {
        setState(() {
          hasLiked = !hasLiked;
          if (hasLiked) {
            likeCount++;
          } else {
            likeCount = likeCount > 0 ? likeCount - 1 : 0;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating like: $e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          isProcessingLike = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _animationController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thread connector line
          Container(
            width: 3,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFF2E4F99).withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(1.5),
            ),
            margin: const EdgeInsets.only(left: 30, right: 12),
          ),
          // Sub-thread content
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
                border: Border.all(
                  color: const Color(0xFF2E4F99).withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User info row - improved to match parent thread style
                  Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [Colors.green, Colors.teal],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: widget.thread.userPhotoUrl != null
                            ? ClipOval(
                                child: Image.network(
                                  widget.thread.userPhotoUrl!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(
                                      Icons.person,
                                      color: Colors.white,
                                      size: 20,
                                    );
                                  },
                                ),
                              )
                            : const Icon(
                                Icons.person,
                                color: Colors.white,
                                size: 20,
                              ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.thread.userDisplayName ?? 'User',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1a1a1a),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _formatDate(widget.thread.createdAt),
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF999999),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // More options menu like parent thread
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F0FF),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.more_horiz,
                          color: Color(0xFF2E4F99),
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Thread content
                  Text(
                    widget.thread.content,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Color(0xFF333333),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Like count display
                  if (likeCount > 0) ...[
                    Text(
                      '$likeCount likes',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF666666),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                  // Sub-thread actions - improved like button, removed reply
                  Row(
                    children: [
                      // Animated Like button
                      _animationController != null
                          ? AnimatedBuilder(
                              animation: _animationController!,
                              builder: (context, child) {
                                return Transform.scale(
                                  scale: _scaleAnimation?.value ?? 1.0,
                                  child: GestureDetector(
                                    onTap: isProcessingLike
                                        ? null
                                        : _handleLike,
                                    child: AnimatedContainer(
                                      duration: const Duration(
                                        milliseconds: 250,
                                      ),
                                      curve: Curves.easeInOut,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isProcessingLike
                                            ? Colors.grey.shade300
                                            : hasLiked
                                            ? const Color(0xFF2E4F99)
                                            : Colors.transparent,
                                        border: hasLiked || isProcessingLike
                                            ? null
                                            : Border.all(
                                                color: const Color(0xFF2E4F99),
                                                width: 1,
                                              ),
                                        borderRadius: BorderRadius.circular(20),
                                        boxShadow: hasLiked
                                            ? [
                                                BoxShadow(
                                                  color: const Color(
                                                    0xFF2E4F99,
                                                  ).withValues(alpha: 0.2),
                                                  blurRadius: 6,
                                                  offset: const Offset(0, 1),
                                                ),
                                              ]
                                            : null,
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          AnimatedScale(
                                            scale: hasLiked
                                                ? (_iconAnimation?.value ?? 1.0)
                                                : 1.0,
                                            duration: const Duration(
                                              milliseconds: 200,
                                            ),
                                            child: Icon(
                                              hasLiked
                                                  ? Icons.thumb_up
                                                  : Icons.thumb_up_outlined,
                                              color: hasLiked
                                                  ? Colors.white
                                                  : const Color(0xFF2E4F99),
                                              size: 14,
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          AnimatedDefaultTextStyle(
                                            duration: const Duration(
                                              milliseconds: 250,
                                            ),
                                            style: TextStyle(
                                              color: hasLiked
                                                  ? Colors.white
                                                  : const Color(0xFF2E4F99),
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                            ),
                                            child: Text(
                                              hasLiked ? 'Liked' : 'Like',
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            )
                          : Container(),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
