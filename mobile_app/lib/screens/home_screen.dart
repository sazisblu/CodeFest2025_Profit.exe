import 'package:flutter/material.dart';
import 'package:hamro_chautari/services/profile_service.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../models/post_model.dart';
import '../models/user_model.dart';
import '../services/post_service.dart';
import '../widgets/custom_app_bar.dart';
import 'create_post_screen.dart';
import '../models/comment_model.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PostService _postService = PostService();
  final ImagePicker _picker = ImagePicker();
  final AuthService _authService = AuthService();
  List<PostModel> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final posts = await _postService.getAllPosts();
      setState(() {
        _posts = posts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading posts: $e')));
      }
    }
  }

  Future<void> _pickAndUploadImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

      if (pickedFile != null) {
        final imageFile = File(pickedFile.path);

        // Navigate to CreatePostScreen with the selected image
        if (mounted) {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreatePostScreen(selectedImage: imageFile),
            ),
          );

          if (result == true) {
            _loadPosts(); // Refresh posts after creating a new one
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error picking image: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Community Issues'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Post creation section
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
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
                  child: Row(
                    children: [
                      // User profile image
                      FutureBuilder<UserModel?>(
                        future: _authService.getUserProfile(
                          _authService.currentUser?.id ?? '',
                        ),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return Container(
                              width: 45,
                              height: 45,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [Colors.orange, Colors.deepOrange],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            );
                          }
                          final user = snapshot.data;
                          if (user == null) {
                            return const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 24,
                            );
                          }
                          // Use a FutureBuilder to get the custom photo URL from ProfileService
                          return FutureBuilder<String?>(
                            future: ProfileService().getUserPhotoUrl(user.id),
                            builder: (context, photoSnapshot) {
                              String? photoUrl =
                                  photoSnapshot.data ?? user.photoUrl;
                              return Container(
                                width: 45,
                                height: 45,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: [Colors.orange, Colors.deepOrange],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                                child: (photoUrl != null && photoUrl.isNotEmpty)
                                    ? ClipOval(
                                        child: Image.network(
                                          photoUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) {
                                                return const Icon(
                                                  Icons.person,
                                                  color: Colors.white,
                                                  size: 24,
                                                );
                                              },
                                        ),
                                      )
                                    : const Icon(
                                        Icons.person,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                              );
                            },
                          );
                        },
                      ),
                      const SizedBox(width: 12),
                      // What's on your mind input
                      Expanded(
                        child: GestureDetector(
                          onTap: () async {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const CreatePostScreen(),
                              ),
                            );
                            if (result == true) {
                              _loadPosts();
                            }
                          },
                          child: Container(
                            height: 45,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF5F5F5),
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(
                                color: const Color(0xFFE0E0E0),
                                width: 1,
                              ),
                            ),
                            child: const Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "What's on your mind?",
                                style: TextStyle(
                                  color: Color(0xFF666666),
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Image upload icon
                      GestureDetector(
                        onTap: _pickAndUploadImage,
                        child: Container(
                          width: 45,
                          height: 45,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F0FF),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.image_rounded,
                            color: Color(0xFF2E4F99),
                            size: 24,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Posts list
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadPosts,
                    child: _posts.isEmpty
                        ? const Center(
                            child: Text('No issues yet. Create the first one!'),
                          )
                        : ListView.builder(
                            itemCount: _posts.length,
                            itemBuilder: (context, index) {
                              final post = _posts[index];
                              return PostCard(
                                post: post,
                                onLike: () {
                                  // No need to refresh all posts for a like
                                  // The PostCard handles its own state updates
                                },
                              );
                            },
                          ),
                  ),
                ),
              ],
            ),
    );
  }
}

class PostCard extends StatefulWidget {
  final PostModel post;
  final VoidCallback onLike;

  const PostCard({super.key, required this.post, required this.onLike});

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard>
    with SingleTickerProviderStateMixin {
  late int likeCount;
  late int commentCount;
  bool hasLiked = false;
  bool isProcessingLike = false;
  List<CommentModel> comments = [];
  bool loadingComments = false;
  bool showCommentInput = false;
  final _commentController = TextEditingController();
  final PostService _postService = PostService();
  final AuthService _authService = AuthService();

  // Animation related
  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;
  Animation<Color?>? _colorAnimation;
  Animation<double>? _iconAnimation;

  @override
  void initState() {
    super.initState();
    likeCount = widget.post.likes;
    commentCount = widget.post.commentsCount;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.elasticOut),
    );

    _colorAnimation =
        ColorTween(
          begin: Colors.transparent,
          end: const Color(0xFF2E4F99),
        ).animate(
          CurvedAnimation(
            parent: _animationController!,
            curve: Curves.easeInOut,
          ),
        );

