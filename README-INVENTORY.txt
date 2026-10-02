JINENDRA KALAKRITI - LOCAL INVENTORY MANAGER

WHAT THIS DOES
- Keeps product names and stock quantities in a local SQLite database.
- Lets you add products, rename products, change quantities, and delete products.
- Quantities are private: this tool does not publish them to the customer website.
- It does not automatically deduct stock when an order is placed.
- The first launch creates jinendra_inventory.db and adds the 10 current storefront products with quantity 0.

HOW TO RUN (WINDOWS)
1. Extract the complete ZIP into a folder on your computer.
2. Install Python 3 from https://www.python.org/downloads/ if it is not installed.
   During installation, select "Add Python to PATH".
3. Double-click Start_Inventory_Manager.bat.
4. Select a product and click Update Quantity to enter your current stock.

DATABASE AND BACKUP
- jinendra_inventory.db is created in this same folder on first launch.
- Keep this file. It contains your inventory records.
- To back it up, close the app and copy jinendra_inventory.db to another safe location.
- Do not delete or move the database file while the app is running.

REQUIREMENTS
- Windows, Python 3, and Tkinter (included with the standard Windows Python installer).
- No Flask, web server, internet connection, or paid database service is required.

IMPORTANT
This is a separate local admin tool. It does not connect to or change the online storefront.
