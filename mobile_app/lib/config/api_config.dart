class ApiConfig {
  // Backend API URL
  // For Android Emulator, use 10.0.2.2
  // For iOS Simulator, use localhost
  // For physical device, use your computer's IP address
  static const String baseUrl =
      'http://10.199.155.51:5000/api'; // Android Emulator
  // static const String baseUrl = 'http://localhost:5000/api'; // iOS Simulator
  // static const String baseUrl = 'http://192.168.x.x:5000/api'; // Physical Device

  // API Endpoints
  static const String postsEndpoint = '/posts';
  static const String getPostEndpoint = '/posts'; // + /{id}
}