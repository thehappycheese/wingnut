import bpy
import math

# Get the active camera
camera = bpy.context.scene.camera.data

# Camera properties
focal_length = camera.lens
sensor_width = camera.sensor_width
sensor_height = camera.sensor_height
sensor_fit = camera.sensor_fit

# Calculate FOV
def calculate_fov(sensor_size, focal_length):
    return 2 * math.atan(sensor_size / (2 * focal_length)) * (180 / math.pi)

# Determine horizontal and vertical FOV based on sensor fit
if sensor_fit == 'HORIZONTAL' or (sensor_fit == 'AUTO' and sensor_width > sensor_height):
    horizontal_fov = calculate_fov(sensor_width, focal_length)
    vertical_fov = calculate_fov(sensor_height, focal_length * (sensor_height / sensor_width))
elif sensor_fit == 'VERTICAL' or (sensor_fit == 'AUTO' and sensor_height >= sensor_width):
    vertical_fov = calculate_fov(sensor_height, focal_length)
    horizontal_fov = calculate_fov(sensor_width, focal_length * (sensor_width / sensor_height))

print(f"Horizontal FOV: {horizontal_fov} degrees")
print(f"Vertical FOV: {vertical_fov} degrees")