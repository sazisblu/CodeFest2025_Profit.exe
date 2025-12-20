import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../services/auth_service.dart';
import '../services/post_service.dart';
import '../services/tag_service.dart';
import '../services/ward_detection_service.dart';
import '../models/tag_model.dart';
import 'post_detail_screen.dart';

class CreatePostScreen extends StatefulWidget {
  final File? selectedImage;

  const CreatePostScreen({super.key, this.selectedImage});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();

  final PostService _postService = PostService();
  final AuthService _authService = AuthService();
  final TagService _tagService = TagService();
  final WardDetectionService _wardDetectionService = WardDetectionService();
  final ImagePicker _picker = ImagePicker();

  String? _selectedTagId;
  String? _selectedFeeling;
  bool _isLoading = false;
  bool _isLoadingTags = true;
  bool _isDetectingWard = false;
  File? _selectedImage;
  double? _latitude;
  double? _longitude;
  int? _wardNumber;

  List<TagModel> _availableTags = [];

  final List<Map<String, dynamic>> _feelings = [
    {
      'label': 'Happy',
      'icon': Icons.sentiment_satisfied_alt,
      'color': Colors.amber,
    },
    {
      'label': 'Sad',
      'icon': Icons.sentiment_dissatisfied,
      'color': Colors.blue,
    },
    {
      'label': 'Angry',
      'icon': Icons.sentiment_very_dissatisfied,
      'color': Colors.red,
    },
    {
      'label': 'Frustrated',
      'icon': Icons.sentiment_neutral,
      'color': Colors.orange,
    },
    {'label': 'Excited', 'icon': Icons.emoji_emotions, 'color': Colors.green},
    {'label': 'Other', 'icon': Icons.sentiment_satisfied, 'color': Colors.grey},
  ];

  @override
  void initState() {
    super.initState();
    _selectedImage = widget.selectedImage;
    _loadTags();
    _setCurrentLocation();
  }

  Future<void> _setCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    if (permission == LocationPermission.deniedForever) return;

    try {
      setState(() {
        _isDetectingWard = true;
      });

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Detect ward number
      final wardResult = await _wardDetectionService.findWardInBhaktapur(
        position.latitude,
        position.longitude,
      );

      print('Ward detection resul tmeow : $wardResult');

      if (wardResult['success'] == true) {
        _wardNumber = wardResult['ward']['number'];
        print('Ward detected: $_wardNumber (type: ${_wardNumber.runtimeType})');
      } else {
        print(
          'Ward detection failed: ${wardResult['message'] ?? wardResult['error']}',
        );
        _wardNumber = null;
      }

      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      if (placemarks.isNotEmpty) {
        String address =
            "${placemarks.first.street}, ${placemarks.first.locality}";
        setState(() {
          _locationController.text = address;
          _latitude = position.latitude;
          _longitude = position.longitude;
          _isDetectingWard = false;
        });
      }
    } catch (e) {
      setState(() {
        _isDetectingWard = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error detecting location: $e')));
      }
    }
  }

