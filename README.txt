JINENDRA KALAKRITI - WEBSITE (static, works on GitHub Pages)

DEPLOY
1. Copy everything in this folder into your repo root (replace index.html, keep CNAME).
2. The new site uses the img/ folder. Your old products/ folder is no longer needed by the site (you can keep or delete it).
3. Commit and push.

BEFORE GOING LIVE - EDIT assets/config.js
- upiId: put your real UPI ID (e.g. yourname@okaxis). Until you do, the payment QR is hidden
  and customers are told payment details will come on WhatsApp.
- whatsapp / instagram are already filled from your catalogue.

CHANGING PRODUCTS OR PRICES
- Edit assets/products.js (name, price, mrp, description, details, images).
- Price null = "Contact us for price" (shows an Enquire on WhatsApp button instead of Add to cart).
- Add photos to img/ and list them in the product's imgs array.

PAGES: Shipping, Returns, FAQ, Contact text lives in the PAGES object near the bottom of assets/app.js. Review the wording.

GOOGLE / SEARCH (important)
- Every product now has its own real page (p/<name>/), plus sitemap.xml and robots.txt.
- After you add or change products, run:  python3 build_pages.py   (then upload the new files).
- To make Google list your brand: add the site in Google Search Console (search.google.com/search-console),
  verify it (paste the tag it gives you into index.html where the comment says so), then submit
  https://jinendrakalakriti.in/sitemap.xml and click "Request indexing" for the home page.
- Local preview: product pages need a small server:  python3 -m http.server  then open http://localhost:8000
