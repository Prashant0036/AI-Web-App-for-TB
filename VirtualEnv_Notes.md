# Python Virtual Environment — Summary for Prashant Saraswat
_Date: October 26, 2025_

## 🧩 What is a Virtual Environment?
A **virtual environment (venv)** in Python is a self-contained directory that contains its own Python interpreter and libraries.  
It allows each project to have its own dependencies, avoiding conflicts between different projects.

---

## ⚙️ How It Works
1. **Create** a new venv folder — Python copies its interpreter and base structure.
2. **Activate** it — the terminal PATH is temporarily changed to point to the venv.
3. **Install packages** — `pip` installs them into `venv/Lib/site-packages`, not globally.
4. **Deactivate** — restores normal system PATH.

---

## 🧱 Folder Structure Example
```
my_project/
│
├── .venv/
│   ├── Scripts/
│   ├── Lib/
│   └── pyvenv.cfg
├── app.py
└── requirements.txt
```

---

## 🪄 Commands
| Action | Windows Command |
|--------|------------------|
| Create venv | `python -m venv .venv` |
| Activate venv | `.venv\Scripts\activate` |
| Deactivate venv | `deactivate` |
| Install package | `pip install flask` |
| Save dependencies | `pip freeze > requirements.txt` |

---

## 📘 Important Notes
- The **`.venv` folder** is for Python packages — don’t store your project files inside it.
- The **`.env` file** (different thing) stores environment variables like passwords or secret keys.
- Always **activate venv before installing packages**.
- You can **reactivate the same venv** anytime using `.venv\Scripts\activate`.

---

## 💡 Example Workflow
```bash
mkdir my_project
cd my_project
python -m venv .venv     , .venv is folder name
.venv\Scripts\activate   ,it will run activate batch file inside .venv\Scripts folder
pip install flask
notepad app.py
```
Then write your code in `app.py`.

---

**Summary:**  
> Always create your virtual environment first (`python -m venv .venv`), activate it, then write your Python app and install packages inside it.

---

© 2025 — Compiled for **Prashant Saraswat**

ctrl + shift + v to Read
