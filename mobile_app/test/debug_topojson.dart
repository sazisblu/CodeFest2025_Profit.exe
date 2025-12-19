import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('Debug TopoJSON structure', () async {
    final String topoJsonString = await rootBundle.loadString(
      'assets/data/nepal-wards.topojson',
    );
    final Map<String, dynamic> topoData = json.decode(topoJsonString);

    print('\n=== TopoJSON Structure ===');
    print('Keys: ${topoData.keys.toList()}');

    final objects = topoData['objects'] as Map<String, dynamic>;
    final objectKey = objects.keys.first;
    print('Object key: $objectKey');

    final geometries = objects[objectKey]['geometries'] as List;
    print('Number of geometries: ${geometries.length}');

    // Look at first geometry
    final firstGeom = geometries[0];
    print('\n=== First Geometry ===');
    print('Type: ${firstGeom['type']}');
    print(
      'Properties keys: ${(firstGeom['properties'] as Map?)?.keys.toList()}',
    );
    print('Arcs type: ${firstGeom['arcs'].runtimeType}');

    if (firstGeom['arcs'] is List) {
      final arcs = firstGeom['arcs'] as List;
      print('Arcs length: ${arcs.length}');
      if (arcs.isNotEmpty) {
        print('First arc type: ${arcs[0].runtimeType}');
        print('First arc: ${arcs[0]}');
        if (arcs[0] is List) {
          final firstArc = arcs[0] as List;
          if (firstArc.isNotEmpty) {
            print('First arc[0] type: ${firstArc[0].runtimeType}');
            print('First arc[0]: ${firstArc[0]}');
          }
        }
      }
    }

    // Look at the arcs array
    final arcsArray = topoData['arcs'] as List;
    print('\n=== Arcs Array ===');
    print('Number of arcs: ${arcsArray.length}');
    if (arcsArray.isNotEmpty) {
      print('First arc type: ${arcsArray[0].runtimeType}');
      print('First arc length: ${(arcsArray[0] as List).length}');
      final firstArc = arcsArray[0] as List;
      if (firstArc.isNotEmpty) {
        print('First arc[0] type: ${firstArc[0].runtimeType}');
        print('First arc[0]: ${firstArc[0]}');
        if (firstArc.length > 1) {
          print('First arc[1]: ${firstArc[1]}');
        }
      }
    }

    // Look at transform
    final transform = topoData['transform'];
    print('\n=== Transform ===');
    print('Transform: $transform');
    print('Scale type: ${transform['scale'].runtimeType}');
    print('Translate type: ${transform['translate'].runtimeType}');
  });
}
