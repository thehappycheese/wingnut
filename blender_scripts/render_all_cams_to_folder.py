import bpy
from pathlib import Path

# Specify the folder where you want to save the renders
output_folder = Path('M:/GIT/wingnut/src/texture/skybox_blender')

# Ensure the output directory exists, create if it doesn't
output_folder.mkdir(parents=True, exist_ok=True)

# Iterate through all cameras in the scene
for obj in bpy.data.objects:
    if obj.type == 'CAMERA':
        # Set the current camera as the active camera
        bpy.context.scene.camera = obj
        
        # Update the scene (required in some versions of Blender)
        bpy.context.view_layer.update()
        
        # Set the output file path with camera name, saving as PNG
        bpy.context.scene.render.filepath = str(output_folder / f"{obj.name}.png")
        
        # Render the scene
        bpy.ops.render.render(write_still=True)