from flask import Flask, render_template, request, send_file
import os
import uuid
import subprocess
from PIL import Image
import zipfile, shutil
from cryptography.fernet import Fernet

app = Flask(__name__)

UPLOAD = "uploads"
OUTPUT = "compressed"
ENCRYPTED = "encrypted"

os.makedirs(UPLOAD, exist_ok=True)
os.makedirs(OUTPUT, exist_ok=True)
os.makedirs(ENCRYPTED, exist_ok=True)


# ---------------- ENCRYPTION SETUP ----------------
KEY_FILE = "secret.key"

if not os.path.exists(KEY_FILE):
    with open(KEY_FILE, "wb") as f:
        f.write(Fernet.generate_key())

with open(KEY_FILE, "rb") as f:
    ENCRYPTION_KEY = f.read()

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_file(input_path, output_path):
    with open(input_path, "rb") as f:
        encrypted = fernet.encrypt(f.read())
    with open(output_path, "wb") as f:
        f.write(encrypted)

def decrypt_file(input_path, output_path):
    with open(input_path, "rb") as f:
        decrypted = fernet.decrypt(f.read())
    with open(output_path, "wb") as f:
        f.write(decrypted)
# ---------------------------------------------------



# -------- DOCX COMPRESSOR --------
def compress_docx(input_path, output_path, quality=60):
    temp_dir = f"temp_{uuid.uuid4().hex}"
    os.makedirs(temp_dir, exist_ok=True)

    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)

    media_path = os.path.join(temp_dir, "word", "media")

    if os.path.exists(media_path):
        for img_name in os.listdir(media_path):
            img_path = os.path.join(media_path, img_name)
            try:
                img = Image.open(img_path)
                img.save(img_path, optimize=True, quality=quality)
            except:
                pass

    shutil.make_archive(output_path.replace(".docx",""), 'zip', temp_dir)
    os.rename(output_path.replace(".docx",".zip"), output_path)
    shutil.rmtree(temp_dir)



# -------- IMAGE COMPRESSOR --------
def compress_image(input_path, output_path, quality=40):
    img = Image.open(input_path)
    img.save(output_path, optimize=True, quality=quality)



# -------- PDF COMPRESSOR --------
def compress_pdf(input_path, output_path):
    gs_cmd = [
        "C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_path}",
        input_path
    ]
    subprocess.run(gs_cmd)




@app.route("/")
def index():
    return render_template("index.html")



@app.route("/compress", methods=["POST"])
def compress_file():
    file = request.files["file"]
    filename = file.filename

    in_path = os.path.join(UPLOAD, filename)
    file.save(in_path)

    ext = filename.lower().split(".")[-1]

    compressed_name = uuid.uuid4().hex + "." + ext
    compressed_path = os.path.join(OUTPUT, compressed_name)

    # ---------------- COMPRESSION ----------------
    if ext == "pdf":
        compress_pdf(in_path, compressed_path)

    elif ext in ["jpg", "jpeg", "png"]:
        compress_image(in_path, compressed_path)

    elif ext == "docx":
        compress_docx(in_path, compressed_path)

    else:
        return "Unsupported file type!"

    # ---------------- ENCRYPTION ----------------
    encrypted_name = uuid.uuid4().hex + ".secure"
    encrypted_path = os.path.join(ENCRYPTED, encrypted_name)

    encrypt_file(compressed_path, encrypted_path)

    return send_file(
        encrypted_path,
        as_attachment=True,
        mimetype="application/octet-stream",
        download_name=encrypted_name
    )


@app.route("/decrypt", methods=["POST"])
def decrypt_file_route():
    file = request.files["file"]
    filename = file.filename

    encrypted_path = os.path.join(ENCRYPTED, filename)
    file.save(encrypted_path)

    decrypted_name = "decrypted_" + uuid.uuid4().hex + "_" + filename.replace(".secure", "")
    decrypted_path = os.path.join(OUTPUT, decrypted_name)

    try:
        decrypt_file(encrypted_path, decrypted_path)
        return send_file(
            decrypted_path,
            as_attachment=True,
            mimetype="application/octet-stream",
            download_name=decrypted_name
        )
    except Exception as e:
        return f"Decryption failed: {str(e)}", 400


if __name__ == "__main__":
    app.run(debug=True, port=5800)
