class TagModel {
  final String id;
  final String name;
  final DateTime createdAt;

  TagModel({required this.id, required this.name, required this.createdAt});

  factory TagModel.fromJson(Map<String, dynamic> json) {
    return TagModel(
      id: json['id'] as String,
      name: json['name'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'created_at': createdAt.toIso8601String()};
  }
}
