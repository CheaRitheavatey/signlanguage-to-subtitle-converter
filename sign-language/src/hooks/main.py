import fiftyone as fo
import fiftyone.utils.huggingface as fouh

# load dataset
dataset = fouh.load_from_hub("Voxel51/WLASL")

# launch the app
session = fo.launch_app(dataset)