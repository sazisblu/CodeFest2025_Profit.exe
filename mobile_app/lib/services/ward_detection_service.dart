import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:turf/turf.dart';

class WardDetectionService {
  static const String _topoJsonPath = 'assets/data/nepal-wards.topojson';
  static const String _targetMunicipality = 'Bhaktapur';

  List<Map<String, dynamic>>? _bhaktapurWards;
  bool _isLoaded = false;

  /// Convert TopoJSON to GeoJSON features
  Map<String, dynamic> _topoJsonToGeoJson(Map<String, dynamic> topology) {
    try {
      final objects = topology['objects'] as Map<String, dynamic>;
      if (objects.isEmpty) {
        throw Exception('No objects found in TopoJSON');
      }

      final objectKey = objects.keys.first;
      final geometries = objects[objectKey]['geometries'] as List;
      final arcs = topology['arcs'] as List;
      final transform = topology['transform'];

      List<Map<String, dynamic>> features = [];

      for (var i = 0; i < geometries.length; i++) {
        try {
          final feature = _convertGeometry(geometries[i], arcs, transform);
          if (feature != null) {
            features.add(feature);
          }
        } catch (e) {
          // Skip geometries that fail to convert
          continue;
        }
      }

      return {'type': 'FeatureCollection', 'features': features};
    } catch (e) {
      print('[WardDetection] ERROR in _topoJsonToGeoJson: $e');
      rethrow;
    }
  }

  /// Convert a single geometry from TopoJSON to GeoJSON
  Map<String, dynamic>? _convertGeometry(
    Map<String, dynamic> geometry,
    List arcs,
    Map<String, dynamic>? transform,
  ) {
    if (geometry['type'] == 'Polygon') {
      // For Polygon: arcs is an array of rings, each ring is an array of arc indices
      final rings = geometry['arcs'] as List;
      final coordinates = rings.map((ring) {
        return _convertArcRing(ring as List, arcs, transform);
      }).toList();

      return {
        'type': 'Feature',
        'properties': geometry['properties'] ?? {},
        'geometry': {'type': 'Polygon', 'coordinates': coordinates},
      };
    } else if (geometry['type'] == 'MultiPolygon') {
      // For MultiPolygon: arcs is an array of polygons, each polygon is an array of rings
      final polygons = geometry['arcs'] as List;
      final coordinates = polygons.map((polygon) {
        return (polygon as List).map((ring) {
          return _convertArcRing(ring as List, arcs, transform);
        }).toList();
      }).toList();

      return {
        'type': 'Feature',
        'properties': geometry['properties'] ?? {},
        'geometry': {'type': 'MultiPolygon', 'coordinates': coordinates},
      };
    }
    return null;
  }

  /// Convert a ring of arc indices to coordinates
  List<List<double>> _convertArcRing(
    List arcIndices,
    List arcs,
    Map<String, dynamic>? transform,
  ) {
    List<List<double>> coordinates = [];

    for (var arcIndex in arcIndices) {
      // arcIndex is an integer referencing an arc in the arcs array
      final arcIndexInt = arcIndex as int;
      final isReversed = arcIndexInt < 0;
      final arcData = arcs[arcIndexInt.abs()] as List;

      // Convert arc points to coordinates
      List<List<double>> arcCoordinates = [];
      double x = 0, y = 0;

      for (var point in arcData) {
        final pointList = point as List;
        final deltaX = (pointList[0] as num).toDouble();
        final deltaY = (pointList[1] as num).toDouble();

        x += deltaX;
        y += deltaY;

        double lon = x;
        double lat = y;

        // Apply transform if present
        if (transform != null) {
          final scale = transform['scale'] as List;
          final translate = transform['translate'] as List;
          lon =
              x * (scale[0] as num).toDouble() +
              (translate[0] as num).toDouble();
          lat =
              y * (scale[1] as num).toDouble() +
              (translate[1] as num).toDouble();
        }

        arcCoordinates.add([lon, lat]);
      }

      // If arc is reversed, reverse the coordinates
      if (isReversed) {
        arcCoordinates = arcCoordinates.reversed.toList();
      }

      // Add arc coordinates to ring (skip first point if not first arc to avoid duplication)
      if (coordinates.isEmpty) {
        coordinates.addAll(arcCoordinates);
      } else {
        coordinates.addAll(arcCoordinates.skip(1));
      }
    }

    // Ensure ring is closed (first and last coordinates must be the same)
    if (coordinates.isNotEmpty) {
      final first = coordinates.first;
      final last = coordinates.last;
      if (first[0] != last[0] || first[1] != last[1]) {
        coordinates.add([first[0], first[1]]);
      }
    }

    return coordinates;
  }

