from datasets import load_dataset

# Replace "dxli94/wlasl" with the exact repo name if different
dataset = load_dataset("dxli94/wlasl", split="train")

print(dataset[0])
