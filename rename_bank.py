import os

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old_str, new_str in replacements:
            content = content.replace(old_str, new_str)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filepath}")
    except Exception as e:
        pass

def walk_and_replace(directory, replacements):
    ignore_dirs = {'.git', 'node_modules', '.next', '__pycache__', '.temp'}
    ignore_exts = {'.sqlite3', '.db', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.pyc', '.bat'}
    
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]  # type: ignore
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ignore_exts:
                continue
            # Also ignore this script itself
            if file == "rename_bank.py":
                continue
                
            filepath = os.path.join(root, file)
            replace_in_file(filepath, replacements)

if __name__ == "__main__":
    workspace = r"c:\Users\Anand Shah\.gemini\antigravity\scratch\hsbc_platform"
    
    replacements = [
        ("HSBC", "Aura"),
        ("hsbc", "aura"),
    ]
    
    print("Starting rebranding from HSBC to Aura...")
    walk_and_replace(workspace, replacements)
    print("Rebranding string replacement complete.")
