import os
import re
import glob

# Step 1: Extract all calculator slugs
slugs = set()
data_dir = r"d:\MegaCalc-Hub\src\data\calculators"
for filepath in glob.glob(os.path.join(data_dir, "*.ts")):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        # Find all slug: 'something' or slug: "something"
        matches = re.findall(r"slug\s*:\s*['\"]([^'\"]+)['\"]", content)
        for m in matches:
            slugs.add(m)

print(f"Found {len(slugs)} calculator slugs.")

# Step 2: Global replace in files
src_dir = r"d:\MegaCalc-Hub\src"
files_to_check = []
for ext in ["*.ts", "*.tsx", "*.js", "*.jsx"]:
    files_to_check.extend(glob.glob(os.path.join(src_dir, "**", ext), recursive=True))

count = 0
for filepath in files_to_check:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            original_content = content
        
        # We look for /category/<anything>/slug or /category/<anything>/<anything>/slug
        for slug in slugs:
            # Match href="/category/anything/slug" or href={`/category/anything/slug`}
            # We will just replace exactly "/category/.../slug" -> "/slug"
            # It handles both 1 or 2 level deep paths after /category/
            # E.g. /category/sports-training/bowling-average-calculator
            # E.g. /category/education/maths/fractions-calculator
            pattern = r"/category/[^/\"\'`<>]+/" + slug + r"(?=[/\"\'`<>#?])"
            content = re.sub(pattern, f"/{slug}", content)
            
            pattern2 = r"/category/[^/\"\'`<>]+/[^/\"\'`<>]+/" + slug + r"(?=[/\"\'`<>#?])"
            content = re.sub(pattern2, f"/{slug}", content)

        if content != original_content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            count += 1
            print(f"Updated {filepath}")
    except Exception as e:
        pass

print(f"Updated {count} files.")
