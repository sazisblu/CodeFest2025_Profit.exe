import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:async';
import '../services/ward_detection_service.dart';

class LocationPickerScreen extends StatefulWidget {
  final double? initialLatitude;
  final double? initialLongitude;

  const LocationPickerScreen({
    super.key,
    this.initialLatitude,
    this.initialLongitude,
  });

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  final WardDetectionService _wardDetectionService = WardDetectionService();
  LatLng? _selectedPosition;
  String _selectedAddress = 'Tap on map to select location';
  bool _isLoading = false;
  bool _isSearching = false;
  bool _isDetectingWard = false;
  List<Location> _searchSuggestions = [];
  bool _showSuggestions = false;
  Timer? _debounce;
  LatLng _initialPosition = const LatLng(27.6710, 85.4298); // Fallback to Bhaktapur
  int? _wardNumber;

  @override
  void initState() {
    super.initState();
    if (widget.initialLatitude != null && widget.initialLongitude != null) {
      _selectedPosition = LatLng(widget.initialLatitude!, widget.initialLongitude!);
      _initialPosition = _selectedPosition!;
      _getAddressFromLatLng(_selectedPosition!);
    } else {
      // Get user's current location as initial position
      _getUserLocationForMap();
    }
    
    // Listen to search text changes
    _searchController.addListener(_onSearchChanged);
    
    // Hide suggestions when focus is lost
    _searchFocusNode.addListener(() {
      if (!_searchFocusNode.hasFocus) {
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) {
            setState(() {
              _showSuggestions = false;
            });
          }
        });
      }
    });
  }

  Future<void> _getUserLocationForMap() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      if (permission == LocationPermission.deniedForever) return;

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      if (mounted) {
        setState(() {
          _initialPosition = LatLng(position.latitude, position.longitude);
        });
        
        // Move map to user's location
        _mapController.move(_initialPosition, 15.0);
      }
    } catch (e) {
      // Silently fail and keep Bhaktapur as default
      print('Error getting user location for map: $e');
    }
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    final query = _searchController.text.trim();
    
    if (query.isEmpty) {
      setState(() {
        _searchSuggestions = [];
        _showSuggestions = false;
      });
      return;
    }
    
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _searchLocationSuggestions(query);
    });
  }

  Future<void> _getAddressFromLatLng(LatLng position) async {
    setState(() {
      _isLoading = true;
    });

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      if (placemarks.isNotEmpty) {
        String address = "${placemarks.first.street}, ${placemarks.first.locality}";
        setState(() {
          _selectedAddress = address;
        });
      }
    } catch (e) {
      setState(() {
        _selectedAddress = 'Unable to get address';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onMapTapped(LatLng position) {
    setState(() {
      _selectedPosition = position;
    });
    _getAddressFromLatLng(position);
    _detectWard(position);
  }

  Future<void> _detectWard(LatLng position) async {
    setState(() {
      _isDetectingWard = true;
    });

    try {
      final wardResult = await _wardDetectionService.findWardInBhaktapur(
        position.latitude,
        position.longitude,
      );

      print('Ward detection result: $wardResult');

      if (wardResult['success'] == true) {
        setState(() {
          _wardNumber = wardResult['ward']['number'];
        });
        print('Ward detected: $_wardNumber');
      } else {
        setState(() {
          _wardNumber = null;
        });
        print('Ward detection failed: ${wardResult['message'] ?? wardResult['error']}');
      }
    } catch (e) {
      print('Error detecting ward: $e');
      setState(() {
        _wardNumber = null;
      });
    } finally {
      setState(() {
        _isDetectingWard = false;
      });
    }
  }

  void _confirmLocation() {
    if (_selectedPosition != null) {
      Navigator.pop(context, {
        'latitude': _selectedPosition!.latitude,
        'longitude': _selectedPosition!.longitude,
        'address': _selectedAddress,
        'wardNumber': _wardNumber,
      });
    }
  }

  Future<void> _goToCurrentLocation() async {
    setState(() {
      _isLoading = true;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied');
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      LatLng currentLocation = LatLng(position.latitude, position.longitude);
      
      setState(() {
        _selectedPosition = currentLocation;
      });

      _mapController.move(currentLocation, 15.0);

      await _getAddressFromLatLng(currentLocation);
      await _detectWard(currentLocation);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error getting current location: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _searchLocationSuggestions(String query) async {
    if (query.trim().isEmpty) return;

    setState(() {
      _isSearching = true;
    });

    try {
      // Add "Nepal" to the search query for better local results
      final searchQuery = query.contains('Nepal') ? query : '$query, Nepal';
      List<Location> locations = await locationFromAddress(searchQuery);
      
      if (mounted) {
        setState(() {
          _searchSuggestions = locations.take(5).toList();
          _showSuggestions = locations.isNotEmpty;
        });
      }
    } catch (e) {
      // If search fails, try without "Nepal"
      try {
        List<Location> locations = await locationFromAddress(query);
        if (mounted) {
          setState(() {
            _searchSuggestions = locations.take(5).toList();
            _showSuggestions = locations.isNotEmpty;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _searchSuggestions = [];
            _showSuggestions = false;
          });
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  Future<void> _selectLocationFromSuggestion(Location location) async {
    LatLng searchedPosition = LatLng(location.latitude, location.longitude);
    
    setState(() {
      _selectedPosition = searchedPosition;
      _showSuggestions = false;
    });

    _mapController.move(searchedPosition, 15.0);
    
    await _getAddressFromLatLng(searchedPosition);
    await _detectWard(searchedPosition);

    // Update search text with found address
    if (_selectedAddress != 'Unable to get address') {
      _searchController.text = _selectedAddress;
    }

    // Hide keyboard
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pick Location'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _initialPosition,
              initialZoom: 15.0,
              onTap: (tapPosition, point) => _onMapTapped(point),
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.hamrochautari.app',
                maxZoom: 19,
              ),
              if (_selectedPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _selectedPosition!,
                      width: 50,
                      height: 50,
                      child: GestureDetector(
                        onPanUpdate: (details) {
                          // Handle marker dragging
                          final RenderBox renderBox = context.findRenderObject() as RenderBox;
                          final position = renderBox.globalToLocal(details.globalPosition);
                          // Convert screen position to LatLng would require more complex calculation
                          // For simplicity, we'll just allow tap-to-move
                        },
                        child: Icon(
                          Icons.location_pin,
                          color: colorScheme.primary,
                          size: 50,
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
          // Search bar with suggestions
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Column(
              children: [
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.search, color: Colors.grey),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                focusNode: _searchFocusNode,
                                decoration: const InputDecoration(
                                  hintText: 'Search for a location...',
                                  border: InputBorder.none,
                                ),
                                onTap: () {
                                  if (_searchSuggestions.isNotEmpty) {
                                    setState(() {
                                      _showSuggestions = true;
                                    });
                                  }
                                },
                              ),
                            ),
                            if (_isSearching)
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            else if (_searchController.text.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.clear, size: 20),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {
                                    _searchSuggestions = [];
                                    _showSuggestions = false;
                                  });
                                },
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                          ],
                        ),
                      ),
                      // Suggestions dropdown
                      if (_showSuggestions && _searchSuggestions.isNotEmpty)
                        Container(
                          constraints: const BoxConstraints(maxHeight: 200),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(color: Colors.grey.shade300),
                            ),
                          ),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: _searchSuggestions.length,
                            itemBuilder: (context, index) {
                              final suggestion = _searchSuggestions[index];
                              return ListTile(
                                dense: true,
                                leading: const Icon(Icons.location_on, size: 20),
                                title: FutureBuilder<List<Placemark>>(
                                  future: placemarkFromCoordinates(
                                    suggestion.latitude,
                                    suggestion.longitude,
                                  ),
                                  builder: (context, snapshot) {
                                    if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                                      final placemark = snapshot.data!.first;
                                      String displayText = '';
                                      if (placemark.street?.isNotEmpty ?? false) {
                                        displayText = placemark.street!;
                                      }
                                      if (placemark.locality?.isNotEmpty ?? false) {
                                        displayText += displayText.isEmpty 
                                            ? placemark.locality! 
                                            : ', ${placemark.locality}';
                                      }
                                      if (placemark.administrativeArea?.isNotEmpty ?? false) {
                                        displayText += displayText.isEmpty
                                            ? placemark.administrativeArea!
                                            : ', ${placemark.administrativeArea}';
                                      }
                                      return Text(
                                        displayText.isEmpty 
                                            ? 'Lat: ${suggestion.latitude.toStringAsFixed(4)}, Lng: ${suggestion.longitude.toStringAsFixed(4)}'
                                            : displayText,
                                        style: const TextStyle(fontSize: 14),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      );
                                    }
                                    return Text(
                                      'Lat: ${suggestion.latitude.toStringAsFixed(4)}, Lng: ${suggestion.longitude.toStringAsFixed(4)}',
                                      style: const TextStyle(fontSize: 14),
                                    );
                                  },
                                ),
                                onTap: () => _selectLocationFromSuggestion(suggestion),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
          // Address display card
          Positioned(
            top: _showSuggestions && _searchSuggestions.isNotEmpty ? 240 : 80,
            left: 16,
            right: 16,
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Selected Location',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _isLoading
                        ? const Row(
                            children: [
                              SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                              SizedBox(width: 8),
                              Text('Getting address...'),
                            ],
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 16),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      _selectedAddress,
                                      style: const TextStyle(fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                              if (_isDetectingWard) ...[
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: colorScheme.primary,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'Detecting ward...',
                                      style: TextStyle(fontSize: 11, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ] else if (_wardNumber != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.check_circle, color: Colors.green.shade700, size: 12),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Ward $_wardNumber',
                                        style: TextStyle(
                                          color: Colors.green.shade700,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ] else if (_selectedPosition != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.shade50,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.warning_amber, color: Colors.orange.shade700, size: 12),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Ward not detected (outside Bhaktapur?)',
                                        style: TextStyle(
                                          color: Colors.orange.shade700,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                  ],
                ),
              ),
            ),
          ),
          // Current location button
          Positioned(
            bottom: 100,
            right: 16,
            child: FloatingActionButton(
              heroTag: 'currentLocation',
              onPressed: _goToCurrentLocation,
              backgroundColor: Colors.white,
              child: _isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(Icons.my_location, color: colorScheme.primary),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
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
          child: ElevatedButton(
            onPressed: _selectedPosition != null ? _confirmLocation : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: colorScheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 2,
            ),
            child: const Text(
              'Confirm Location',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _mapController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }
}
