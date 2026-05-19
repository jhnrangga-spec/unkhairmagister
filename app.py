import os
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, abort, send_from_directory
)
from flask_login import (
    LoginManager, UserMixin, login_user, logout_user,
    login_required, current_user
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXT = {"pdf", "jpg", "jpeg", "png"}
MAX_UPLOAD_MB = 5

os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + os.path.join(BASE_DIR, "magister.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Silakan login terlebih dahulu."


# ---------- Models ----------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    nama = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="mahasiswa")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    pendaftaran_baru = db.relationship(
        "PendaftaranBaru", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    pendaftaran_wisuda = db.relationship(
        "PendaftaranWisuda", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class PendaftaranBaru(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    nama_lengkap = db.Column(db.String(120), nullable=False)
    nik = db.Column(db.String(20), nullable=False)
    tempat_lahir = db.Column(db.String(80))
    tanggal_lahir = db.Column(db.Date)
    jenis_kelamin = db.Column(db.String(10))
    alamat = db.Column(db.Text)
    no_hp = db.Column(db.String(20))

    asal_universitas_s1 = db.Column(db.String(150))
    program_studi_s1 = db.Column(db.String(150))
    tahun_lulus_s1 = db.Column(db.Integer)
    ipk_s1 = db.Column(db.Float)

    program_studi_tujuan = db.Column(db.String(150), nullable=False)
    gelombang = db.Column(db.String(20))

    file_ijazah = db.Column(db.String(255))
    file_transkrip = db.Column(db.String(255))
    file_ktp = db.Column(db.String(255))

    status = db.Column(db.String(20), default="menunggu")  # menunggu/diterima/ditolak
    catatan_admin = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PendaftaranWisuda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    nama_lengkap = db.Column(db.String(120), nullable=False)
    nim = db.Column(db.String(30), nullable=False)
    program_studi = db.Column(db.String(150), nullable=False)
    judul_tesis = db.Column(db.Text, nullable=False)
    pembimbing_1 = db.Column(db.String(120))
    pembimbing_2 = db.Column(db.String(120))
    tanggal_yudisium = db.Column(db.Date)
    ipk = db.Column(db.Float)
    no_hp = db.Column(db.String(20))

    file_ijazah_s1 = db.Column(db.String(255))
    file_transkrip = db.Column(db.String(255))
    file_lembar_pengesahan = db.Column(db.String(255))
    file_bebas_pustaka = db.Column(db.String(255))

    status = db.Column(db.String(20), default="menunggu")
    catatan_admin = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ---------- Helpers ----------
@login_manager.user_loader
def load_user(uid):
    return db.session.get(User, int(uid))


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != "admin":
            abort(403)
        return fn(*args, **kwargs)
    return wrapper


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT


def save_upload(file_storage, prefix):
    if not file_storage or file_storage.filename == "":
        return None
    if not allowed_file(file_storage.filename):
        flash(f"Format file '{file_storage.filename}' tidak diizinkan.", "danger")
        return None
    fname = secure_filename(file_storage.filename)
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    final = f"{prefix}_{current_user.id}_{ts}_{fname}"
    file_storage.save(os.path.join(UPLOAD_DIR, final))
    return final


def parse_date(s):
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


# ---------- Public routes ----------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        nama = request.form.get("nama", "").strip()
        pw = request.form.get("password", "")
        pw2 = request.form.get("password2", "")

        if not (email and nama and pw):
            flash("Semua field wajib diisi.", "danger")
        elif pw != pw2:
            flash("Konfirmasi password tidak sama.", "danger")
        elif len(pw) < 6:
            flash("Password minimal 6 karakter.", "danger")
        elif User.query.filter_by(email=email).first():
            flash("Email sudah terdaftar.", "danger")
        else:
            user = User(email=email, nama=nama, role="mahasiswa")
            user.set_password(pw)
            db.session.add(user)
            db.session.commit()
            flash("Registrasi berhasil. Silakan login.", "success")
            return redirect(url_for("login"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        pw = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(pw):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Email atau password salah.", "danger")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route("/dashboard")
@login_required
def dashboard():
    if current_user.role == "admin":
        return redirect(url_for("admin_dashboard"))
    pb = PendaftaranBaru.query.filter_by(user_id=current_user.id) \
        .order_by(PendaftaranBaru.created_at.desc()).all()
    pw = PendaftaranWisuda.query.filter_by(user_id=current_user.id) \
        .order_by(PendaftaranWisuda.created_at.desc()).all()
    return render_template("student/dashboard.html", pb=pb, pw=pw)


# ---------- Student: pendaftaran baru ----------
@app.route("/pendaftaran-baru", methods=["GET", "POST"])
@login_required
def daftar_baru():
    if request.method == "POST":
        p = PendaftaranBaru(
            user_id=current_user.id,
            nama_lengkap=request.form.get("nama_lengkap", "").strip(),
            nik=request.form.get("nik", "").strip(),
            tempat_lahir=request.form.get("tempat_lahir", "").strip(),
            tanggal_lahir=parse_date(request.form.get("tanggal_lahir")),
            jenis_kelamin=request.form.get("jenis_kelamin"),
            alamat=request.form.get("alamat", "").strip(),
            no_hp=request.form.get("no_hp", "").strip(),
            asal_universitas_s1=request.form.get("asal_universitas_s1", "").strip(),
            program_studi_s1=request.form.get("program_studi_s1", "").strip(),
            tahun_lulus_s1=int(request.form.get("tahun_lulus_s1") or 0) or None,
            ipk_s1=float(request.form.get("ipk_s1") or 0) or None,
            program_studi_tujuan=request.form.get("program_studi_tujuan", "").strip(),
            gelombang=request.form.get("gelombang"),
        )
        if not (p.nama_lengkap and p.nik and p.program_studi_tujuan):
            flash("Nama, NIK, dan program studi tujuan wajib diisi.", "danger")
            return render_template("student/daftar_baru.html")

        p.file_ijazah = save_upload(request.files.get("file_ijazah"), "ijazah_s1")
        p.file_transkrip = save_upload(request.files.get("file_transkrip"), "transkrip_s1")
        p.file_ktp = save_upload(request.files.get("file_ktp"), "ktp")

        db.session.add(p)
        db.session.commit()
        flash("Pendaftaran berhasil dikirim. Menunggu verifikasi admin.", "success")
        return redirect(url_for("dashboard"))
    return render_template("student/daftar_baru.html")


# ---------- Student: pendaftaran wisuda ----------
@app.route("/pendaftaran-wisuda", methods=["GET", "POST"])
@login_required
def daftar_wisuda():
    if request.method == "POST":
        p = PendaftaranWisuda(
            user_id=current_user.id,
            nama_lengkap=request.form.get("nama_lengkap", "").strip(),
            nim=request.form.get("nim", "").strip(),
            program_studi=request.form.get("program_studi", "").strip(),
            judul_tesis=request.form.get("judul_tesis", "").strip(),
            pembimbing_1=request.form.get("pembimbing_1", "").strip(),
            pembimbing_2=request.form.get("pembimbing_2", "").strip(),
            tanggal_yudisium=parse_date(request.form.get("tanggal_yudisium")),
            ipk=float(request.form.get("ipk") or 0) or None,
            no_hp=request.form.get("no_hp", "").strip(),
        )
        if not (p.nama_lengkap and p.nim and p.program_studi and p.judul_tesis):
            flash("Nama, NIM, program studi, dan judul tesis wajib diisi.", "danger")
            return render_template("student/daftar_wisuda.html")

        p.file_ijazah_s1 = save_upload(request.files.get("file_ijazah_s1"), "ijazah_s1_wis")
        p.file_transkrip = save_upload(request.files.get("file_transkrip"), "transkrip_s2")
        p.file_lembar_pengesahan = save_upload(
            request.files.get("file_lembar_pengesahan"), "pengesahan"
        )
        p.file_bebas_pustaka = save_upload(
            request.files.get("file_bebas_pustaka"), "bebas_pustaka"
        )

        db.session.add(p)
        db.session.commit()
        flash("Pendaftaran wisuda berhasil dikirim. Menunggu verifikasi admin.", "success")
        return redirect(url_for("dashboard"))
    return render_template("student/daftar_wisuda.html")


# ---------- Admin ----------
@app.route("/admin")
@login_required
@admin_required
def admin_dashboard():
    tab = request.args.get("tab", "baru")
    status = request.args.get("status", "semua")
    q_baru = PendaftaranBaru.query
    q_wis = PendaftaranWisuda.query
    if status != "semua":
        q_baru = q_baru.filter_by(status=status)
        q_wis = q_wis.filter_by(status=status)
    daftar_baru_list = q_baru.order_by(PendaftaranBaru.created_at.desc()).all()
    daftar_wisuda_list = q_wis.order_by(PendaftaranWisuda.created_at.desc()).all()
    stats = {
        "baru_total": PendaftaranBaru.query.count(),
        "baru_menunggu": PendaftaranBaru.query.filter_by(status="menunggu").count(),
        "wisuda_total": PendaftaranWisuda.query.count(),
        "wisuda_menunggu": PendaftaranWisuda.query.filter_by(status="menunggu").count(),
    }
    return render_template(
        "admin/dashboard.html",
        tab=tab, status=status, stats=stats,
        daftar_baru_list=daftar_baru_list,
        daftar_wisuda_list=daftar_wisuda_list,
    )


@app.route("/admin/pendaftaran-baru/<int:pid>", methods=["GET", "POST"])
@login_required
@admin_required
def admin_detail_baru(pid):
    p = db.session.get(PendaftaranBaru, pid) or abort(404)
    if request.method == "POST":
        new_status = request.form.get("status")
        if new_status in ("menunggu", "diterima", "ditolak"):
            p.status = new_status
        p.catatan_admin = request.form.get("catatan_admin", "").strip()
        db.session.commit()
        flash("Status pendaftaran diperbarui.", "success")
        return redirect(url_for("admin_detail_baru", pid=pid))
    return render_template("admin/detail_baru.html", p=p)


@app.route("/admin/pendaftaran-wisuda/<int:pid>", methods=["GET", "POST"])
@login_required
@admin_required
def admin_detail_wisuda(pid):
    p = db.session.get(PendaftaranWisuda, pid) or abort(404)
    if request.method == "POST":
        new_status = request.form.get("status")
        if new_status in ("menunggu", "diterima", "ditolak"):
            p.status = new_status
        p.catatan_admin = request.form.get("catatan_admin", "").strip()
        db.session.commit()
        flash("Status pendaftaran wisuda diperbarui.", "success")
        return redirect(url_for("admin_detail_wisuda", pid=pid))
    return render_template("admin/detail_wisuda.html", p=p)


# ---------- File download ----------
@app.route("/uploads/<path:filename>")
@login_required
def serve_upload(filename):
    # Admin boleh, pemilik berkas boleh
    if current_user.role == "admin":
        return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)
    owns = False
    for p in PendaftaranBaru.query.filter_by(user_id=current_user.id).all():
        if filename in (p.file_ijazah, p.file_transkrip, p.file_ktp):
            owns = True
            break
    if not owns:
        for p in PendaftaranWisuda.query.filter_by(user_id=current_user.id).all():
            if filename in (
                p.file_ijazah_s1, p.file_transkrip,
                p.file_lembar_pengesahan, p.file_bebas_pustaka
            ):
                owns = True
                break
    if not owns:
        abort(403)
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


# ---------- Error handlers ----------
@app.errorhandler(403)
def forbidden(_):
    return render_template("error.html", code=403, msg="Akses ditolak."), 403


@app.errorhandler(404)
def notfound(_):
    return render_template("error.html", code=404, msg="Halaman tidak ditemukan."), 404


@app.errorhandler(413)
def too_large(_):
    return render_template(
        "error.html", code=413,
        msg=f"Ukuran file melebihi batas {MAX_UPLOAD_MB} MB."
    ), 413


# ---------- Template filters ----------
@app.template_filter("tgl")
def tgl(value):
    if not value:
        return "-"
    if isinstance(value, datetime):
        return value.strftime("%d-%m-%Y %H:%M")
    return value.strftime("%d-%m-%Y")


@app.template_filter("status_badge")
def status_badge(s):
    return {
        "menunggu": "warning",
        "diterima": "success",
        "ditolak": "danger",
    }.get(s, "secondary")


# ---------- CLI helpers ----------
@app.cli.command("init-db")
def init_db_cmd():
    """Buat tabel database dan akun admin default."""
    db.create_all()
    if not User.query.filter_by(email="admin@magister.local").first():
        admin = User(
            email="admin@magister.local",
            nama="Administrator",
            role="admin",
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("Akun admin dibuat: admin@magister.local / admin123")
    print("Database siap.")


def _bootstrap():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email="admin@magister.local").first():
            admin = User(
                email="admin@magister.local",
                nama="Administrator",
                role="admin",
            )
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()


_bootstrap()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
