#!/usr/bin/env python3
"""Run this after changing assets/products.js:   python3 build_pages.py
Creates a real page for every product (p/<slug>/index.html), sitemap.xml, robots.txt and 404.html
so Google can find and list each product."""
import json, html, datetime, os, re
DOMAIN='https://jinendrakalakriti.in'
t=open('assets/products.js',encoding='utf-8').read()
P=json.loads(t[len('window.PRODUCTS='):].rstrip().rstrip(';'))
tpl=open('index.html',encoding='utf-8').read()
e=lambda s:html.escape(str(s),quote=True)
money=lambda n:'₹{:,}'.format(n)
def must(s,a,b):
    assert a in s,a[:60]; return s.replace(a,b,1)
today=datetime.date.today().isoformat()
for p in P:
    url=f"{DOMAIN}/p/{p['slug']}/"
    price=money(p['price']) if p['price'] else 'Contact us for price'
    title=f"{p['name']} | Jinendra Kalakriti"
    desc=p['desc']+(f" Price {price}." if p['price'] else '')+' Order on WhatsApp. Pan-India delivery.'
    img=f"{DOMAIN}/{p['imgs'][0]}"
    ld={'@context':'https://schema.org','@type':'Product','name':p['name'],'image':[f"{DOMAIN}/{i}" for i in p['imgs']],'description':p['desc'],'category':p['cat'],'brand':{'@type':'Brand','name':'Jinendra Kalakriti'},'url':url}
    if p['price']: ld['offers']={'@type':'Offer','priceCurrency':'INR','price':str(p['price']),'availability':'https://schema.org/InStock','url':url}
    s=tpl
    s=must(s,'<meta charset="utf-8">','<meta charset="utf-8">\n<base href="/">')
    s=re.sub(r'<title>.*?</title>',lambda m:f'<title>{e(title)}</title>',s,count=1,flags=re.S)
    s=re.sub(r'<meta name="description" content="[^"]*">',lambda m:f'<meta name="description" content="{e(desc)}">',s,count=1)
    s=must(s,'<link rel="canonical" href="https://jinendrakalakriti.in/">',f'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">')
    s=re.sub(r'<meta property="og:title" content="[^"]*">',lambda m:f'<meta property="og:title" content="{e(title)}">',s,count=1)
    s=re.sub(r'<meta property="og:description" content="[^"]*">',lambda m:f'<meta property="og:description" content="{e(desc)}">',s,count=1)
    s=re.sub(r'<meta property="og:image" content="[^"]*">',lambda m:f'<meta property="og:image" content="{img}">',s,count=1)
    s=must(s,'</head>','<script type="application/ld+json" id="ld">'+json.dumps(ld,ensure_ascii=False)+'</script>\n</head>')
    s=must(s,'<body>',f'<body data-product="{e(p["slug"])}">')
    s=must(s,'<div id="home">','<div id="home" hidden>')
    static=(f'<div class="container page" style="padding-top:36px"><nav class="crumbs"><a href="/">Home</a> / {e(p["cat"])}</nav>'
      f'<h1>{e(p["name"])}</h1><p>{e(price)}</p><img src="{e(p["imgs"][0])}" alt="{e(p["name"])}" width="500">'
      f'<p>{e(p["desc"])}</p><ul>'+''.join(f'<li>{e(d)}</li>' for d in p['details'])+'</ul></div>')
    s=must(s,'<div id="product" hidden></div>',f'<div id="product">{static}</div>')
    os.makedirs(f"p/{p['slug']}",exist_ok=True)
    open(f"p/{p['slug']}/index.html",'w',encoding='utf-8').write(s)
urls=[f'<url><loc>{DOMAIN}/</loc><lastmod>{today}</lastmod><priority>1.0</priority></url>']+[f"<url><loc>{DOMAIN}/p/{p['slug']}/</loc><lastmod>{today}</lastmod><priority>0.8</priority></url>" for p in P]
open('sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(urls)+'\n</urlset>\n')
open('robots.txt','w').write(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
open('404.html','w').write('<!doctype html><meta charset="utf-8"><title>Jinendra Kalakriti</title><meta http-equiv="refresh" content="0;url=/"><p>Page not found. <a href="/">Go to Jinendra Kalakriti</a></p>\n')
print(len(P),'product pages written')
