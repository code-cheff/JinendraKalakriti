import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
DB_PATH = APP_DIR / 'jinendra_inventory.db'
SEED_PRODUCTS = [
    ('Royal Aarti Thali', 0),
    ('Lotus Glow Set', 0),
    ('Charan & Swastik Set', 0),
    ('Lotus Cow Hanging', 0),
    ('Colourful Diya Set', 0),
    ('Hreem Namah Board', 0),
    ('Arihant Namah Board', 0),
    ('Jai Jinendra Plaque', 0),
    ('Creative Paint Kit', 0),
    ('Cute Stationery Kit', 0),
]

class InventoryApp:
    def __init__(self, root):
        self.root = root
        root.title('Jinendra Kalakriti | Inventory Manager')
        root.geometry('850x590')
        root.minsize(700, 480)
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.execute('''CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL COLLATE NOCASE UNIQUE,
            quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )''')
        count = self.conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
        if count == 0:
            self.conn.executemany('INSERT INTO products(name, quantity) VALUES (?, ?)', SEED_PRODUCTS)
            self.conn.commit()
        self.build_ui()
        self.refresh()
        root.protocol('WM_DELETE_WINDOW', self.close)

    def build_ui(self):
        style = ttk.Style()
        try: style.theme_use('clam')
        except tk.TclError: pass
        style.configure('Treeview', rowheight=31, font=('Segoe UI', 10))
        style.configure('Treeview.Heading', font=('Segoe UI', 10, 'bold'))
        outer = ttk.Frame(self.root, padding=20)
        outer.pack(fill='both', expand=True)
        ttk.Label(outer, text='JINENDRA KALAKRITI', font=('Segoe UI', 19, 'bold')).pack(anchor='w')
        ttk.Label(outer, text='Local inventory manager  •  Quantities are private and stored on this computer', foreground='#666').pack(anchor='w', pady=(2,16))
        top = ttk.Frame(outer); top.pack(fill='x', pady=(0,10))
        ttk.Label(top, text='Search products').pack(side='left')
        self.search_var = tk.StringVar()
        search = ttk.Entry(top, textvariable=self.search_var, width=30)
        search.pack(side='left', padx=9)
        self.search_var.trace_add('write', lambda *_: self.refresh())
        self.count_label = ttk.Label(top, text=''); self.count_label.pack(side='right')
        columns = ('name','quantity','updated')
        self.tree = ttk.Treeview(outer, columns=columns, show='headings', selectmode='browse')
        self.tree.heading('name', text='PRODUCT'); self.tree.heading('quantity', text='QUANTITY'); self.tree.heading('updated', text='LAST UPDATED')
        self.tree.column('name', width=430); self.tree.column('quantity', width=110, anchor='center'); self.tree.column('updated', width=180, anchor='center')
        self.tree.pack(fill='both', expand=True)
        self.tree.bind('<Double-1>', lambda e: self.edit_product())
        actions = ttk.Frame(outer); actions.pack(fill='x', pady=(14,0))
        ttk.Button(actions, text='+ Add Product', command=self.add_product).pack(side='left')
        ttk.Button(actions, text='Update Quantity', command=self.update_quantity).pack(side='left', padx=8)
        ttk.Button(actions, text='Rename Product', command=self.edit_product).pack(side='left')
        ttk.Button(actions, text='Delete Product', command=self.delete_product).pack(side='left', padx=8)
        ttk.Button(actions, text='Refresh', command=self.refresh).pack(side='right')
        ttk.Label(outer, text=f'Database file: {DB_PATH.name}  |  Back it up by copying this file.', foreground='#777').pack(anchor='w', pady=(12,0))

    def refresh(self):
        for item in self.tree.get_children(): self.tree.delete(item)
        term = f"%{self.search_var.get().strip()}%"
        rows = self.conn.execute('SELECT id,name,quantity,updated_at FROM products WHERE name LIKE ? ORDER BY name COLLATE NOCASE', (term,)).fetchall()
        for row in rows: self.tree.insert('', 'end', iid=str(row[0]), values=(row[1], row[2], row[3]))
        total = self.conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
        self.count_label.config(text=f'{len(rows)} shown  •  {total} products total')

    def selected_id(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo('Select a product', 'Please select a product first.')
            return None
        return int(selected[0])

    def prompt(self, title, label, initial=''):
        win = tk.Toplevel(self.root); win.title(title); win.transient(self.root); win.grab_set(); win.resizable(False, False)
        frame = ttk.Frame(win, padding=18); frame.pack(fill='both', expand=True)
        ttk.Label(frame, text=label).pack(anchor='w')
        var = tk.StringVar(value=str(initial)); entry = ttk.Entry(frame, textvariable=var, width=38); entry.pack(pady=10); entry.focus_set()
        result = {'value': None}
        def submit(): result['value'] = var.get().strip(); win.destroy()
        buttons = ttk.Frame(frame); buttons.pack(fill='x')
        ttk.Button(buttons, text='Cancel', command=win.destroy).pack(side='right')
        ttk.Button(buttons, text='Save', command=submit).pack(side='right', padx=7)
        win.bind('<Return>', lambda e: submit()); win.bind('<Escape>', lambda e: win.destroy())
        self.root.wait_window(win)
        return result['value']

    def add_product(self):
        name = self.prompt('Add product', 'Product name:')
        if name is None: return
        if not name: messagebox.showwarning('Required', 'Product name cannot be empty.'); return
        qty = self.prompt('Initial quantity', 'Enter current quantity (whole number):', '0')
        if qty is None: return
        try: qty = int(qty); assert qty >= 0
        except (ValueError, AssertionError): messagebox.showerror('Invalid quantity', 'Quantity must be a whole number zero or greater.'); return
        try:
            self.conn.execute('INSERT INTO products(name,quantity,updated_at) VALUES (?,?,CURRENT_TIMESTAMP)', (name,qty)); self.conn.commit(); self.refresh()
        except sqlite3.IntegrityError: messagebox.showerror('Already exists', 'A product with that name already exists.')

    def update_quantity(self):
        pid = self.selected_id()
        if pid is None: return
        name, current = self.conn.execute('SELECT name,quantity FROM products WHERE id=?', (pid,)).fetchone()
        qty = self.prompt('Update quantity', f'New available quantity for {name}:', current)
        if qty is None: return
        try: qty = int(qty); assert qty >= 0
        except (ValueError, AssertionError): messagebox.showerror('Invalid quantity', 'Quantity must be a whole number zero or greater.'); return
        self.conn.execute('UPDATE products SET quantity=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', (qty,pid)); self.conn.commit(); self.refresh()

    def edit_product(self):
        pid = self.selected_id()
        if pid is None: return
        old = self.conn.execute('SELECT name FROM products WHERE id=?', (pid,)).fetchone()[0]
        name = self.prompt('Rename product', 'Product name:', old)
        if name is None or not name: return
        try: self.conn.execute('UPDATE products SET name=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', (name,pid)); self.conn.commit(); self.refresh()
        except sqlite3.IntegrityError: messagebox.showerror('Already exists', 'A product with that name already exists.')

    def delete_product(self):
        pid = self.selected_id()
        if pid is None: return
        name = self.conn.execute('SELECT name FROM products WHERE id=?', (pid,)).fetchone()[0]
        if messagebox.askyesno('Delete product', f'Delete "{name}" from your inventory?'):
            self.conn.execute('DELETE FROM products WHERE id=?', (pid,)); self.conn.commit(); self.refresh()

    def close(self):
        self.conn.close(); self.root.destroy()

if __name__ == '__main__':
    root = tk.Tk(); app = InventoryApp(root); root.mainloop()
