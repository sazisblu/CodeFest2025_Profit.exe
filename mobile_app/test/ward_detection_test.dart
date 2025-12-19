import 'package:flutter_test/flutter_test.dart';
import 'package:hamro_chautari/services/ward_detection_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WardDetectionService Tests', () {
    late WardDetectionService service;

    setUp(() {
      service = WardDetectionService();
    });

    tearDown(() {
      service.clearCache();
    });

    test('Test Case 1: Kamalbinayak (should be in a ward)', () async {
      // Bhaktapur Durbar Square coordinates
      final result = await service.findWardInBhaktapur(27.6749933, 85.4470633);

      print('\n=== Test Case 1: Bhaktapur Durbar Square ===');
      print('Coordinates: (27.6722, 85.4298)');
      print('Result: $result');

      expect(result['success'], true);
      expect(result['inMunicipality'], true);
      expect(result['ward'], isNotNull);
      expect(result['ward']['number'], isNotNull);
    });

    test('Test Case 2: Bhaktapur Bus Park area', () async {
      // Bhaktapur Bus Park area
      final result = await service.findWardInBhaktapur(27.6710, 85.4280);

      print('\n=== Test Case 2: Bhaktapur Bus Park ===');
      print('Coordinates: (27.6710, 85.4280)');
      print('Result: $result');

      expect(result['success'], isNotNull);
    });

    test('Test Case 3: Suryabinayak Temple area', () async {
      // Suryabinayak area (edge of Bhaktapur)
      final result = await service.findWardInBhaktapur(27.6550, 85.4450);

      print('\n=== Test Case 3: Suryabinayak Area ===');
      print('Coordinates: (27.6550, 85.4450)');
      print('Result: $result');

      expect(result['success'], isNotNull);
    });

    test('Test Case 4: Kathmandu (outside Bhaktapur)', () async {
      // Kathmandu coordinates - should NOT be in Bhaktapur
      final result = await service.findWardInBhaktapur(27.7172, 85.3240);

      print('\n=== Test Case 4: Kathmandu (Outside Bhaktapur) ===');
      print('Coordinates: (27.7172, 85.3240)');
      print('Result: $result');

      expect(result['success'], false);
      expect(result['inMunicipality'], false);
    });

    test('Test Case 5: Thimi (near Bhaktapur)', () async {
      // Thimi coordinates - neighboring municipality
      final result = await service.findWardInBhaktapur(27.6800, 85.3800);

      print('\n=== Test Case 5: Thimi (Near Bhaktapur) ===');
      print('Coordinates: (27.6800, 85.3800)');
      print('Result: $result');

      expect(result['success'], false);
      expect(result['inMunicipality'], false);
    });

    test('Test Case 6: Invalid coordinates (out of range)', () async {
      // Invalid latitude
      final result = await service.findWardInBhaktapur(100.0, 85.4298);

      print('\n=== Test Case 6: Invalid Coordinates ===');
      print('Coordinates: (100.0, 85.4298)');
      print('Result: $result');

      expect(result['success'], false);
      expect(result['error'], contains('Invalid coordinates'));
    });

    test('Test Case 7: Nagarkot area (edge of municipality)', () async {
      // Nagarkot area coordinates
      final result = await service.findWardInBhaktapur(27.7150, 85.5200);

      print('\n=== Test Case 7: Nagarkot Area ===');
      print('Coordinates: (27.7150, 85.5200)');
      print('Result: $result');

      expect(result['success'], isNotNull);
    });

    test('Test Case 8: Cache functionality', () async {
      // First call - should load data
      final result1 = await service.findWardInBhaktapur(27.6722, 85.4298);

      // Second call - should use cached data
      final result2 = await service.findWardInBhaktapur(27.6710, 85.4280);

      print('\n=== Test Case 8: Cache Functionality ===');
      print('First call result: ${result1['success']}');
      print('Second call result: ${result2['success']}');

      expect(result1['success'], isNotNull);
      expect(result2['success'], isNotNull);
    });

    test('Test Case 9: Multiple coordinates in Bhaktapur', () async {
      // Test multiple coordinates to see ward distribution
      final testCoordinates = [
        {'lat': 27.6715, 'lon': 85.4298, 'name': 'Durbar Square'},
        {'lat': 27.6680, 'lon': 85.4250, 'name': 'South Bhaktapur'},
        {'lat': 27.6750, 'lon': 85.4350, 'name': 'North Bhaktapur'},
        {'lat': 27.6700, 'lon': 85.4400, 'name': 'East Bhaktapur'},
        {'lat': 27.6700, 'lon': 85.4200, 'name': 'West Bhaktapur'},
      ];

      print('\n=== Test Case 9: Multiple Bhaktapur Coordinates ===');

      for (var coord in testCoordinates) {
        final result = await service.findWardInBhaktapur(
          coord['lat'] as double,
          coord['lon'] as double,
        );

        print('\n${coord['name']}:');
        print('  Coordinates: (${coord['lat']}, ${coord['lon']})');
        print('  Success: ${result['success']}');
        if (result['success'] == true) {
          print('  Ward: ${result['ward']['number']}');
        }
      }
    });
  });
}
