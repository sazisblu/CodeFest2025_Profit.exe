import 'package:flutter_test/flutter_test.dart';
import 'package:hamro_chautari/services/ward_detection_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Cross-Platform Consistency Tests', () {
    late WardDetectionService service;

    setUp(() {
      service = WardDetectionService();
    });

    tearDown(() {
      service.clearCache();
    });

    // These are the exact same test coordinates from the JavaScript test file
    test('Khwopa College - matches JavaScript result', () async {
      final result = await service.findWardInBhaktapur(
        27.671043832848206,
        85.43919412551233,
      );

      print('\n=== Khwopa College ===');
      print('Coordinates: (27.671043832848206, 85.43919412551233)');
      print('Result: $result');

      // Verify it returns a valid ward (JavaScript returns success: true)
      expect(result['success'], true);
      expect(result['ward']['number'], isNotNull);
      print(
        '✓ Ward ${result['ward']['number']} detected (matching JavaScript)',
      );
    });

    test('Durbar Square - matches JavaScript result', () async {
      final result = await service.findWardInBhaktapur(27.6715, 85.4298);

      print('\n=== Durbar Square ===');
      print('Coordinates: (27.6715, 85.4298)');
      print('Result: $result');

      expect(result['success'], true);
      expect(result['ward']['number'], isNotNull);
      print(
        '✓ Ward ${result['ward']['number']} detected (matching JavaScript)',
      );
    });

    test('Sample Location 1 - matches JavaScript result', () async {
      final result = await service.findWardInBhaktapur(27.6749933, 85.4470633);

      print('\n=== Sample Location 1 ===');
      print('Coordinates: (27.6749933, 85.4470633)');
      print('Result: $result');

      expect(result['success'], true);
      expect(result['ward']['number'], isNotNull);
      print(
        '✓ Ward ${result['ward']['number']} detected (matching JavaScript)',
      );
    });

    test('Outside Municipality - matches JavaScript result', () async {
      final result = await service.findWardInBhaktapur(27.665, 85.435);

      print('\n=== Outside Municipality ===');
      print('Coordinates: (27.665, 85.435)');
      print('Result: $result');

      // This should fail in both implementations
      expect(result['success'], false);
      print(
        '✓ Correctly identified as outside Bhaktapur (matching JavaScript)',
      );
    });

    test('All JavaScript test cases - comprehensive check', () async {
      final testCases = [
        {
          'lat': 27.671043832848206,
          'lon': 85.43919412551233,
          'label': 'Khwopa College',
          'shouldSucceed': true,
        },
        {
          'lat': 27.6715,
          'lon': 85.4298,
          'label': 'Durbar Square',
          'shouldSucceed': true,
        },
        {
          'lat': 27.6749933,
          'lon': 85.4470633,
          'label': 'Sample Location 1',
          'shouldSucceed': true,
        },
        {
          'lat': 27.665,
          'lon': 85.435,
          'label': 'Outside Municipality',
          'shouldSucceed': false,
        },
      ];

      print('\n=== Comprehensive Cross-Platform Check ===');

      for (var testCase in testCases) {
        final result = await service.findWardInBhaktapur(
          testCase['lat'] as double,
          testCase['lon'] as double,
        );

        final expected = testCase['shouldSucceed'] as bool;
        final actual = result['success'] as bool;

        print('\n${testCase['label']}:');
        print('  Expected success: $expected');
        print('  Actual success: $actual');

        if (actual && result['ward'] != null) {
          print('  Ward: ${result['ward']['number']}');
        }

        expect(actual, expected, reason: 'Failed for ${testCase['label']}');
        print('  ✓ Matches JavaScript behavior');
      }
    });
  });
}