    _iconAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.bounceOut),
    );

    _checkIfLiked();
    _fetchComments();
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

  Future<void> _fetchComments() async {
    if (mounted) {
      setState(() {
        loadingComments = true;
      });
    }
    comments = await _postService.getComments(widget.post.id);
    if (mounted) {
      setState(() {
        loadingComments = false;
      });
    }
  }

  Future<void> _handleLike() async {
    final user = _authService.currentUser;
    if (user == null || isProcessingLike) {
      return;
    }

    // Prevent double-taps with processing flag
    if (mounted) {
      setState(() {
        isProcessingLike = true;
      });
    }

    // Play animation immediately for better UX
    _animationController?.forward().then((_) {
      _animationController?.reverse();
    });

    try {
      // Toggle like in database and get new state
      final newLikeState = await _postService.toggleLike(
        widget.post.id,
        user.id,
      );
      // Update UI with new state
      if (mounted) {
        setState(() {
          hasLiked = newLikeState;
          // Update count based on the toggle
          if (newLikeState) {
            likeCount++;
          } else {
            likeCount = likeCount > 0 ? likeCount - 1 : 0;
          }
        });
      }

      // No need to refresh all posts, the UI is already updated optimistically
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating like: $e')));
      }
    } finally {
      // Always reset processing flag
      if (mounted) {
        setState(() {
          isProcessingLike = false;
        });
      }
    }
  }

  Future<void> _addComment() async {
    final user = _authService.currentUser;
    if (user == null || _commentController.text.trim().isEmpty) return;

    try {
      await _postService.addComment(
        postId: widget.post.id,
        userId: user.id,
        comment: _commentController.text.trim(),
      );

      _commentController.clear();
      await _fetchComments();

      if (mounted) {
        setState(() {
          commentCount++;
        });
      }

      // No need to refresh all posts for a comment
      // The comment count is already updated locally
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error adding comment: $e')));
      }
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    _animationController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                width: 50,
                height: 50,
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
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 28,
                            );
                          },
                        ),
                      )
                    : const Icon(Icons.person, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 12),
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
                                widget.post.userDisplayName ?? 'Anonymous User',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1a1a1a),
                            ),
                          ),
                          if (widget.post.location.isNotEmpty) ...[
                            const TextSpan(
                              text: ' is feeling angry in ',
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF666666),
                              ),
                            ),
                            TextSpan(
                              text: widget.post.location,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1a1a1a),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(widget.post.createdAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF999999),
                      ),
                    ),
                  ],
                ),
              ),
              // More options menu
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F0FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.more_horiz,
                  color: Color(0xFF2E4F99),
                  size: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Post title
          Text(
            widget.post.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1a1a1a),
            ),
          ),
          const SizedBox(height: 8),

          // Post description
          Text(
            widget.post.description,
            style: const TextStyle(
              fontSize: 15,
              color: Color(0xFF333333),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),

          // Post image display
          if (widget.post.imageUrl != null &&
              widget.post.imageUrl!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.network(
                  widget.post.imageUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: Colors.grey.shade200,
                      child: const Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
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
            const SizedBox(height: 16),
          ],

          // Likes count
          Text(
            '$likeCount likes',
            style: const TextStyle(fontSize: 13, color: Color(0xFF666666)),
          ),
          const SizedBox(height: 12),

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
                            onTap: isProcessingLike ? null : _handleLike,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 10,
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
                                        width: 1.5,
                                      ),
                                borderRadius: BorderRadius.circular(25),
                                boxShadow: hasLiked
                                    ? [
                                        BoxShadow(
                                          color: const Color(
                                            0xFF2E4F99,
                                          ).withValues(alpha: 0.3),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
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
                                    duration: const Duration(milliseconds: 200),
                                    child: Icon(
                                      hasLiked
                                          ? Icons.thumb_up
                                          : Icons.thumb_up_outlined,
                                      color: hasLiked
                                          ? Colors.white
                                          : const Color(0xFF2E4F99),
                                      size: 16,
                                    ),
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
                          ),
                        );
                      },
                    )
                  :
                    // Fallback like button without animation
                    GestureDetector(
                      onTap: isProcessingLike ? null : _handleLike,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
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
                                  width: 1.5,
                                ),
                          borderRadius: BorderRadius.circular(25),
                          boxShadow: hasLiked
                              ? [
                                  BoxShadow(
                                    color: const Color(
                                      0xFF2E4F99,
                                    ).withValues(alpha: 0.3),
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
                    ),
              const SizedBox(width: 12),
              // Comment button
                GestureDetector(
                  onTap: () {
                    setState(() {
                      showCommentInput = !showCommentInput;
                    });
                  },
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: showCommentInput
                          ? const Color(0xFF2E4F99)
                          : const Color(0xFFE8F0FF),
                      shape: BoxShape.circle,
                      boxShadow: showCommentInput
                          ? [
                              BoxShadow(
                                color: const Color(0xFF2E4F99).withOpacity(0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : [],
                    ),
                    child: Icon(
                      Icons.mode_comment_rounded,
                      color: showCommentInput
                          ? Colors.white
                          : const Color(0xFF2E4F99),
                      size: 20,
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              // Share button
              Container(
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
              const Spacer(),
              // Comments and shares count
              Text(
                '$commentCount comments',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Comments section
          if (loadingComments)
            const Center(child: CircularProgressIndicator())
          else ...[
            for (final comment in comments)
              Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Colors.green, Colors.teal],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: comment.userPhotoUrl != null
                          ? ClipOval(
                              child: Image.network(
                                comment.userPhotoUrl!,
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
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            comment.userDisplayName ?? 'User',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1a1a1a),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            comment.comment,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF333333),
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatDate(comment.createdAt),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF999999),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
          // Add comment input (only show when comment icon is clicked)
          if (showCommentInput) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: const InputDecoration(
                      hintText: 'Add a comment...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(32)),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F0FF),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: IconButton(
                    icon: const Icon(
                      Icons.send_rounded,
                      color: Color(0xFF2E4F99),
                      size: 22,
                    ),
                    onPressed: _addComment,
                    padding: const EdgeInsets.only(left: 2),
                    constraints: const BoxConstraints(),
                  ),
                ),
              ],
            ),
          ],
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
