import os

def fix_encoding(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # It's double encoded utf-8 -> cp1252 -> utf-8
        # We need to reverse it.
        try:
            fixed = content.encode('cp1252').decode('utf-8')
        except Exception as e:
            # Maybe some characters can't be encoded back to cp1252, fallback.
            # E.g. non-cp1252 characters.
            print(f"Direct reverse failed for {filepath}: {e}")
            return
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
            
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error {filepath}: {e}")

fix_encoding('Arquimedes/index.html')
fix_encoding('Arquimedes/app.js')
fix_encoding('Arquimedes/styles.css')