  /// Load and cache Bhaktapur wards data
  Future<void> _loadBhaktapurWards() async {
    if (_isLoaded) {
      print(
        '[WardDetection] Ward data already loaded (${_bhaktapurWards?.length ?? 0} wards)',
      );
      return;
    }

    try {
      print('[WardDetection] Loading TopoJSON from $_topoJsonPath...');
      final String topoJsonString = await rootBundle.loadString(_topoJsonPath);
      print(
        '[WardDetection] TopoJSON loaded, size: ${topoJsonString.length} bytes',
      );

      final Map<String, dynamic> topoData = json.decode(topoJsonString);
      print('[WardDetection] TopoJSON parsed successfully');

      // Convert TopoJSON to GeoJSON
      final geoData = _topoJsonToGeoJson(topoData);
      print('[WardDetection] Converted to GeoJSON');

      final List<dynamic> features = geoData['features'] ?? [];
      print('[WardDetection] Total features: ${features.length}');

      // Filter for Bhaktapur Municipality wards
      _bhaktapurWards = features
          .where((feature) {
            final props = feature['properties'] ?? {};
            final palika = (props['PALIKA'] ?? props['palika'] ?? '')
                .toString();
            return palika.toLowerCase() == _targetMunicipality.toLowerCase();
          })
          .cast<Map<String, dynamic>>()
          .toList();

      print(
        '[WardDetection] Filtered to ${_bhaktapurWards!.length} Bhaktapur wards',
      );
      _isLoaded = true;
    } catch (e) {
      print('[WardDetection] ERROR loading ward data: $e');
      throw Exception('Error loading ward data: $e');
    }
  }

  /// Find ward number for given coordinates
  Future<Map<String, dynamic>> findWardInBhaktapur(
    double lat,
    double lon,
  ) async {
    print('[WardDetection] Starting ward detection for ($lat, $lon)');
    try {
      // Validate coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        print('[WardDetection] Invalid coordinates');
        return {
          'success': false,
          'error': 'Invalid coordinates: out of valid range',
        };
      }

      // Load ward data
      print('[WardDetection] Loading Bhaktapur wards data...');
      await _loadBhaktapurWards();

      if (_bhaktapurWards == null || _bhaktapurWards!.isEmpty) {
        print('[WardDetection] ERROR: Ward data not loaded or empty');
        return {'success': false, 'error': 'Ward data not available'};
      }

      print(
        '[WardDetection] Checking ${_bhaktapurWards!.length} wards for point ($lat, $lon)',
      );
      final point = Point(coordinates: Position(lon, lat));

      // Check each ward
      for (final wardFeature in _bhaktapurWards!) {
        try {
          final geometry = wardFeature['geometry'];
          if (geometry == null) continue;

          bool pointInWard = false;

          if (geometry['type'] == 'Polygon') {
            final polygon = Polygon(
              coordinates: (geometry['coordinates'] as List)
                  .map(
                    (ring) => (ring as List)
                        .map(
                          (coord) => Position(
                            (coord[0] as num).toDouble(),
                            (coord[1] as num).toDouble(),
                          ),
                        )
                        .toList(),
                  )
                  .toList(),
            );
            pointInWard = booleanPointInPolygon(point.coordinates, polygon);
          } else if (geometry['type'] == 'MultiPolygon') {
            // Check ALL polygons in the MultiPolygon, not just the first one
            final polygons = geometry['coordinates'] as List;
            for (final polygonCoords in polygons) {
              final polygon = Polygon(
                coordinates: (polygonCoords as List)
                    .map(
                      (ring) => (ring as List)
                          .map(
                            (coord) => Position(
                              (coord[0] as num).toDouble(),
                              (coord[1] as num).toDouble(),
                            ),
                          )
                          .toList(),
                    )
                    .toList(),
              );
              if (booleanPointInPolygon(point.coordinates, polygon)) {
                pointInWard = true;
                break; // Found it, no need to check other polygons
              }
            }
          }

          if (pointInWard) {
            final props = wardFeature['properties'] ?? {};
            print('[WardDetection] ✓ Found ward! Properties: $props');

            return {
              'success': true,
              'inMunicipality': true,
              'ward': {
                'number': props['WARD'] ?? props['ward'],
                'name':
                    props['PALIKA'] ?? props['palika'] ?? _targetMunicipality,
                'district':
                    props['DISTRICT'] ?? props['district'] ?? 'Bhaktapur',
                'province': props['PROVINCE'] ?? props['province'] ?? 3,
                'type': props['TYPE'] ?? props['type'] ?? 'Nagarpalika',
              },
              'coordinates': {'latitude': lat, 'longitude': lon},
            };
          }
        } catch (e) {
          // Skip this ward if there's an error processing it
          print('[WardDetection] Error processing ward: $e');
          continue;
        }
      }

      print('[WardDetection] ✗ No ward found for coordinates ($lat, $lon)');
      return {
        'success': false,
        'inMunicipality': false,
        'message':
            'Location is not within Bhaktapur Municipality or ward not determined',
      };
    } catch (e) {
      print('[WardDetection] EXCEPTION in findWardInBhaktapur: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Clear cached data
  void clearCache() {
    _bhaktapurWards = null;
    _isLoaded = false;
  }
}
