import bpy
import math

# Desired settings
desired_fov_degrees = 90
sensor_size_mm = 30  # Horizontal sensor size

# Convert FOV to radians for the calculation
desired_fov_radians = math.radians(desired_fov_degrees)

# Calculate the focal length needed for the desired FOV
focal_length = sensor_size_mm / (2 * math.tan(desired_fov_radians / 2))

for obj in bpy.data.objects:
    if obj.type == 'CAMERA':

        # Set the selected camera's sensor size and focal length
        camera = obj.data
        camera.sensor_width = sensor_size_mm  # Set sensor width to 30mm
        camera.lens = focal_length  # Update the camera's focal length to achieve the desired FOV

print(f"Set focal length to {focal_length}mm to achieve a horizontal FOV of {desired_fov_degrees} degrees.")