  Future<void> _loadTags() async {
    setState(() {
      _isLoadingTags = true;
    });

    try {
      final tags = await _tagService.getAllTags();
      setState(() {
        _availableTags = tags;
        _isLoadingTags = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingTags = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading tags: $e')));
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error picking image: $e')));
      }
    }
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
    });
  }

  Future<void> _submitPost() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedTagId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a category tag')),
      );
      return;
    }

    final user = _authService.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You must be logged in to create a post')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      print('Creating post with ward number: $_wardNumber');
      final result = await _postService.createPost(
        userId: user.id,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        location: _locationController.text.trim(),
        tagId: _selectedTagId!,
        imageFile: _selectedImage,
        latitude: _latitude,
        longitude: _longitude,
        wardNumber: _wardNumber,
      );

      if (mounted) {
        // Check if it was created as a thread or a post
        final type = result['type'];
        final message = result['message'];

        if (type == 'thread') {
          // Thread was created - navigate to parent post
          final parentPostId = result['data']['parent_post_id'];
          final parentPostTitle = result['data']['parent_post_title'];
          final similarity = result['data']['similarity'];

          print('✨ Thread created for parent post: $parentPostId');
          print('📊 Response data: ${result['data']}');
          print('🔑 parentPostId type: ${parentPostId.runtimeType}, value: "$parentPostId"');

          // Capture the navigator before popping
          final navigator = Navigator.of(context);
          final scaffoldMessenger = ScaffoldMessenger.of(context);
          
          // Pop to go back to home screen with refresh
          navigator.pop(true);

          // Show snackbar after navigation
          // Use WidgetsBinding to ensure the pop animation completes
          WidgetsBinding.instance.addPostFrameCallback((_) {
            scaffoldMessenger.showSnackBar(
              SnackBar(
                content: Text(
                  '✨ Similar post found (${(similarity * 100).toStringAsFixed(0)}% match)!\nAdded as comment to: "$parentPostTitle"',
                ),
                backgroundColor: Colors.orange,
                duration: const Duration(seconds: 5),
                action: SnackBarAction(
                  label: 'View',
                  textColor: Colors.white,
                  onPressed: () async {
                    // Navigate to the parent post detail
                    try {
                      print('🔍 Fetching parent post: $parentPostId');
                      final parentPost = await _postService.getPost(
                        parentPostId,
                      );
                      print('📦 parentPost result: ${parentPost != null ? "Found" : "Null"}');
                      if (parentPost != null) {
                        print('✅ Navigating to parent post detail');
                        navigator.push(
                          MaterialPageRoute(
                            builder: (context) =>
                                PostDetailScreen(post: parentPost),
                          ),
                        );
                      } else {
                        print('❌ Parent post not found');
                        scaffoldMessenger.showSnackBar(
                          const SnackBar(content: Text('Could not find parent post')),
                        );
                      }
                    } catch (e) {
                      print('❌ Error navigating to parent post: $e');
                      scaffoldMessenger.showSnackBar(
                        SnackBar(content: Text('Error loading post: $e')),
                      );
                    }
                  },
                ),
              ),
            );
          });
        } else {
          // New post was created
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('✅ $message'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 3),
            ),
          );
          Navigator.of(context).pop(true);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error creating Post: $e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        title: const Text(
          'Create Post',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Progress indicator (optional)
            Container(
              margin: const EdgeInsets.only(bottom: 32),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: _calculateProgress(),
                        child: Container(
                          decoration: BoxDecoration(
                            color: colorScheme.primary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${(_calculateProgress() * 100).round()}%',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),

            // Title Section
            _buildSectionCard(
              title: 'Title',
              icon: Icons.title,
              child: TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: 'What do you want to post?',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: colorScheme.primary,
                      width: 2,
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.all(16),
                  counterStyle: TextStyle(color: Colors.grey.shade600),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
                maxLength: 100,
                onChanged: (value) => setState(() {}),
              ),
            ),
            const SizedBox(height: 24),

            // Image Upload Section
            _buildSectionCard(
              title: 'Upload an Image',
              icon: Icons.camera_alt,
              child: _buildImageUploadSection(colorScheme),
            ),
            const SizedBox(height: 24),

            // Description Section
            _buildSectionCard(
              title: 'Description',
              icon: Icons.description,
              child: TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  hintText: 'Describe your Post in detail...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: colorScheme.primary,
                      width: 2,
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.all(16),
                  counterStyle: TextStyle(color: Colors.grey.shade600),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
                maxLines: 5,
                maxLength: 500,
                onChanged: (value) => setState(() {}),
              ),
            ),
            const SizedBox(height: 24),

            // Location Section
            _buildSectionCard(
              title: 'Location',
              icon: Icons.location_on,
              child: TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  hintText: 'Where is this located?',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: colorScheme.primary,
                      width: 2,
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.all(16),
                  prefixIcon: const Icon(Icons.location_on_outlined),
                  counterStyle: TextStyle(color: Colors.grey.shade600),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a location';
                  }
                  return null;
                },
                maxLength: 100,
                onChanged: (value) => setState(() {}),
              ),
            ),
            const SizedBox(height: 24),

            // Feeling Section
            _buildSectionCard(
              title: 'How are you feeling?',
              icon: Icons.emoji_emotions,
              child: _buildFeelingSelection(colorScheme),
            ),
            const SizedBox(height: 24),

            // Category Section
            _buildSectionCard(
              title: 'Category',
              icon: Icons.category,
              child: _buildCategorySelection(colorScheme),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submitPost,
              style: ElevatedButton.styleFrom(
                backgroundColor: colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
                shadowColor: colorScheme.primary.withOpacity(0.3),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Create Post',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  double _calculateProgress() {
    int filledFields = 0;
    if (_titleController.text.trim().isNotEmpty) filledFields++;
    if (_descriptionController.text.trim().isNotEmpty) filledFields++;
    if (_locationController.text.trim().isNotEmpty) filledFields++;
    if (_selectedTagId != null) filledFields++;
    return filledFields / 4;
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: Theme.of(context).colorScheme.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildImageUploadSection(ColorScheme colorScheme) {
    return Column(
      children: [
        if (_selectedImage != null) ...[
          // Image preview
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(
                    _selectedImage!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                  ),
                ),
                // Remove image button
                Positioned(
                  top: 12,
                  right: 12,
                  child: GestureDetector(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      _removeImage();
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.close,
                        color: Colors.red,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Change image button
          OutlinedButton.icon(
            onPressed: () {
              HapticFeedback.lightImpact();
              _pickImage();
            },
            icon: const Icon(Icons.image_outlined),
            label: const Text('Change Image'),
            style: OutlinedButton.styleFrom(
              foregroundColor: colorScheme.primary,
              side: BorderSide(color: colorScheme.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ] else ...[
          // Image picker button
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              _pickImage();
            },
            child: Container(
              width: double.infinity,
              height: 160,
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: colorScheme.primary.withOpacity(0.3),
                  width: 2,
                  style: BorderStyle.solid,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colorScheme.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.add_photo_alternate_outlined,
                      size: 32,
                      color: colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Add Photo',
                    style: TextStyle(
                      color: colorScheme.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Visual evidence helps strengthen your Post',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildFeelingSelection(ColorScheme colorScheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _feelings.map((feeling) {
            final isSelected = _selectedFeeling == feeling['label'];
            return ChoiceChip(
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    feeling['icon'],
                    color: isSelected
                        ? Colors.white
                        : (feeling['color'] as Color).withOpacity(0.8),
                    size: 20,
                  ),
                  const SizedBox(width: 6),
                  Text(feeling['label']),
                ],
              ),
              selected: isSelected,
              selectedColor: colorScheme.primary,
              backgroundColor: Colors.grey.shade100,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade800,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected
                      ? colorScheme.primary
                      : Colors.grey.shade300,
                  width: isSelected ? 2 : 1,
                ),
              ),
              onSelected: (selected) {
                HapticFeedback.selectionClick();
                setState(() {
                  _selectedFeeling = selected ? feeling['label'] : null;
                });
              },
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            );
          }).toList(),
        ),
        if (_selectedFeeling == null) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.orange.shade600),
              const SizedBox(width: 8),
              Text(
                'Let us know how you feel!',
                style: TextStyle(color: Colors.orange.shade600, fontSize: 12),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildCategorySelection(ColorScheme colorScheme) {
    if (_isLoadingTags) {
      return Container(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Column(
            children: [
              CircularProgressIndicator(color: colorScheme.primary),
              const SizedBox(height: 16),
              Text(
                'Loading categories...',
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Chip-based selection
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _availableTags.map<Widget>((tag) {
            final isSelected = _selectedTagId == tag.id;
            return FilterChip(
              label: Text(tag.name),
              selected: isSelected,
              onSelected: (selected) {
                HapticFeedback.selectionClick();
                setState(() {
                  _selectedTagId = selected ? tag.id : null;
                });
              },
              backgroundColor: Colors.white,
              selectedColor: colorScheme.primaryContainer,
              checkmarkColor: colorScheme.primary,
              labelStyle: TextStyle(
                color: isSelected ? colorScheme.primary : Colors.grey.shade700,
                fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected
                      ? colorScheme.primary
                      : Colors.grey.shade300,
                  width: isSelected ? 2 : 1,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            );
          }).toList(),
        ),
        if (_selectedTagId == null) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.orange.shade600),
              const SizedBox(width: 8),
              Text(
                'Please select a category',
                style: TextStyle(color: Colors.orange.shade600, fontSize: 12),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
